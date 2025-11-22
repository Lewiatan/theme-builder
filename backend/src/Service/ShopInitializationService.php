<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\Entity\Page;
use App\Model\Entity\Shop;
use App\Model\Enum\PageType;
use App\Repository\PageRepository;
use Symfony\Component\Uid\Uuid;

/**
 * Handles shop initialization tasks, including creating default pages.
 *
 * This service is called during user registration to set up a new shop
 * with all required default pages (Home, Catalog, Product, Contact).
 */
final readonly class ShopInitializationService
{
    public function __construct(
        private PageRepository $pageRepository,
        private DefaultLayoutService $defaultLayoutService
    ) {}

    /**
     * Creates 4 default pages for a new shop.
     *
     * Each page receives a default layout from DefaultLayoutService.
     * Pages are persisted but not flushed (flush happens in calling service).
     */
    public function createDefaultPages(Shop $shop): void
    {
        $pages = [
            $this->createPage($shop, PageType::HOME),
            $this->createPage($shop, PageType::CATALOG),
            $this->createPage($shop, PageType::PRODUCT),
            $this->createPage($shop, PageType::CONTACT),
        ];

        foreach ($pages as $page) {
            $this->pageRepository->persist($page);
        }
    }

    private function createPage(Shop $shop, PageType $type): Page
    {
        $layout = $this->defaultLayoutService->getDefaultLayout($type);

        return Page::create(
            Uuid::v7()->toString(),
            $shop,
            $type,
            $layout
        );
    }
}
