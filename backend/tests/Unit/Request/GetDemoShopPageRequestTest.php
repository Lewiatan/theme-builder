<?php

declare(strict_types=1);

namespace App\Tests\Unit\Request;

use App\Model\Enum\PageType;
use App\Request\GetDemoShopPageRequest;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[CoversClass(GetDemoShopPageRequest::class)]
final class GetDemoShopPageRequestTest extends TestCase
{
    private ValidatorInterface $validator;

    protected function setUp(): void
    {
        $this->validator = Validation::createValidatorBuilder()
            ->enableAttributeMapping()
            ->getValidator();
    }

    #[Test]
    public function it_creates_request_with_valid_shop_id_and_type(): void
    {
        $shopId = '123e4567-e89b-12d3-a456-426614174000';
        $type = 'catalog';

        $request = new GetDemoShopPageRequest($shopId, $type);

        $this->assertSame($shopId, $request->getShopId());
        $this->assertSame($type, $request->getType());
        $this->assertSame(PageType::CATALOG, $request->getPageType());
    }

    #[Test]
    public function it_creates_request_with_default_type_when_not_provided(): void
    {
        $shopId = '123e4567-e89b-12d3-a456-426614174000';

        $request = new GetDemoShopPageRequest($shopId);

        $this->assertSame($shopId, $request->getShopId());
        $this->assertSame('home', $request->getType());
        $this->assertSame(PageType::HOME, $request->getPageType());
    }

    #[Test]
    #[TestWith(['home', PageType::HOME])]
    #[TestWith(['catalog', PageType::CATALOG])]
    #[TestWith(['product', PageType::PRODUCT])]
    #[TestWith(['contact', PageType::CONTACT])]
    public function it_converts_type_to_page_type_enum(string $type, PageType $expected): void
    {
        $shopId = '123e4567-e89b-12d3-a456-426614174000';

        $request = new GetDemoShopPageRequest($shopId, $type);

        $this->assertSame($expected, $request->getPageType());
    }

    #[Test]
    public function it_validates_successfully_with_valid_data(): void
    {
        $request = new GetDemoShopPageRequest(
            '123e4567-e89b-12d3-a456-426614174000',
            'home'
        );

        $violations = $this->validator->validate($request);

        $this->assertCount(0, $violations);
    }

    #[Test]
    public function it_validates_successfully_with_default_type(): void
    {
        $request = new GetDemoShopPageRequest('123e4567-e89b-12d3-a456-426614174000');

        $violations = $this->validator->validate($request);

        $this->assertCount(0, $violations);
    }

    #[Test]
    #[TestWith(['home'])]
    #[TestWith(['catalog'])]
    #[TestWith(['product'])]
    #[TestWith(['contact'])]
    public function it_validates_successfully_with_all_valid_page_types(string $type): void
    {
        $request = new GetDemoShopPageRequest(
            '123e4567-e89b-12d3-a456-426614174000',
            $type
        );

        $violations = $this->validator->validate($request);

        $this->assertCount(0, $violations);
    }

    #[Test]
    #[TestWith(['not-a-uuid'])]
    #[TestWith(['12345'])]
    #[TestWith(['invalid-format'])]
    #[TestWith([''])]
    public function it_fails_validation_with_invalid_shop_id(string $invalidShopId): void
    {
        $request = new GetDemoShopPageRequest($invalidShopId, 'home');

        $violations = $this->validator->validate($request);

        $this->assertGreaterThan(0, $violations->count());
        $this->assertSame('shopId', $violations[0]->getPropertyPath());
    }

    #[Test]
    public function it_fails_validation_with_empty_shop_id(): void
    {
        $request = new GetDemoShopPageRequest('', 'home');

        $violations = $this->validator->validate($request);

        $this->assertGreaterThan(0, $violations->count());
        $this->assertSame('shopId', $violations[0]->getPropertyPath());
    }

    #[Test]
    #[TestWith(['invalid'])]
    #[TestWith(['HOME'])]
    #[TestWith(['Home'])]
    #[TestWith(['unknown'])]
    #[TestWith(['page'])]
    public function it_fails_validation_with_invalid_page_type(string $invalidType): void
    {
        $request = new GetDemoShopPageRequest(
            '123e4567-e89b-12d3-a456-426614174000',
            $invalidType
        );

        $violations = $this->validator->validate($request);

        $this->assertGreaterThan(0, $violations->count());
        $this->assertSame('type', $violations[0]->getPropertyPath());
        $this->assertStringContainsString('Page type must be one of', $violations[0]->getMessage());
    }

    #[Test]
    public function it_provides_correct_validation_message_for_invalid_shop_id(): void
    {
        $request = new GetDemoShopPageRequest('not-a-uuid', 'home');

        $violations = $this->validator->validate($request);

        $this->assertGreaterThan(0, $violations->count());
        $this->assertStringContainsString('UUID', $violations[0]->getMessage());
    }

    #[Test]
    public function it_provides_correct_validation_message_for_empty_shop_id(): void
    {
        $request = new GetDemoShopPageRequest('', 'home');

        $violations = $this->validator->validate($request);

        $this->assertGreaterThan(0, $violations->count());
        // Either NotBlank or UUID constraint will trigger
        $this->assertTrue(
            str_contains($violations[0]->getMessage(), 'required') ||
            str_contains($violations[0]->getMessage(), 'UUID')
        );
    }

    #[Test]
    public function it_is_immutable(): void
    {
        $shopId = '123e4567-e89b-12d3-a456-426614174000';
        $type = 'home';

        $request = new GetDemoShopPageRequest($shopId, $type);

        // Verify class is readonly by checking reflection
        $reflection = new \ReflectionClass($request);
        $this->assertTrue($reflection->isReadOnly());
    }
}
