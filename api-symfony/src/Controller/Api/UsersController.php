<?php

namespace App\Controller\Api;

use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users')]
class UsersController
{
    public function __construct(private readonly UserRepository $users)
    {
    }

    #[Route('/list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $rows = $this->users->createQueryBuilder('u')
            ->select('u.id', 'u.pseudo')
            ->orderBy('u.pseudo', 'ASC')
            ->getQuery()
            ->getArrayResult();

        return new JsonResponse($rows);
    }
}
