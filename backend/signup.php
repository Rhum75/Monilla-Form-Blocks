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

$name = cleanString($body['name'] ?? '');
$email = strtolower(cleanString($body['email'] ?? ''));
$password = (string) ($body['password'] ?? '');
$confirmPassword = (string) ($body['confirmPassword'] ?? '');

if ($name === '' || $email === '' || $password === '' || $confirmPassword === '') {
    jsonResponse(['message' => 'Please complete all fields.'], 422);
}

if (!isValidEmail($email)) {
    jsonResponse(['message' => 'Please provide a valid email address.'], 422);
}

if (strlen($password) < 8) {
    jsonResponse(['message' => 'Password must be at least 8 characters long.'], 422);
}

if ($password !== $confirmPassword) {
    jsonResponse(['message' => 'Passwords do not match.'], 422);
}

$pdo = db();

$existsStmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$existsStmt->execute(['email' => $email]);
if ($existsStmt->fetch()) {
    jsonResponse(['message' => 'Email is already registered.'], 409);
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);

$insertStmt = $pdo->prepare(
    'INSERT INTO users (full_name, email, password_hash) VALUES (:full_name, :email, :password_hash)'
);
$insertStmt->execute([
    'full_name' => $name,
    'email' => $email,
    'password_hash' => $passwordHash,
]);

jsonResponse([
    'message' => 'Account created successfully.',
    'userId' => (int) $pdo->lastInsertId(),
], 201);
