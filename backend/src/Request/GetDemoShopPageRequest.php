<?php

declare(strict_types=1);

namespace App\Request;

use App\Model\Enum\PageType;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Request DTO for retrieving a page by shop ID and type in the Demo Shop.
 *
 * Validates input parameters for GET /api/public/shops/{shopId}/pages/{type} endpoint.
 * The shopId must be a valid UUID, and type is optional (defaults to "home").
 * If type is provided, it must be a valid PageType enum value.
 */
final readonly class GetDemoShopPageRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Shop ID is required')]
        #[Assert\Uuid(message: 'Shop ID must be a valid UUID')]
        private string $shopId,

        #[Assert\Choice(
            choices: ['home', 'catalog', 'product', 'contact'],
            message: 'Page type must be one of: home, catalog, product, contact'
        )]
        private string $type = 'home'
    ) {}

    public function getShopId(): string
    {
        return $this->shopId;
    }

    public function getType(): string
    {
        return $this->type;
    }

    /**
     * Converts the string type to PageType enum.
     * This method should be called after validation to ensure type safety.
     */
    public function getPageType(): PageType
    {
        return PageType::fromString($this->type);
    }
}
