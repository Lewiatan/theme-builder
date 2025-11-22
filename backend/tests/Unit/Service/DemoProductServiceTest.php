<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Exception\CategoryNotFoundException;
use App\ReadModel\DemoProductReadModel;
use App\Repository\DemoProductRepository;
use App\Service\DemoProductService;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for DemoProductService
 *
 * Tests the service layer with mocked repository to verify:
 * - Correct delegation to repository methods
 * - Category existence validation logic
 * - Exception handling for non-existent categories
 * - Proper null handling for optional category filter
 */
#[CoversClass(DemoProductService::class)]
final class DemoProductServiceTest extends TestCase
{
    private DemoProductRepository|MockObject $repository;
    private DemoProductService $service;

    protected function setUp(): void
    {
        $this->repository = $this->createMock(DemoProductRepository::class);
        $this->service = new DemoProductService($this->repository);
    }

    #[Test]
    public function it_returns_all_products_when_category_id_is_null(): void
    {
        // Arrange
        $expectedProducts = [
            new DemoProductReadModel(
                id: 1,
                categoryId: 1,
                categoryName: 'Electronics',
                name: 'Headphones',
                description: 'Wireless headphones',
                price: 19999,
                salePrice: null,
                imageThumbnail: 'https://r2.example.com/thumb.jpg',
                imageMedium: 'https://r2.example.com/medium.jpg',
                imageLarge: 'https://r2.example.com/large.jpg'
            ),
            new DemoProductReadModel(
                id: 2,
                categoryId: 2,
                categoryName: 'Books',
                name: 'PHP Guide',
                description: 'Programming book',
                price: 4999,
                salePrice: 3999,
                imageThumbnail: 'https://r2.example.com/thumb2.jpg',
                imageMedium: 'https://r2.example.com/medium2.jpg',
                imageLarge: 'https://r2.example.com/large2.jpg'
            ),
        ];

        $this->repository
            ->expects($this->once())
            ->method('findAllProducts')
            ->willReturn($expectedProducts);

        // categoryExists should not be called when category_id is null
        $this->repository
            ->expects($this->never())
            ->method('categoryExists');

        // findProductsByCategoryId should not be called when category_id is null
        $this->repository
            ->expects($this->never())
            ->method('findProductsByCategoryId');

        // Act
        $result = $this->service->getProducts(null);

        // Assert
        $this->assertSame($expectedProducts, $result);
        $this->assertCount(2, $result);
    }

    #[Test]
    public function it_validates_category_exists_before_filtering(): void
    {
        // Arrange
        $categoryId = 5;

        $this->repository
            ->expects($this->once())
            ->method('categoryExists')
            ->with($categoryId)
            ->willReturn(true);

        $this->repository
            ->expects($this->once())
            ->method('findProductsByCategoryId')
            ->with($categoryId)
            ->willReturn([]);

        // Act
        $this->service->getProducts($categoryId);

        // Assert - expectations verified by PHPUnit
    }

    #[Test]
    public function it_throws_exception_when_category_does_not_exist(): void
    {
        // Arrange
        $categoryId = 999;

        $this->repository
            ->expects($this->once())
            ->method('categoryExists')
            ->with($categoryId)
            ->willReturn(false);

        // findProductsByCategoryId should not be called when category doesn't exist
        $this->repository
            ->expects($this->never())
            ->method('findProductsByCategoryId');

        // Assert
        $this->expectException(CategoryNotFoundException::class);
        $this->expectExceptionMessage('Category with ID 999 not found');

        // Act
        $this->service->getProducts($categoryId);
    }

    #[Test]
    public function it_returns_filtered_products_when_category_exists(): void
    {
        // Arrange
        $categoryId = 3;
        $expectedProducts = [
            new DemoProductReadModel(
                id: 5,
                categoryId: 3,
                categoryName: 'Clothing',
                name: 'T-Shirt',
                description: 'Cotton t-shirt',
                price: 2999,
                salePrice: null,
                imageThumbnail: 'https://r2.example.com/thumb.jpg',
                imageMedium: 'https://r2.example.com/medium.jpg',
                imageLarge: 'https://r2.example.com/large.jpg'
            ),
        ];

        $this->repository
            ->expects($this->once())
            ->method('categoryExists')
            ->with($categoryId)
            ->willReturn(true);

        $this->repository
            ->expects($this->once())
            ->method('findProductsByCategoryId')
            ->with($categoryId)
            ->willReturn($expectedProducts);

        // Act
        $result = $this->service->getProducts($categoryId);

        // Assert
        $this->assertSame($expectedProducts, $result);
        $this->assertCount(1, $result);
    }

    #[Test]
    public function it_returns_empty_array_when_category_exists_but_has_no_products(): void
    {
        // Arrange
        $categoryId = 10;

        $this->repository
            ->expects($this->once())
            ->method('categoryExists')
            ->with($categoryId)
            ->willReturn(true);

        $this->repository
            ->expects($this->once())
            ->method('findProductsByCategoryId')
            ->with($categoryId)
            ->willReturn([]);

        // Act
        $result = $this->service->getProducts($categoryId);

        // Assert
        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    #[Test]
    public function it_passes_correct_parameters_to_repository(): void
    {
        // Arrange
        $categoryId = 7;

        $this->repository
            ->expects($this->once())
            ->method('categoryExists')
            ->with($this->identicalTo($categoryId))
            ->willReturn(true);

        $this->repository
            ->expects($this->once())
            ->method('findProductsByCategoryId')
            ->with($this->identicalTo($categoryId))
            ->willReturn([]);

        // Act
        $this->service->getProducts($categoryId);

        // Assert - expectations verified by PHPUnit
    }

    #[Test]
    public function it_does_not_call_repository_methods_unnecessarily(): void
    {
        // Arrange - when category doesn't exist
        $categoryId = 404;

        $this->repository
            ->expects($this->once())
            ->method('categoryExists')
            ->with($categoryId)
            ->willReturn(false);

        // findProductsByCategoryId should never be called if category doesn't exist
        $this->repository
            ->expects($this->never())
            ->method('findProductsByCategoryId');

        // findAllProducts should never be called when categoryId is provided
        $this->repository
            ->expects($this->never())
            ->method('findAllProducts');

        try {
            // Act
            $this->service->getProducts($categoryId);
            $this->fail('Expected CategoryNotFoundException was not thrown');
        } catch (CategoryNotFoundException $e) {
            // Assert - exception was thrown, method expectations verified
            $this->assertInstanceOf(CategoryNotFoundException::class, $e);
        }
    }
}
