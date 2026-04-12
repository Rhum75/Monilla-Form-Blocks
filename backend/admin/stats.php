<?php

declare(strict_types=1);

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

requireMethod('GET');
requireAdminUser();

$pdo = db();

$usersCount = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
$newUsersToday = (int) $pdo->query('SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()')->fetchColumn();

$ordersCount = 0;
$ordersPending = 0;
$ordersTotalValue = 0.0;

try {
    $ordersCount = (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    $ordersPending = (int) $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn();
    $ordersTotalValue = (float) $pdo->query('SELECT COALESCE(SUM(total_amount), 0) FROM orders')->fetchColumn();
} catch (Throwable $e) {
    // Keep dashboard usable even when orders table is not yet available.
}

jsonResponse([
    'users' => [
        'total' => $usersCount,
        'newToday' => $newUsersToday,
    ],
    'orders' => [
        'total' => $ordersCount,
        'pending' => $ordersPending,
        'totalValue' => $ordersTotalValue,
    ],
]);
