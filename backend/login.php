<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['message' => 'Method not allowed.'], 405);
}

$body = getJsonBody();
if ($body === []) {
    $body = $_POST;
}

$identity = cleanString($body['identity'] ?? '');
$password = (string) ($body['password'] ?? '');

if ($identity === '' || $password === '') {
    jsonResponse(['message' => 'Identity and password are required.'], 422);
}

$pdo = db();
$stmt = $pdo->prepare('SELECT id, full_name, email, password_hash FROM users WHERE email = :identity LIMIT 1');
$stmt->execute(['identity' => strtolower($identity)]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, (string) $user['password_hash'])) {
    jsonResponse(['message' => 'Invalid credentials.'], 401);
}

$_SESSION['user'] = [
    'id' => (int) $user['id'],
    'name' => (string) $user['full_name'],
    'email' => (string) $user['email'],
];

jsonResponse([
    'message' => 'Login successful.',
    'user' => $_SESSION['user'],
]);
