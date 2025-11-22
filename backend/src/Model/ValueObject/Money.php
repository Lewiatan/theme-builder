<?php

declare(strict_types=1);

namespace App\Model\ValueObject;

use InvalidArgumentException;

final readonly class Money
{
    public function __construct(
        private int $amountInCents
    ) {
        if ($amountInCents < 0) {
            throw new InvalidArgumentException("Money amount cannot be negative");
        }
    }

    public function getAmountInCents(): int
    {
        return $this->amountInCents;
    }

    public function getAmountInDollars(): float
    {
        return $this->amountInCents / 100;
    }

    public function format(string $currencySymbol = '$'): string
    {
        return sprintf('%s%.2f', $currencySymbol, $this->getAmountInDollars());
    }

    public function equals(Money $other): bool
    {
        return $this->amountInCents === $other->amountInCents;
    }
}
