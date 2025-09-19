<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin
        User::factory()->admin()->create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
        ]);

        // create customer
        User::factory()->customer()->create([
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
        ]);

        // create suppliers
        User::factory()->supplier()->create([
            'name' => 'Test Supplier1',
            'email' => 'supplier1@example.com',
            'company_name' => 'Tech Supplier Inc.',
            'company_description' => 'Leading supplier of electronics and gadgets',
        ]);

        User::factory()->supplier()->create([
            'name' => 'Test Supplier2',
            'email' => 'supplier2@example.com',
            'company_name' => 'Fashion Hub LLC',
            'company_description' => 'Premium clothing and accessories supplier',
        ]);

        User::factory()->supplier()->create([
            'name' => 'Test Supplier3',
            'email' => 'supplier3@example.com',
            'company_name' => 'Home & Garden Co.',
            'company_description' => 'Quality home and garden products',
        ]);

        // Create additional customers
        User::factory(5)->customer()->create();

        // Create additional suppliers
        User::factory(2)->supplier()->create();
    }
}
