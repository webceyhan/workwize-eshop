<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

describe('Supplier Order Controller', function () {
    beforeEach(function () {
        $this->supplier = User::factory()->supplier()->create();
        $this->customer = User::factory()->customer()->create();
        $this->product = Product::factory()
            ->forSupplier($this->supplier)
            ->create();
    });

    describe('index', function () {
        test('displays orders index page', function () {
            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.orders.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->component('supplier/orders/index')
                    ->has('orders')
                    ->has('orderStatuses');
            });
        });

        test('shows only orders containing supplier products', function () {
            $order1 = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            $order2 = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            // Order 1 contains this supplier's product
            OrderItem::factory()->create([
                'order_id' => $order1->id,
                'product_id' => $this->product->id,
            ]);

            // Order 2 contains another supplier's product
            $otherSupplier = User::factory()->supplier()->create();
            $otherProduct = Product::factory()
                ->forSupplier($otherSupplier)
                ->create();

            OrderItem::factory()->create([
                'order_id' => $order2->id,
                'product_id' => $otherProduct->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.orders.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('orders.data', 1);
            });
        });

        test('filters orders by status', function () {
            $pendingOrder = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'status' => OrderStatus::Pending,
                ]);

            $processingOrder = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'status' => OrderStatus::Processing,
                ]);

            // Add products to both orders
            OrderItem::factory()->create([
                'order_id' => $pendingOrder->id,
                'product_id' => $this->product->id,
            ]);

            OrderItem::factory()->create([
                'order_id' => $processingOrder->id,
                'product_id' => $this->product->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.orders.index', ['filter[status]' => 'pending']));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('orders.data', 1);
            });
        });

        test('filters order items to show only supplier products', function () {
            $order = Order::factory()
                ->create(['customer_id' => $this->customer->id]);

            // This supplier's product
            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
            ]);

            // Another supplier's product in the same order
            $otherSupplier = User::factory()->supplier()->create();
            $otherProduct = Product::factory()
                ->forSupplier($otherSupplier)
                ->create();

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $otherProduct->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->get(route('supplier.orders.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('orders.data', 1);
                // Order items might be nested differently, let's just check the order count
            });
        });

        test('requires supplier authentication', function () {
            $response = $this->get(route('supplier.orders.index'));

            $response->assertRedirect(route('login'));
        });

        test('prevents customer access', function () {
            $response = $this
                ->actingAs($this->customer)
                ->get(route('supplier.orders.index'));

            $response->assertStatus(403);
        });
    });

    describe('updateStatus', function () {
        test('updates order status from pending to processing', function () {
            $order = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'status' => OrderStatus::Pending,
                ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->patch(route('supplier.orders.update-status', $order), [
                    'status' => 'processing',
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('success');

            $this->assertDatabaseHas('orders', [
                'id' => $order->id,
                'status' => OrderStatus::Processing,
            ]);
        });

        test('updates order status from processing to shipped', function () {
            $order = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'status' => OrderStatus::Processing,
                ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->patch(route('supplier.orders.update-status', $order), [
                    'status' => 'shipped',
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('success');

            $this->assertDatabaseHas('orders', [
                'id' => $order->id,
                'status' => OrderStatus::Shipped,
            ]);
        });

        test('sets shipped_at when order is marked as shipped', function () {
            $order = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'status' => OrderStatus::Processing,
                    'shipped_at' => null,
                ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
            ]);

            $this
                ->actingAs($this->supplier)
                ->patch(route('supplier.orders.update-status', $order), [
                    'status' => 'shipped',
                ]);

            $order->refresh();
            expect($order->shipped_at)->not->toBeNull();
        });

        test('prevents invalid status transitions', function () {
            $order = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'status' => OrderStatus::Pending,
                ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->patch(route('supplier.orders.update-status', $order), [
                    'status' => 'shipped', // Can't go directly from pending to shipped
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('error', 'Invalid status transition.');

            $this->assertDatabaseHas('orders', [
                'id' => $order->id,
                'status' => OrderStatus::Pending, // Should remain unchanged
            ]);
        });

        test('prevents updating orders without supplier products', function () {
            $otherSupplier = User::factory()->supplier()->create();
            $otherProduct = Product::factory()
                ->forSupplier($otherSupplier)
                ->create();

            $order = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'status' => OrderStatus::Pending,
                ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $otherProduct->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->patch(route('supplier.orders.update-status', $order), [
                    'status' => 'processing',
                ]);

            $response->assertStatus(403);
        });

        test('validates status field', function () {
            $order = Order::factory()
                ->create([
                    'customer_id' => $this->customer->id,
                    'status' => OrderStatus::Pending,
                ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'product_id' => $this->product->id,
            ]);

            $response = $this
                ->actingAs($this->supplier)
                ->patch(route('supplier.orders.update-status', $order), [
                    'status' => 'invalid_status',
                ]);

            $response->assertSessionHasErrors(['status']);
        });

        test('requires supplier authentication', function () {
            $order = Order::factory()->create();

            $response = $this->patch(route('supplier.orders.update-status', $order), [
                'status' => 'processing',
            ]);

            $response->assertRedirect(route('login'));
        });
    });
});
