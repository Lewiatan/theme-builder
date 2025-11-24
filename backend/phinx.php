<?php

return
[
    'paths' => [
        'migrations' => '%%PHINX_CONFIG_DIR%%/db/migrations',
        'seeds' => '%%PHINX_CONFIG_DIR%%/db/seeds'
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment' => 'development',
        'development' => [
            'adapter' => 'pgsql',
            'host' => 'postgres',
            'name' => 'builder',
            'user' => 'builder',
            'pass' => 'builder',
            'port' => '5432',
            'charset' => 'utf8',
        ],
        'production' => [
            'adapter' => 'pgsql',
            'connection' => getenv('DATABASE_URL') ?: 'postgresql://user:pass@localhost:5432/dbname',
            'charset' => 'utf8',
        ],
        'testing' => [
            'adapter' => 'pgsql',
            'host' => 'postgres',
            'name' => 'builder_test',
            'user' => 'builder',
            'pass' => 'builder',
            'port' => '5432',
            'charset' => 'utf8',
        ]
    ],
    'version_order' => 'creation'
];
