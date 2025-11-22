<?php

declare(strict_types=1);

namespace App\Model\ValueObject;

use Doctrine\ORM\Mapping as ORM;
use InvalidArgumentException;

#[ORM\Embeddable]
final readonly class Email
{
    private const MAX_LENGTH = 255;

    #[ORM\Column(name: 'email', type: 'string', length: 255, nullable: false)]
    private string $value;

    public function __construct(string $email)
    {
        $this->validate($email);
        $this->value = strtolower($email);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }

    private function validate(string $email): void
    {
        if (strlen($email) > self::MAX_LENGTH) {
            throw new InvalidArgumentException(
                sprintf("Email exceeds maximum length of %d characters", self::MAX_LENGTH)
            );
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Invalid email format: {$email}");
        }
    }
}
