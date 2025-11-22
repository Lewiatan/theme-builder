<?php

declare(strict_types=1);

namespace App\Model\Entity;

use App\Model\ValueObject\ThemeSettings;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use InvalidArgumentException;

#[ORM\Entity]
#[ORM\Table(name: 'shops')]
#[ORM\UniqueConstraint(name: 'idx_shops_user_id', columns: ['user_id'])]
final class Shop
{
    private const MAX_NAME_LENGTH = 60;

    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: 'guid', unique: true)]
        private string $id,

        #[ORM\ManyToOne(targetEntity: User::class)]
        #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false, unique: true, onDelete: 'CASCADE')]
        private User $user,

        #[ORM\Column(type: 'string', length: 60, nullable: false)]
        private string $name,

        #[ORM\Embedded(class: ThemeSettings::class, columnPrefix: false)]
        private ThemeSettings $themeSettings,

        #[ORM\Column(name: 'created_at', type: 'datetime_immutable', nullable: false)]
        private DateTimeImmutable $createdAt,

        #[ORM\Column(name: 'updated_at', type: 'datetime_immutable', nullable: false)]
        private DateTimeImmutable $updatedAt
    ) {
        $this->validateName($name);
    }

    public static function create(
        string $id,
        User $user,
        string $name
    ): self {
        $now = new DateTimeImmutable();

        return new self(
            $id,
            $user,
            $name,
            ThemeSettings::default(),
            $now,
            $now
        );
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getThemeSettings(): ThemeSettings
    {
        return $this->themeSettings;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function updateName(string $name): void
    {
        $this->validateName($name);
        $this->name = $name;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateThemeSettings(ThemeSettings $themeSettings): void
    {
        $this->themeSettings = $themeSettings;
        $this->updatedAt = new DateTimeImmutable();
    }

    private function validateName(string $name): void
    {
        if (empty(trim($name))) {
            throw new InvalidArgumentException("Shop name cannot be empty");
        }

        if (mb_strlen($name) > self::MAX_NAME_LENGTH) {
            throw new InvalidArgumentException(
                sprintf("Shop name cannot exceed %d characters", self::MAX_NAME_LENGTH)
            );
        }
    }
}
