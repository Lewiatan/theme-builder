<?php

declare(strict_types=1);

namespace App\Tests\Unit\Model\ValueObject;

use App\Model\ValueObject\ComponentDefinition;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

#[CoversClass(ComponentDefinition::class)]
final class ComponentDefinitionTest extends TestCase
{
    #[Test]
    public function it_creates_component_definition_with_valid_data(): void
    {
        $component = new ComponentDefinition(
            'comp-123',
            'hero',
            'default',
            ['title' => 'Welcome']
        );

        $this->assertSame('comp-123', $component->getId());
        $this->assertSame('hero', $component->getType());
        $this->assertSame('default', $component->getVariant());
        $this->assertSame(['title' => 'Welcome'], $component->getProps());
    }

    #[Test]
    public function it_creates_from_array(): void
    {
        $data = [
            'id' => 'comp-456',
            'type' => 'footer',
            'variant' => 'minimal',
            'props' => ['links' => ['About', 'Contact']],
        ];

        $component = ComponentDefinition::fromArray($data);

        $this->assertSame('comp-456', $component->getId());
        $this->assertSame('footer', $component->getType());
        $this->assertSame('minimal', $component->getVariant());
        $this->assertSame(['links' => ['About', 'Contact']], $component->getProps());
    }

    #[Test]
    public function it_throws_exception_when_from_array_missing_id(): void
    {
        $data = [
            'type' => 'hero',
            'variant' => 'default',
            'props' => [],
        ];

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid component definition structure');

        ComponentDefinition::fromArray($data);
    }

    #[Test]
    public function it_throws_exception_when_from_array_missing_type(): void
    {
        $data = [
            'id' => 'comp-123',
            'variant' => 'default',
            'props' => [],
        ];

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid component definition structure');

        ComponentDefinition::fromArray($data);
    }

    #[Test]
    public function it_throws_exception_when_from_array_missing_variant(): void
    {
        $data = [
            'id' => 'comp-123',
            'type' => 'hero',
            'props' => [],
        ];

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid component definition structure');

        ComponentDefinition::fromArray($data);
    }

    #[Test]
    public function it_throws_exception_when_from_array_missing_props(): void
    {
        $data = [
            'id' => 'comp-123',
            'type' => 'hero',
            'variant' => 'default',
        ];

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid component definition structure');

        ComponentDefinition::fromArray($data);
    }

    #[Test]
    public function it_throws_exception_for_empty_id(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Component ID cannot be empty');

        new ComponentDefinition('', 'hero', 'default', []);
    }

    #[Test]
    public function it_throws_exception_for_empty_type(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Component type cannot be empty');

        new ComponentDefinition('comp-123', '', 'default', []);
    }

    #[Test]
    public function it_throws_exception_for_empty_variant(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Component variant cannot be empty');

        new ComponentDefinition('comp-123', 'hero', '', []);
    }

    #[Test]
    public function it_allows_empty_props(): void
    {
        $component = new ComponentDefinition('comp-123', 'hero', 'default', []);

        $this->assertSame([], $component->getProps());
    }

    #[Test]
    public function it_converts_to_array(): void
    {
        $component = new ComponentDefinition(
            'comp-789',
            'navigation',
            'sticky',
            ['items' => ['Home', 'About']]
        );

        $expected = [
            'id' => 'comp-789',
            'type' => 'navigation',
            'variant' => 'sticky',
            'props' => ['items' => ['Home', 'About']],
        ];

        $this->assertSame($expected, $component->toArray());
    }

    #[Test]
    public function from_array_and_to_array_are_reversible(): void
    {
        $original = [
            'id' => 'comp-999',
            'type' => 'carousel',
            'variant' => 'autoplay',
            'props' => ['interval' => 3000, 'loop' => true],
        ];

        $component = ComponentDefinition::fromArray($original);
        $result = $component->toArray();

        $this->assertSame($original, $result);
    }

    #[Test]
    public function it_handles_complex_nested_props(): void
    {
        $props = [
            'style' => [
                'colors' => ['primary' => '#000', 'secondary' => '#fff'],
                'spacing' => ['top' => 10, 'bottom' => 20],
            ],
            'content' => [
                'items' => [
                    ['title' => 'Item 1', 'description' => 'Description 1'],
                    ['title' => 'Item 2', 'description' => 'Description 2'],
                ],
            ],
        ];

        $component = new ComponentDefinition('comp-complex', 'gallery', 'grid', $props);

        $this->assertSame($props, $component->getProps());
    }

    #[Test]
    public function to_array_contains_all_required_keys(): void
    {
        $component = new ComponentDefinition('id', 'type', 'variant', []);
        $array = $component->toArray();

        $this->assertArrayHasKey('id', $array);
        $this->assertArrayHasKey('type', $array);
        $this->assertArrayHasKey('variant', $array);
        $this->assertArrayHasKey('props', $array);
    }
}
