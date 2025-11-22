<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Model\Enum\PageType;
use App\ReadModel\DemoPageReadModel;
use App\Repository\DemoPageRepository;
use App\Service\DemoPageService;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for DemoPageService
 *
 * Tests the service layer with mocked repository to verify:
 * - Correct delegation to repository
 * - Proper null handling
 * - Correct parameter passing
 */
#[CoversClass(DemoPageService::class)]
final class DemoPageServiceTest extends TestCase
{
    private DemoPageRepository|MockObject $pageRepository;
    private DemoPageService $pageService;

    protected function setUp(): void
    {
        $this->pageRepository = $this->createMock(DemoPageRepository::class);
        $this->pageService = new DemoPageService($this->pageRepository);
    }

    #[Test]
    public function it_returns_page_read_model_when_page_exists(): void
    {
        // Arrange
        $shopId = '550e8400-e29b-41d4-a716-446655440000';
        $pageType = PageType::HOME;
        $expectedReadModel = new DemoPageReadModel('home', [
            ['id' => 'cmp_001', 'type' => 'hero', 'variant' => 'default', 'settings' => []],
        ]);

        $this->pageRepository
            ->expects($this->once())
            ->method('findPublicPageByShopAndType')
            ->with($shopId, $pageType)
            ->willReturn($expectedReadModel);

        // Act
        $result = $this->pageService->getPublicPage($shopId, $pageType);

        // Assert
        $this->assertSame($expectedReadModel, $result);
    }

    #[Test]
    public function it_returns_null_when_page_does_not_exist(): void
    {
        // Arrange
        $shopId = '00000000-0000-0000-0000-000000000000';
        $pageType = PageType::HOME;

        $this->pageRepository
            ->expects($this->once())
            ->method('findPublicPageByShopAndType')
            ->with($shopId, $pageType)
            ->willReturn(null);

        // Act
        $result = $this->pageService->getPublicPage($shopId, $pageType);

        // Assert
        $this->assertNull($result);
    }

    #[Test]
    public function it_passes_correct_parameters_to_repository(): void
    {
        // Arrange
        $shopId = 'test-shop-id';
        $pageType = PageType::CATALOG;

        $this->pageRepository
            ->expects($this->once())
            ->method('findPublicPageByShopAndType')
            ->with(
                $this->identicalTo($shopId),
                $this->identicalTo($pageType)
            )
            ->willReturn(null);

        // Act
        $this->pageService->getPublicPage($shopId, $pageType);

        // Assert - expectations verified by PHPUnit
    }

    #[Test]
    public function it_works_for_all_page_types(): void
    {
        // Arrange
        $shopId = '550e8400-e29b-41d4-a716-446655440000';
        $pageTypes = [PageType::HOME, PageType::CATALOG, PageType::PRODUCT, PageType::CONTACT];

        foreach ($pageTypes as $index => $pageType) {
            // Create a fresh mock for each iteration
            $repository = $this->createMock(DemoPageRepository::class);
            $service = new DemoPageService($repository);

            $expectedReadModel = new DemoPageReadModel($pageType->value, []);

            $repository
                ->expects($this->once())
                ->method('findPublicPageByShopAndType')
                ->with($shopId, $pageType)
                ->willReturn($expectedReadModel);

            // Act
            $result = $service->getPublicPage($shopId, $pageType);

            // Assert
            $this->assertSame($expectedReadModel, $result);
        }
    }
}
