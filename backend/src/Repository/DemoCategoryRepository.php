<?php

declare(strict_types=1);

namespace App\Repository;

use App\ReadModel\DemoCategoryReadModel;
use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository for demo category data access.
 *
 * Handles database queries for demo categories. Uses raw SQL queries for optimal
 * performance with simple reads. Returns ReadModel instances for API consumption.
 *
 * Demo categories are read-only reference data - no write operations needed.
 */
class DemoCategoryRepository
{
    private Connection $connection;

    public function __construct(ManagerRegistry $registry)
    {
        $this->connection = $registry->getConnection();
    }

    /**
     * Retrieves all demo categories, ordered alphabetically by name.
     *
     * Categories are ordered in ascending order for consistent display across
     * the CategoryPills component and product filtering.
     *
     * SQL Query:
     * SELECT id, name
     * FROM demo_categories
     * ORDER BY name ASC
     *
     * @return array<DemoCategoryReadModel> Array of category read models (empty if no categories)
     */
    public function findAllCategories(): array
    {
        $sql = '
            SELECT
                id,
                name
            FROM demo_categories
            ORDER BY name ASC
        ';

        $rows = $this->connection->fetchAllAssociative($sql);

        return array_map(
            fn(array $row) => $this->mapRowToReadModel($row),
            $rows
        );
    }

    /**
     * Maps a database row to a DemoCategoryReadModel instance.
     *
     * Handles type conversion from database strings to proper types.
     *
     * @param array{
     *     id: int|string,
     *     name: string
     * } $row Database row
     * @return DemoCategoryReadModel Read model instance
     */
    private function mapRowToReadModel(array $row): DemoCategoryReadModel
    {
        return new DemoCategoryReadModel(
            id: (int) $row['id'],
            name: $row['name']
        );
    }
}
