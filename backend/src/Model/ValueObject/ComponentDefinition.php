<?php

declare(strict_types=1);

namespace App\Model\ValueObject;

use InvalidArgumentException;
use JsonSerializable;

final readonly class ComponentDefinition implements JsonSerializable
{
    /**
     * @param array<int,mixed> $props
     */
    public function __construct(
        private string $id,
        private string $type,
        private string $variant,
        private array $props
    ) {
        $this->validate();
    }

    /**
     * @param array<int,mixed> $data
     */
    public static function fromArray(array $data): self
    {
        if (!isset($data['id'], $data['type'], $data['variant'], $data['props'])) {
            throw new InvalidArgumentException("Invalid component definition structure");
        }

        return new self(
            $data['id'],
            $data['type'],
            $data['variant'],
            $data['props']
        );
    }
    /**
     * @return array<string,mixed>
     */
     public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'variant' => $this->variant,
            'props' => $this->props,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getVariant(): string
    {
        return $this->variant;
    }

    /**
     * @return array<int,mixed>
     */
    public function getProps(): array
    {
        return $this->props;
    }

    private function validate(): void
    {
        if (empty($this->id)) {
            throw new InvalidArgumentException("Component ID cannot be empty");
        }

        if (empty($this->type)) {
            throw new InvalidArgumentException("Component type cannot be empty");
        }

        if (empty($this->variant)) {
            throw new InvalidArgumentException("Component variant cannot be empty");
        }
    }
}
