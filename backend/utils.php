<?php

declare(strict_types=1);

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function cleanString(mixed $value): string
{
    return trim((string) $value);
}

function isValidEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function requireMethod(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
        jsonResponse(['message' => 'Method not allowed.'], 405);
    }
}

function currentUser(): ?array
{
    if (!isset($_SESSION['user']) || !is_array($_SESSION['user'])) {
        return null;
    }

    return $_SESSION['user'];
}

function requireAuthUser(): array
{
    $user = currentUser();
    if ($user === null) {
        jsonResponse(['message' => 'Please log in first.'], 401);
    }

    return $user;
}
