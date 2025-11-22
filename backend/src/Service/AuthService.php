<?php

declare(strict_types=1);

namespace App\Service;

use App\Exception\InvalidCredentialsException;
use App\Exception\ShopNameExistsException;
use App\Exception\UserAlreadyExistsException;
use App\Model\Entity\Shop;
use App\Model\Entity\User;
use App\Model\ValueObject\Email;
use App\ReadModel\ShopReadModel;
use App\ReadModel\UserReadModel;
use App\Repository\ShopRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Uid\Uuid;
use Throwable;

/**
 * Orchestrates authentication operations (registration and login).
 *
 * Handles user registration with atomic shop and page creation,
 * and user authentication with JWT token generation.
 */
final readonly class AuthService
{
    public function __construct(
        private UserRepository $userRepository,
        private ShopRepository $shopRepository,
        private ShopInitializationService $shopInitializationService,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger
    ) {}

    /**
     * Registers a new user with shop and default pages.
     *
     * This operation is atomic - if any step fails, the entire transaction is rolled back.
     *
     * @return array{user: UserReadModel, shop: ShopReadModel}
     * @throws UserAlreadyExistsException
     * @throws ShopNameExistsException
     */
    public function register(string $email, string $password, string $shopName): array
    {
        // Validate email and create value object
        $emailVO = new Email($email);

        // Check email uniqueness
        if ($this->userRepository->emailExists($emailVO)) {
            $this->logger->info('Registration failed: email already exists', ['email' => $email]);
            throw new UserAlreadyExistsException($email);
        }

        // Check shop name uniqueness
        if ($this->shopRepository->shopNameExists($shopName)) {
            $this->logger->info('Registration failed: shop name already exists', ['shopName' => $shopName]);
            throw new ShopNameExistsException($shopName);
        }

        // Begin transaction for atomic operation
        $this->entityManager->beginTransaction();

        try {
            // Create user entity
            $user = User::create(
                Uuid::v7()->toString(),
                $emailVO,
                '' // Temporary password, will be set below
            );

            // Hash password
            $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
            $user->changePassword($hashedPassword);

            $this->entityManager->persist($user);

            // Create shop entity
            $shop = Shop::create(
                Uuid::v7()->toString(),
                $user,
                $shopName
            );

            $this->entityManager->persist($shop);

            // Create default pages
            $this->shopInitializationService->createDefaultPages($shop);

            // Commit transaction (flush happens here)
            $this->entityManager->flush();
            $this->entityManager->commit();

            $this->logger->info('User registered successfully', [
                'userId' => $user->getId(),
                'email' => $email,
                'shopId' => $shop->getId(),
            ]);

            // Return read models
            return [
                'user' => new UserReadModel(
                    $user->getId(),
                    $user->getEmail()->getValue(),
                    $user->getCreatedAt()->format('c')
                ),
                'shop' => new ShopReadModel(
                    $shop->getId(),
                    $shop->getName(),
                    $shop->getCreatedAt()->format('c')
                ),
            ];
        } catch (Throwable $e) {
            $this->entityManager->rollback();

            $this->logger->error('Registration failed', [
                'email' => $email,
                'shopName' => $shopName,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Authenticates a user and generates a JWT token.
     *
     * @return array{token: string, user: UserReadModel}
     * @throws InvalidCredentialsException
     */
    public function login(string $email, string $password): array
    {
        // Create email value object
        $emailVO = new Email($email);

        // Find user by email
        $user = $this->userRepository->findByEmail($emailVO);

        if ($user === null) {
            $this->logger->info('Login failed: user not found', ['email' => $email]);
            throw new InvalidCredentialsException();
        }

        // Verify password
        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            $this->logger->info('Login failed: invalid password', ['email' => $email]);
            throw new InvalidCredentialsException();
        }

        // Get user's shop (every user must have a shop)
        $shop = $this->shopRepository->findByUserId($user->getId());

        if ($shop === null) {
            $this->logger->error('Login failed: user has no associated shop', [
                'userId' => $user->getId(),
                'email' => $email,
            ]);
            throw new \RuntimeException('User account is incomplete: no shop found');
        }

        // Generate JWT token with custom claims
        $token = $this->jwtManager->createFromPayload($user, [
            'userId' => $user->getId(),
            'email' => $user->getEmail()->getValue(),
            'shopId' => $shop->getId(),
        ]);

        $this->logger->info('User logged in successfully', [
            'userId' => $user->getId(),
            'email' => $email,
            'shopId' => $shop->getId(),
        ]);

        // Return token and user read model
        return [
            'token' => $token,
            'user' => new UserReadModel(
                $user->getId(),
                $user->getEmail()->getValue(),
                $user->getCreatedAt()->format('c')
            ),
        ];
    }
}
