<?php

declare(strict_types=1);

namespace App\Tests\Unit\Exception;

use App\Exception\PageNotFoundException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Unit tests for PageNotFoundException
 *
 * Tests the custom exception to verify:
 * - Proper inheritance from NotFoundHttpException
 * - Correct message formatting
 * - HTTP 404 status code
 */
#[CoversClass(PageNotFoundException::class)]
final class PageNotFoundExceptionTest extends TestCase
{
    #[Test]
    public function it_extends_not_found_http_exception(): void
    {
        // Arrange
        $userId = '550e8400-e29b-41d4-a716-446655440000';
        $type = 'home';

        // Act
        $exception = new PageNotFoundException($userId, $type);

        // Assert
        $this->assertInstanceOf(NotFoundHttpException::class, $exception);
    }

    #[Test]
    public function it_has_404_status_code(): void
    {
        // Arrange
        $userId = '550e8400-e29b-41d4-a716-446655440000';
        $type = 'catalog';

        // Act
        $exception = new PageNotFoundException($userId, $type);

        // Assert
        $this->assertSame(404, $exception->getStatusCode());
    }

    #[Test]
    public function it_formats_message_with_user_id_and_type(): void
    {
        // Arrange
        $userId = '550e8400-e29b-41d4-a716-446655440000';
        $type = 'product';

        // Act
        $exception = new PageNotFoundException($userId, $type);

        // Assert
        $expectedMessage = "Page of type 'product' not found for user 550e8400-e29b-41d4-a716-446655440000";
        $this->assertSame($expectedMessage, $exception->getMessage());
    }

    #[Test]
    public function it_includes_page_type_in_message(): void
    {
        // Arrange
        $userId = 'test-user-id';
        $type = 'contact';

        // Act
        $exception = new PageNotFoundException($userId, $type);

        // Assert
        $this->assertStringContainsString('contact', $exception->getMessage());
        $this->assertStringContainsString("Page of type 'contact'", $exception->getMessage());
    }

    #[Test]
    public function it_includes_user_id_in_message(): void
    {
        // Arrange
        $userId = '123e4567-e89b-12d3-a456-426614174000';
        $type = 'home';

        // Act
        $exception = new PageNotFoundException($userId, $type);

        // Assert
        $this->assertStringContainsString($userId, $exception->getMessage());
        $this->assertStringContainsString('for user 123e4567-e89b-12d3-a456-426614174000', $exception->getMessage());
    }

    #[Test]
    public function it_works_with_all_page_types(): void
    {
        // Arrange
        $userId = 'test-user';
        $pageTypes = ['home', 'catalog', 'product', 'contact'];

        foreach ($pageTypes as $type) {
            // Act
            $exception = new PageNotFoundException($userId, $type);

            // Assert
            $this->assertStringContainsString("Page of type '{$type}'", $exception->getMessage());
            $this->assertSame(404, $exception->getStatusCode());
        }
    }

    #[Test]
    public function it_message_is_user_friendly(): void
    {
        // Arrange
        $userId = '550e8400-e29b-41d4-a716-446655440000';
        $type = 'home';

        // Act
        $exception = new PageNotFoundException($userId, $type);

        // Assert - Message should be descriptive and informative
        $message = $exception->getMessage();
        $this->assertStringContainsString('Page', $message);
        $this->assertStringContainsString('type', $message);
        $this->assertStringContainsString('not found', $message);
        $this->assertStringContainsString('user', $message);
    }

    #[Test]
    public function it_can_be_thrown_and_caught(): void
    {
        // Arrange
        $userId = '550e8400-e29b-41d4-a716-446655440000';
        $type = 'catalog';

        // Assert
        $this->expectException(PageNotFoundException::class);
        $this->expectExceptionMessage("Page of type 'catalog' not found for user $userId");

        // Act
        throw new PageNotFoundException($userId, $type);
    }

    #[Test]
    public function it_can_be_caught_as_not_found_http_exception(): void
    {
        // Arrange
        $userId = '550e8400-e29b-41d4-a716-446655440000';
        $type = 'product';
        $caught = false;

        try {
            // Act
            throw new PageNotFoundException($userId, $type);
        } catch (NotFoundHttpException $e) {
            // Assert
            $caught = true;
            $this->assertInstanceOf(PageNotFoundException::class, $e);
            $this->assertSame(404, $e->getStatusCode());
        }

        $this->assertTrue($caught, 'Exception should be catchable as NotFoundHttpException');
    }
}
