<?php

declare(strict_types=1);

namespace App\ReadModel;

use JsonSerializable;

/**
 * Read model for demo product data.
 *
 * Represents a single product with its category information for API responses.
 * This decouples the database structure from the API contract, providing explicit
 * control over what data is exposed to the Demo Shop frontend.
 *
 * Products are read-only reference data for demonstration purposes.
 * Prices are stored and returned in cents (e.g., 19999 = $199.99).
 * Sale price is nullable (null when product is not on sale).
 */
final readonly class DemoProductReadModel implements JsonSerializable
{
    /**
     * @param int $id Product ID
     * @param int $categoryId Category ID this product belongs to
     * @param string $categoryName Human-readable category name
     * @param string $name Product name
     * @param string $description Product description
     * @param int $price Regular price in cents
     * @param int|null $salePrice Sale price in cents (null if not on sale)
     * @param string $imageThumbnail URL to thumbnail image
     * @param string $imageMedium URL to medium-sized image
     * @param string $imageLarge URL to large image
     */
    public function __construct(
        private int $id,
        private int $categoryId,
        private string $categoryName,
        private string $name,
        private string $description,
        private int $price,
        private ?int $salePrice,
        private string $imageThumbnail,
        private string $imageMedium,
        private string $imageLarge
    ) {}

    /**
     * Serializes the product to JSON with snake_case keys for API response.
     *
     * @return array{
     *     id: int,
     *     category_id: int,
     *     category_name: string,
     *     name: string,
     *     description: string,
     *     price: int,
     *     sale_price: int|null,
     *     image_thumbnail: string,
     *     image_medium: string,
     *     image_large: string
     * }
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->categoryId,
            'category_name' => $this->categoryName,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'sale_price' => $this->salePrice,
            'image_thumbnail' => $this->imageThumbnail,
            'image_medium' => $this->imageMedium,
            'image_large' => $this->imageLarge,
        ];
    }
}
