<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

// Force test environment
$_ENV['APP_ENV'] = 'test';
$_SERVER['APP_ENV'] = 'test';

if (file_exists(dirname(__DIR__).'/config/bootstrap.php')) {
    require dirname(__DIR__).'/config/bootstrap.php';
} elseif (method_exists(Dotenv::class, 'bootEnv')) {
    // Load .env.test file for test environment
    (new Dotenv())->loadEnv(dirname(__DIR__).'/.env.test');
}

if ($_SERVER['APP_DEBUG'] ?? false) {
    umask(0000);
}
