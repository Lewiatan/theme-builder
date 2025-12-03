<?php

declare(strict_types=1);

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Exception thrown when a requested demo product does not exist.
 *
 * This exception is specific to the demo product detail functionality.
 * It extends NotFoundHttpException to automatically return 404 status code
 * when caught by Symfony's exception handling.
 */
final class ProductNotFoundException extends NotFoundHttpException
{
    public function __construct(int $productId)
    {
        parent::__construct(
            message: sprintf('Product with ID %d not found', $productId)
        );
    }
}
