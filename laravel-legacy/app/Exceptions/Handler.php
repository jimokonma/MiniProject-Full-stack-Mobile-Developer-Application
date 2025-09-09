<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [
        //
    ];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e): JsonResponse
    {
        if ($request->expectsJson()) {
            if ($e instanceof ValidationException) {
                return response()->json([
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'details' => $e->errors(),
                ], 422);
            }

            if ($e instanceof HttpException) {
                return response()->json([
                    'code' => 'HTTP_ERROR',
                    'message' => $e->getMessage(),
                ], $e->getStatusCode());
            }

            return response()->json([
                'code' => 'INTERNAL_ERROR',
                'message' => 'Internal server error',
            ], 500);
        }

        return parent::render($request, $e);
    }
}
