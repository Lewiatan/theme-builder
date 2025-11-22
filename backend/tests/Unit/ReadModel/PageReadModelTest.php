<?php

declare(strict_types=1);

namespace App\Tests\Unit\ReadModel;

use App\ReadModel\PageReadModel;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

#[CoversClass(PageReadModel::class)]
final class PageReadModelTest extends TestCase
{
    #[Test]
    public function it_serializes_to_json_correctly(): void
    {
        // Arrange
        $type = 'home';
        $layout = [
            [
                'id' => 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
                'type' => 'hero',
                'variant' => 'with-image',
                'settings' => [
                    'heading' => 'Welcome',
                ],
            ],
        ];
        $createdAt = '2025-10-15T10:30:00+00:00';
        $updatedAt = '2025-10-15T14:30:00+00:00';

        $readModel = new PageReadModel($type, $layout, $createdAt, $updatedAt);

        // Act
        $serialized = $readModel->jsonSerialize();

        // Assert
        $this->assertSame($type, $serialized['type']);
        $this->assertSame($layout, $serialized['layout']);
        $this->assertSame($createdAt, $serialized['created_at']);
        $this->assertSame($updatedAt, $serialized['updated_at']);
    }

    #[Test]
    public function it_handles_empty_layout(): void
    {
        // Arrange
        $readModel = new PageReadModel(
            'catalog',
            [],
            '2025-10-15T10:30:00+00:00',
            '2025-10-15T10:30:00+00:00'
        );

        // Act
        $serialized = $readModel->jsonSerialize();

        // Assert
        $this->assertSame([], $serialized['layout']);
    }

    #[Test]
    public function it_preserves_complex_layout_structure(): void
    {
        // Arrange
        $complexLayout = [
            [
                'id' => 'id-1',
                'type' => 'hero',
                'variant' => 'with-image',
                'settings' => [
                    'heading' => 'Welcome',
                    'subheading' => 'Quality products',
                    'ctaText' => 'Shop Now',
                    'ctaLink' => '/catalog',
                    'imageUrl' => 'https://r2.example.com/hero.jpg',
                ],
            ],
            [
                'id' => 'id-2',
                'type' => 'featured-products',
                'variant' => 'grid-3',
                'settings' => [
                    'heading' => 'Featured Products',
                    'productIds' => [1, 2, 3],
                ],
            ],
        ];

        $readModel = new PageReadModel(
            'home',
            $complexLayout,
            '2025-10-15T10:30:00+00:00',
            '2025-10-15T14:30:00+00:00'
        );

        // Act
        $serialized = $readModel->jsonSerialize();

        // Assert
        $this->assertSame($complexLayout, $serialized['layout']);
        $this->assertCount(2, $serialized['layout']);
    }

    #[Test]
    public function it_includes_all_required_fields_in_serialization(): void
    {
        // Arrange
        $readModel = new PageReadModel(
            'product',
            [['id' => 'test-id', 'type' => 'product-info']],
            '2025-10-15T10:30:00+00:00',
            '2025-10-15T10:30:00+00:00'
        );

        // Act
        $serialized = $readModel->jsonSerialize();

        // Assert
        $this->assertArrayHasKey('type', $serialized);
        $this->assertArrayHasKey('layout', $serialized);
        $this->assertArrayHasKey('created_at', $serialized);
        $this->assertArrayHasKey('updated_at', $serialized);
        $this->assertCount(4, $serialized);
    }
}
