<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 5);
        $unitPrice = fake()->randomFloat(2, 10, 200);
        $totalPrice = $quantity * $unitPrice;

        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
        ];
    }

    // RELATIONS ///////////////////////////////////////////////////////////////////////////////////

    /**
     * Create order item for specific order
     */
    public function forOrder(Order $order): static
    {
        return $this->state(fn (array $attributes) => [
            'order_id' => $order->id,
        ]);
    }

    /**
     * Create order item for specific product
     */
    public function forProduct(Product $product): static
    {
        return $this->state(function (array $attributes) use ($product) {
            $quantity = $attributes['quantity'] ?? fake()->numberBetween(1, 5);

            return [
                'product_id' => $product->id,
                'unit_price' => $product->price,
                'total_price' => $quantity * $product->price,
            ];
        });
    }

    // STATES //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Set specific quantity
     */
    public function quantity(int $quantity): static
    {
        return $this->state(function (array $attributes) use ($quantity) {
            $unitPrice = $attributes['unit_price'] ?? fake()->randomFloat(2, 10, 200);

            return [
                'quantity' => $quantity,
                'total_price' => $quantity * $unitPrice,
            ];
        });
    }

    /**
     * Set specific unit price
     */
    public function unitPrice(float $price): static
    {
        return $this->state(function (array $attributes) use ($price) {
            $quantity = $attributes['quantity'] ?? fake()->numberBetween(1, 5);

            return [
                'unit_price' => $price,
                'total_price' => $quantity * $price,
            ];
        });
    }
}
