<?php

declare(strict_types=1);

namespace App\ReadModel;

use JsonSerializable;

/**
 * Read model for authenticated user's page data.
 *
 * Decouples the domain entity from the API response structure by exposing
 * page type, layout configuration, and timestamps. This prevents accidental
 * exposure of sensitive entity data (internal IDs, shop relationships).
 *
 * Used for authenticated endpoints where users retrieve their own pages.
 */
final readonly class PageReadModel implements JsonSerializable
{
    /**
     * @param string $type Page type (home, catalog, product, contact)
     * @param array $layout Layout components array
     * @param string $createdAt ISO 8601 formatted timestamp
     * @param string $updatedAt ISO 8601 formatted timestamp
     */
    public function __construct(
        private string $type,
        private array $layout,
        private string $createdAt,
        private string $updatedAt
    ) {}

    /**
     * @return array{type: string, layout: array, created_at: string, updated_at: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type,
            'layout' => $this->layout,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
