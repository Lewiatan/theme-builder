<?php

declare(strict_types=1);

namespace App\Repository;

use App\Model\Entity\Page;
use App\Model\Enum\PageType;
use App\ReadModel\PageReadModel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Page>
 */
final class PageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Page::class);
    }

    public function persist(Page $page): void
    {
        $this->getEntityManager()->persist($page);
    }

    public function save(Page $page): void
    {
        $this->getEntityManager()->persist($page);
        $this->getEntityManager()->flush();
    }

    /**
     * Batch saves multiple pages for performance optimization.
     * Uses single flush operation for all pages.
     *
     * @param Page[] $pages
     */
    public function saveBatch(array $pages): void
    {
        $em = $this->getEntityManager();

        foreach ($pages as $page) {
            $em->persist($page);
        }

        $em->flush();
    }

    public function findByShopIdAndType(string $shopId, PageType $type): ?Page
    {
        return $this->createQueryBuilder('p')
            ->where('p.shop = :shopId')
            ->andWhere('p.type = :type')
            ->setParameter('shopId', $shopId)
            ->setParameter('type', $type)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Retrieves all pages for a specific shop for authenticated access.
     *
     * Returns PageReadModel instances containing type, layout, and timestamps,
     * decoupled from the domain entity to prevent accidental data exposure.
     *
     * Performance optimization: Uses plain query with array result to bypass
     * entity hydration since we don't need entity capabilities for this read-only operation.
     *
     * @param string $shopId UUID of the shop
     * @return PageReadModel[] Array of page read models, ordered by type
     */
    public function findAllByShopId(string $shopId): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT p.type, p.layout, p.created_at, p.updated_at
            FROM pages p
            WHERE p.shop_id = :shopId
            ORDER BY p.type
        ';

        $results = $conn->fetchAllAssociative($sql, [
            'shopId' => $shopId,
        ]);

        return array_map(function (array $row): PageReadModel {
            // Decode JSON layout column
            $layout = json_decode($row['layout'], true);

            // Format timestamps to ISO 8601
            $createdAt = (new \DateTimeImmutable($row['created_at']))->format('c');
            $updatedAt = (new \DateTimeImmutable($row['updated_at']))->format('c');

            return new PageReadModel(
                $row['type'],
                $layout,
                $createdAt,
                $updatedAt
            );
        }, $results);
    }

    /**
     * Retrieves a single page by shop ID and page type for authenticated access.
     *
     * Returns PageReadModel containing type, layout, and timestamps,
     * decoupled from the domain entity to prevent accidental data exposure.
     *
     * Performance optimization: Uses plain query with array result to bypass
     * entity hydration since we don't need entity capabilities for this read-only operation.
     *
     * @param string $shopId UUID of the shop
     * @param PageType $type Page type to retrieve
     * @return PageReadModel|null Page read model if found, null otherwise
     */
    public function findOneByShopIdAndType(string $shopId, PageType $type): ?PageReadModel
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT p.type, p.layout, p.created_at, p.updated_at
            FROM pages p
            WHERE p.shop_id = :shopId AND p.type = :type
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

        // Format timestamps to ISO 8601
        $createdAt = (new \DateTimeImmutable($result['created_at']))->format('c');
        $updatedAt = (new \DateTimeImmutable($result['updated_at']))->format('c');

        return new PageReadModel(
            $result['type'],
            $layout,
            $createdAt,
            $updatedAt
        );
    }
}
