<?php

declare(strict_types=1);

namespace App\Model\Enum;

enum PageType: string
{
    case HOME = 'home';
    case CATALOG = 'catalog';
    case PRODUCT = 'product';
    case CONTACT = 'contact';

    public static function fromString(string $type): self
    {
        return self::from($type);
    }

    public function toString(): string
    {
        return $this->value;
    }
}
