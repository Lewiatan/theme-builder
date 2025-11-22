<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Health check endpoint for monitoring and testing
 */
final class HealthCheckController extends AbstractController
{
    #[Route('/health', name: 'health_check', methods: ['GET'])]
    public function check(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'service' => 'theme-builder-api',
        ]);
    }
}
