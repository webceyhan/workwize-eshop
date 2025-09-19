<?php

namespace Database\Seeders;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample orders using factories
        $allCustomers = User::customers()->get();

        // Create various types of orders
        foreach ($allCustomers->take(3) as $customer) {
            // Create a delivered order
            $deliveredOrder = Order::factory()->forCustomer($customer)->delivered()->create();

            // Add order items using factory
            Product::inRandomOrder()
                ->take(rand(1, 3))
                ->each(function ($product) use ($deliveredOrder) {
                    OrderItem::factory()->forOrder($deliveredOrder)->forProduct($product)->create();
                });

            // Calculate and update total
            $deliveredOrder->update(['total_amount' => $deliveredOrder->calculateTotal()]);
        }

        // Create some pending orders
        foreach ($allCustomers->take(2) as $customer) {
            $pendingOrder = Order::factory()->forCustomer($customer)->pending()->create();

            Product::inRandomOrder()
                ->take(rand(1, 2))
                ->each(function ($product) use ($pendingOrder) {
                    OrderItem::factory()->forOrder($pendingOrder)->forProduct($product)->create();
                });

            $pendingOrder->update(['total_amount' => $pendingOrder->calculateTotal()]);
        }

        // Create some cart items using factories
        foreach ($allCustomers->take(3) as $customer) {
            Product::active()
                ->inStock()
                ->inRandomOrder()
                ->take(rand(1, 4))
                ->each(function ($product) use ($customer) {
                    CartItem::factory()->forUser($customer)->forProduct($product)->create();
                });
        }
    }
}
