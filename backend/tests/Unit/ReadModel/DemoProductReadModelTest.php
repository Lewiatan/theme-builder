<?php

declare(strict_types=1);

namespace App\Tests\Unit\ReadModel;

use App\ReadModel\DemoProductReadModel;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for DemoProductReadModel
 *
 * Tests the ReadModel with various scenarios:
 * - JSON serialization structure
 * - Snake_case key conversion
 * - Null sale_price handling
 * - Immutability
 */
#[CoversClass(DemoProductReadModel::class)]
final class DemoProductReadModelTest extends TestCase
{
    #[Test]
    public function it_returns_correct_structure_on_json_serialize(): void
    {
        // Arrange
        $readModel = new DemoProductReadModel(
            id: 1,
            categoryId: 2,
            categoryName: 'Electronics',
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling wireless headphones',
            price: 19999,
            salePrice: 14999,
            imageThumbnail: 'https://r2.example.com/thumb.jpg',
            imageMedium: 'https://r2.example.com/medium.jpg',
            imageLarge: 'https://r2.example.com/large.jpg'
        );

        // Act
        $result = $readModel->jsonSerialize();

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(10, $result);

        // Verify all expected keys exist
        $expectedKeys = [
            'id', 'category_id', 'category_name', 'name', 'description',
            'price', 'sale_price', 'image_thumbnail', 'image_medium', 'image_large'
        ];
        foreach ($expectedKeys as $key) {
            $this->assertArrayHasKey($key, $result);
        }
    }

    #[Test]
    public function it_converts_to_snake_case_on_json_serialize(): void
    {
        // Arrange
        $readModel = new DemoProductReadModel(
            id: 1,
            categoryId: 2,
            categoryName: 'Electronics',
            name: 'Smart Watch',
            description: 'Feature-rich smartwatch',
            price: 29999,
            salePrice: null,
            imageThumbnail: 'https://r2.example.com/thumb.jpg',
            imageMedium: 'https://r2.example.com/medium.jpg',
            imageLarge: 'https://r2.example.com/large.jpg'
        );

        // Act
        $result = $readModel->jsonSerialize();

        // Assert - camelCase properties become snake_case keys
        $this->assertEquals(2, $result['category_id']);
        $this->assertEquals('Electronics', $result['category_name']);
        $this->assertEquals('https://r2.example.com/thumb.jpg', $result['image_thumbnail']);
        $this->assertEquals('https://r2.example.com/medium.jpg', $result['image_medium']);
        $this->assertEquals('https://r2.example.com/large.jpg', $result['image_large']);
    }

    #[Test]
    public function it_handles_null_sale_price_on_json_serialize(): void
    {
        // Arrange
        $readModel = new DemoProductReadModel(
            id: 1,
            categoryId: 2,
            categoryName: 'Electronics',
            name: 'Smart Watch',
            description: 'Not on sale',
            price: 29999,
            salePrice: null,
            imageThumbnail: 'https://r2.example.com/thumb.jpg',
            imageMedium: 'https://r2.example.com/medium.jpg',
            imageLarge: 'https://r2.example.com/large.jpg'
        );

        // Act
        $result = $readModel->jsonSerialize();

        // Assert
        $this->assertArrayHasKey('sale_price', $result);
        $this->assertNull($result['sale_price']);
    }

    #[Test]
    public function it_handles_non_null_sale_price_on_json_serialize(): void
    {
        // Arrange
        $readModel = new DemoProductReadModel(
            id: 1,
            categoryId: 2,
            categoryName: 'Electronics',
            name: 'Wireless Headphones',
            description: 'On sale!',
            price: 19999,
            salePrice: 14999,
            imageThumbnail: 'https://r2.example.com/thumb.jpg',
            imageMedium: 'https://r2.example.com/medium.jpg',
            imageLarge: 'https://r2.example.com/large.jpg'
        );

        // Act
        $result = $readModel->jsonSerialize();

        // Assert
        $this->assertArrayHasKey('sale_price', $result);
        $this->assertEquals(14999, $result['sale_price']);
    }

