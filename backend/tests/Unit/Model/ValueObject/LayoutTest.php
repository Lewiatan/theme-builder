<?php

declare(strict_types=1);

namespace App\Tests\Unit\Model\ValueObject;

use App\Model\ValueObject\ComponentDefinition;
use App\Model\ValueObject\Layout;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use stdClass;

#[CoversClass(Layout::class)]
final class LayoutTest extends TestCase
{
    #[Test]
    public function it_creates_empty_layout(): void
    {
        $layout = Layout::empty();

        $this->assertTrue($layout->isEmpty());
        $this->assertSame(0, $layout->count());
        $this->assertSame([], $layout->getComponents());
    }

    #[Test]
    public function it_creates_layout_with_components(): void
    {
        $component = new ComponentDefinition('comp-1', 'hero', 'default', []);
        $layout = new Layout([$component]);

        $this->assertFalse($layout->isEmpty());
        $this->assertSame(1, $layout->count());
        $this->assertSame([$component], $layout->getComponents());
    }

    #[Test]
    public function it_throws_exception_for_invalid_component_type(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('All items must be ComponentDefinition instances');

        new Layout([new stdClass()]);
    }

    #[Test]
    public function it_throws_exception_for_mixed_array_with_invalid_items(): void
    {
        $validComponent = new ComponentDefinition('comp-1', 'hero', 'default', []);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('All items must be ComponentDefinition instances');

        new Layout([$validComponent, 'invalid']);
    }

    #[Test]
    public function it_creates_from_array(): void
    {
        $data = [
            ['id' => 'comp-1', 'type' => 'hero', 'variant' => 'default', 'settings' => []],
            ['id' => 'comp-2', 'type' => 'footer', 'variant' => 'minimal', 'settings' => []],
        ];

        $layout = Layout::fromArray($data);

        $this->assertSame(2, $layout->count());
        $components = $layout->getComponents();
        $this->assertSame('comp-1', $components[0]->getId());
        $this->assertSame('comp-2', $components[1]->getId());
    }

    #[Test]
    public function it_converts_to_array(): void
    {
        $component1 = new ComponentDefinition('comp-1', 'hero', 'default', ['title' => 'Hello']);
        $component2 = new ComponentDefinition('comp-2', 'footer', 'minimal', []);

        $layout = new Layout([$component1, $component2]);

        $expected = [
            ['id' => 'comp-1', 'type' => 'hero', 'variant' => 'default', 'settings' => ['title' => 'Hello']],
            ['id' => 'comp-2', 'type' => 'footer', 'variant' => 'minimal', 'settings' => []],
        ];

        $this->assertSame($expected, $layout->toArray());
    }

    #[Test]
    public function from_array_and_to_array_are_reversible(): void
    {
        $original = [
            ['id' => 'comp-1', 'type' => 'hero', 'variant' => 'default', 'settings' => []],
            ['id' => 'comp-2', 'type' => 'footer', 'variant' => 'minimal', 'settings' => []],
        ];

        $layout = Layout::fromArray($original);
        $result = $layout->toArray();

        $this->assertSame($original, $result);
    }

    #[Test]
    public function it_adds_component_creating_new_instance(): void
    {
        $component1 = new ComponentDefinition('comp-1', 'hero', 'default', []);
        $component2 = new ComponentDefinition('comp-2', 'footer', 'minimal', []);

        $layout = new Layout([$component1]);
        $newLayout = $layout->withComponent($component2);

        // Original remains unchanged
        $this->assertSame(1, $layout->count());

        // New instance has both components
        $this->assertSame(2, $newLayout->count());
        $components = $newLayout->getComponents();
        $this->assertSame('comp-1', $components[0]->getId());
        $this->assertSame('comp-2', $components[1]->getId());
    }

    #[Test]
    public function it_removes_component_by_id_creating_new_instance(): void
    {
        $component1 = new ComponentDefinition('comp-1', 'hero', 'default', []);
        $component2 = new ComponentDefinition('comp-2', 'footer', 'minimal', []);

        $layout = new Layout([$component1, $component2]);
        $newLayout = $layout->withoutComponent('comp-1');

        // Original remains unchanged
        $this->assertSame(2, $layout->count());

        // New instance has only one component
        $this->assertSame(1, $newLayout->count());
        $components = $newLayout->getComponents();
        $this->assertSame('comp-2', $components[0]->getId());
    }

    #[Test]
    public function it_removes_non_existent_component_gracefully(): void
    {
        $component = new ComponentDefinition('comp-1', 'hero', 'default', []);
        $layout = new Layout([$component]);
        $newLayout = $layout->withoutComponent('non-existent');

        // Original count remains
        $this->assertSame(1, $newLayout->count());
        $this->assertSame('comp-1', $newLayout->getComponents()[0]->getId());
    }

    #[Test]
    public function it_maintains_component_order(): void
    {
        $component1 = new ComponentDefinition('comp-1', 'hero', 'default', []);
        $component2 = new ComponentDefinition('comp-2', 'content', 'text', []);
        $component3 = new ComponentDefinition('comp-3', 'footer', 'minimal', []);

        $layout = new Layout([$component1, $component2, $component3]);
        $components = $layout->getComponents();

        $this->assertSame('comp-1', $components[0]->getId());
        $this->assertSame('comp-2', $components[1]->getId());
        $this->assertSame('comp-3', $components[2]->getId());
    }

    #[Test]
    public function it_reindexes_array_after_removal(): void
    {
        $component1 = new ComponentDefinition('comp-1', 'hero', 'default', []);
        $component2 = new ComponentDefinition('comp-2', 'content', 'text', []);
        $component3 = new ComponentDefinition('comp-3', 'footer', 'minimal', []);

        $layout = new Layout([$component1, $component2, $component3]);
        $newLayout = $layout->withoutComponent('comp-2');

        $components = $newLayout->getComponents();

        // Check that array keys are sequential starting from 0
        $this->assertArrayHasKey(0, $components);
        $this->assertArrayHasKey(1, $components);
        $this->assertArrayNotHasKey(2, $components);

        $this->assertSame('comp-1', $components[0]->getId());
        $this->assertSame('comp-3', $components[1]->getId());
    }

    #[Test]
    public function it_chains_immutable_operations(): void
    {
        $component1 = new ComponentDefinition('comp-1', 'hero', 'default', []);
        $component2 = new ComponentDefinition('comp-2', 'footer', 'minimal', []);
        $component3 = new ComponentDefinition('comp-3', 'navigation', 'sticky', []);

        $layout = Layout::empty()
            ->withComponent($component1)
            ->withComponent($component2)
            ->withComponent($component3)
            ->withoutComponent('comp-2');

        $this->assertSame(2, $layout->count());
        $components = $layout->getComponents();
        $this->assertSame('comp-1', $components[0]->getId());
        $this->assertSame('comp-3', $components[1]->getId());
    }

    #[Test]
    public function it_handles_large_number_of_components(): void
    {
        $components = [];
        for ($i = 0; $i < 100; $i++) {
            $components[] = new ComponentDefinition("comp-{$i}", 'type', 'variant', []);
        }

        $layout = new Layout($components);

        $this->assertSame(100, $layout->count());
        $this->assertFalse($layout->isEmpty());
    }

    #[Test]
    public function empty_layout_to_array_returns_empty_array(): void
    {
        $layout = Layout::empty();

        $this->assertSame([], $layout->toArray());
    }
}
