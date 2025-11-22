<?php

declare(strict_types=1);

namespace App\Repository;

use App\Model\Entity\User;
use App\Model\ValueObject\Email;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<User>
 */
final class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function save(User $user): void
    {
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    public function findByEmail(Email $email): ?User
    {
        return $this->createQueryBuilder('u')
            ->where('u.email.value = :email')
            ->setParameter('email', $email->getValue())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function emailExists(Email $email): bool
    {
        $count = $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.email.value = :email')
            ->setParameter('email', $email->getValue())
            ->getQuery()
            ->getSingleScalarResult();

        return $count > 0;
    }

    public function findById(string $id): ?User
    {
        return $this->find($id);
    }
}
