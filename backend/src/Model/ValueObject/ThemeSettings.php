<?php

declare(strict_types=1);

namespace App\Model\ValueObject;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Embeddable]
final readonly class ThemeSettings
{
    /**
     * @param array<int,mixed> $settings
     */
    public function __construct(
        #[ORM\Column(name: 'theme_settings', type: 'json', nullable: false, options: ['default' => '{}'])]
        private array $settings
    ) {}

    /**
     * @param array<int,mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public static function default(): self
    {
        return new self([]);
    }

    /**
     * @return array<int,mixed>
     */
    public function toArray(): array
    {
        return $this->settings;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->settings[$key] ?? $default;
    }

    public function has(string $key): bool
    {
        return array_key_exists($key, $this->settings);
    }

    public function with(string $key, mixed $value): self
    {
        $settings = $this->settings;
        $settings[$key] = $value;

        return new self($settings);
    }

    public function without(string $key): self
    {
        $settings = $this->settings;
        unset($settings[$key]);

        return new self($settings);
    }
    /**
     * @param array<int,mixed> $settings
     */
    public function merge(array $settings): self
    {
        return new self(array_merge($this->settings, $settings));
    }
}
