<?php

declare(strict_types=1);

namespace App\Request;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Request DTO for user registration endpoint.
 *
 * Validates input parameters for POST /api/auth/register.
 * Enforces email format, password length constraints, and shop name requirements.
 */
final readonly class RegisterRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Email is required')]
        #[Assert\Email(
            message: 'Invalid email format',
            mode: 'strict'
        )]
        private string $email,

        #[Assert\NotBlank(message: 'Password is required')]
        #[Assert\Length(
            min: 8,
            max: 72,
            minMessage: 'Password must be at least {{ limit }} characters long',
            maxMessage: 'Password must not exceed {{ limit }} characters'
        )]
        private string $password,

        #[Assert\NotBlank(message: 'Shop name is required')]
        #[Assert\Length(
            min: 1,
            max: 60,
            minMessage: 'Shop name must be at least {{ limit }} character long',
            maxMessage: 'Shop name must not exceed {{ limit }} characters'
        )]
        private string $shopName
    ) {}

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getShopName(): string
    {
        return $this->shopName;
    }
}
