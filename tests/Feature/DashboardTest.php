<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('dashboard displays for customers', function () {
    $user = User::factory()->customer()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    // Customers get redirected to shop.products.index
    $response->assertRedirect(route('shop.products.index'));
});

test('dashboard displays for suppliers', function () {
    $user = User::factory()->supplier()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    // Suppliers get redirected to supplier.dashboard
    $response->assertRedirect(route('supplier.dashboard'));
});

test('dashboard displays for admin', function () {
    $user = User::factory()->admin()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    // Admin gets redirected to shop.products.index (same as customers)
    $response->assertRedirect(route('shop.products.index'));
});
