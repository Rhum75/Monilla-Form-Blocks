<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

function ensureUserCartsTable(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS user_carts (
            user_id INT UNSIGNED NOT NULL PRIMARY KEY,
            cart_json LONGTEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_user_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function normalizeCartItems(array $items): array
{
    $normalized = [];

    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }

        $id = cleanString($item['id'] ?? '');
        if ($id === '') {
            continue;
        }

        $title = cleanString($item['title'] ?? 'Product');
        $type = cleanString($item['type'] ?? 'Precast Block');
        $image = cleanString($item['image'] ?? '');
        $price = (float) ($item['price'] ?? 0);
        $quantity = (int) ($item['quantity'] ?? 1);

        $normalized[] = [
            'id' => substr($id, 0, 120),
            'title' => substr($title, 0, 255),
            'type' => substr($type, 0, 120),
            'image' => substr($image, 0, 255),
            'price' => max(0, round($price, 2)),
            'quantity' => max(1, min(9999, $quantity)),
        ];
    }

    return $normalized;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$user = requireAuthUser();
$pdo = db();
ensureUserCartsTable($pdo);

if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT cart_json FROM user_carts WHERE user_id = :user_id LIMIT 1');
    $stmt->execute(['user_id' => (int) $user['id']]);
    $row = $stmt->fetch();

    $items = [];
    if ($row && isset($row['cart_json'])) {
        $decoded = json_decode((string) $row['cart_json'], true);
        if (is_array($decoded)) {
            $items = normalizeCartItems($decoded);
        }
    }

    jsonResponse(['items' => $items]);
}

if ($method === 'POST') {
    $body = getJsonBody();
    $items = $body['items'] ?? [];

    if (!is_array($items)) {
        jsonResponse(['message' => 'Invalid cart payload.'], 422);
    }

    if (count($items) > 200) {
        jsonResponse(['message' => 'Cart item limit exceeded.'], 422);
    }

    $normalized = normalizeCartItems($items);
    $json = json_encode($normalized, JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        jsonResponse(['message' => 'Failed to encode cart payload.'], 500);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO user_carts (user_id, cart_json)
         VALUES (:user_id, :cart_json)
         ON DUPLICATE KEY UPDATE cart_json = VALUES(cart_json), updated_at = CURRENT_TIMESTAMP'
    );

    $stmt->execute([
        'user_id' => (int) $user['id'],
        'cart_json' => $json,
    ]);

    jsonResponse(['message' => 'Cart saved.', 'items' => $normalized]);
}

jsonResponse(['message' => 'Method not allowed.'], 405);
