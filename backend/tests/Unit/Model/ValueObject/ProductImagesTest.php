<?php

declare(strict_types=1);

namespace App\Tests\Unit\Model\ValueObject;

use App\Model\ValueObject\ProductImages;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

#[CoversClass(ProductImages::class)]
final class ProductImagesTest extends TestCase
{
    #[Test]
    public function it_creates_product_images_with_valid_urls(): void
    {
        $images = new ProductImages(
            'https://example.com/thumb.jpg',
            'https://example.com/medium.jpg',
            'https://example.com/large.jpg'
        );

        $this->assertSame('https://example.com/thumb.jpg', $images->getThumbnail());
        $this->assertSame('https://example.com/medium.jpg', $images->getMedium());
        $this->assertSame('https://example.com/large.jpg', $images->getLarge());
    }

    #[Test]
    public function it_throws_exception_for_empty_thumbnail(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Thumbnail image URL cannot be empty');

        new ProductImages(
            '',
            'https://example.com/medium.jpg',
            'https://example.com/large.jpg'
        );
    }

    #[Test]
    public function it_throws_exception_for_empty_medium(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Medium image URL cannot be empty');

        new ProductImages(
            'https://example.com/thumb.jpg',
            '',
            'https://example.com/large.jpg'
        );
    }

    #[Test]
    public function it_throws_exception_for_empty_large(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Large image URL cannot be empty');

        new ProductImages(
            'https://example.com/thumb.jpg',
            'https://example.com/medium.jpg',
            ''
        );
    }

    #[Test]
    public function it_converts_to_array(): void
    {
        $images = new ProductImages(
            'https://example.com/thumb.jpg',
            'https://example.com/medium.jpg',
            'https://example.com/large.jpg'
        );

        $expected = [
            'thumbnail' => 'https://example.com/thumb.jpg',
            'medium' => 'https://example.com/medium.jpg',
            'large' => 'https://example.com/large.jpg',
        ];

        $this->assertSame($expected, $images->toArray());
    }

    #[Test]
    public function it_accepts_relative_urls(): void
    {
        $images = new ProductImages(
            '/images/thumb.jpg',
            '/images/medium.jpg',
            '/images/large.jpg'
        );

        $this->assertSame('/images/thumb.jpg', $images->getThumbnail());
        $this->assertSame('/images/medium.jpg', $images->getMedium());
        $this->assertSame('/images/large.jpg', $images->getLarge());
    }

    #[Test]
    public function it_accepts_data_urls(): void
    {
        $dataUrl = 'data:image/png;base64,iVBORw0KGgo=';

        $images = new ProductImages($dataUrl, $dataUrl, $dataUrl);

        $this->assertSame($dataUrl, $images->getThumbnail());
        $this->assertSame($dataUrl, $images->getMedium());
        $this->assertSame($dataUrl, $images->getLarge());
    }

    #[Test]
    public function it_allows_same_url_for_all_sizes(): void
    {
        $url = 'https://example.com/image.jpg';
        $images = new ProductImages($url, $url, $url);

        $this->assertSame($url, $images->getThumbnail());
        $this->assertSame($url, $images->getMedium());
        $this->assertSame($url, $images->getLarge());
    }

    #[Test]
    public function to_array_returns_correct_keys(): void
    {
        $images = new ProductImages('thumb.jpg', 'medium.jpg', 'large.jpg');
        $array = $images->toArray();

        $this->assertArrayHasKey('thumbnail', $array);
        $this->assertArrayHasKey('medium', $array);
        $this->assertArrayHasKey('large', $array);
        $this->assertCount(3, $array);
    }
}
