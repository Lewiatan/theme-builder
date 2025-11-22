<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\ReadModel\DemoCategoryReadModel;
use App\Repository\DemoCategoryRepository;
use App\Service\DemoCategoryService;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for DemoCategoryService
 *
 * Tests the service layer with mocked repository to verify:
 * - Correct delegation to repository methods
 * - Proper return value handling
 * - Empty result handling
 * - Multiple category handling
 */
#[CoversClass(DemoCategoryService::class)]
final class DemoCategoryServiceTest extends TestCase
{
    private DemoCategoryRepository|MockObject $repository;
    private DemoCategoryService $service;

    protected function setUp(): void
    {
        $this->repository = $this->createMock(DemoCategoryRepository::class);
        $this->service = new DemoCategoryService($this->repository);
    }

    #[Test]
    public function it_returns_categories_from_repository(): void
    {
        // Arrange
        $expectedCategories = [
            new DemoCategoryReadModel(id: 1, name: 'Electronics'),
            new DemoCategoryReadModel(id: 2, name: 'Books'),
            new DemoCategoryReadModel(id: 3, name: 'Clothing'),
        ];

        $this->repository
            ->expects($this->once())
            ->method('findAllCategories')
            ->willReturn($expectedCategories);

        // Act
        $result = $this->service->getAllCategories();

        // Assert
        $this->assertSame($expectedCategories, $result);
        $this->assertCount(3, $result);
        $this->assertContainsOnlyInstancesOf(DemoCategoryReadModel::class, $result);
    }

    #[Test]
    public function it_returns_empty_array_when_no_categories(): void
    {
        // Arrange
        $this->repository
            ->expects($this->once())
            ->method('findAllCategories')
            ->willReturn([]);

        // Act
        $result = $this->service->getAllCategories();

        // Assert
        $this->assertIsArray($result);
        $this->assertEmpty($result);
        $this->assertCount(0, $result);
    }

    #[Test]
    public function it_delegates_to_repository_once(): void
    {
        // Arrange
        $this->repository
            ->expects($this->once())
            ->method('findAllCategories')
            ->willReturn([]);

        // Act
        $this->service->getAllCategories();

        // Assert - expectations verified by PHPUnit (exactly one call)
    }

    #[Test]
    public function it_returns_single_category_from_repository(): void
    {
        // Arrange
        $expectedCategories = [
            new DemoCategoryReadModel(id: 42, name: 'Single Category'),
        ];

        $this->repository
            ->expects($this->once())
            ->method('findAllCategories')
            ->willReturn($expectedCategories);

        // Act
        $result = $this->service->getAllCategories();

        // Assert
        $this->assertCount(1, $result);
        $this->assertEquals(42, $result[0]->id);
        $this->assertEquals('Single Category', $result[0]->name);
    }

    #[Test]
    public function it_returns_multiple_categories_from_repository(): void
    {
        // Arrange
        $expectedCategories = [
            new DemoCategoryReadModel(id: 1, name: 'Beauty & Personal Care'),
            new DemoCategoryReadModel(id: 2, name: 'Books'),
            new DemoCategoryReadModel(id: 3, name: 'Clothing'),
            new DemoCategoryReadModel(id: 4, name: 'Electronics'),
            new DemoCategoryReadModel(id: 5, name: 'Home & Garden'),
            new DemoCategoryReadModel(id: 6, name: 'Sports & Outdoors'),
        ];

        $this->repository
            ->expects($this->once())
            ->method('findAllCategories')
            ->willReturn($expectedCategories);

        // Act
        $result = $this->service->getAllCategories();

        // Assert
        $this->assertCount(6, $result);
        $this->assertSame($expectedCategories, $result);

        // Verify first and last categories
        $this->assertEquals('Beauty & Personal Care', $result[0]->name);
        $this->assertEquals('Sports & Outdoors', $result[5]->name);
    }

    #[Test]
    public function it_preserves_repository_return_order(): void
    {
        // Arrange - categories in specific order from repository
        $expectedCategories = [
            new DemoCategoryReadModel(id: 3, name: 'Third'),
            new DemoCategoryReadModel(id: 1, name: 'First'),
            new DemoCategoryReadModel(id: 2, name: 'Second'),
        ];

        $this->repository
            ->expects($this->once())
            ->method('findAllCategories')
            ->willReturn($expectedCategories);

        // Act
        $result = $this->service->getAllCategories();

        // Assert - order is preserved from repository
        $this->assertEquals(3, $result[0]->id);
        $this->assertEquals(1, $result[1]->id);
        $this->assertEquals(2, $result[2]->id);
    }

    #[Test]
    public function it_returns_categories_with_special_characters(): void
    {
        // Arrange
        $expectedCategories = [
            new DemoCategoryReadModel(id: 1, name: 'Beauty & Personal Care'),
            new DemoCategoryReadModel(id: 2, name: "Books & Media's Corner"),
        ];

        $this->repository
            ->expects($this->once())
            ->method('findAllCategories')
            ->willReturn($expectedCategories);

        // Act
        $result = $this->service->getAllCategories();

        // Assert
        $this->assertEquals('Beauty & Personal Care', $result[0]->name);
        $this->assertEquals("Books & Media's Corner", $result[1]->name);
    }

    #[Test]
    public function it_does_not_modify_repository_results(): void
    {
        // Arrange
        $categories = [
            new DemoCategoryReadModel(id: 1, name: 'Electronics'),
            new DemoCategoryReadModel(id: 2, name: 'Books'),
        ];

        $this->repository
            ->expects($this->once())
            ->method('findAllCategories')
            ->willReturn($categories);

        // Act
        $result = $this->service->getAllCategories();

        // Assert - service returns exactly what repository provides
        $this->assertSame($categories, $result);
    }
}
