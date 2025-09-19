<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Electronics',
            'Clothing',
            'Books',
            'Home & Garden',
            'Sports',
            'Toys',
            'Health & Beauty',
            'Automotive',
            'Food & Beverage',
            'Tools',
        ];

        $name = fake()->words(3, true);
        $price = fake()->randomFloat(2, 10, 1000);

        return [
            'supplier_id' => User::factory()->supplier(),
            'name' => ucwords($name),
            'description' => fake()->sentence(10),
            'price' => $price,
            'category' => fake()->randomElement($categories),
            'stock_quantity' => fake()->numberBetween(0, 100),
            'image_url' => 'https://images.pexels.com/photos/8533739/pexels-photo-8533739.jpeg?w=400',
            'is_active' => fake()->boolean(90), // 90% chance of being active
            'sku' => fake()->unique()->regexify('[A-Z]{3}[0-9]{3}'), // e.g., ABC123
        ];
    }

    // RELATIONS ///////////////////////////////////////////////////////////////////////////////////

    /**
     * Create product for specific supplier
     */
    public function forSupplier(User $supplier): static
    {
        return $this->state(fn (array $attributes) => [
            'supplier_id' => $supplier->id,
        ]);
    }

    // STATES //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Indicate that the product should be active
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the product should be inactive
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the product should be out of stock
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => 0,
        ]);
    }

    /**
     * Indicate that the product should be in stock
     */
    public function inStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock_quantity' => fake()->numberBetween(1, 100),
        ]);
    }

    /**
     * Indicate that the product belongs to a specific category
     */
    public function category(string $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => $category,
        ]);
    }
}
