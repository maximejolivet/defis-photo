<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

// Always return JSON on error, even for infrastructure failures (e.g. an
// unreachable database) — an API should never leak an HTML debug page.
#[AsEventListener(event: KernelEvents::EXCEPTION)]
class ApiExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $status = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;

        $event->setResponse(new JsonResponse(['message' => $exception->getMessage() ?: 'Erreur interne du serveur.'], $status));
    }
}
