<?php

declare(strict_types=1);

namespace App\Controller;

use App\Exception\PageNotFoundException;
use App\Exception\ShopNotFoundException;
use App\Model\Entity\User;
use App\Model\Enum\PageType;
use App\Request\UpdatePageLayoutRequest;
use App\Service\PageService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * API controller for authenticated user's page management.
 *
 * Provides authenticated access to page data for the user's shop.
 * All endpoints require valid JWT authentication and enforce data isolation.
 */
final class PageController extends AbstractController
{
    public function __construct(
        private readonly PageService $pageService,
        private readonly LoggerInterface $logger
    ) {}

    /**
     * Retrieves all pages for the authenticated user's shop.
     *
     * Returns the complete set of pages (home, catalog, product, contact)
     * with their layout configurations and metadata. Pages are automatically
     * filtered to only include those belonging to the authenticated user's shop.
     *
     * @param User $user Authenticated user (automatically injected by Symfony Security)
     * @return JsonResponse Page data (200), shop not found (404), or error (500)
     *
     * Response examples:
     * - 200 OK: {"pages": [{"type": "home", "layout": [...], "created_at": "...", "updated_at": "..."}]}
     * - 404 Not Found: {"error": "Shop not found for user"}
     * - 500 Internal Server Error: {"error": "An unexpected error occurred"}
     */
    #[Route('/api/pages', name: 'api_pages_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPages(): JsonResponse
    {
        try {
            // Get the authenticated user from security context
            /** @var User $authenticatedUser */
            $authenticatedUser = $this->getUser();

            if (!$authenticatedUser instanceof User) {
                $this->logger->error('Authenticated user is not a User instance', [
                    'user_class' => get_class($authenticatedUser),
                ]);

                return new JsonResponse(
                    ['error' => 'Authentication error'],
                    JsonResponse::HTTP_UNAUTHORIZED
                );
            }

            // Retrieve pages for user's shop
            $pages = $this->pageService->getPagesByUserId($authenticatedUser->getId());

            // Return pages wrapped in response structure
            return new JsonResponse(
                ['pages' => $pages],
                JsonResponse::HTTP_OK
            );
        } catch (ShopNotFoundException $exception) {
            $this->logger->info('Shop not found for user', [
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                ['error' => $exception->getMessage()],
                JsonResponse::HTTP_NOT_FOUND
            );
        } catch (\Throwable $exception) {
            $this->logger->error('Unexpected error retrieving pages', [
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
     * Retrieves a specific page by type for the authenticated user's shop.
     *
     * Returns a single page with its layout configuration and metadata.
     * The page type must be one of: home, catalog, product, contact.
     * Pages are automatically filtered to only include those belonging
     * to the authenticated user's shop.
     *
     * @param string $type Page type path parameter (home, catalog, product, contact)
     * @return JsonResponse Page data (200), invalid type (400), page not found (404), or error (500)
     *
     * Response examples:
     * - 200 OK: {"type": "home", "layout": [...], "created_at": "...", "updated_at": "..."}
     * - 400 Bad Request: {"error": "invalid_page_type", "message": "Page type must be one of: home, catalog, product, contact"}
     * - 404 Not Found: {"error": "page_not_found", "message": "Page of type 'home' not found for user..."}
     * - 500 Internal Server Error: {"error": "An unexpected error occurred"}
     */
    #[Route('/api/pages/{type}', name: 'api_pages_get_by_type', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPageByType(string $type): JsonResponse
    {
        try {
            // Validate and convert type parameter to PageType enum
            // This will throw ValueError if the type is invalid
            $pageType = PageType::fromString($type);

            // Get the authenticated user from security context
            /** @var User $authenticatedUser */
            $authenticatedUser = $this->getUser();

            if (!$authenticatedUser instanceof User) {
                $this->logger->error('Authenticated user is not a User instance', [
                    'user_class' => get_class($authenticatedUser),
                ]);

                return new JsonResponse(
                    ['error' => 'Authentication error'],
                    JsonResponse::HTTP_UNAUTHORIZED
                );
            }

            // Retrieve page by type for user's shop
            $page = $this->pageService->getPageByType($authenticatedUser->getId(), $pageType);

            // Return page data (PageReadModel auto-serializes via jsonSerialize())
            return new JsonResponse(
                $page,
                JsonResponse::HTTP_OK
            );
        } catch (\ValueError $exception) {
            // Invalid page type parameter
            $this->logger->info('Invalid page type parameter', [
                'type' => $type,
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'invalid_page_type',
                    'message' => 'Page type must be one of: home, catalog, product, contact'
                ],
                JsonResponse::HTTP_BAD_REQUEST
            );
        } catch (PageNotFoundException $exception) {
            // Page not found for user
            $this->logger->info('Page not found', [
                'type' => $type,
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'page_not_found',
                    'message' => $exception->getMessage()
                ],
                JsonResponse::HTTP_NOT_FOUND
            );
        } catch (ShopNotFoundException $exception) {
            // User has no shop (edge case)
            $this->logger->info('Shop not found for user', [
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'shop_not_found',
                    'message' => $exception->getMessage()
                ],
                JsonResponse::HTTP_NOT_FOUND
            );
        } catch (\Throwable $exception) {
            // Unexpected error
            $this->logger->error('Unexpected error retrieving page by type', [
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
     * Updates the layout for a specific page type for the authenticated user's shop.
     *
     * Accepts a layout array in the request body and updates the specified page.
     * The page type must be one of: home, catalog, product, contact.
     * Layout validation is handled by UpdatePageLayoutRequest DTO.
     *
     * Request body format:
     * {
     *   "layout": [
     *     {
     *       "id": "uuid",
     *       "type": "component-type",
     *       "variant": "variant-name",
     *       "settings": {...}
     *     }
     *   ]
     * }
     *
     * @param string $type Page type path parameter (home, catalog, product, contact)
     * @param UpdatePageLayoutRequest $request Validated request DTO with layout data
     * @return JsonResponse Updated page data (200), invalid type/layout (400), not found (404), or error (500)
     *
     * Response examples:
     * - 200 OK: {"type": "home", "layout": [...], "created_at": "...", "updated_at": "..."}
     * - 400 Bad Request: {"error": "invalid_page_type", "message": "Page type must be one of: home, catalog, product, contact"}
     * - 400 Bad Request: {"error": "validation_error", "message": "Component id is required"}
     * - 404 Not Found: {"error": "page_not_found", "message": "Page of type 'home' not found..."}
     * - 500 Internal Server Error: {"error": "An unexpected error occurred"}
     */
    #[Route('/api/pages/{type}', name: 'api_pages_update_by_type', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updatePageByType(
        string $type,
        #[MapRequestPayload] UpdatePageLayoutRequest $request
    ): JsonResponse {
        try {
            // Validate and convert type parameter to PageType enum
            // This will throw ValueError if the type is invalid
            $pageType = PageType::fromString($type);

            // Get the authenticated user from security context
            /** @var User $authenticatedUser */
            $authenticatedUser = $this->getUser();

            if (!$authenticatedUser instanceof User) {
                $this->logger->error('Authenticated user is not a User instance', [
                    'user_class' => get_class($authenticatedUser),
                ]);

                return new JsonResponse(
                    ['error' => 'Authentication error'],
                    JsonResponse::HTTP_UNAUTHORIZED
                );
            }

            // Transform request DTO to Layout ValueObject
            // This may throw InvalidArgumentException if layout structure is invalid at domain level
            $layout = $request->getLayout();

            // Update page layout via service layer
            $updatedPage = $this->pageService->updatePageLayout(
                $authenticatedUser->getId(),
                $pageType,
                $layout
            );

            // Return updated page data (PageReadModel auto-serializes via jsonSerialize())
            return new JsonResponse(
                $updatedPage,
                JsonResponse::HTTP_OK
            );
        } catch (\ValueError $exception) {
            // Invalid page type parameter
            $this->logger->info('Invalid page type parameter', [
                'type' => $type,
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'invalid_page_type',
                    'message' => 'Page type must be one of: home, catalog, product, contact'
                ],
                JsonResponse::HTTP_BAD_REQUEST
            );
        } catch (\InvalidArgumentException $exception) {
            // Invalid layout structure at domain level (from Layout::fromArray or ComponentDefinition::fromArray)
            $this->logger->info('Invalid layout structure', [
                'type' => $type,
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'validation_error',
                    'message' => $exception->getMessage()
                ],
                JsonResponse::HTTP_BAD_REQUEST
            );
        } catch (PageNotFoundException $exception) {
            // Page not found for user
            $this->logger->info('Page not found for update', [
                'type' => $type,
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'page_not_found',
                    'message' => $exception->getMessage()
                ],
                JsonResponse::HTTP_NOT_FOUND
            );
        } catch (ShopNotFoundException $exception) {
            // User has no shop (edge case)
            $this->logger->info('Shop not found for user', [
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'shop_not_found',
                    'message' => $exception->getMessage()
                ],
                JsonResponse::HTTP_NOT_FOUND
            );
        } catch (\Throwable $exception) {
            // Unexpected error
            $this->logger->error('Unexpected error updating page layout', [
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
     * Resets a page to its default layout for the authenticated user's shop.
     *
     * Loads the default layout for the specified page type and replaces
     * the current layout. This operation is irreversible (no undo in MVP).
     * The page type must be one of: home, catalog, product, contact.
     *
     * @param string $type Page type path parameter (home, catalog, product, contact)
     * @return JsonResponse Updated page data (200), invalid type (400), not found (404), or error (500)
     *
     * Response examples:
     * - 200 OK: {"type": "home", "layout": [...], "created_at": "...", "updated_at": "..."}
     * - 400 Bad Request: {"error": "invalid_page_type", "message": "Page type must be one of: home, catalog, product, contact"}
     * - 404 Not Found: {"error": "page_not_found", "message": "Page of type 'home' not found..."}
     * - 500 Internal Server Error: {"error": "An unexpected error occurred"}
     */
    #[Route('/api/pages/{type}/reset', name: 'api_pages_reset', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function resetPage(string $type): JsonResponse
    {
        try {
            // Validate and convert type parameter to PageType enum
            // This will throw ValueError if the type is invalid
            $pageType = PageType::fromString($type);

            // Get the authenticated user from security context
            /** @var User $authenticatedUser */
            $authenticatedUser = $this->getUser();

            if (!$authenticatedUser instanceof User) {
                $this->logger->error('Authenticated user is not a User instance', [
                    'user_class' => get_class($authenticatedUser),
                ]);

                return new JsonResponse(
                    ['error' => 'Authentication error'],
                    JsonResponse::HTTP_UNAUTHORIZED
                );
            }

            // Reset page to default layout via service layer
            $resetPage = $this->pageService->resetPageToDefault(
                $authenticatedUser->getId(),
                $pageType
            );

            // Return updated page data (PageReadModel auto-serializes via jsonSerialize())
            return new JsonResponse(
                $resetPage,
                JsonResponse::HTTP_OK
            );
        } catch (\ValueError $exception) {
            // Invalid page type parameter
            $this->logger->info('Invalid page type parameter for reset', [
                'type' => $type,
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'invalid_page_type',
                    'message' => 'Page type must be one of: home, catalog, product, contact'
                ],
                JsonResponse::HTTP_BAD_REQUEST
            );
        } catch (PageNotFoundException $exception) {
            // Page not found for user
            $this->logger->info('Page not found for reset', [
                'type' => $type,
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'page_not_found',
                    'message' => $exception->getMessage()
                ],
                JsonResponse::HTTP_NOT_FOUND
            );
        } catch (ShopNotFoundException $exception) {
            // User has no shop (edge case)
            $this->logger->info('Shop not found for user during page reset', [
                'message' => $exception->getMessage(),
            ]);

            return new JsonResponse(
                [
                    'error' => 'shop_not_found',
                    'message' => $exception->getMessage()
                ],
                JsonResponse::HTTP_NOT_FOUND
            );
        } catch (\Throwable $exception) {
            // Unexpected error
            $this->logger->error('Unexpected error resetting page to default', [
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
}
