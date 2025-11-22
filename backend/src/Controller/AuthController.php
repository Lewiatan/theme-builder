<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\InvalidCredentialsException;
use App\Exception\ShopNameExistsException;
use App\Exception\UserAlreadyExistsException;
use App\Request\LoginRequest;
use App\Request\RegisterRequest;
use App\Service\AuthService;
use InvalidArgumentException;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Authentication controller for user registration and login.
 *
 * Handles JWT-based authentication endpoints. These endpoints are public
 * (no authentication required) as configured in security.yaml.
 */
final class AuthController extends AbstractController
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly LoggerInterface $logger
    ) {}

    /**
     * Registers a new user with shop and default pages.
     *
     * Creates a user account, shop, and 4 default pages in a single atomic transaction.
     * Returns only the userId on success.
     *
     * @return JsonResponse userId (201), validation error (400), conflict (409), or error (500)
     *
     * Response examples:
     * - 201 Created: {"userId": "..."}
     * - 400 Bad Request: {"error": "validation_error", "message": "Invalid email format", "field": "email"}
     * - 409 Conflict (email exists): {"error": "email_exists", "message": "An account with this email already exists"}
     * - 409 Conflict (shop name exists): {"error": "shop_exists", "message": "A shop with this name already exists"}
     * - 500 Internal Server Error: {"error": "registration_failed", "message": "Registration failed. Please try again."}
     */
    #[Route('/api/auth/register', name: 'auth_register', methods: ['POST'])]
    public function register(
        #[MapRequestPayload] RegisterRequest $registerRequest
    ): JsonResponse
    {
        try {
            // Register user (validation is handled automatically by MapRequestPayload)
            $result = $this->authService->register(
                $registerRequest->getEmail(),
                $registerRequest->getPassword(),
                $registerRequest->getShopName()
            );

            return new JsonResponse(['userId' => $result['user']->getId()], JsonResponse::HTTP_CREATED);

        } catch (UserAlreadyExistsException $e) {
            return new JsonResponse([
                'error' => 'email_exists',
                'message' => 'An account with this email already exists',
            ], JsonResponse::HTTP_CONFLICT);

        } catch (ShopNameExistsException $e) {
            return new JsonResponse([
                'error' => 'shop_exists',
                'message' => 'A shop with this name already exists',
            ], JsonResponse::HTTP_CONFLICT);

        } catch (InvalidArgumentException $e) {
            // Validation errors from value objects (Email, Password, etc.)
            return new JsonResponse([
                'error' => 'validation_error',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_BAD_REQUEST);

        } catch (\Throwable $e) {
            $this->logger->error('Registration failed with unexpected error', [
                'exception' => get_class($e) . ': ' . $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            // In development, return the actual error
            if ($_ENV['APP_ENV'] === 'dev') {
                return new JsonResponse([
                    'error' => 'registration_failed',
                    'message' => $e->getMessage(),
                    'exception' => get_class($e),
                    'file' => $e->getFile() . ':' . $e->getLine(),
                ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
            }

            return new JsonResponse([
                'error' => 'registration_failed',
                'message' => 'Registration failed. Please try again.',
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Authenticates a user and returns a JWT token.
     *
     * Verifies credentials and generates a JWT token with userId and email claims.
     * Token expires in 1 hour (3600 seconds).
     *
     * @return JsonResponse Token string (200), validation error (400), invalid credentials (401), or error (500)
     *
     * Response examples:
     * - 200 OK: {"token": "eyJ..."}
     * - 400 Bad Request: {"error": "validation_error", "message": "Invalid email format", "field": "email"}
     * - 401 Unauthorized: {"error": "invalid_credentials", "message": "Invalid email or password"}
     * - 500 Internal Server Error: {"error": "login_failed", "message": "Login failed. Please try again."}
     */
    #[Route('/api/auth/login', name: 'auth_login', methods: ['POST'])]
    public function login(
        #[MapRequestPayload] LoginRequest $loginRequest
    ): JsonResponse
    {
        try {
            // Authenticate user (validation is handled automatically by MapRequestPayload)
            $result = $this->authService->login(
                $loginRequest->getEmail(),
                $loginRequest->getPassword()
            );

            return new JsonResponse(['token' => $result['token']], JsonResponse::HTTP_OK);

        } catch (InvalidCredentialsException $e) {
            return new JsonResponse([
                'error' => 'invalid_credentials',
                'message' => 'Invalid email or password',
            ], JsonResponse::HTTP_UNAUTHORIZED);

        } catch (InvalidArgumentException $e) {
            // Validation errors from value objects (Email)
            return new JsonResponse([
                'error' => 'validation_error',
                'message' => $e->getMessage(),
            ], JsonResponse::HTTP_BAD_REQUEST);

        } catch (\Throwable $e) {
            $this->logger->error('Login failed with unexpected error', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // In development, return the actual error
            if ($_ENV['APP_ENV'] === 'dev' || $_ENV['APP_ENV'] === 'test') {
                return new JsonResponse([
                    'error' => 'login_failed',
                    'message' => $e->getMessage(),
                    'exception' => get_class($e),
                    'file' => $e->getFile() . ':' . $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
            }

            return new JsonResponse([
                'error' => 'login_failed',
                'message' => 'Login failed. Please try again.',
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
