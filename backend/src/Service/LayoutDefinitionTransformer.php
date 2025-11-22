<?php

declare(strict_types=1);

namespace App\Service;

/**
 * Transforms layout component definitions for database seeding.
 *
 * Converts component definitions from the application format (with 'settings')
 * to the database/seeder format (with 'props') and allows ID overrides
 * for consistent reseeding with static UUIDs.
 */
final class LayoutDefinitionTransformer
{
    /**
     * Transform component definitions for database seeding.
     *
     * Converts 'settings' key to 'props' and optionally overrides component IDs.
     *
     * @param array $components Array of component definitions from DefaultLayoutDefinitions
     * @param array $idMap Optional mapping of default IDs to custom IDs (e.g., static UUIDs)
     * @return array Transformed components ready for database insertion
     */
    public static function transformForSeeder(array $components, array $idMap = []): array
    {
        return array_map(function($component) use ($idMap) {
            $transformed = $component;

            // Override ID if provided in the map
            if (isset($idMap[$component['id']])) {
                $transformed['id'] = $idMap[$component['id']];
            }

            // Rename 'settings' to 'props' for database storage
            if (isset($transformed['settings'])) {
                $transformed['props'] = $transformed['settings'];
                unset($transformed['settings']);
            }

            return $transformed;
        }, $components);
    }
}
