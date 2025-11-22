<?php

declare(strict_types=1);

namespace App\Model\ValueObject;

use InvalidArgumentException;

final readonly class ProductImages
{
    public function __construct(
        private string $thumbnail,
        private string $medium,
        private string $large
    ) {
        $this->validate();
    }

    public function getThumbnail(): string
    {
        return $this->thumbnail;
    }

    public function getMedium(): string
    {
        return $this->medium;
    }

    public function getLarge(): string
    {
        return $this->large;
    }
    /**
     * @return array<string,string>
     */
    public function toArray(): array
    {
        return [
            'thumbnail' => $this->thumbnail,
            'medium' => $this->medium,
            'large' => $this->large,
        ];
    }

    private function validate(): void
    {
        if (empty($this->thumbnail)) {
            throw new InvalidArgumentException("Thumbnail image URL cannot be empty");
        }

        if (empty($this->medium)) {
            throw new InvalidArgumentException("Medium image URL cannot be empty");
        }

        if (empty($this->large)) {
            throw new InvalidArgumentException("Large image URL cannot be empty");
        }
    }
}
