<?php

declare(strict_types=1);

namespace App\Exception;

use RuntimeException;

/**
 * Exception thrown when user provides invalid credentials during login.
 *
 * Uses generic message to prevent user enumeration attacks.
 */
final class InvalidCredentialsException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Invalid email or password');
    }
}
