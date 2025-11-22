<?php

declare(strict_types=1);

namespace App\Service;

use App\Model\Enum\PageType;
use App\Model\ValueObject\ComponentDefinition;
use App\Model\ValueObject\Layout;

/**
 * Provides default page layouts for new shops.
 *
 * Uses DefaultLayoutDefinitions as the single source of truth
 * to ensure consistency across demo shops and newly registered users.
 */
final readonly class DefaultLayoutService
{
    public function getDefaultLayout(PageType $pageType): Layout
    {
        return match($pageType) {
            PageType::HOME => $this->getHomeLayout(),
            PageType::CATALOG => $this->getCatalogLayout(),
            PageType::PRODUCT => $this->getProductLayout(),
            PageType::CONTACT => $this->getContactLayout(),
        };
    }

    private function getHomeLayout(): Layout
    {
        $componentArrays = DefaultLayoutDefinitions::getHomeComponents();
        $components = array_map(
            fn(array $componentArray) => ComponentDefinition::fromArray($componentArray),
            $componentArrays
        );

        return new Layout($components);
    }

    private function getCatalogLayout(): Layout
    {
        $componentArrays = DefaultLayoutDefinitions::getCatalogComponents();
        $components = array_map(
            fn(array $componentArray) => ComponentDefinition::fromArray($componentArray),
            $componentArrays
        );

        return new Layout($components);
    }

    private function getProductLayout(): Layout
    {
        $componentArrays = DefaultLayoutDefinitions::getProductComponents();
        $components = array_map(
            fn(array $componentArray) => ComponentDefinition::fromArray($componentArray),
            $componentArrays
        );

        return new Layout($components);
    }

    private function getContactLayout(): Layout
    {
        $componentArrays = DefaultLayoutDefinitions::getContactComponents();
        $components = array_map(
            fn(array $componentArray) => ComponentDefinition::fromArray($componentArray),
            $componentArrays
        );

        return new Layout($components);
    }
}
