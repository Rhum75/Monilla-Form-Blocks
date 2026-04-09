<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

if (!isset($_SESSION['user'])) {
    jsonResponse(['authenticated' => false, 'user' => null]);
}

jsonResponse([
    'authenticated' => true,
    'user' => $_SESSION['user'],
]);
