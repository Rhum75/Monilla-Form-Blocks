<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils.php';

// Always return fresh auth/session state.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if (!isset($_SESSION['user'])) {
    jsonResponse(['authenticated' => false, 'user' => null]);
}

jsonResponse([
    'authenticated' => true,
    'user' => $_SESSION['user'],
]);
