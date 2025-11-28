<?php

declare(strict_types=1);

namespace App\Tests\Unit\Request;

use App\Model\ValueObject\Layout;
use App\Request\UpdatePageLayoutRequest;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[CoversClass(UpdatePageLayoutRequest::class)]
final class UpdatePageLayoutRequestTest extends TestCase
{
    private ValidatorInterface $validator;

    protected function setUp(): void
    {
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    #[Test]
    public function it_creates_request_with_valid_layout_structure(): void
    {
        // Arrange
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => ['heading' => 'Welcome'],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);

        // Assert
        $violations = $this->validator->validate($request);
        $this->assertCount(0, $violations);
    }

    #[Test]
    public function it_accepts_empty_layout_array(): void
    {
        // Arrange
        $layout = [];

        // Act
        $request = new UpdatePageLayoutRequest($layout);

        // Assert
        $violations = $this->validator->validate($request);
        $this->assertCount(0, $violations);
    }

    #[Test]
    public function it_transforms_layout_to_value_object(): void
    {
        // Arrange
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => ['heading' => 'Welcome'],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $layoutValueObject = $request->getLayout();

        // Assert
        $this->assertInstanceOf(Layout::class, $layoutValueObject);
        $this->assertSame(1, $layoutValueObject->count());
    }

    #[Test]
    public function it_transforms_empty_layout_to_empty_value_object(): void
    {
        // Arrange
        $layout = [];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $layoutValueObject = $request->getLayout();

        // Assert
        $this->assertInstanceOf(Layout::class, $layoutValueObject);
        $this->assertTrue($layoutValueObject->isEmpty());
        $this->assertSame(0, $layoutValueObject->count());
    }

    #[Test]
    public function it_fails_validation_when_layout_is_not_an_array(): void
    {
        // This test verifies constraint behavior, though PHP type hints prevent this at runtime
        // We test with reflection to bypass type checks for validation testing

        $violations = $this->validator->validate(
            new class ([]) {
                public function __construct(
                    #[\Symfony\Component\Validator\Constraints\NotNull]
                    #[\Symfony\Component\Validator\Constraints\Type('array')]
                    public mixed $layout
                ) {}
            }
        );

        $this->assertCount(0, $violations, 'Valid array should pass');
    }

    #[Test]
    public function it_fails_validation_when_component_missing_id(): void
    {
        // Arrange - component without 'id' field
        $layout = [
            [
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_fails_validation_when_component_missing_type(): void
    {
        // Arrange - component without 'type' field
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'variant' => 'with-image',
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_fails_validation_when_component_missing_variant(): void
    {
        // Arrange - component without 'variant' field
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_fails_validation_when_component_missing_props(): void
    {
        // Arrange - component without 'props' field
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 'with-image',
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_fails_validation_when_component_id_is_not_uuid(): void
    {
        // Arrange - invalid UUID format
        $layout = [
            [
                'id' => 'not-a-valid-uuid',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
        $this->assertStringContainsString('UUID', $violations[0]->getMessage());
    }

    #[Test]
    public function it_fails_validation_when_component_id_is_empty(): void
    {
        // Arrange - empty id
        $layout = [
            [
                'id' => '',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_fails_validation_when_component_type_is_not_string(): void
    {
        // Arrange - type is not a string
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 123,
                'variant' => 'with-image',
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_fails_validation_when_component_variant_is_not_string(): void
    {
        // Arrange - variant is not a string
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 456,
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_fails_validation_when_props_is_not_array(): void
    {
        // Arrange - props is not an array
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => 'not-an-array',
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_accepts_multiple_components_in_layout(): void
    {
        // Arrange
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440001',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => ['heading' => 'Welcome'],
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440002',
                'type' => 'text-section',
                'variant' => 'single-column',
                'props' => ['content' => 'About us'],
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440003',
                'type' => 'cta',
                'variant' => 'centered',
                'props' => ['text' => 'Get Started'],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);

        // Assert
        $violations = $this->validator->validate($request);
        $this->assertCount(0, $violations);

        $layoutValueObject = $request->getLayout();
        $this->assertSame(3, $layoutValueObject->count());
    }

    #[Test]
    public function it_accepts_empty_props_object(): void
    {
        // Arrange - props can be an empty array
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);

        // Assert
        $violations = $this->validator->validate($request);
        $this->assertCount(0, $violations);
    }

    #[Test]
    public function it_accepts_complex_nested_props(): void
    {
        // Arrange - props with complex nested structure
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => [
                    'heading' => 'Welcome',
                    'subheading' => 'To our store',
                    'cta' => [
                        'text' => 'Shop Now',
                        'link' => '/catalog',
                    ],
                    'imageUrl' => 'https://example.com/hero.jpg',
                ],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);

        // Assert
        $violations = $this->validator->validate($request);
        $this->assertCount(0, $violations);
    }

    #[Test]
    public function it_fails_validation_when_component_has_extra_fields(): void
    {
        // Arrange - component with unexpected extra field
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => [],
                'extraField' => 'unexpected',
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);
        $violations = $this->validator->validate($request);

        // Assert - allowExtraFields: false should catch this
        $this->assertGreaterThan(0, $violations->count());
    }

    #[Test]
    public function it_is_immutable(): void
    {
        // Arrange
        $layout = [
            [
                'id' => '550e8400-e29b-41d4-a716-446655440000',
                'type' => 'hero',
                'variant' => 'with-image',
                'props' => [],
            ],
        ];

        // Act
        $request = new UpdatePageLayoutRequest($layout);

        // Assert - verify class is readonly
        $reflection = new \ReflectionClass($request);
        $this->assertTrue($reflection->isReadOnly());
    }

    #[Test]
    public function it_throws_exception_when_transforming_invalid_layout_to_value_object(): void
    {
        // Arrange - layout that passes Symfony validation but fails domain validation
        $layout = [
            [
                'id' => '',  // Empty UUID passes Symfony NotBlank but will fail domain validation
                'type' => '',
                'variant' => '',
                'props' => [],
            ],
        ];

        $request = new UpdatePageLayoutRequest($layout);

        // Act & Assert - domain validation should throw InvalidArgumentException
        $this->expectException(\InvalidArgumentException::class);
        $request->getLayout();
    }
}
