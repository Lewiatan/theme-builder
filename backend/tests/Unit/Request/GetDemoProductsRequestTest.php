<?php

declare(strict_types=1);

namespace App\Tests\Unit\Request;

use App\Request\GetDemoProductsRequest;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[CoversClass(GetDemoProductsRequest::class)]
final class GetDemoProductsRequestTest extends TestCase
{
    private ValidatorInterface $validator;

    protected function setUp(): void
    {
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    #[Test]
    public function it_creates_request_with_valid_category_id(): void
    {
        $categoryId = 5;

        $request = new GetDemoProductsRequest($categoryId);

        $this->assertSame($categoryId, $request->getCategoryId());
        $this->assertTrue($request->hasCategoryFilter());
    }

    #[Test]
    public function it_creates_request_without_category_id(): void
    {
        $request = new GetDemoProductsRequest();

        $this->assertNull($request->getCategoryId());
        $this->assertFalse($request->hasCategoryFilter());
    }

    #[Test]
    public function it_creates_request_with_explicit_null_category_id(): void
    {
        $request = new GetDemoProductsRequest(null);

        $this->assertNull($request->getCategoryId());
        $this->assertFalse($request->hasCategoryFilter());
    }

    #[Test]
    #[TestWith([1])]
    #[TestWith([10])]
    #[TestWith([999])]
    #[TestWith([100000])]
    public function it_validates_successfully_with_valid_positive_category_id(int $categoryId): void
    {
        $request = new GetDemoProductsRequest($categoryId);

        $violations = $this->validator->validate($request);

        $this->assertCount(0, $violations);
    }

    #[Test]
    public function it_validates_successfully_without_category_id(): void
    {
        $request = new GetDemoProductsRequest();

        $violations = $this->validator->validate($request);

        $this->assertCount(0, $violations);
    }

    #[Test]
    public function it_validates_successfully_with_null_category_id(): void
    {
        $request = new GetDemoProductsRequest(null);

        $violations = $this->validator->validate($request);

        $this->assertCount(0, $violations);
    }

    #[Test]
    #[TestWith([0])]
    #[TestWith([-1])]
    #[TestWith([-100])]
    public function it_fails_validation_with_non_positive_category_id(int $invalidCategoryId): void
    {
        $request = new GetDemoProductsRequest($invalidCategoryId);

        $violations = $this->validator->validate($request);

        $this->assertGreaterThan(0, $violations->count());
        $this->assertSame('categoryId', $violations[0]->getPropertyPath());
    }

    #[Test]
    public function it_provides_correct_validation_message_for_zero_category_id(): void
    {
        $request = new GetDemoProductsRequest(0);

        $violations = $this->validator->validate($request);

        $this->assertGreaterThan(0, $violations->count());
        $this->assertStringContainsString('positive', $violations[0]->getMessage());
    }

    #[Test]
    public function it_provides_correct_validation_message_for_negative_category_id(): void
    {
        $request = new GetDemoProductsRequest(-5);

        $violations = $this->validator->validate($request);

        $this->assertGreaterThan(0, $violations->count());
        $this->assertStringContainsString('positive', $violations[0]->getMessage());
    }

    #[Test]
    public function it_correctly_indicates_when_category_filter_is_present(): void
    {
        $requestWithFilter = new GetDemoProductsRequest(10);
        $requestWithoutFilter = new GetDemoProductsRequest(null);

        $this->assertTrue($requestWithFilter->hasCategoryFilter());
        $this->assertFalse($requestWithoutFilter->hasCategoryFilter());
    }

    #[Test]
    public function it_is_immutable(): void
    {
        $request = new GetDemoProductsRequest(5);

        // Verify class is readonly by checking reflection
        $reflection = new \ReflectionClass($request);
        $this->assertTrue($reflection->isReadOnly());
    }

    #[Test]
    public function it_maintains_type_safety_for_category_id(): void
    {
        $categoryId = 42;
        $request = new GetDemoProductsRequest($categoryId);

        $this->assertIsInt($request->getCategoryId());
        $this->assertSame($categoryId, $request->getCategoryId());
    }

    #[Test]
    public function it_maintains_null_type_for_missing_category_id(): void
    {
        $request = new GetDemoProductsRequest();

        $this->assertNull($request->getCategoryId());
    }
}
