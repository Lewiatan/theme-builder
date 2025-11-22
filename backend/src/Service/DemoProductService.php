<?php

declare(strict_types=1);

namespace App\Service;

use App\Exception\CategoryNotFoundException;
use App\ReadModel\DemoProductReadModel;
use App\Repository\DemoProductRepository;

/**
 * Service for demo product business logic.
 *
 * Orchestrates product retrieval with optional category filtering.
 * Validates category existence before filtering to distinguish between
 * "category doesn't exist" vs. "category exists but has no products".
 */
final class DemoProductService
{
    public function __construct(
        private readonly DemoProductRepository $repository
    ) {}

    /**
     * Retrieves demo products with optional category filtering.
     *
     * When categoryId is provided, validates that the category exists before
     * attempting to filter products. This ensures meaningful error responses
     * when a category doesn't exist.
     *
     * @param int|null $categoryId Optional category ID to filter by
     * @return array<DemoProductReadModel> Array of product read models ordered by name
     * @throws CategoryNotFoundException When categoryId provided but category doesn't exist
     */
    public function getProducts(?int $categoryId): array
    {
        // No filter - return all products
        if ($categoryId === null) {
            return $this->repository->findAllProducts();
        }

        // Validate category exists before filtering
        if (!$this->repository->categoryExists($categoryId)) {
            throw new CategoryNotFoundException($categoryId);
        }

        // Category exists - return filtered products
        return $this->repository->findProductsByCategoryId($categoryId);
    }
}
