<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $paymentMethods = ['card', 'cash', 'bank_transfer'];

        return [
            'customer_id' => User::factory()->customer(),
            'total_amount' => fake()->randomFloat(2, 20, 500),
            'status' => fake()->randomElement(OrderStatus::cases()),
            'shipping_address' => fake()->address(),
            'billing_address' => fake()->address(),
            'payment_method' => fake()->randomElement($paymentMethods),
            'shipped_at' => null,
            'delivered_at' => null,
        ];
    }

    // RELATIONS ///////////////////////////////////////////////////////////////////////////////////

    /**
     * Set the customer for the order
     */
    public function forCustomer(User $customer): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_id' => $customer->id,
        ]);
    }

    // STATES //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Indicate that the order should be pending
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Pending,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Indicate that the order should be processing
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Processing,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Indicate that the order should be shipped
     */
    public function shipped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Shipped,
            'shipped_at' => fake()->dateTimeBetween('-1 week', 'now'),
            'delivered_at' => null,
        ]);
    }

    /**
     * Indicate that the order should be delivered
     */
    public function delivered(): static
    {
        $shippedAt = fake()->dateTimeBetween('-2 weeks', '-1 day');
        $deliveredAt = fake()->dateTimeBetween($shippedAt, 'now');

        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Delivered,
            'shipped_at' => $shippedAt,
            'delivered_at' => $deliveredAt,
        ]);
    }

    /**
     * Indicate that the order should be cancelled
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Cancelled,
            'shipped_at' => null,
            'delivered_at' => null,
        ]);
    }

    /**
     * Create an order with card payment
     */
    public function cardPayment(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'card',
        ]);
    }

    /**
     * Create an order with cash payment
     */
    public function cashPayment(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'cash',
        ]);
    }
}
