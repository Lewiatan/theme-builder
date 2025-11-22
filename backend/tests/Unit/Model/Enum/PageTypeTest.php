<?php

declare(strict_types=1);

namespace App\Tests\Unit\Model\Enum;

use App\Model\Enum\PageType;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use ValueError;

#[CoversClass(PageType::class)]
final class PageTypeTest extends TestCase
{
    #[Test]
    public function it_has_all_expected_cases(): void
    {
        $cases = PageType::cases();

        $this->assertCount(4, $cases);
        $this->assertContains(PageType::HOME, $cases);
        $this->assertContains(PageType::CATALOG, $cases);
        $this->assertContains(PageType::PRODUCT, $cases);
        $this->assertContains(PageType::CONTACT, $cases);
    }

    #[Test]
    #[TestWith(['home', PageType::HOME])]
    #[TestWith(['catalog', PageType::CATALOG])]
    #[TestWith(['product', PageType::PRODUCT])]
    #[TestWith(['contact', PageType::CONTACT])]
    public function it_creates_from_string(string $value, PageType $expected): void
    {
        $pageType = PageType::fromString($value);

        $this->assertSame($expected, $pageType);
    }

    #[Test]
    #[TestWith(['invalid'])]
    #[TestWith([''])]
    #[TestWith(['HOME'])]
    #[TestWith(['Home'])]
    public function it_throws_exception_for_invalid_string(string $invalidValue): void
    {
        $this->expectException(ValueError::class);

        PageType::fromString($invalidValue);
    }

    #[Test]
    public function it_converts_to_string(): void
    {
        $this->assertSame('home', PageType::HOME->toString());
        $this->assertSame('catalog', PageType::CATALOG->toString());
        $this->assertSame('product', PageType::PRODUCT->toString());
        $this->assertSame('contact', PageType::CONTACT->toString());
    }

    #[Test]
    public function it_has_correct_backing_values(): void
    {
        $this->assertSame('home', PageType::HOME->value);
        $this->assertSame('catalog', PageType::CATALOG->value);
        $this->assertSame('product', PageType::PRODUCT->value);
        $this->assertSame('contact', PageType::CONTACT->value);
    }

    #[Test]
    public function it_can_be_compared_for_equality(): void
    {
        $home1 = PageType::HOME;
        $home2 = PageType::fromString('home');
        $catalog = PageType::CATALOG;

        $this->assertSame($home1, $home2);
        $this->assertNotSame($home1, $catalog);
    }

    #[Test]
    public function it_can_be_used_in_match_expression(): void
    {
        $result = match (PageType::HOME) {
            PageType::HOME => 'home-page',
            PageType::CATALOG => 'catalog-page',
            PageType::PRODUCT => 'product-page',
            PageType::CONTACT => 'contact-page',
        };

        $this->assertSame('home-page', $result);
    }

    #[Test]
    public function from_string_and_to_string_are_reversible(): void
    {
        foreach (PageType::cases() as $pageType) {
            $string = $pageType->toString();
            $recreated = PageType::fromString($string);

            $this->assertSame($pageType, $recreated);
        }
    }
}
