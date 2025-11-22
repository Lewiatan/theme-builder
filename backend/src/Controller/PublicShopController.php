<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\CategoryNotFoundException;
use App\Model\Enum\PageType;
use App\Request\GetDemoProductsRequest;
use App\Service\DemoCategoryService;
use App\Service\DemoProductService;
use App\Service\DemoPageService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

/**
 * Public API controller for Demo Shop data retrieval.
 *
 * Provides unauthenticated access to published page layouts and demo products
 * for rendering in the Demo Shop frontend. This controller handles the public-facing
 * API that does not require authentication.
 */
final class PublicShopController extends AbstractController
{
    public function __construct(
        private readonly DemoPageService $pageService,
        private readonly DemoProductService $demoProductService,
        private readonly DemoCategoryService $demoCategoryService,
        private readonly LoggerInterface $logger
    ) {}

    /**
     * Retrieves a published page layout for a specific shop and page type.
     *
     * This endpoint is used by the Demo Shop frontend to fetch page configurations
     * for rendering. Path parameters are automatically injected and converted to
     * the appropriate types by Symfony's routing system.
     *
     * @param string $shopId UUID of the shop
     * @param string $type Page type (home, catalog, product, contact) - defaults to 'home'
     * @return JsonResponse Page data (200), not found (404), or error (500)
     *
     * Response examples:
     * - 200 OK: {"type": "home", "layout": {"components": [...]}}
     * - 404 Not Found: {"error": "Page not found for this shop"}
     * - 500 Internal Server Error: {"error": "An unexpected error occurred"}
     */
    #[Route('/api/public/shops/{shopId}/pages/{type}', name: 'public_shop_page', defaults: ['type' => 'home'], methods: ['GET'])]
    public function getPage(
        string $shopId,
        string $type = 'home'
    ): JsonResponse
    {
        try {
            // Validate shop ID
            if (!$this->isValidUuid($shopId)) {
                throw new \InvalidArgumentException('Invalid shop ID format');
            }

            // Validate and convert page type
            $pageType = $this->validatePageType($type);

            $pageReadModel = $this->pageService->getPublicPage($shopId, $pageType);

            if ($pageReadModel === null) {
                $this->logger->info('Page not found', [
                    'shopId' => $shopId,
                    'type' => $pageType->value,
                ]);

                return new JsonResponse(
                    ['error' => 'Page not found for this shop'],
                    JsonResponse::HTTP_NOT_FOUND
                );
            }

            return new JsonResponse($pageReadModel, JsonResponse::HTTP_OK);
        } catch (\Throwable $exception) {
            $this->logger->error('Unexpected error retrieving page', [
                'shopId' => $shopId,
                'type' => $type,
                'exception' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return new JsonResponse(
                ['error' => 'An unexpected error occurred'],
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Retrieves demo products with optional category filtering.
     *
     * This endpoint provides product data for the Demo Shop frontend.
     * Supports filtering by category via the category_id query parameter.
     * Products are returned ordered alphabetically by name.
     *
     * Symfony automatically validates the request DTO using the MapQueryString attribute.
     * Validation errors are automatically returned as 422 responses.
     *
     * @param GetDemoProductsRequest $requestDto Automatically mapped and validated query parameters
     * @return JsonResponse Product data (200), category not found (404), or error (500)
     *
     * Response examples:
     * - 200 OK: {"products": [{"id": 1, "name": "Product", ...}]}
     * - 404 Not Found: {"error": "Category with ID 999 not found"}
     * - 422 Unprocessable Entity: Validation errors (handled automatically by Symfony)
     * - 500 Internal Server Error: {"error": "An unexpected error occurred"}
     */
    #[Route('/api/demo/products', name: 'demo_products_list', methods: ['GET'])]
    public function getDemoProducts(
        #[MapQueryString] GetDemoProductsRequest $requestDto
    ): JsonResponse
    {
        try {
            // Retrieve products from service
            $products = $this->demoProductService->getProducts($requestDto->getCategoryId());

            return new JsonResponse(
                ['products' => $products],
                JsonResponse::HTTP_OK
            );
        } catch (CategoryNotFoundException $exception) {
            $this->logger->info('Category not found', [
                'category_id' => $requestDto->getCategoryId(),
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                ['error' => $exception->getMessage()],
                JsonResponse::HTTP_NOT_FOUND
            );
        } catch (\Throwable $exception) {
            $this->logger->error('Unexpected error retrieving demo products', [
                'category_id' => $requestDto->getCategoryId(),
                'exception' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return new JsonResponse(
                ['error' => 'An unexpected error occurred'],
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Retrieves all demo product categories.
     *
     * This endpoint provides category data for the Demo Shop frontend.
     * Categories are returned ordered alphabetically by name.
     * No authentication is required as this is public demo data.
     *
     * @return JsonResponse Category data (200) or error (500)
     *
     * Response examples:
     * - 200 OK: {"categories": [{"id": 1, "name": "Beauty & Personal Care"}, ...]}
     * - 500 Internal Server Error: {"error": "An unexpected error occurred"}
     */
    #[Route('/api/demo/categories', name: 'demo_categories_list', methods: ['GET'])]
    public function getDemoCategories(): JsonResponse
    {
        try {
            $categories = $this->demoCategoryService->getAllCategories();

            return new JsonResponse(
                ['categories' => $categories],
                JsonResponse::HTTP_OK
            );
        } catch (\Throwable $exception) {
            $this->logger->error('Unexpected error retrieving demo categories', [
                'exception' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return new JsonResponse(
                ['error' => 'An unexpected error occurred'],
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Validates if a string is a valid UUID.
     *
     * @param string $uuid The UUID string to validate
     * @return bool True if valid UUID, false otherwise
     */
    private function isValidUuid(string $uuid): bool
    {
        return Uuid::isValid($uuid);
    }

    /**
     * Validates and converts a page type string to PageType enum.
     *
     * @param string $type The page type string to validate
     * @return PageType The validated PageType enum
     * @throws \InvalidArgumentException If the page type is invalid
     */
    private function validatePageType(string $type): PageType
    {
        try {
            return PageType::fromString($type);
        } catch (\ValueError $e) {
            throw new \InvalidArgumentException(
                sprintf('Invalid page type "%s". Must be one of: home, catalog, product, contact', $type),
                0,
                $e
            );
        }
    }
}
