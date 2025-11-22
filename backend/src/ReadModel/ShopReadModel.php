<?php

declare(strict_types=1);

namespace App\ReadModel;

use JsonSerializable;

/**
 * Read model for shop data in API responses.
 *
 * Decouples the Shop entity from API responses to prevent accidental
 * exposure of internal data. Only includes essential shop information.
 *
 * Theme settings are excluded from registration response as per API plan.
 */
final readonly class ShopReadModel implements JsonSerializable
{
    /**
     * @param string $id Shop UUID
     * @param string $name Shop name
     * @param string $createdAt ISO 8601 formatted creation timestamp
     */
    public function __construct(
        private string $id,
        private string $name,
        private string $createdAt
    ) {}

    /**
     * Serializes the shop to JSON for API response.
     *
     * @return array{
     *     id: string,
     *     name: string,
     *     created_at: string
     * }
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->createdAt,
        ];
    }
}
