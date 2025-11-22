<?php

declare(strict_types=1);

namespace App\Repository;

use App\Model\Entity\Shop;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Shop>
 */
final class ShopRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Shop::class);
    }

    public function save(Shop $shop): void
    {
        $this->getEntityManager()->persist($shop);
        $this->getEntityManager()->flush();
    }

    public function findByUserId(string $userId): ?Shop
    {
        return $this->createQueryBuilder('s')
            ->where('s.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function shopNameExists(string $name): bool
    {
        $count = $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('s.name = :name')
            ->setParameter('name', $name)
            ->getQuery()
            ->getSingleScalarResult();

        return $count > 0;
    }

    public function findById(string $id): ?Shop
    {
        return $this->find($id);
    }
}
