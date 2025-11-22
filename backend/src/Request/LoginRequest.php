<?php

declare(strict_types=1);

namespace App\Request;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Request DTO for user login endpoint.
 *
 * Validates input parameters for POST /api/auth/login.
 * No password length validation on login (only validates presence).
 */
final readonly class LoginRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Email is required')]
        #[Assert\Email(
            message: 'Invalid email format',
            mode: 'strict'
        )]
        private string $email,

        #[Assert\NotBlank(message: 'Password is required')]
        private string $password
    ) {}

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPassword(): string
    {
        return $this->password;
    }
}
