<?php

declare(strict_types=1);

namespace App\ReadModel;

use JsonSerializable;

/**
 * Read model for user data in API responses.
 *
 * Decouples the User entity from API responses to prevent accidental
 * exposure of sensitive data. Only includes public-facing user information.
 *
 * Password is explicitly excluded for security reasons.
 */
final readonly class UserReadModel implements JsonSerializable
{
    /**
     * @param string $id User UUID
     * @param string $email User email address
     * @param string $createdAt ISO 8601 formatted creation timestamp
     */
    public function __construct(
        private string $id,
        private string $email,
        private string $createdAt
    ) {}

    public function getId(): string
    {
        return $this->id;
    }

    /**
     * Serializes the user to JSON for API response.
     *
     * @return array{
     *     id: string,
     *     email: string,
     *     created_at: string
     * }
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'created_at' => $this->createdAt,
        ];
    }
}
