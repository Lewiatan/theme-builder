<?php

declare(strict_types=1);

namespace App\Exception;

use RuntimeException;

/**
 * Exception thrown when attempting to register with an email that already exists.
 */
final class UserAlreadyExistsException extends RuntimeException
{
    public function __construct(string $email)
    {
        parent::__construct("An account with email {$email} already exists");
    }
}
