<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Exception thrown when a requested page is not found for a user.
 *
 * This exception is used when a user attempts to retrieve a specific page
 * by type, but the page doesn't exist in their shop. It extends
 * NotFoundHttpException to automatically return 404 status code when caught
 * by Symfony's exception handling.
 */
final class PageNotFoundException extends NotFoundHttpException
{
    public function __construct(string $userId, string $type)
    {
        parent::__construct(
            message: sprintf("Page of type '%s' not found for user %s", $type, $userId)
        );
    }
}
