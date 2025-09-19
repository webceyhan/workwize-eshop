<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    const ELECTRONICS_PRODUCTS = [
        [
            'name' => 'Wireless Bluetooth Headphones',
            'description' => 'High-quality wireless headphones with noise cancellation and 20-hour battery life.',
            'price' => 89.99,
            'stock_quantity' => 50,
            'category' => 'Electronics',
            'sku' => 'WBH001',
            'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        ],
        [
            'name' => 'Smartphone Case',
            'description' => 'Durable protective case for smartphones with military-grade protection.',
            'price' => 24.99,
            'stock_quantity' => 100,
            'category' => 'Electronics',
            'sku' => 'SPC001',
            'image_url' => 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
        ],
        [
            'name' => 'USB-C Charging Cable',
            'description' => 'Fast charging USB-C cable compatible with most modern devices.',
            'price' => 12.99,
            'stock_quantity' => 200,
            'category' => 'Electronics',
            'sku' => 'UCC001',
            'image_url' => 'https://images.pexels.com/photos/5208826/pexels-photo-5208826.jpeg?w=400',
        ],
        [
            'name' => 'Wireless Mouse',
            'description' => 'Ergonomic wireless mouse with precision tracking and long battery life.',
            'price' => 29.99,
            'stock_quantity' => 75,
            'category' => 'Electronics',
            'sku' => 'WM001',
            'image_url' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
        ],
    ];

    const FASHION_PRODUCTS = [
        [
            'name' => 'Cotton T-Shirt',
            'description' => 'Comfortable 100% cotton t-shirt available in multiple colors.',
            'price' => 19.99,
            'stock_quantity' => 150,
            'category' => 'Clothing',
            'sku' => 'CTS001',
            'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        ],
        [
            'name' => 'Denim Jeans',
            'description' => 'Classic fit denim jeans made from premium quality denim.',
            'price' => 59.99,
            'stock_quantity' => 80,
            'category' => 'Clothing',
            'sku' => 'DJ001',
            'image_url' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        ],
        [
            'name' => 'Leather Handbag',
            'description' => 'Stylish leather handbag perfect for everyday use.',
            'price' => 129.99,
            'stock_quantity' => 30,
            'category' => 'Accessories',
            'sku' => 'LHB001',
            'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        ],
        [
            'name' => 'Sneakers',
            'description' => 'Comfortable casual sneakers for everyday wear.',
            'price' => 79.99,
            'stock_quantity' => 60,
            'category' => 'Shoes',
            'sku' => 'SNK001',
            'image_url' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        ],
    ];

    const HOME_GARDEN_PRODUCTS = [
        [
            'name' => 'Ceramic Plant Pot',
            'description' => 'Elegant ceramic plant pot suitable for indoor plants.',
            'price' => 15.99,
            'stock_quantity' => 60,
            'category' => 'Home & Garden',
            'sku' => 'CPP001',
            'image_url' => 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400',
        ],
        [
            'name' => 'LED Desk Lamp',
            'description' => 'Adjustable LED desk lamp with touch control and USB charging port.',
            'price' => 39.99,
            'stock_quantity' => 40,
            'category' => 'Home & Garden',
            'sku' => 'LDL001',
            'image_url' => 'https://images.pexels.com/photos/15519510/pexels-photo-15519510.jpeg?w=400',
        ],
        [
            'name' => 'Stainless Steel Kitchen Knife Set',
            'description' => 'Professional kitchen knife set with wooden block for safe storage.',
            'price' => 99.99,
            'stock_quantity' => 25,
            'category' => 'Home & Garden',
            'sku' => 'SSK001',
            'image_url' => 'https://images.pexels.com/photos/16443132/pexels-photo-16443132.jpeg?w=400',
        ],
        [
            'name' => 'Cotton Bath Towel Set',
            'description' => 'Soft and absorbent cotton bath towel set including 2 large towels and 2 hand towels.',
            'price' => 49.99,
            'stock_quantity' => 70,
            'category' => 'Home & Garden',
            'sku' => 'CBT001',
            'image_url' => 'https://images.pexels.com/photos/12679/pexels-photo-12679.jpeg?w=400',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = User::suppliers()->get();

        // Tech Supplier products (using factory with specific data)
        $testSupplier1 = $suppliers->shift();

        Product::factory()
            ->forSupplier($testSupplier1)
            ->count(count(self::ELECTRONICS_PRODUCTS))
            ->sequence(...self::ELECTRONICS_PRODUCTS)
            ->active()
            ->create();

        // Create additional random products for tech supplier
        Product::factory(3)->forSupplier($testSupplier1)->create([
            'created_at' => fake()->dateTimeBetween('-2 months', '-1 month'),
            'category' => fake()->randomElement(['Electronics', 'Gadgets', 'Accessories']),
        ]);

        // Fashion Supplier products (using factory with specific data)
        $testSupplier2 = $suppliers->shift();
        Product::factory()
            ->forSupplier($testSupplier2)
            ->count(count(self::FASHION_PRODUCTS))
            ->sequence(...self::FASHION_PRODUCTS)
            ->active()
            ->create();

        // Create additional random products for fashion supplier
        Product::factory(6)->forSupplier($testSupplier2)->create([
            'created_at' => fake()->dateTimeBetween('-2 months', '-1 month'),
            'category' => fake()->randomElement(['Clothing', 'Accessories', 'Shoes']),
        ]);

        // Home & Garden Supplier products (using factory with specific data)
        $testSupplier3 = $suppliers->shift();
        Product::factory()
            ->forSupplier($testSupplier3)
            ->count(count(self::HOME_GARDEN_PRODUCTS))
            ->sequence(...self::HOME_GARDEN_PRODUCTS)
            ->active()
            ->create();

        // Create additional random products for home & garden supplier
        Product::factory(9)->forSupplier($testSupplier3)->create([
            'created_at' => fake()->dateTimeBetween('-2 months', '-1 month'),
            'category' => fake()->randomElement(['Home & Garden', 'Kitchen', 'Outdoor']),
        ]);

        // Create random products for additional suppliers
        foreach ($suppliers as $supplier) {
            Product::factory(rand(1, 9))->forSupplier($supplier)->create([
                'created_at' => fake()->dateTimeBetween('-6 months', '-3 months'),
            ]);
        }
    }
}
