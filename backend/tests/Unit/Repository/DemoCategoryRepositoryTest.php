<?php

declare(strict_types=1);

namespace App\Tests\Unit\Repository;

use App\ReadModel\DemoCategoryReadModel;
use App\Repository\DemoCategoryRepository;
use Doctrine\DBAL\Connection;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for DemoCategoryRepository
 *
 * Tests the repository layer with mocked DBAL Connection to verify:
 * - SQL query construction and ordering
 * - Row-to-ReadModel mapping with type casting
 * - Empty result handling
 * - Multiple category handling
 */
#[CoversClass(DemoCategoryRepository::class)]
final class DemoCategoryRepositoryTest extends TestCase
{
    private Connection|MockObject $connection;
    private ManagerRegistry|MockObject $registry;
    private DemoCategoryRepository $repository;

    protected function setUp(): void
    {
        $this->connection = $this->createMock(Connection::class);
        $this->registry = $this->createMock(ManagerRegistry::class);

        $this->registry
            ->method('getConnection')
            ->willReturn($this->connection);

        $this->repository = new DemoCategoryRepository($this->registry);
    }

    #[Test]
    public function it_returns_all_categories_ordered_by_name(): void
    {
        // Arrange
        $databaseRows = [
            ['id' => '6', 'name' => 'Beauty & Personal Care'],
            ['id' => '3', 'name' => 'Books'],
            ['id' => '2', 'name' => 'Clothing'],
            ['id' => '1', 'name' => 'Electronics'],
            ['id' => '4', 'name' => 'Home & Garden'],
            ['id' => '5', 'name' => 'Sports & Outdoors'],
        ];

        $this->connection
            ->expects($this->once())
            ->method('fetchAllAssociative')
            ->with($this->stringContains('ORDER BY name ASC'))
            ->willReturn($databaseRows);

        // Act
        $result = $this->repository->findAllCategories();

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(6, $result);

        // Verify all results are DemoCategoryReadModel instances
        foreach ($result as $category) {
            $this->assertInstanceOf(DemoCategoryReadModel::class, $category);
        }

        // Verify first category (alphabetically)
        $this->assertEquals(6, $result[0]->id);
        $this->assertEquals('Beauty & Personal Care', $result[0]->name);

        // Verify last category (alphabetically)
        $this->assertEquals(5, $result[5]->id);
        $this->assertEquals('Sports & Outdoors', $result[5]->name);
    }

    #[Test]
    public function it_maps_database_rows_to_read_models_correctly(): void
    {
        // Arrange - database returns strings for integer columns
        $databaseRows = [
            ['id' => '42', 'name' => 'Test Category'],
            ['id' => '99', 'name' => 'Another Category'],
        ];

        $this->connection
            ->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturn($databaseRows);

        // Act
        $result = $this->repository->findAllCategories();

        // Assert - verify type casting from string to int
        $this->assertCount(2, $result);

        $this->assertInstanceOf(DemoCategoryReadModel::class, $result[0]);
        $this->assertIsInt($result[0]->id);
        $this->assertEquals(42, $result[0]->id);
        $this->assertEquals('Test Category', $result[0]->name);

        $this->assertInstanceOf(DemoCategoryReadModel::class, $result[1]);
        $this->assertIsInt($result[1]->id);
        $this->assertEquals(99, $result[1]->id);
        $this->assertEquals('Another Category', $result[1]->name);
    }

    #[Test]
    public function it_returns_empty_array_when_no_categories_exist(): void
    {
        // Arrange
        $this->connection
            ->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturn([]);

        // Act
        $result = $this->repository->findAllCategories();

        // Assert
        $this->assertIsArray($result);
        $this->assertEmpty($result);
        $this->assertCount(0, $result);
    }

    #[Test]
    public function it_executes_correct_sql_query(): void
    {
        // Arrange
        $expectedSqlParts = [
            'SELECT',
            'id',
            'name',
            'FROM demo_categories',
            'ORDER BY name ASC',
        ];

        $this->connection
            ->expects($this->once())
            ->method('fetchAllAssociative')
            ->with($this->callback(function (string $sql) use ($expectedSqlParts): bool {
                // Verify SQL contains all expected parts
                foreach ($expectedSqlParts as $part) {
                    if (stripos($sql, $part) === false) {
                        return false;
                    }
                }
                return true;
            }))
            ->willReturn([]);

        // Act
        $this->repository->findAllCategories();

        // Assert - expectations verified by PHPUnit
    }

    #[Test]
    public function it_handles_single_category(): void
    {
        // Arrange
        $databaseRows = [
            ['id' => '1', 'name' => 'Single Category'],
        ];

        $this->connection
            ->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturn($databaseRows);

        // Act
        $result = $this->repository->findAllCategories();

        // Assert
        $this->assertCount(1, $result);
        $this->assertInstanceOf(DemoCategoryReadModel::class, $result[0]);
        $this->assertEquals(1, $result[0]->id);
        $this->assertEquals('Single Category', $result[0]->name);
    }

    #[Test]
    public function it_handles_categories_with_special_characters(): void
    {
        // Arrange
        $databaseRows = [
            ['id' => '1', 'name' => 'Beauty & Personal Care'],
            ['id' => '2', 'name' => "Books & Media's Corner"],
            ['id' => '3', 'name' => 'Home & Garden "Premium"'],
        ];

        $this->connection
            ->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturn($databaseRows);

        // Act
        $result = $this->repository->findAllCategories();

        // Assert
        $this->assertCount(3, $result);
        $this->assertEquals('Beauty & Personal Care', $result[0]->name);
        $this->assertEquals("Books & Media's Corner", $result[1]->name);
        $this->assertEquals('Home & Garden "Premium"', $result[2]->name);
    }

    #[Test]
    public function it_preserves_category_name_case(): void
    {
        // Arrange
        $databaseRows = [
            ['id' => '1', 'name' => 'UPPERCASE'],
            ['id' => '2', 'name' => 'lowercase'],
            ['id' => '3', 'name' => 'MixedCase'],
        ];

        $this->connection
            ->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturn($databaseRows);

        // Act
        $result = $this->repository->findAllCategories();

        // Assert - verify case is preserved from database
        $this->assertEquals('UPPERCASE', $result[0]->name);
        $this->assertEquals('lowercase', $result[1]->name);
        $this->assertEquals('MixedCase', $result[2]->name);
    }

    #[Test]
    public function it_calls_connection_only_once(): void
    {
        // Arrange
        $this->connection
            ->expects($this->once())
            ->method('fetchAllAssociative')
            ->willReturn([]);

        // Act
        $this->repository->findAllCategories();

        // Assert - expectations verified by PHPUnit (exactly one call)
    }
}
