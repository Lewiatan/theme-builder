<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\Enum\PageType;
use App\ReadModel\DemoPageReadModel;
use App\Repository\DemoPageRepository;

/**
 * Service for page-related business operations.
 *
 * Orchestrates page data retrieval through the repository layer,
 * maintaining clean separation between controllers and data access.
 */
final readonly class DemoPageService
{
    public function __construct(
        private DemoPageRepository $pageRepository
    ) {}

    /**
     * Retrieves public page data for the Demo Shop.
     *
     * Returns page configuration (type and layout) for a specific shop and page type.
     * This method is intended for public access without authentication.
     *
     * @param string $shopId UUID of the shop
     * @param PageType $type Page type to retrieve
     * @return DemoPageReadModel|null Page data if found, null if shop or page doesn't exist
     */
    public function getPublicPage(string $shopId, PageType $type): ?DemoPageReadModel
    {
        return $this->pageRepository->findPublicPageByShopAndType($shopId, $type);
    }
}
