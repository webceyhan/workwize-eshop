<?php

use App\Models\Product;
use App\Models\User;

describe('Shop Product Controller', function () {
    beforeEach(function () {
        $this->supplier = User::factory()->supplier()->create();
        $this->customer = User::factory()->customer()->create();
    });

    describe('index', function () {
        test('displays products index page', function () {
            $products = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->count(3)
                ->create();

            $response = $this->get(route('shop.products.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->component('shop/products/index')
                    ->has('products.data', 3)
                    ->has('categories');
            });
        });

        test('only shows active products', function () {
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Active Product']);

            Product::factory()
                ->forSupplier($this->supplier)
                ->inactive()
                ->create(['name' => 'Inactive Product']);

            $response = $this->get(route('shop.products.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('products.data', 1)
                    ->whereContains('products.data.0.name', 'Active Product');
            });
        });

        test('only shows products in stock', function () {
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'In Stock Product', 'stock_quantity' => 10]);

            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Out of Stock Product', 'stock_quantity' => 0]);

            $response = $this->get(route('shop.products.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('products.data', 1)
                    ->whereContains('products.data.0.name', 'In Stock Product');
            });
        });

        test('filters products by search term', function () {
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'iPhone 15', 'description' => 'Latest smartphone']);

            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Samsung TV', 'description' => 'Smart television']);

            $response = $this->get(route('shop.products.index', ['filter[search]' => 'iPhone']));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('products.data', 1)
                    ->whereContains('products.data.0.name', 'iPhone 15');
            });
        });

        test('filters products by category', function () {
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'iPhone', 'category' => 'Electronics']);

            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'T-Shirt', 'category' => 'Clothing']);

            $response = $this->get(route('shop.products.index', ['filter[category]' => 'Electronics']));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('products.data', 1)
                    ->whereContains('products.data.0.name', 'iPhone');
            });
        });

        test('sorts products by name', function () {
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Zebra Product']);

            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Alpha Product']);

            $response = $this->get(route('shop.products.index', ['sort' => 'name']));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->where('products.data.0.name', 'Alpha Product')
                    ->where('products.data.1.name', 'Zebra Product');
            });
        });

        test('sorts products by price', function () {
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Expensive Product', 'price' => 100.00]);

            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Cheap Product', 'price' => 10.00]);

            $response = $this->get(route('shop.products.index', ['sort' => 'price']));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->where('products.data.0.name', 'Cheap Product')
                    ->where('products.data.1.name', 'Expensive Product');
            });
        });

        test('returns categories list', function () {
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['category' => 'Electronics']);

            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['category' => 'Clothing']);

            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['category' => 'Electronics']); // Duplicate category

            $response = $this->get(route('shop.products.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('categories', 2)
                    ->whereContains('categories', 'Electronics')
                    ->whereContains('categories', 'Clothing');
            });
        });
    });

    describe('show', function () {
        test('displays product details', function () {
            $product = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Test Product']);

            $response = $this->get(route('shop.products.show', $product));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) use ($product) {
                $page->component('shop/products/show')
                    ->where('product.id', $product->id)
                    ->where('product.name', 'Test Product')
                    ->has('product.supplier')
                    ->has('relatedProducts');
            });
        });

        test('shows related products from same category', function () {
            $mainProduct = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Main Product', 'category' => 'Electronics']);

            // Related products in same category
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->count(3)
                ->create(['category' => 'Electronics']);

            // Unrelated product in different category
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['category' => 'Clothing']);

            $response = $this->get(route('shop.products.show', $mainProduct));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('relatedProducts', 3);
            });
        });

        test('returns 404 for inactive product', function () {
            $product = Product::factory()
                ->forSupplier($this->supplier)
                ->inactive()
                ->create();

            $response = $this->get(route('shop.products.show', $product));

            $response->assertStatus(404);
        });

        test('returns 404 for out of stock product', function () {
            $product = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['stock_quantity' => 0]);

            $response = $this->get(route('shop.products.show', $product));

            $response->assertStatus(404);
        });

        test('excludes main product from related products', function () {
            $mainProduct = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['name' => 'Main Product', 'category' => 'Electronics']);

            // Related products in same category
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->count(2)
                ->create(['category' => 'Electronics']);

            $response = $this->get(route('shop.products.show', $mainProduct));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) use ($mainProduct) {
                $page->has('relatedProducts', 2)
                    ->whereNot('relatedProducts.0.id', $mainProduct->id)
                    ->whereNot('relatedProducts.1.id', $mainProduct->id);
            });
        });

        test('limits related products to 4', function () {
            $mainProduct = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['category' => 'Electronics']);

            // Create 6 related products (should only show 4)
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->count(6)
                ->create(['category' => 'Electronics']);

            $response = $this->get(route('shop.products.show', $mainProduct));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('relatedProducts', 4);
            });
        });

        test('works for guests', function () {
            $product = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create();

            $response = $this->get(route('shop.products.show', $product));

            $response->assertStatus(200);
        });

        test('works for authenticated customers', function () {
            $product = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create();

            $response = $this
                ->actingAs($this->customer)
                ->get(route('shop.products.show', $product));

            $response->assertStatus(200);
        });
    });
});
