<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

describe('Supplier Dashboard Controller', function () {
    beforeEach(function () {
        $this->supplier = User::factory()->supplier()->create();
        $this->customer = User::factory()->customer()->create();
    });

    describe('index', function () {
        test('displays dashboard with basic stats', function () {
            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.dashboard'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->component('supplier/dashboard')
                    ->has('stats')
                    ->has('recentOrders')
                    ->has('salesData');
            });
        });

        test('calculates product statistics correctly', function () {
            // Create products for this supplier
            Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->count(3)
                ->create(['stock_quantity' => 10]);

            Product::factory()
                ->forSupplier($this->supplier)
                ->inactive()
                ->create(['stock_quantity' => 5]);

            // Create products for another supplier (should not be counted)
            $otherSupplier = User::factory()->supplier()->create();
            Product::factory()
                ->forSupplier($otherSupplier)
                ->count(2)
                ->create();

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.dashboard'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->where('stats.totalProducts', 4)
                    ->where('stats.activeProducts', 3)
                    ->where('stats.totalStock', 35); // (3 * 10) + 5
            });
        });

        test('calculates sales statistics correctly', function () {
            $product = Product::factory()
                ->forSupplier($this->supplier)
                ->create(['price' => 100]);

            $order = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            // Create order items for this supplier's products
            OrderItem::factory()->count(2)->create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 100,
                'total_price' => 100,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.dashboard'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->where('stats.totalSales', 200)
                    ->where('stats.totalOrders', 1);
            });
        });

        test('shows recent orders from supplier products', function () {
            $product = Product::factory()
                ->forSupplier($this->supplier)
                ->create();

            $order = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $product->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.dashboard'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('recentOrders', 1);
            });
        });

        test('only shows data for authenticated supplier', function () {
            $otherSupplier = User::factory()->supplier()->create();

            // Create products for other supplier
            $otherProduct = Product::factory()
                ->forSupplier($otherSupplier)
                ->create();

            $order = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $otherProduct->id,
                'total_price' => 100,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.dashboard'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->where('stats.totalProducts', 0)
                    ->where('stats.totalSales', 0)
                    ->where('stats.totalOrders', 0)
                    ->has('recentOrders', 0);
            });
        });

        test('requires supplier authentication', function () {
            $response = $this->get(route('supplier.dashboard'));

            $response->assertRedirect(route('login'));
        });

        test('prevents customer access', function () {
            $response = $this
                ->actingAs($this->customer)
                ->get(route('supplier.dashboard'));

            $response->assertStatus(403);
        });

        test('provides sales chart data', function () {
            $product = Product::factory()
                ->forSupplier($this->supplier)
                ->create();

            $order = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'total_price' => 150,
                'created_at' => now()->subDays(2),
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.dashboard'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('salesData');
            });
        });
    });
});
