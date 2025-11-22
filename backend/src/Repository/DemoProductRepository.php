<?php

declare(strict_types=1);

namespace App\Repository;

use App\ReadModel\DemoProductReadModel;
use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository for demo product data access.
 *
 * Handles database queries for demo products with category information.
 * Uses raw SQL queries with INNER JOIN for optimal performance and to avoid
 * N+1 query problems. Returns ReadModel instances for API consumption.
 *
 * Demo products are read-only reference data - no write operations needed.
 */
class DemoProductRepository
{
    private Connection $connection;

    public function __construct(ManagerRegistry $registry)
    {
        $this->connection = $registry->getConnection();
    }

    /**
     * Retrieves all demo products with category names, ordered alphabetically.
     *
     * Uses INNER JOIN to fetch category names in a single query, avoiding N+1 issues.
     * Products are ordered by name in ascending order for consistent display.
     *
     * SQL Query:
     * SELECT p.*, c.name AS category_name
     * FROM demo_products p
     * INNER JOIN demo_categories c ON p.category_id = c.id
     * ORDER BY p.name ASC
     *
     * @return array<DemoProductReadModel> Array of product read models (empty if no products)
     */
    public function findAllProducts(): array
    {
        $sql = '
            SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.price,
                p.sale_price,
                p.image_thumbnail,
                p.image_medium,
                p.image_large
            FROM demo_products p
            INNER JOIN demo_categories c ON p.category_id = c.id
            ORDER BY p.name ASC
        ';

        $rows = $this->connection->fetchAllAssociative($sql);

        return array_map(
            fn(array $row) => $this->mapRowToReadModel($row),
            $rows
        );
    }

    /**
     * Retrieves demo products filtered by category, ordered alphabetically.
     *
     * Uses parameterized query to prevent SQL injection.
     * Returns empty array if category exists but has no products.
     *
     * SQL Query:
     * SELECT p.*, c.name AS category_name
     * FROM demo_products p
     * INNER JOIN demo_categories c ON p.category_id = c.id
     * WHERE p.category_id = :categoryId
     * ORDER BY p.name ASC
     *
     * @param int $categoryId Category ID to filter by
     * @return array<DemoProductReadModel> Array of product read models (empty if no products in category)
     */
    public function findProductsByCategoryId(int $categoryId): array
    {
        $sql = '
            SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.price,
                p.sale_price,
                p.image_thumbnail,
                p.image_medium,
                p.image_large
            FROM demo_products p
            INNER JOIN demo_categories c ON p.category_id = c.id
            WHERE p.category_id = :categoryId
            ORDER BY p.name ASC
        ';

        $rows = $this->connection->fetchAllAssociative($sql, [
            'categoryId' => $categoryId,
        ]);

        return array_map(
            fn(array $row) => $this->mapRowToReadModel($row),
            $rows
        );
    }

    /**
     * Checks if a category exists in the database.
     *
     * Used for validation before filtering products by category.
     * Prevents returning empty results when a category doesn't exist
     * vs. when a category exists but has no products.
     *
     * @param int $categoryId Category ID to check
     * @return bool True if category exists, false otherwise
     */
    public function categoryExists(int $categoryId): bool
    {
        $sql = 'SELECT COUNT(*) FROM demo_categories WHERE id = :categoryId';

        $count = $this->connection->fetchOne($sql, [
            'categoryId' => $categoryId,
        ]);

        return (int) $count > 0;
    }

    /**
     * Maps a database row to a DemoProductReadModel instance.
     *
     * Handles type conversion and null handling for sale_price.
     *
     * @param array{
     *     id: int|string,
     *     category_id: int|string,
     *     category_name: string,
     *     name: string,
     *     description: string,
     *     price: int|string,
     *     sale_price: int|string|null,
     *     image_thumbnail: string,
     *     image_medium: string,
     *     image_large: string
     * } $row Database row
     * @return DemoProductReadModel Read model instance
     */
    private function mapRowToReadModel(array $row): DemoProductReadModel
    {
        return new DemoProductReadModel(
            id: (int) $row['id'],
            categoryId: (int) $row['category_id'],
            categoryName: $row['category_name'],
            name: $row['name'],
            description: $row['description'],
            price: (int) $row['price'],
            salePrice: $row['sale_price'] !== null ? (int) $row['sale_price'] : null,
            imageThumbnail: $row['image_thumbnail'],
            imageMedium: $row['image_medium'],
            imageLarge: $row['image_large']
        );
    }
}
