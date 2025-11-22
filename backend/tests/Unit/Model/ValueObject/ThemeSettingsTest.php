<?php

declare(strict_types=1);

namespace App\Tests\Unit\Model\ValueObject;

use App\Model\ValueObject\ThemeSettings;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

#[CoversClass(ThemeSettings::class)]
final class ThemeSettingsTest extends TestCase
{
    #[Test]
    public function it_creates_from_array(): void
    {
        $data = ['color' => 'blue', 'font' => 'Arial'];
        $settings = ThemeSettings::fromArray($data);

        $this->assertSame($data, $settings->toArray());
    }

    #[Test]
    public function it_creates_default_empty_settings(): void
    {
        $settings = ThemeSettings::default();

        $this->assertSame([], $settings->toArray());
    }

    #[Test]
    public function it_gets_existing_setting(): void
    {
        $settings = new ThemeSettings(['color' => 'blue', 'font' => 'Arial']);

        $this->assertSame('blue', $settings->get('color'));
        $this->assertSame('Arial', $settings->get('font'));
    }

    #[Test]
    public function it_returns_default_for_missing_setting(): void
    {
        $settings = ThemeSettings::default();

        $this->assertNull($settings->get('missing'));
        $this->assertSame('default', $settings->get('missing', 'default'));
    }

    #[Test]
    public function it_checks_if_setting_exists(): void
    {
        $settings = new ThemeSettings(['color' => 'blue']);

        $this->assertTrue($settings->has('color'));
        $this->assertFalse($settings->has('font'));
    }

    #[Test]
    public function it_creates_new_instance_with_added_setting(): void
    {
        $settings = ThemeSettings::default();
        $newSettings = $settings->with('color', 'blue');

        // Original remains unchanged
        $this->assertFalse($settings->has('color'));

        // New instance has the setting
        $this->assertTrue($newSettings->has('color'));
        $this->assertSame('blue', $newSettings->get('color'));
    }

    #[Test]
    public function it_creates_new_instance_with_updated_setting(): void
    {
        $settings = new ThemeSettings(['color' => 'blue']);
        $newSettings = $settings->with('color', 'red');

        // Original remains unchanged
        $this->assertSame('blue', $settings->get('color'));

        // New instance has updated value
        $this->assertSame('red', $newSettings->get('color'));
    }

    #[Test]
    public function it_creates_new_instance_without_setting(): void
    {
        $settings = new ThemeSettings(['color' => 'blue', 'font' => 'Arial']);
        $newSettings = $settings->without('color');

        // Original remains unchanged
        $this->assertTrue($settings->has('color'));

        // New instance doesn't have the setting
        $this->assertFalse($newSettings->has('color'));
        $this->assertTrue($newSettings->has('font'));
    }

    #[Test]
    public function it_merges_settings_creating_new_instance(): void
    {
        $settings = new ThemeSettings(['color' => 'blue', 'font' => 'Arial']);
        $newSettings = $settings->merge(['color' => 'red', 'size' => 'large']);

        // Original remains unchanged
        $this->assertSame('blue', $settings->get('color'));
        $this->assertFalse($settings->has('size'));

        // New instance has merged values
        $this->assertSame('red', $newSettings->get('color'));
        $this->assertSame('Arial', $newSettings->get('font'));
        $this->assertSame('large', $newSettings->get('size'));
    }

    #[Test]
    public function it_handles_complex_nested_values(): void
    {
        $complexData = [
            'colors' => ['primary' => 'blue', 'secondary' => 'green'],
            'fonts' => ['heading' => 'Arial', 'body' => 'Georgia'],
        ];

        $settings = new ThemeSettings($complexData);

        $this->assertSame($complexData['colors'], $settings->get('colors'));
        $this->assertSame($complexData['fonts'], $settings->get('fonts'));
    }

    #[Test]
    public function it_maintains_immutability_through_chaining(): void
    {
        $settings = ThemeSettings::default()
            ->with('color', 'blue')
            ->with('font', 'Arial')
            ->with('size', 'large');

        $this->assertSame('blue', $settings->get('color'));
        $this->assertSame('Arial', $settings->get('font'));
        $this->assertSame('large', $settings->get('size'));
    }

    #[Test]
    public function without_non_existent_key_returns_equivalent_instance(): void
    {
        $settings = new ThemeSettings(['color' => 'blue']);
        $newSettings = $settings->without('nonexistent');

        $this->assertSame($settings->toArray(), $newSettings->toArray());
    }

    #[Test]
    public function it_handles_null_values(): void
    {
        $settings = new ThemeSettings(['nullable' => null]);

        $this->assertTrue($settings->has('nullable'));
        $this->assertNull($settings->get('nullable'));
    }

    #[Test]
    public function merge_with_empty_array_returns_equivalent_instance(): void
    {
        $settings = new ThemeSettings(['color' => 'blue']);
        $newSettings = $settings->merge([]);

        $this->assertSame($settings->toArray(), $newSettings->toArray());
    }
}
