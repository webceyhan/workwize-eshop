<?php

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;

describe('Shop Cart Controller', function () {
    beforeEach(function () {
        $this->supplier = User::factory()->supplier()->create();
        $this->customer = User::factory()->customer()->create();
        $this->product = Product::factory()
            ->forSupplier($this->supplier)
            ->active()
            ->create(['stock_quantity' => 10, 'price' => 50.00]);
    });

    describe('index', function () {
        test('displays cart index page for authenticated user', function () {
            $cartItem = CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->get(route('shop.cart.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->component('shop/cart/index')
                    ->has('cartItems', 1)
                    ->where('total', 100); // 2 * 50.00
            });
        });

        test('shows empty cart for user with no items', function () {
            $response = $this
                ->actingAs($this->customer)
                ->get(route('shop.cart.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('cartItems', 0)
                    ->where('total', 0);
            });
        });

        test('redirects guests to login', function () {
            $response = $this->get(route('shop.cart.index'));

            $response->assertRedirect(route('login'));
        });

        test('calculates total correctly with multiple items', function () {
            $product2 = Product::factory()
                ->forSupplier($this->supplier)
                ->active()
                ->create(['price' => 25.00]);

            CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $product2->id,
                'quantity' => 3,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->get(route('shop.cart.index'));

            $response->assertStatus(200);
            $response->assertInertia(function ($page) {
                $page->has('cartItems', 2)
                    ->where('total', 175); // (2 * 50.00) + (3 * 25.00)
            });
        });
    });

    describe('store', function () {
        test('adds new product to cart', function () {
            $response = $this
                ->actingAs($this->customer)
                ->post(route('shop.cart.store'), [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('message', 'Product added to cart successfully!');

            $this->assertDatabaseHas('cart_items', [
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);
        });

        test('updates quantity when adding existing product', function () {
            CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->post(route('shop.cart.store'), [
                    'product_id' => $this->product->id,
                    'quantity' => 3,
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('message', 'Product added to cart successfully!');

            $this->assertDatabaseHas('cart_items', [
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 5, // 2 + 3
            ]);
        });

        test('validates required fields', function () {
            $response = $this
                ->actingAs($this->customer)
                ->post(route('shop.cart.store'), []);

            $response->assertSessionHasErrors(['product_id', 'quantity']);
        });

        test('validates product exists', function () {
            $response = $this
                ->actingAs($this->customer)
                ->post(route('shop.cart.store'), [
                    'product_id' => 999,
                    'quantity' => 1,
                ]);

            $response->assertSessionHasErrors(['product_id']);
        });

        test('validates minimum quantity', function () {
            $response = $this
                ->actingAs($this->customer)
                ->post(route('shop.cart.store'), [
                    'product_id' => $this->product->id,
                    'quantity' => 0,
                ]);

            $response->assertSessionHasErrors(['quantity']);
        });

        test('prevents adding inactive product', function () {
            $this->product->update(['is_active' => false]);

            $response = $this
                ->actingAs($this->customer)
                ->post(route('shop.cart.store'), [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('error', 'Product is not available or insufficient stock');
        });

        test('prevents adding more than available stock', function () {
            $response = $this
                ->actingAs($this->customer)
                ->post(route('shop.cart.store'), [
                    'product_id' => $this->product->id,
                    'quantity' => 15, // Product has stock_quantity of 10
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('error', 'Product is not available or insufficient stock');
        });

        test('prevents exceeding stock when adding to existing cart item', function () {
            CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 8,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->post(route('shop.cart.store'), [
                    'product_id' => $this->product->id,
                    'quantity' => 5, // 8 + 5 = 13, but stock is 10
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('error', 'Cannot add more items. Insufficient stock.');
        });

        test('requires authentication', function () {
            $response = $this->post(route('shop.cart.store'), [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

            $response->assertRedirect(route('login'));
        });
    });

    describe('update', function () {
        test('updates cart item quantity', function () {
            $cartItem = CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->patch(route('shop.cart.update', $cartItem), [
                    'quantity' => 5,
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('message', 'Cart updated successfully!');

            $this->assertDatabaseHas('cart_items', [
                'id' => $cartItem->id,
                'quantity' => 5,
            ]);
        });

        test('validates quantity field', function () {
            $cartItem = CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->patch(route('shop.cart.update', $cartItem), [
                    'quantity' => 0,
                ]);

            $response->assertSessionHasErrors(['quantity']);
        });

        test('prevents updating to exceed stock', function () {
            $cartItem = CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->patch(route('shop.cart.update', $cartItem), [
                    'quantity' => 15, // Product has stock_quantity of 10
                ]);

            $response->assertRedirect();
            $response->assertSessionHas('error', 'Insufficient stock available');
        });

        test('prevents updating cart item of another user', function () {
            $otherCustomer = User::factory()->customer()->create();
            $cartItem = CartItem::factory()->create([
                'user_id' => $otherCustomer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->patch(route('shop.cart.update', $cartItem), [
                    'quantity' => 5,
                ]);

            $response->assertStatus(403);
        });

        test('requires authentication', function () {
            $cartItem = CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this->patch(route('shop.cart.update', $cartItem), [
                'quantity' => 5,
            ]);

            $response->assertRedirect(route('login'));
        });
    });

    describe('destroy', function () {
        test('removes cart item', function () {
            $cartItem = CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->delete(route('shop.cart.destroy', $cartItem));

            $response->assertRedirect();
            $response->assertSessionHas('message', 'Item removed from cart!');

            $this->assertDatabaseMissing('cart_items', [
                'id' => $cartItem->id,
            ]);
        });

        test('prevents removing cart item of another user', function () {
            $otherCustomer = User::factory()->customer()->create();
            $cartItem = CartItem::factory()->create([
                'user_id' => $otherCustomer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->delete(route('shop.cart.destroy', $cartItem));

            $response->assertStatus(403);

            $this->assertDatabaseHas('cart_items', [
                'id' => $cartItem->id,
            ]);
        });

        test('requires authentication', function () {
            $cartItem = CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

            $response = $this->delete(route('shop.cart.destroy', $cartItem));

            $response->assertRedirect(route('login'));
        });
    });

    describe('clear', function () {
        test('clears all cart items for user', function () {
            CartItem::factory()->count(3)->create([
                'user_id' => $this->customer->id,
            ]);

            // Create cart items for another user (should not be deleted)
            $otherCustomer = User::factory()->customer()->create();
            CartItem::factory()->create([
                'user_id' => $otherCustomer->id,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->delete(route('shop.cart.clear'));

            $response->assertRedirect();
            $response->assertSessionHas('message', 'Cart cleared successfully!');

            $this->assertDatabaseCount('cart_items', 1); // Only other user's item remains
            $this->assertDatabaseMissing('cart_items', [
                'user_id' => $this->customer->id,
            ]);
        });

        test('requires authentication', function () {
            $response = $this->delete(route('shop.cart.clear'));

            $response->assertRedirect(route('login'));
        });
    });

    describe('count', function () {
        test('returns total quantity in cart', function () {
            CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'quantity' => 3,
            ]);

            CartItem::factory()->create([
                'user_id' => $this->customer->id,
                'quantity' => 2,
            ]);

            $response = $this
                ->actingAs($this->customer)
                ->get(route('shop.cart.count'));

            $response->assertRedirect();
            $response->assertSessionHas('count', 5); // 3 + 2
        });

        test('returns zero for empty cart', function () {
            $response = $this
                ->actingAs($this->customer)
                ->get(route('shop.cart.count'));

            $response->assertRedirect();
            $response->assertSessionHas('count', 0);
        });

        test('requires authentication', function () {
            $response = $this->get(route('shop.cart.count'));

            $response->assertRedirect(route('login'));
        });
    });
});
