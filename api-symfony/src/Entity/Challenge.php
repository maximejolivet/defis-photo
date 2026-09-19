<?php

namespace App\Entity;

use App\Repository\ChallengeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ChallengeRepository::class)]
#[ORM\Table(name: 'challenges')]
class Challenge
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private string $title;

    #[ORM\Column(length: 500)]
    private string $description;

    #[ORM\Column(length: 10)]
    private string $icon;

    #[ORM\Column(name: 'sort_order')]
    private int $sortOrder = 0;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function getIcon(): string
    {
        return $this->icon;
    }

    public function getSortOrder(): int
    {
        return $this->sortOrder;
    }
}
