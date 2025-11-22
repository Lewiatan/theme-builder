<?php

declare(strict_types=1);

namespace App\Tests\Unit\Model\ValueObject;

use App\Model\ValueObject\Money;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;

#[CoversClass(Money::class)]
final class MoneyTest extends TestCase
{
    #[Test]
    public function it_creates_money_with_valid_amount(): void
    {
        $money = new Money(1000);

        $this->assertSame(1000, $money->getAmountInCents());
    }

    #[Test]
    public function it_creates_money_with_zero_amount(): void
    {
        $money = new Money(0);

        $this->assertSame(0, $money->getAmountInCents());
    }

    #[Test]
    public function it_throws_exception_for_negative_amount(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Money amount cannot be negative');

        new Money(-100);
    }

    #[Test]
    public function it_converts_cents_to_dollars_correctly(): void
    {
        $money = new Money(1050);

        $this->assertSame(10.50, $money->getAmountInDollars());
    }

    #[Test]
    #[TestWith([0, 0.0])]
    #[TestWith([1, 0.01])]
    #[TestWith([100, 1.0])]
    #[TestWith([1234, 12.34])]
    #[TestWith([999999, 9999.99])]
    public function it_converts_various_cent_amounts_to_dollars(int $cents, float $expectedDollars): void
    {
        $money = new Money($cents);

        $this->assertSame($expectedDollars, $money->getAmountInDollars());
    }

    #[Test]
    public function it_formats_with_default_currency_symbol(): void
    {
        $money = new Money(1234);

        $this->assertSame('$12.34', $money->format());
    }

    #[Test]
    public function it_formats_with_custom_currency_symbol(): void
    {
        $money = new Money(5000);

        $this->assertSame('€50.00', $money->format('€'));
        $this->assertSame('£50.00', $money->format('£'));
        $this->assertSame('¥50.00', $money->format('¥'));
    }

    #[Test]
    #[TestWith([0, '$0.00'])]
    #[TestWith([1, '$0.01'])]
    #[TestWith([99, '$0.99'])]
    #[TestWith([100, '$1.00'])]
    #[TestWith([1000, '$10.00'])]
    #[TestWith([123456, '$1234.56'])]
    public function it_formats_various_amounts_correctly(int $cents, string $expected): void
    {
        $money = new Money($cents);

        $this->assertSame($expected, $money->format());
    }

    #[Test]
    public function it_compares_equal_money_objects(): void
    {
        $money1 = new Money(1000);
        $money2 = new Money(1000);

        $this->assertTrue($money1->equals($money2));
    }

    #[Test]
    public function it_compares_different_money_objects(): void
    {
        $money1 = new Money(1000);
        $money2 = new Money(2000);

        $this->assertFalse($money1->equals($money2));
    }

    #[Test]
    public function it_handles_large_amounts(): void
    {
        $money = new Money(PHP_INT_MAX);

        $this->assertSame(PHP_INT_MAX, $money->getAmountInCents());
        $this->assertIsFloat($money->getAmountInDollars());
    }

    #[Test]
    public function it_maintains_precision_in_formatting(): void
    {
        $money = new Money(1);

        $this->assertSame('$0.01', $money->format());
    }
}