    #[Test]
    public function it_matches_api_contract_on_json_serialize(): void
    {
        // Arrange
        $readModel = new DemoProductReadModel(
            id: 123,
            categoryId: 456,
            categoryName: 'Test Category',
            name: 'Test Product',
            description: 'Test Description',
            price: 9999,
            salePrice: 7999,
            imageThumbnail: 'https://example.com/thumb.jpg',
            imageMedium: 'https://example.com/medium.jpg',
            imageLarge: 'https://example.com/large.jpg'
        );

        // Act
        $result = $readModel->jsonSerialize();

        // Assert - verify exact values
        $this->assertEquals(123, $result['id']);
        $this->assertEquals(456, $result['category_id']);
        $this->assertEquals('Test Category', $result['category_name']);
        $this->assertEquals('Test Product', $result['name']);
        $this->assertEquals('Test Description', $result['description']);
        $this->assertEquals(9999, $result['price']);
        $this->assertEquals(7999, $result['sale_price']);
        $this->assertEquals('https://example.com/thumb.jpg', $result['image_thumbnail']);
        $this->assertEquals('https://example.com/medium.jpg', $result['image_medium']);
        $this->assertEquals('https://example.com/large.jpg', $result['image_large']);
    }

    #[Test]
    public function it_is_immutable(): void
    {
        // Arrange
        $readModel = new DemoProductReadModel(
            id: 1,
            categoryId: 2,
            categoryName: 'Electronics',
            name: 'Wireless Headphones',
            description: 'Premium headphones',
            price: 19999,
            salePrice: 14999,
            imageThumbnail: 'https://r2.example.com/thumb.jpg',
            imageMedium: 'https://r2.example.com/medium.jpg',
            imageLarge: 'https://r2.example.com/large.jpg'
        );

        // Act
        $firstSerialization = $readModel->jsonSerialize();
        $secondSerialization = $readModel->jsonSerialize();

        // Assert - multiple calls return identical data
        $this->assertEquals($firstSerialization, $secondSerialization);
    }

    #[Test]
    public function it_handles_special_characters_in_strings(): void
    {
        // Arrange
        $readModel = new DemoProductReadModel(
            id: 1,
            categoryId: 2,
            categoryName: 'Books & Media',
            name: "O'Reilly's \"PHP Guide\"",
            description: 'Special chars: <>&"\' test',
            price: 4999,
            salePrice: null,
            imageThumbnail: 'https://r2.example.com/thumb.jpg',
            imageMedium: 'https://r2.example.com/medium.jpg',
            imageLarge: 'https://r2.example.com/large.jpg'
        );

        // Act
        $result = $readModel->jsonSerialize();
        $json = json_encode($result);

        // Assert - should encode without errors
        $this->assertNotFalse($json);
        $decoded = json_decode($json, true);
        $this->assertEquals('Books & Media', $decoded['category_name']);
        $this->assertEquals("O'Reilly's \"PHP Guide\"", $decoded['name']);
        $this->assertEquals('Special chars: <>&"\' test', $decoded['description']);
    }

    #[Test]
    public function it_handles_zero_price(): void
    {
        // Arrange - free product
        $readModel = new DemoProductReadModel(
            id: 1,
            categoryId: 2,
            categoryName: 'Free Stuff',
            name: 'Free Sample',
            description: 'Completely free',
            price: 0,
            salePrice: null,
            imageThumbnail: 'https://r2.example.com/thumb.jpg',
            imageMedium: 'https://r2.example.com/medium.jpg',
            imageLarge: 'https://r2.example.com/large.jpg'
        );

        // Act
        $result = $readModel->jsonSerialize();

        // Assert
        $this->assertEquals(0, $result['price']);
    }
}
