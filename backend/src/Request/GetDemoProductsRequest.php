<?php

declare(strict_types=1);

namespace App\Request;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Request DTO for retrieving demo products with optional category filtering.
 *
 * Validates input parameters for GET /api/demo/products endpoint.
 * Supports optional category filtering. Products are ordered by name in ascending order.
 */
final readonly class GetDemoProductsRequest
{
    public function __construct(
        #[Assert\Type(
            type: 'integer',
            message: 'Category ID must be an integer'
        )]
        #[Assert\Positive(message: 'Category ID must be a positive integer')]
        private ?int $categoryId = null
    ) {}

    public function getCategoryId(): ?int
    {
        return $this->categoryId;
    }

    /**
     * Returns whether category filtering is enabled.
     */
    public function hasCategoryFilter(): bool
    {
        return $this->categoryId !== null;
    }
}
