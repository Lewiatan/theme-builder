<?php

declare(strict_types=1);

namespace App\Tests\Unit\Model\ValueObject;

use App\Model\ValueObject\Email;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;

#[CoversClass(Email::class)]
final class EmailTest extends TestCase
{
    #[Test]
    public function it_creates_valid_email(): void
    {
        $email = new Email('test@example.com');

        $this->assertSame('test@example.com', $email->getValue());
        $this->assertSame('test@example.com', (string) $email);
    }

    #[Test]
    public function it_normalizes_email_to_lowercase(): void
    {
        $email = new Email('Test@EXAMPLE.COM');

        $this->assertSame('test@example.com', $email->getValue());
    }

    #[Test]
    #[TestWith(['invalid-email'])]
    #[TestWith(['@example.com'])]
    #[TestWith(['test@'])]
    #[TestWith(['test..test@example.com'])]
    #[TestWith(['test @example.com'])]
    #[TestWith([''])]
    public function it_throws_exception_for_invalid_email_format(string $invalidEmail): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid email format');

        new Email($invalidEmail);
    }

    #[Test]
    public function it_throws_exception_when_email_exceeds_max_length(): void
    {
        $longEmail = str_repeat('a', 250) . '@example.com';

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Email exceeds maximum length of 255 characters');

        new Email($longEmail);
    }

    #[Test]
    public function it_accepts_email_near_max_length(): void
    {
        // Create a valid email near max length (local part max is 64 chars per RFC)
        // Use subdomain structure to create a long but valid email
        $domain = str_repeat('subdomain.', 20) . 'example.com'; // Creates ~230 chars domain
        $email = new Email('user@' . $domain);

        $this->assertIsString($email->getValue());
        $this->assertLessThanOrEqual(255, strlen($email->getValue()));
    }

    #[Test]
    public function it_compares_emails_for_equality(): void
    {
        $email1 = new Email('test@example.com');
        $email2 = new Email('test@example.com');
        $email3 = new Email('other@example.com');

        $this->assertTrue($email1->equals($email2));
        $this->assertFalse($email1->equals($email3));
    }

    #[Test]
    public function it_compares_normalized_emails_for_equality(): void
    {
        $email1 = new Email('Test@Example.COM');
        $email2 = new Email('test@example.com');

        $this->assertTrue($email1->equals($email2));
    }

    #[Test]
    #[TestWith(['user@domain.com'])]
    #[TestWith(['user.name@domain.com'])]
    #[TestWith(['user+tag@domain.com'])]
    #[TestWith(['user_name@sub.domain.com'])]
    #[TestWith(['123@domain.com'])]
    public function it_accepts_various_valid_email_formats(string $validEmail): void
    {
        $email = new Email($validEmail);

        $this->assertSame(strtolower($validEmail), $email->getValue());
    }
}
