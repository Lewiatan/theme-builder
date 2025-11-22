<?php

declare(strict_types=1);

namespace App\ReadModel;

use JsonSerializable;

/**
 * Read model for demo category data.
 *
 * Represents a single category for API responses to the Demo Shop frontend.
 * This decouples the database structure from the API contract, providing explicit
 * control over what data is exposed.
 *
 * Categories are simple reference data containing only id and name.
 * Used by the CategoryPills component and product filtering functionality.
 */
final readonly class DemoCategoryReadModel implements JsonSerializable
{
    /**
     * @param int $id Category ID
     * @param string $name Category name
     */
    public function __construct(
        public int $id,
        public string $name
    ) {}

    /**
     * Serializes the category to JSON for API response.
     *
     * @return array{
     *     id: int,
     *     name: string
     * }
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}
