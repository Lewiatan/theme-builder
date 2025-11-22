<?php

declare(strict_types=1);

namespace App\Repository;

use App\Model\Entity\Page;
use App\Model\Enum\PageType;
use App\ReadModel\DemoPageReadModel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Page>
 */
class DemoPageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Page::class);
    }

    /**
     * Retrieves a page by shop ID and page type for public access.
     *
     * Returns a PageReadModel containing only public data (type and layout),
     * decoupled from the domain entity to prevent accidental data exposure.
     *
     * Performance optimization: Uses plain query with array result to bypass
     * entity hydration since we don't need entity capabilities for this read-only operation.
     *
     * @param string $shopId UUID of the shop
     * @param PageType $type Page type enum
     * @return DemoPageReadModel|null Read model if page found, null otherwise
     */
    public function findPublicPageByShopAndType(string $shopId, PageType $type): ?DemoPageReadModel
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT p.type, p.layout
            FROM pages p
            INNER JOIN shops s ON p.shop_id = s.id
            WHERE s.id = :shopId AND p.type = :type
        ';

        $result = $conn->fetchAssociative($sql, [
            'shopId' => $shopId,
            'type' => $type->value,
        ]);

        if ($result === false) {
            return null;
        }

        // Decode JSON layout column
        $layout = json_decode($result['layout'], true);

        return new DemoPageReadModel(
            $result['type'],
            $layout
        );
    }
}
