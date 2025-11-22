<?php

declare(strict_types=1);

namespace App\Service;

use App\Exception\PageNotFoundException;
use App\Exception\ShopNotFoundException;
use App\Model\Enum\PageType;
use App\Model\ValueObject\Layout;
use App\ReadModel\PageReadModel;
use App\Repository\PageRepository;
use App\Repository\ShopRepository;

/**
 * Service for authenticated page-related business operations.
 *
 * Orchestrates page data retrieval for authenticated users,
 * ensuring data isolation by only returning pages for the user's shop.
 */
final readonly class PageService
{
    public function __construct(
        private ShopRepository $shopRepository,
        private PageRepository $pageRepository,
        private DefaultLayoutService $defaultLayoutService
    ) {}

    /**
     * Retrieves all pages for the authenticated user's shop.
     *
     * Enforces data isolation by first finding the user's shop,
     * then retrieving only pages belonging to that shop.
     *
     * @param string $userId UUID of the authenticated user
     * @return PageReadModel[] Array of page read models
     * @throws ShopNotFoundException If user doesn't have an associated shop
     */
    public function getPagesByUserId(string $userId): array
    {
        // Find shop by user ID
        $shop = $this->shopRepository->findByUserId($userId);

        // If user has no shop, throw exception (edge case)
        if ($shop === null) {
            throw new ShopNotFoundException($userId);
        }

        // Retrieve all pages for the shop
        return $this->pageRepository->findAllByShopId($shop->getId());
    }

    /**
     * Retrieves a specific page by type for the authenticated user's shop.
     *
     * Enforces data isolation by first finding the user's shop,
     * then retrieving only the page belonging to that shop.
     *
     * @param string $userId UUID of the authenticated user
     * @param \App\Model\Enum\PageType $type Page type to retrieve
     * @return PageReadModel Page read model
     * @throws ShopNotFoundException If user doesn't have an associated shop
     * @throws \App\Exception\PageNotFoundException If page doesn't exist
     */
    public function getPageByType(string $userId, PageType $type): PageReadModel
    {
        // Find shop by user ID
        $shop = $this->shopRepository->findByUserId($userId);

        // If user has no shop, throw exception (edge case)
        if ($shop === null) {
            throw new ShopNotFoundException($userId);
        }

        // Retrieve page by shop ID and type
        $page = $this->pageRepository->findOneByShopIdAndType($shop->getId(), $type);

        // If page doesn't exist, throw exception
        if ($page === null) {
            throw new PageNotFoundException($userId, $type->value);
        }

        return $page;
    }

    /**
     * Updates the layout for a specific page type for the authenticated user's shop.
     *
     * Enforces data isolation by first finding the user's shop,
     * then updating only the page belonging to that shop.
     *
     * Business logic flow:
     * 1. Find shop by user ID
     * 2. Find page by shop ID and page type (entity, not ReadModel)
     * 3. Update page layout using entity's updateLayout method
     * 4. Persist changes to database
     * 5. Return updated PageReadModel
     *
     * @param string $userId UUID of the authenticated user
     * @param PageType $type Page type to update
     * @param Layout $layout New layout to apply
     * @return PageReadModel Updated page read model with new timestamp
     * @throws ShopNotFoundException If user doesn't have an associated shop
     * @throws PageNotFoundException If page doesn't exist
     */
    public function updatePageLayout(
        string $userId,
        PageType $type,
        Layout $layout
    ): PageReadModel {
        // Find shop by user ID
        $shop = $this->shopRepository->findByUserId($userId);

        // If user has no shop, throw exception (edge case)
        if ($shop === null) {
            throw new ShopNotFoundException($userId);
        }

        // Retrieve page entity by shop ID and type (for updating)
        $page = $this->pageRepository->findByShopIdAndType($shop->getId(), $type);

        // If page doesn't exist, throw exception
        if ($page === null) {
            throw new PageNotFoundException($userId, $type->value);
        }

        // Update page layout using entity method (updates timestamp automatically)
        $page->updateLayout($layout);

        // Persist changes to database
        $this->pageRepository->save($page);

        // Construct and return PageReadModel from updated entity
        return new PageReadModel(
            $page->getType()->value,
            $page->getLayout()->toArray(),
            $page->getCreatedAt()->format('c'),
            $page->getUpdatedAt()->format('c')
        );
    }

    /**
     * Resets a page to its default layout for the authenticated user's shop.
     *
     * Loads the default layout for the specified page type from DefaultLayoutService
     * and updates the page entity. The updated_at timestamp is automatically updated
     * by the entity's updateLayout() method.
     *
     * Business logic flow:
     * 1. Find shop by user ID
     * 2. Find page entity by shop ID and page type
     * 3. Load default layout from DefaultLayoutService
     * 4. Update page layout using entity's updateLayout method
     * 5. Persist changes to database
     * 6. Return updated PageReadModel
     *
     * @param string $userId UUID of the authenticated user
     * @param PageType $type Page type to reset
     * @return PageReadModel Updated page read model with default layout and new timestamp
     * @throws ShopNotFoundException If user doesn't have an associated shop
     * @throws PageNotFoundException If page doesn't exist
     */
    public function resetPageToDefault(
        string $userId,
        PageType $type
    ): PageReadModel {
        // Find shop by user ID
        $shop = $this->shopRepository->findByUserId($userId);

        // If user has no shop, throw exception (edge case)
        if ($shop === null) {
            throw new ShopNotFoundException($userId);
        }

        // Retrieve page entity by shop ID and type (for updating)
        $page = $this->pageRepository->findByShopIdAndType($shop->getId(), $type);

        // If page doesn't exist, throw exception
        if ($page === null) {
            throw new PageNotFoundException($userId, $type->value);
        }

        // Load default layout for the page type
        $defaultLayout = $this->defaultLayoutService->getDefaultLayout($type);

        // Update page layout using entity method (updates timestamp automatically)
        $page->updateLayout($defaultLayout);

        // Persist changes to database
        $this->pageRepository->save($page);

        // Construct and return PageReadModel from updated entity
        return new PageReadModel(
            $page->getType()->value,
            $page->getLayout()->toArray(),
            $page->getCreatedAt()->format('c'),
            $page->getUpdatedAt()->format('c')
        );
    }
}
