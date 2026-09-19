<?php

namespace App\Entity;

use App\Repository\PhotoRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PhotoRepository::class)]
#[ORM\Table(name: 'photos')]
class Photo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(name: 'user_id')]
    private int $userId;

    #[ORM\Column(name: 'image_path', length: 255)]
    private string $imagePath;

    #[ORM\Column(name: 'challenge_id', nullable: true)]
    private ?int $challengeId = null;

    #[ORM\Column(name: 'recipient_user_id', nullable: true)]
    private ?int $recipientUserId = null;

    #[ORM\Column(name: 'created_at')]
    private DateTimeImmutable $createdAt;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function setUserId(int $userId): static
    {
        $this->userId = $userId;

        return $this;
    }

    public function getImagePath(): string
    {
        return $this->imagePath;
    }

    public function setImagePath(string $imagePath): static
    {
        $this->imagePath = $imagePath;

        return $this;
    }

    public function getChallengeId(): ?int
    {
        return $this->challengeId;
    }

    public function setChallengeId(?int $challengeId): static
    {
        $this->challengeId = $challengeId;

        return $this;
    }

    public function getRecipientUserId(): ?int
    {
        return $this->recipientUserId;
    }

    public function setRecipientUserId(?int $recipientUserId): static
    {
        $this->recipientUserId = $recipientUserId;

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new DateTimeImmutable();
    }
}
