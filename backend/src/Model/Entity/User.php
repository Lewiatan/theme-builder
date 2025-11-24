<?php

declare(strict_types=1);

namespace App\Model\Entity;

use App\Model\ValueObject\Email;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
#[ORM\Index(columns: ['email'], name: 'idx_users_email')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: 'guid', unique: true)]
        private string $id,

        #[ORM\Embedded(class: Email::class, columnPrefix: false)]
        private Email $email,

        #[ORM\Column(type: 'string', length: 255, nullable: false)]
        private string $password,

        #[ORM\Column(type: 'datetime_immutable', nullable: false)]
        private DateTimeImmutable $createdAt,

        #[ORM\Column(type: 'datetime_immutable', nullable: false)]
        private DateTimeImmutable $updatedAt
    ) {}

    public static function create(
        string $id,
        Email $email,
        string $hashedPassword
    ): self {
        $now = new DateTimeImmutable();

        return new self(
            $id,
            $email,
            $hashedPassword,
            $now,
            $now
        );
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getEmail(): Email
    {
        return $this->email;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function changePassword(string $hashedPassword): void
    {
        $this->password = $hashedPassword;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateEmail(Email $email): void
    {
        $this->email = $email;
        $this->updatedAt = new DateTimeImmutable();
    }

    // UserInterface implementation

    public function getUserIdentifier(): string
    {
        return $this->email->getValue();
    }

    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    public function eraseCredentials(): void
    {
        // No sensitive temporary credentials to erase
    }
}
