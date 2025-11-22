<?php

declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

/**
 * Seeder for example shop with user and page layouts.
 *
 * Creates a single example shop with:
 * - One user (demo@example.com)
 * - One shop (Example Store)
 * - Four pages (home, catalog, product, contact) each with a HeaderNavigation component
 */
class ExampleShopSeeder extends AbstractSeed
{
    /**
     * Run Method.
     *
     * Seeds an example shop with default page layouts featuring HeaderNavigation components.
     */
    public function run(): void
    {
        // Truncate tables to allow reseeding with static UUIDs
        $this->execute('TRUNCATE TABLE pages CASCADE');
        $this->execute('TRUNCATE TABLE shops CASCADE');
        $this->execute('TRUNCATE TABLE users CASCADE');

        // Static UUIDs for consistent reseeding
        $userId = '550e8400-e29b-41d4-a716-446655440001';
        $shopId = '550e8400-e29b-41d4-a716-446655440002';

        // Hash the password using PHP's password_hash function
        $hashedPassword = password_hash('test123', PASSWORD_DEFAULT);

        // Get current timestamp
        $now = date('Y-m-d H:i:s');

        // Insert example user
        $this->table('users')->insert([
            [
                'id' => $userId,
                'email' => 'demo@example.com',
                'password' => $hashedPassword,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ])->saveData();

        // Insert example shop
        $this->table('shops')->insert([
            [
                'id' => $shopId,
                'user_id' => $userId,
                'name' => 'Example Store',
                'theme_settings' => json_encode(new stdClass()), // Empty object
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ])->saveData();

        // Import required classes
        require_once __DIR__ . '/../../src/Service/DefaultLayoutDefinitions.php';
        require_once __DIR__ . '/../../src/Service/LayoutDefinitionTransformer.php';

        // Define ID mappings to maintain static UUIDs for consistent reseeding
        $idMaps = [
            'home' => [
                'default-header-home' => '550e8400-e29b-41d4-a716-446655440100',
                'default-heading1-home' => '550e8400-e29b-41d4-a716-446655440201',
                'default-textsection1-home' => '550e8400-e29b-41d4-a716-446655440202',
                'default-heading2-home' => '550e8400-e29b-41d4-a716-446655440203',
                'default-textsection2-home' => '550e8400-e29b-41d4-a716-446655440204',
            ],
            'catalog' => [
                'default-header-catalog' => '550e8400-e29b-41d4-a716-446655440100',
                'default-heading1-catalog' => '550e8400-e29b-41d4-a716-446655440301',
                'default-categorypills-catalog' => '550e8400-e29b-41d4-a716-446655440305',
                'default-productlistgrid-catalog' => '550e8400-e29b-41d4-a716-446655440306',
                'default-textsection1-catalog' => '550e8400-e29b-41d4-a716-446655440302',
                'default-heading2-catalog' => '550e8400-e29b-41d4-a716-446655440303',
                'default-textsection2-catalog' => '550e8400-e29b-41d4-a716-446655440304',
            ],
            'product' => [
                'default-header-product' => '550e8400-e29b-41d4-a716-446655440100',
                'default-heading1-product' => '550e8400-e29b-41d4-a716-446655440401',
                'default-textsection1-product' => '550e8400-e29b-41d4-a716-446655440402',
                'default-heading2-product' => '550e8400-e29b-41d4-a716-446655440403',
                'default-textsection2-product' => '550e8400-e29b-41d4-a716-446655440404',
            ],
            'contact' => [
                'default-header-contact' => '550e8400-e29b-41d4-a716-446655440100',
                'default-heading1-contact' => '550e8400-e29b-41d4-a716-446655440501',
                'default-textsection1-contact' => '550e8400-e29b-41d4-a716-446655440502',
                'default-heading2-contact' => '550e8400-e29b-41d4-a716-446655440503',
                'default-textsection2-contact' => '550e8400-e29b-41d4-a716-446655440504',
            ],
        ];

        // Get page configurations from DefaultLayoutDefinitions and transform for seeding
        $pageConfigurations = [
            'home' => \App\Service\LayoutDefinitionTransformer::transformForSeeder(
                \App\Service\DefaultLayoutDefinitions::getHomeComponents(),
                $idMaps['home']
            ),
            'catalog' => \App\Service\LayoutDefinitionTransformer::transformForSeeder(
                \App\Service\DefaultLayoutDefinitions::getCatalogComponents(),
                $idMaps['catalog']
            ),
            'product' => \App\Service\LayoutDefinitionTransformer::transformForSeeder(
                \App\Service\DefaultLayoutDefinitions::getProductComponents(),
                $idMaps['product']
            ),
            'contact' => \App\Service\LayoutDefinitionTransformer::transformForSeeder(
                \App\Service\DefaultLayoutDefinitions::getContactComponents(),
                $idMaps['contact']
            ),
        ];

        // Create pages with all components
        $pageIds = [
            'home' => '550e8400-e29b-41d4-a716-446655440601',
            'catalog' => '550e8400-e29b-41d4-a716-446655440602',
            'product' => '550e8400-e29b-41d4-a716-446655440603',
            'contact' => '550e8400-e29b-41d4-a716-446655440604',
        ];

        $pages = [];
        foreach ($pageConfigurations as $pageType => $layout) {
            $pages[] = [
                'id' => $pageIds[$pageType],
                'shop_id' => $shopId,
                'type' => $pageType,
                'layout' => json_encode($layout),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Insert all pages
        $this->table('pages')->insert($pages)->saveData();
    }
}
