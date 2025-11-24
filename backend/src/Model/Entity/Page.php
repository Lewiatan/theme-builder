<?php

declare(strict_types=1);

namespace App\Model\Entity;

use App\Model\Enum\PageType;
use App\Model\ValueObject\Layout;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: \App\Repository\DemoPageRepository::class)]
#[ORM\Table(name: 'pages')]
#[ORM\UniqueConstraint(name: 'idx_pages_shop_type', columns: ['shop_id', 'type'])]
class Page
{
    public function __construct(
        #[ORM\Id]
        #[ORM\Column(type: 'guid', unique: true)]
        private string $id,

        #[ORM\ManyToOne(targetEntity: Shop::class)]
        #[ORM\JoinColumn(name: 'shop_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
        private Shop $shop,

        #[ORM\Column(type: 'string', enumType: PageType::class, nullable: false)]
        private PageType $type,

        #[ORM\Embedded(class: Layout::class, columnPrefix: false)]
        private Layout $layout,

        #[ORM\Column(name: 'created_at', type: 'datetime_immutable', nullable: false)]
        private DateTimeImmutable $createdAt,

        #[ORM\Column(name: 'updated_at', type: 'datetime_immutable', nullable: false)]
        private DateTimeImmutable $updatedAt
    ) {}

    public static function create(
        string $id,
        Shop $shop,
        PageType $type,
        Layout $layout
    ): self {
        $now = new DateTimeImmutable();

        return new self(
            $id,
            $shop,
            $type,
            $layout,
            $now,
            $now
        );
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getShop(): Shop
    {
        return $this->shop;
    }

    public function getType(): PageType
    {
        return $this->type;
    }

    public function getLayout(): Layout
    {
        return $this->layout;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function updateLayout(Layout $layout): void
    {
        $this->layout = $layout;
        $this->updatedAt = new DateTimeImmutable();
    }
}
