<?php

declare(strict_types=1);

namespace App\Service;

use App\ReadModel\DemoCategoryReadModel;
use App\Repository\DemoCategoryRepository;

/**
 * Service for demo category business logic.
 *
 * Orchestrates category retrieval for the Demo Shop. This service layer
 * provides a clean interface for controllers and allows future enhancement
 * (caching, logging, transformations) without changing the API contract.
 */
final class DemoCategoryService
{
    public function __construct(
        private readonly DemoCategoryRepository $repository
    ) {}

    /**
     * Retrieves all demo categories ordered alphabetically by name.
     *
     * Categories are sorted in ascending order for consistent display
     * in the CategoryPills component and product filtering UI.
     *
     * @return array<DemoCategoryReadModel> Array of category read models (empty if no categories)
     */
    public function getAllCategories(): array
    {
        return $this->repository->findAllCategories();
    }
}
