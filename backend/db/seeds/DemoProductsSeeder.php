<?php

use Phinx\Seed\AbstractSeed;

/**
 * Seeder for demo products and categories data.
 *
 * Populates the demo_categories and demo_products tables with sample data
 * for testing and demonstration purposes in the Demo Shop.
 */
class DemoProductsSeeder extends AbstractSeed
{
    /**
     * Run Method.
     *
     * Seeds demo categories and products with realistic e-commerce data.
     * Products include varied prices, categories, and sale prices to demonstrate
     * different scenarios.
     */
    public function run(): void
    {
        // Truncate tables to allow reseeding with static IDs
        $this->execute('TRUNCATE TABLE demo_products CASCADE');
        $this->execute('TRUNCATE TABLE demo_categories CASCADE');

        // Insert demo categories
        $this->table('demo_categories')->insert([
            ['id' => 1, 'name' => 'Electronics'],
            ['id' => 2, 'name' => 'Clothing'],
            ['id' => 3, 'name' => 'Books'],
            ['id' => 4, 'name' => 'Home & Garden'],
            ['id' => 5, 'name' => 'Sports & Outdoors'],
            ['id' => 6, 'name' => 'Beauty & Personal Care'],
        ])->saveData();

        // Insert demo products
        $this->table('demo_products')->insert([
            // Electronics
            [
                'id' => 1,
                'category_id' => 1,
                'name' => 'Premium Wireless Headphones',
                'description' => 'High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
                'price' => 29999, // $299.99
                'sale_price' => 24999, // $249.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
            ],
            [
                'id' => 2,
                'category_id' => 1,
                'name' => 'Smart Watch Pro',
                'description' => 'Feature-rich smartwatch with heart rate monitoring, GPS, and water resistance. Stay connected and track your fitness goals.',
                'price' => 39999, // $399.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
            ],
            [
                'id' => 3,
                'category_id' => 1,
                'name' => 'Ultra HD Webcam',
                'description' => '4K webcam with auto-focus and noise-canceling microphone. Perfect for video conferencing and content creation.',
                'price' => 12999, // $129.99
                'sale_price' => 9999, // $99.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200',
            ],

            // Clothing
            [
                'id' => 4,
                'category_id' => 2,
                'name' => 'Classic Denim Jacket',
                'description' => 'Timeless denim jacket made from premium cotton. A versatile piece that goes with any outfit.',
                'price' => 7999, // $79.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200',
            ],
            [
                'id' => 5,
                'category_id' => 2,
                'name' => 'Cotton T-Shirt Pack',
                'description' => 'Pack of 3 premium cotton t-shirts in assorted colors. Comfortable, breathable, and perfect for everyday wear.',
                'price' => 2999, // $29.99
                'sale_price' => 2499, // $24.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200',
            ],

            // Books
            [
                'id' => 6,
                'category_id' => 3,
                'name' => 'Advanced JavaScript Patterns',
                'description' => 'Comprehensive guide to modern JavaScript design patterns and best practices. Perfect for intermediate to advanced developers.',
                'price' => 4999, // $49.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200',
            ],
            [
                'id' => 7,
                'category_id' => 3,
                'name' => 'Clean Architecture',
                'description' => 'A craftsman\'s guide to software structure and design. Learn how to build maintainable and scalable applications.',
                'price' => 3999, // $39.99
                'sale_price' => 3499, // $34.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=1200',
            ],
            [
                'id' => 8,
                'category_id' => 3,
                'name' => 'Domain-Driven Design',
                'description' => 'Essential reading for building complex software systems. Learn how to tackle complexity in the heart of software.',
                'price' => 5499, // $54.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200',
            ],

            // Home & Garden
            [
                'id' => 9,
                'category_id' => 4,
                'name' => 'Ceramic Plant Pot Set',
                'description' => 'Set of 3 handcrafted ceramic plant pots with drainage holes. Perfect for indoor plants and succulents.',
                'price' => 3499, // $34.99
                'sale_price' => 2999, // $29.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200',
            ],
            [
                'id' => 10,
                'category_id' => 4,
                'name' => 'LED Garden Lights',
                'description' => 'Solar-powered LED garden lights. Eco-friendly lighting solution for pathways and landscaping.',
                'price' => 4999, // $49.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200',
            ],

            // Additional Electronics
            [
                'id' => 11,
                'category_id' => 1,
                'name' => 'Mechanical Keyboard RGB',
                'description' => 'Gaming mechanical keyboard with customizable RGB lighting and tactile switches. Built for gamers and typists.',
                'price' => 14999, // $149.99
                'sale_price' => 12999, // $129.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200',
            ],
            [
                'id' => 12,
                'category_id' => 1,
                'name' => 'Wireless Mouse Pro',
                'description' => 'Ergonomic wireless mouse with precision tracking and long battery life. Perfect for productivity and gaming.',
                'price' => 6999, // $69.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200',
            ],
            [
                'id' => 13,
                'category_id' => 1,
                'name' => 'Portable SSD 1TB',
                'description' => 'Ultra-fast portable solid-state drive with USB-C connectivity. Transfer files at blazing speeds.',
                'price' => 18999, // $189.99
                'sale_price' => 16999, // $169.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=1200',
            ],
            [
                'id' => 14,
                'category_id' => 1,
                'name' => 'USB-C Hub Adapter',
                'description' => '7-in-1 USB-C hub with HDMI, USB 3.0 ports, SD card reader, and power delivery. Essential for modern laptops.',
                'price' => 4999, // $49.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=1200',
            ],
            [
                'id' => 15,
                'category_id' => 1,
                'name' => 'Bluetooth Speaker Portable',
                'description' => 'Waterproof Bluetooth speaker with 20-hour battery and powerful bass. Perfect for outdoor adventures.',
                'price' => 7999, // $79.99
                'sale_price' => 6499, // $64.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200',
            ],

            // Additional Clothing
            [
                'id' => 16,
                'category_id' => 2,
                'name' => 'Leather Crossbody Bag',
                'description' => 'Genuine leather crossbody bag with adjustable strap. Stylish and practical for everyday use.',
                'price' => 12999, // $129.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200',
            ],
            [
                'id' => 17,
                'category_id' => 2,
                'name' => 'Running Sneakers',
                'description' => 'Lightweight running shoes with cushioned sole and breathable mesh. Designed for comfort and performance.',
                'price' => 8999, // $89.99
                'sale_price' => 7499, // $74.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
            ],
            [
                'id' => 18,
                'category_id' => 2,
                'name' => 'Wool Winter Scarf',
                'description' => 'Soft merino wool scarf in classic patterns. Stay warm and stylish during cold weather.',
                'price' => 3999, // $39.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=1200',
            ],
            [
                'id' => 19,
                'category_id' => 2,
                'name' => 'Baseball Cap',
                'description' => 'Adjustable cotton baseball cap with embroidered logo. Classic style for casual wear.',
                'price' => 1999, // $19.99
                'sale_price' => 1599, // $15.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1200',
            ],
            [
                'id' => 20,
                'category_id' => 2,
                'name' => 'Athletic Shorts',
                'description' => 'Moisture-wicking athletic shorts with zippered pockets. Ideal for workouts and sports.',
                'price' => 3499, // $34.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=1200',
            ],

            // Additional Books
            [
                'id' => 21,
                'category_id' => 3,
                'name' => 'The Pragmatic Programmer',
                'description' => 'Your journey to mastery. Timeless advice for software craftsmanship and professional development.',
                'price' => 4499, // $44.99
                'sale_price' => 3999, // $39.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200',
            ],
            [
                'id' => 22,
                'category_id' => 3,
                'name' => 'Refactoring: Improving Code',
                'description' => 'Essential techniques for improving existing code. Learn how to transform messy code into clean, maintainable systems.',
                'price' => 4999, // $49.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200',
            ],
            [
                'id' => 23,
                'category_id' => 3,
                'name' => 'Design Patterns: Gang of Four',
                'description' => 'Classic book on software design patterns. Essential reading for object-oriented programmers.',
                'price' => 5999, // $59.99
                'sale_price' => 5499, // $54.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200',
            ],
            [
                'id' => 24,
                'category_id' => 3,
                'name' => 'Test-Driven Development',
                'description' => 'By example. Learn TDD practices that will transform your software development approach.',
                'price' => 3999, // $39.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200',
            ],
            [
                'id' => 25,
                'category_id' => 3,
                'name' => 'Continuous Delivery',
                'description' => 'Reliable software releases through build, test, and deployment automation. Modern DevOps practices.',
                'price' => 4599, // $45.99
                'sale_price' => 3999, // $39.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200',
            ],

            // Additional Home & Garden
            [
                'id' => 26,
                'category_id' => 4,
                'name' => 'Throw Pillow Set',
                'description' => 'Set of 4 decorative throw pillows with removable covers. Add comfort and style to any room.',
                'price' => 4999, // $49.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1200',
            ],
            [
                'id' => 27,
                'category_id' => 4,
                'name' => 'Kitchen Knife Set',
                'description' => 'Professional 8-piece chef knife set with wooden block. High-carbon stainless steel blades.',
                'price' => 12999, // $129.99
                'sale_price' => 9999, // $99.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=1200',
            ],
            [
                'id' => 28,
                'category_id' => 4,
                'name' => 'Bamboo Cutting Board',
                'description' => 'Extra-large bamboo cutting board with juice groove. Eco-friendly and durable kitchen essential.',
                'price' => 2999, // $29.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1598346762291-a4ef72a29c50?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1598346762291-a4ef72a29c50?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1598346762291-a4ef72a29c50?w=1200',
            ],
            [
                'id' => 29,
                'category_id' => 4,
                'name' => 'Area Rug Modern',
                'description' => 'Contemporary geometric area rug in neutral tones. Soft, durable, and easy to clean.',
                'price' => 15999, // $159.99
                'sale_price' => 13999, // $139.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1200',
            ],
            [
                'id' => 30,
                'category_id' => 4,
                'name' => 'Wall Mirror Decorative',
                'description' => 'Round decorative wall mirror with metal frame. Modern design to brighten any space.',
                'price' => 7999, // $79.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200',
            ],

            // Sports & Outdoors
            [
                'id' => 31,
                'category_id' => 5,
                'name' => 'Yoga Mat Premium',
                'description' => 'Extra-thick yoga mat with non-slip surface and carrying strap. Perfect for yoga, pilates, and fitness.',
                'price' => 4999, // $49.99
                'sale_price' => 3999, // $39.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=1200',
            ],
            [
                'id' => 32,
                'category_id' => 5,
                'name' => 'Camping Tent 4-Person',
                'description' => 'Waterproof 4-person camping tent with easy setup. Includes rainfly and storage pockets.',
                'price' => 19999, // $199.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
            ],
            [
                'id' => 33,
                'category_id' => 5,
                'name' => 'Mountain Bike Helmet',
                'description' => 'Lightweight cycling helmet with adjustable fit and superior ventilation. CPSC certified for safety.',
                'price' => 5999, // $59.99
                'sale_price' => 4999, // $49.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1557946980-ba8cd5a3f17d?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1557946980-ba8cd5a3f17d?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1557946980-ba8cd5a3f17d?w=1200',
            ],
            [
                'id' => 34,
                'category_id' => 5,
                'name' => 'Resistance Bands Set',
                'description' => 'Set of 5 resistance bands with different levels. Includes door anchor, handles, and carry bag.',
                'price' => 2999, // $29.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=1200',
            ],
            [
                'id' => 35,
                'category_id' => 5,
                'name' => 'Hiking Backpack 40L',
                'description' => 'Durable 40L hiking backpack with hydration compatibility and rain cover. Multiple compartments for organization.',
                'price' => 8999, // $89.99
                'sale_price' => 7499, // $74.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=1200',
            ],
            [
                'id' => 36,
                'category_id' => 5,
                'name' => 'Water Bottle Insulated',
                'description' => 'Stainless steel insulated water bottle keeps drinks cold for 24 hours, hot for 12 hours. 32oz capacity.',
                'price' => 3499, // $34.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200',
            ],
            [
                'id' => 37,
                'category_id' => 5,
                'name' => 'Tennis Racket Pro',
                'description' => 'Professional-grade tennis racket with graphite frame. Pre-strung and ready to play.',
                'price' => 12999, // $129.99
                'sale_price' => 10999, // $109.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1617083277909-10bcc42e1d8b?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1617083277909-10bcc42e1d8b?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1617083277909-10bcc42e1d8b?w=1200',
            ],
            [
                'id' => 38,
                'category_id' => 5,
                'name' => 'Dumbbell Set Adjustable',
                'description' => 'Adjustable dumbbell set with weight range 5-52.5 lbs per hand. Space-saving design for home gym.',
                'price' => 29999, // $299.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=1200',
            ],

            // Beauty & Personal Care
            [
                'id' => 39,
                'category_id' => 6,
                'name' => 'Facial Serum Vitamin C',
                'description' => 'Brightening vitamin C serum with hyaluronic acid. Reduces dark spots and promotes glowing skin.',
                'price' => 3999, // $39.99
                'sale_price' => 3199, // $31.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200',
            ],
            [
                'id' => 40,
                'category_id' => 6,
                'name' => 'Hair Dryer Professional',
                'description' => 'Ionic hair dryer with multiple heat settings and cool shot button. Reduces frizz and drying time.',
                'price' => 8999, // $89.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200',
            ],
            [
                'id' => 41,
                'category_id' => 6,
                'name' => 'Skincare Set Complete',
                'description' => '5-piece skincare routine set including cleanser, toner, serum, moisturizer, and eye cream. Suitable for all skin types.',
                'price' => 7999, // $79.99
                'sale_price' => 6499, // $64.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200',
            ],
            [
                'id' => 42,
                'category_id' => 6,
                'name' => 'Electric Toothbrush',
                'description' => 'Rechargeable electric toothbrush with 5 brushing modes and pressure sensor. Includes 4 brush heads.',
                'price' => 6999, // $69.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=1200',
            ],
            [
                'id' => 43,
                'category_id' => 6,
                'name' => 'Makeup Brush Set',
                'description' => 'Professional 12-piece makeup brush set with synthetic bristles. Includes brushes for face, eyes, and lips.',
                'price' => 4999, // $49.99
                'sale_price' => 3999, // $39.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200',
            ],
            [
                'id' => 44,
                'category_id' => 6,
                'name' => 'Aromatherapy Diffuser',
                'description' => 'Ultrasonic essential oil diffuser with color-changing LED lights. Runs up to 10 hours continuously.',
                'price' => 3499, // $34.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200',
            ],
            [
                'id' => 45,
                'category_id' => 6,
                'name' => 'Facial Cleansing Brush',
                'description' => 'Waterproof sonic facial cleansing brush with 3 speed settings. Removes makeup and deep cleans pores.',
                'price' => 5999, // $59.99
                'sale_price' => 4799, // $47.99
                'image_thumbnail' => 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=1200',
            ],
            [
                'id' => 46,
                'category_id' => 6,
                'name' => 'Natural Deodorant Set',
                'description' => 'Pack of 3 aluminum-free natural deodorants in different scents. Long-lasting protection with organic ingredients.',
                'price' => 2999, // $29.99
                'sale_price' => null,
                'image_thumbnail' => 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200',
                'image_medium' => 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600',
                'image_large' => 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=1200',
            ],
        ])->saveData();
    }
}
