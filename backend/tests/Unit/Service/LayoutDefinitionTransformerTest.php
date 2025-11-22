<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Service\LayoutDefinitionTransformer;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for LayoutDefinitionTransformer
 *
 * Tests the transformation logic that converts component definitions
 * from application format (with 'settings') to database/seeder format
 * (with 'props') and handles ID overrides for consistent seeding.
 */
#[CoversClass(LayoutDefinitionTransformer::class)]
final class LayoutDefinitionTransformerTest extends TestCase
{
    #[Test]
    public function it_transforms_settings_to_props(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'comp-1',
                'type' => 'Heading',
                'variant' => 'text-only',
                'settings' => [
                    'text' => 'Welcome',
                    'level' => 'h1',
                ],
            ],
        ];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components);

        // Assert
        $this->assertCount(1, $result);
        $this->assertArrayHasKey('props', $result[0]);
        $this->assertArrayNotHasKey('settings', $result[0]);
        $this->assertSame([
            'text' => 'Welcome',
            'level' => 'h1',
        ], $result[0]['props']);
    }

    #[Test]
    public function it_overrides_ids_from_id_map(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'default-header-home',
                'type' => 'HeaderNavigation',
                'settings' => [],
            ],
        ];

        $idMap = [
            'default-header-home' => '550e8400-e29b-41d4-a716-446655440100',
        ];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components, $idMap);

        // Assert
        $this->assertSame('550e8400-e29b-41d4-a716-446655440100', $result[0]['id']);
    }

    #[Test]
    public function it_preserves_original_id_when_not_in_map(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'default-header-home',
                'type' => 'HeaderNavigation',
                'settings' => [],
            ],
        ];

        $idMap = [
            'different-id' => '550e8400-e29b-41d4-a716-446655440100',
        ];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components, $idMap);

        // Assert
        $this->assertSame('default-header-home', $result[0]['id']);
    }

    #[Test]
    public function it_handles_components_without_settings(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'comp-1',
                'type' => 'Spacer',
                'variant' => 'default',
            ],
        ];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components);

        // Assert
        $this->assertCount(1, $result);
        $this->assertArrayNotHasKey('settings', $result[0]);
        $this->assertArrayNotHasKey('props', $result[0]);
        $this->assertSame('comp-1', $result[0]['id']);
        $this->assertSame('Spacer', $result[0]['type']);
    }

    #[Test]
    public function it_transforms_multiple_components(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'comp-1',
                'type' => 'Heading',
                'settings' => ['text' => 'Title 1'],
            ],
            [
                'id' => 'comp-2',
                'type' => 'Heading',
                'settings' => ['text' => 'Title 2'],
            ],
            [
                'id' => 'comp-3',
                'type' => 'TextSection',
                'settings' => ['columnCount' => 2],
            ],
        ];

        $idMap = [
            'comp-1' => 'uuid-1',
            'comp-3' => 'uuid-3',
        ];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components, $idMap);

        // Assert
        $this->assertCount(3, $result);

        // First component: ID overridden, settings -> props
        $this->assertSame('uuid-1', $result[0]['id']);
        $this->assertArrayHasKey('props', $result[0]);
        $this->assertSame(['text' => 'Title 1'], $result[0]['props']);

        // Second component: ID preserved, settings -> props
        $this->assertSame('comp-2', $result[1]['id']);
        $this->assertArrayHasKey('props', $result[1]);
        $this->assertSame(['text' => 'Title 2'], $result[1]['props']);

        // Third component: ID overridden, settings -> props
        $this->assertSame('uuid-3', $result[2]['id']);
        $this->assertArrayHasKey('props', $result[2]);
        $this->assertSame(['columnCount' => 2], $result[2]['props']);
    }

    #[Test]
    public function it_handles_empty_array(): void
    {
        // Arrange
        $components = [];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(0, $result);
    }

    #[Test]
    public function it_handles_empty_id_map(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'comp-1',
                'type' => 'Heading',
                'settings' => ['text' => 'Title'],
            ],
        ];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components, []);

        // Assert
        $this->assertSame('comp-1', $result[0]['id']);
        $this->assertArrayHasKey('props', $result[0]);
    }

    #[Test]
    public function it_preserves_all_other_properties(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'comp-1',
                'type' => 'Heading',
                'variant' => 'background-image',
                'settings' => [
                    'text' => 'Welcome',
                    'level' => 'h1',
                    'backgroundImageUrl' => 'https://example.com/image.jpg',
                    'textColor' => '#ffffff',
                ],
            ],
        ];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components);

        // Assert
        $this->assertSame('comp-1', $result[0]['id']);
        $this->assertSame('Heading', $result[0]['type']);
        $this->assertSame('background-image', $result[0]['variant']);
        $this->assertSame([
            'text' => 'Welcome',
            'level' => 'h1',
            'backgroundImageUrl' => 'https://example.com/image.jpg',
            'textColor' => '#ffffff',
        ], $result[0]['props']);
    }

    #[Test]
    public function it_handles_nested_settings_structures(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'comp-1',
                'type' => 'TextSection',
                'settings' => [
                    'variant' => 'with-icons',
                    'columnCount' => 3,
                    'columns' => [
                        [
                            'text' => 'Column 1 text',
                            'iconUrl' => 'https://example.com/icon1.jpg',
                        ],
                        [
                            'text' => 'Column 2 text',
                            'iconUrl' => 'https://example.com/icon2.jpg',
                        ],
                    ],
                ],
            ],
        ];

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components);

        // Assert
        $this->assertArrayHasKey('props', $result[0]);
        $this->assertIsArray($result[0]['props']['columns']);
        $this->assertCount(2, $result[0]['props']['columns']);
        $this->assertSame('Column 1 text', $result[0]['props']['columns'][0]['text']);
        $this->assertSame('https://example.com/icon1.jpg', $result[0]['props']['columns'][0]['iconUrl']);
    }

    #[Test]
    public function it_creates_new_array_without_mutating_input(): void
    {
        // Arrange
        $components = [
            [
                'id' => 'comp-1',
                'type' => 'Heading',
                'settings' => ['text' => 'Title'],
            ],
        ];

        $originalComponents = $components;

        // Act
        $result = LayoutDefinitionTransformer::transformForSeeder($components);

        // Assert - Original array should not be mutated
        $this->assertSame($originalComponents, $components);
        $this->assertArrayHasKey('settings', $components[0]);
        $this->assertArrayNotHasKey('props', $components[0]);

        // Result should have the transformation
        $this->assertArrayNotHasKey('settings', $result[0]);
        $this->assertArrayHasKey('props', $result[0]);
    }
}
