<?php

namespace App\Controller\Api;

use App\Repository\ChallengeRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/challenges')]
class ChallengesController
{
    public function __construct(private readonly ChallengeRepository $challenges)
    {
    }

    #[Route('/list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $rows = $this->challenges->createQueryBuilder('c')
            ->select('c.id', 'c.title', 'c.description', 'c.icon')
            ->orderBy('c.sortOrder', 'ASC')
            ->getQuery()
            ->getArrayResult();

        return new JsonResponse($rows);
    }
}
