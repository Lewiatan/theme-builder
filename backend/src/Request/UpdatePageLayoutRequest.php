<?php

declare(strict_types=1);

namespace App\Request;

use App\Model\ValueObject\Layout;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Request DTO for updating page layout endpoint.
 *
 * Validates input parameters for PUT /api/pages/{type}.
 * Enforces layout structure with component definitions containing
 * id (UUID), type, variant, and settings fields.
 *
 * Empty arrays are accepted to allow clearing all page components.
 * Transformation to Layout ValueObject happens via getLayout() method,
 * which delegates to Layout::fromArray() for domain-level validation.
 */
final readonly class UpdatePageLayoutRequest
{
    /**
     * @param array<int,mixed> $layout
     */
    public function __construct(
        /**
         * Array of component definitions. Each component must have:
         * - id: UUID string identifying the component instance
         * - type: Component type name (e.g., 'hero', 'text-section')
         * - variant: Component variant name (e.g., 'with-image', 'single-column')
         * - props: Component-specific props object/array
         *
         * Empty array is valid and allows clearing all components from the page.
         */
        #[Assert\NotNull(message: 'Layout field is required')]
        #[Assert\Type(
            type: 'array',
            message: 'Layout must be an array of components'
        )]
        #[Assert\All([
            new Assert\Collection(
                fields: [
                    'id' => [
                        new Assert\NotBlank(message: 'Component id is required'),
                        new Assert\Uuid(message: 'Component id must be a valid UUID'),
                    ],
                    'type' => [
                        new Assert\NotBlank(message: 'Component type is required'),
                        new Assert\Type(type: 'string', message: 'Component type must be a string'),
                    ],
                    'variant' => [
                        new Assert\NotBlank(message: 'Component variant is required'),
                        new Assert\Type(type: 'string', message: 'Component variant must be a string'),
                    ],
                    'props' => [
                        new Assert\Type(type: 'array', message: 'Component props must be an object'),
                    ],
                ],
                allowExtraFields: false,
                allowMissingFields: false
            )
        ])]
        private array $layout
    ) {}

    /**
     * Transforms the raw layout array into a Layout ValueObject.
     *
     * This method delegates to Layout::fromArray() which performs
     * domain-level validation and creates ComponentDefinition instances.
     *
     * @throws \InvalidArgumentException If layout structure is invalid at domain level
     */
    public function getLayout(): Layout
    {
        return Layout::fromArray($this->layout);
    }
}
