<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Exception thrown when a user doesn't have an associated shop.
 *
 * This is typically an edge case that shouldn't occur in normal application flow,
 * as users should have a shop created during registration.
 * It extends NotFoundHttpException to automatically return 404 status code
 * when caught by Symfony's exception handling.
 */
final class ShopNotFoundException extends NotFoundHttpException
{
    public function __construct(string $userId)
    {
        parent::__construct(
            message: sprintf('Shop not found for user %s', $userId)
        );
    }
}
