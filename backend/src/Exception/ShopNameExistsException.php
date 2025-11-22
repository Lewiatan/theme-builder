<?php

declare(strict_types=1);

namespace App\Exception;

use RuntimeException;

/**
 * Exception thrown when attempting to create a shop with a name that already exists.
 */
final class ShopNameExistsException extends RuntimeException
{
    public function __construct(string $shopName)
    {
        parent::__construct("A shop with name '{$shopName}' already exists");
    }
}
