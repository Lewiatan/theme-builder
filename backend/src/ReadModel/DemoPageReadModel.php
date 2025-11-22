<?php

declare(strict_types=1);

namespace App\ReadModel;

use JsonSerializable;

/**
 * Read model for public page data.
 *
 * Decouples the domain entity from the API response structure by exposing
 * only the page type and layout configuration. This prevents accidental
 * exposure of sensitive entity data (IDs, timestamps, shop details).
 *
 * Optimized for JSON serialization - no getters needed as this is only
 * used for API responses.
 */
final readonly class DemoPageReadModel implements JsonSerializable
{
    /**
     * @param string $type Page type (home, catalog, product, contact)
     * @param array $layout Layout components array
     */
    public function __construct(
        private string $type,
        private array $layout
    ) {}

    /**
     * @return array{type: string, layout: array{components: array}}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type,
            'layout' => [
                'components' => $this->layout,
            ],
        ];
    }
}