<?php

declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

requireMethod('GET');
requireAdminUser();

$pdo = db();
$stmt = $pdo->query(
    'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC, id DESC'
);
$users = $stmt->fetchAll();

jsonResponse([
    'count' => count($users),
    'users' => $users,
]);
