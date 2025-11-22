<?php

declare(strict_types=1);

namespace App\EventListener;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

/**
 * Converts exceptions to JSON responses for API endpoints.
 *
 * This listener intercepts all exceptions thrown in the application and
 * returns properly formatted JSON error responses instead of HTML pages.
 * It only handles requests to /api/* paths to avoid interfering with
 * other potential routes.
 */
final class JsonExceptionListener
{
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly string $environment
    ) {}

    public function onKernelException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();

        // Only handle API requests
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        $exception = $event->getThrowable();

        // Log the exception
        $this->logger->error('API Exception caught', [
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile() . ':' . $exception->getLine(),
            'path' => $request->getPathInfo(),
            'method' => $request->getMethod(),
        ]);

        // Determine status code
        $statusCode = Response::HTTP_INTERNAL_SERVER_ERROR;
        if ($exception instanceof HttpExceptionInterface) {
            $statusCode = $exception->getStatusCode();
        } elseif ($exception instanceof AuthenticationException) {
            $statusCode = Response::HTTP_UNAUTHORIZED;
        } elseif ($exception instanceof AccessDeniedException) {
            $statusCode = Response::HTTP_FORBIDDEN;
        }

        // Build error response
        $error = [
            'error' => $this->getErrorType($exception, $statusCode),
            'message' => $exception->getMessage(),
        ];

        // Include additional debug info in development
        if ($this->environment === 'dev') {
            $error['debug'] = [
                'exception' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => explode("\n", $exception->getTraceAsString()),
            ];
        }

        $response = new JsonResponse($error, $statusCode);
        $event->setResponse($response);
    }

    private function getErrorType(\Throwable $exception, int $statusCode): string
    {
        return match ($statusCode) {
            Response::HTTP_BAD_REQUEST => 'bad_request',
            Response::HTTP_UNAUTHORIZED => 'unauthorized',
            Response::HTTP_FORBIDDEN => 'forbidden',
            Response::HTTP_NOT_FOUND => 'not_found',
            Response::HTTP_METHOD_NOT_ALLOWED => 'method_not_allowed',
            Response::HTTP_CONFLICT => 'conflict',
            Response::HTTP_UNPROCESSABLE_ENTITY => 'validation_error',
            default => 'internal_error',
        };
    }
}
