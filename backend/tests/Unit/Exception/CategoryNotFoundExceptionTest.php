<?php

declare(strict_types=1);

namespace App\Tests\Unit\Exception;

use App\Exception\CategoryNotFoundException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Unit tests for CategoryNotFoundException
 *
 * Tests the custom exception:
 * - Extends NotFoundHttpException (404 status)
 * - Formats error message with category ID
 * - Provides correct HTTP status code
 */
#[CoversClass(CategoryNotFoundException::class)]
final class CategoryNotFoundExceptionTest extends TestCase
{
    #[Test]
    public function it_extends_not_found_http_exception(): void
    {
        // Arrange & Act
        $exception = new CategoryNotFoundException(123);

        // Assert
        $this->assertInstanceOf(NotFoundHttpException::class, $exception);
    }

    #[Test]
    public function it_includes_category_id_in_message(): void
    {
        // Arrange
        $categoryId = 456;

        // Act
        $exception = new CategoryNotFoundException($categoryId);

        // Assert
        $this->assertStringContainsString('456', $exception->getMessage());
        $this->assertStringContainsString('not found', $exception->getMessage());
    }

    #[Test]
    public function it_has_404_status_code(): void
    {
        // Arrange & Act
        $exception = new CategoryNotFoundException(123);

        // Assert
        $this->assertEquals(404, $exception->getStatusCode());
    }

    #[Test]
    public function it_message_format_is_consistent(): void
    {
        // Arrange
        $categoryId = 789;

        // Act
        $exception = new CategoryNotFoundException($categoryId);

        // Assert
        $expectedMessage = 'Category with ID 789 not found';
        $this->assertEquals($expectedMessage, $exception->getMessage());
    }

    #[Test]
    public function it_works_with_different_category_ids(): void
    {
        // Arrange & Act
        $exception1 = new CategoryNotFoundException(1);
        $exception2 = new CategoryNotFoundException(999);
        $exception3 = new CategoryNotFoundException(123456);

        // Assert
        $this->assertStringContainsString('1', $exception1->getMessage());
        $this->assertStringContainsString('999', $exception2->getMessage());
        $this->assertStringContainsString('123456', $exception3->getMessage());
    }
}
