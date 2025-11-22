<?php

declare(strict_types=1);

namespace App\Tests\Unit\ReadModel;

use App\ReadModel\DemoPageReadModel;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for DemoPageReadModel
 *
 * Tests the ReadModel with various scenarios:
 * - JSON serialization structure
 * - Immutability
 */
#[CoversClass(DemoPageReadModel::class)]
final class DemoPageReadModelTest extends TestCase
{
    #[Test]
    public function it_returns_correct_structure_on_json_serialize(): void
    {
        // Arrange
        $readModel = new DemoPageReadModel(
            type: 'home',
            layout: [
                'components' => [
                    ['id' => 'c1', 'type' => 'hero', 'variant' => 'default', 'settings' => []]
                ]
            ]
        );

        // Act
        $result = $readModel->jsonSerialize();

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);

        // Verify all expected keys exist
        $expectedKeys = [
            'type', 'layout'
        ];
        foreach ($expectedKeys as $key) {
            $this->assertArrayHasKey($key, $result);
        }
        
        $this->assertArrayHasKey('components', $result['layout']);
    }

    #[Test]
    public function it_is_immutable(): void
    {
        // Arrange
        $readModel = new DemoPageReadModel(
            type: 'home',
            layout: [
                'components' => [
                    ['id' => 'c1', 'type' => 'hero', 'variant' => 'default', 'settings' => []]
                ]
            ]
        );

        // Act
        $firstSerialization = $readModel->jsonSerialize();
        $secondSerialization = $readModel->jsonSerialize();

        // Assert - multiple calls return identical data
        $this->assertEquals($firstSerialization, $secondSerialization);
    }
}
