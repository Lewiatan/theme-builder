<?php

declare(strict_types=1);

namespace App\Model\ValueObject;

use Doctrine\ORM\Mapping as ORM;
use InvalidArgumentException;

#[ORM\Embeddable]
final readonly class Layout
{
    /** @var ComponentDefinition[] */
    #[ORM\Column(name: 'layout', type: 'json', nullable: false, options: ['default' => '[]'])]
    private array $components;

    /**
     * @param ComponentDefinition[] $components
     */
    public function __construct(array $components)
    {
        $this->validateComponents($components);
        $this->components = array_values($components);
    }
    /**
     * @param array<int,mixed> $data
     */
    public static function fromArray(array $data): self
    {
        $components = array_map(
            fn(array $item) => ComponentDefinition::fromArray($item),
            $data
        );

        return new self($components);
    }

    public static function empty(): self
    {
        return new self([]);
    }

    public function toArray(): array
    {
        return array_map(
            fn(ComponentDefinition $component) => $component->toArray(),
            $this->components
        );
    }

    /**
     * @return ComponentDefinition[]
     */
    public function getComponents(): array
    {
        return $this->components;
    }

    public function isEmpty(): bool
    {
        return empty($this->components);
    }

    public function count(): int
    {
        return count($this->components);
    }

    public function withComponent(ComponentDefinition $component): self
    {
        $components = $this->components;
        $components[] = $component;

        return new self($components);
    }

    public function withoutComponent(string $componentId): self
    {
        $components = array_filter(
            $this->components,
            fn(ComponentDefinition $component) => $component->getId() !== $componentId
        );

        return new self($components);
    }

    /**
     * @param array $components
     */
    private function validateComponents(array $components): void
    {
        foreach ($components as $component) {
            if (!$component instanceof ComponentDefinition) {
                throw new InvalidArgumentException("All items must be ComponentDefinition instances");
            }
        }
    }
}
