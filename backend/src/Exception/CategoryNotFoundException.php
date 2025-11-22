<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Exception thrown when a requested demo category does not exist.
 *
 * This exception is specific to the demo product filtering functionality.
 * It extends NotFoundHttpException to automatically return 404 status code
 * when caught by Symfony's exception handling.
 */
final class CategoryNotFoundException extends NotFoundHttpException
{
    public function __construct(int $categoryId)
    {
        parent::__construct(
            message: sprintf('Category with ID %d not found', $categoryId)
        );
    }
}
