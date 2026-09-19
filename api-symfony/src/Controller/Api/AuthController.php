<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $users,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly JWTTokenManagerInterface $jwtManager,
    ) {
    }

    #[Route('/register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $pseudo = trim((string) ($data['pseudo'] ?? ''));
        $pin = (string) ($data['pin'] ?? '');

        if ($pseudo === '' || $pin === '') {
            return new JsonResponse(['message' => 'Données incomplètes (pseudo et code PIN requis).'], 400);
        }
        if (!preg_match('/^\d{4}$/', $pin)) {
            return new JsonResponse(['message' => 'Le code PIN doit contenir exactement 4 chiffres.'], 400);
        }

        $user = new User();
        $user->setPseudo($pseudo);
        $user->setPassword($this->passwordHasher->hashPassword($user, $pin));

        try {
            $this->em->persist($user);
            $this->em->flush();
        } catch (UniqueConstraintViolationException) {
            return new JsonResponse(['message' => 'Ce pseudo est déjà utilisé.'], 409);
        }

        return new JsonResponse(['message' => 'Utilisateur créé avec succès.']);
    }

    #[Route('/login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $pseudo = trim((string) ($data['pseudo'] ?? ''));
        $pin = (string) ($data['pin'] ?? '');

        if ($pseudo === '' || $pin === '') {
            return new JsonResponse(['message' => 'Données manquantes (pseudo ou code PIN).'], 400);
        }

        $user = $this->users->findOneBy(['pseudo' => $pseudo]);
        if (!$user || !$this->passwordHasher->isPasswordValid($user, $pin)) {
            return new JsonResponse(['message' => 'Identifiants incorrects.'], 401);
        }

        return new JsonResponse([
            'message' => 'Connexion réussie.',
            'token' => $this->jwtManager->create($user),
            'user' => ['id' => $user->getId(), 'pseudo' => $user->getPseudo()],
        ]);
    }
}
