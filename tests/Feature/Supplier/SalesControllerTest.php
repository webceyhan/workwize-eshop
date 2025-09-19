<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

describe('Supplier Sales Controller', function () {
    beforeEach(function () {
        $this->supplier = User::factory()->supplier()->create();
        $this->customer = User::factory()->customer()->create();
        $this->product = Product::factory()
            ->forSupplier($this->supplier)
            ->create();
    });

    describe('index', function () {
        test('displays sales index page', function () {
            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.sales.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->component('supplier/sales/index')
                    ->has('orderItems')
                    ->has('analytics');
            });
        });

        test('shows only order items from supplier products', function () {
            $otherSupplier = User::factory()->supplier()->create();
            $otherProduct = Product::factory()
                ->forSupplier($otherSupplier)
                ->create();

            $order = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            // This supplier's product
            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
            ]);

            // Other supplier's product
            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $otherProduct->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.sales.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('orderItems.data', 1);
            });
        });

        test('calculates analytics correctly', function () {
            $order = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
                'unit_price' => 100,
                'total_price' => 200,
            ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
                'quantity' => 1,
                'unit_price' => 100,
                'total_price' => 100,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.sales.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('analytics.totalRevenue')
                    ->has('analytics.totalOrders')
                    ->has('analytics.averageOrderValue')
                    ->has('analytics.topProducts')
                    ->has('analytics.salesByMonth');
            });
        });

        test('filters by date range', function () {
            $yesterday = now()->subDay();
            $tomorrow = now()->addDay();

            $order = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'created_at' => now(),
                ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
                'unit_price' => 100,
                'total_price' => 200,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.sales.index', [
                    'filter[from]' => $yesterday->toDateString(),
                    'filter[to]' => $tomorrow->toDateString(),
                ]));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('orderItems.data', 1)
                    ->has('analytics.totalRevenue');
            });
        });

        test('requires supplier authentication', function () {
            $response = $this->get(route('supplier.sales.index'));

            $response->assertRedirect(route('login'));
        });

        test('prevents customer access', function () {
            $response = $this
                ->actingAs($this->customer)
                ->get(route('supplier.sales.index'));

            $response->assertStatus(403);
        });
    });

    describe('customers', function () {
        test('displays customers page', function () {
            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.customers.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->component('supplier/sales/customers')
                    ->has('customers');
            });
        });

        test('shows customer analytics for supplier products', function () {
            $customer1 = User::factory()->customer()->create();
            $customer2 = User::factory()->customer()->create();

            $order1 = Order::factory()->create(['customer_id' => $customer1->id]);
            $order2 = Order::factory()->create(['customer_id' => $customer2->id]);

            // Customer 1 orders
            OrderItem::factory()->create([
                'order_id' => $order1->id,
                'product_id' => $this->product->id,
                'total_price' => 100,
            ]);

            // Customer 2 orders
            OrderItem::factory()->create([
                'order_id' => $order2->id,
                'product_id' => $this->product->id,
                'total_price' => 75,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.customers.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('customers.data', 2);
            });
        });

        test('only shows customers who bought from supplier', function () {
            $customer = User::factory()->customer()->create();
            $otherSupplier = User::factory()->supplier()->create();
            $otherProduct = Product::factory()
                ->forSupplier($otherSupplier)
                ->create();

            $order = Order::factory()->create(['customer_id' => $customer->id]);

            // Customer bought from another supplier
            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $otherProduct->id,
                'total_price' => 100,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.customers.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('customers.data', 0);
            });
        });

        test('requires supplier authentication', function () {
            $response = $this->get(route('supplier.customers.index'));

            $response->assertRedirect(route('login'));
        });

        test('prevents customer access', function () {
            $response = $this
                ->actingAs($this->customer)
                ->get(route('supplier.customers.index'));

            $response->assertStatus(403);
        });
    });
});
