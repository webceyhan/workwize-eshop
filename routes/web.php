<?php

use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Shop\OrderController;
use App\Http\Controllers\Shop\ProductController as ShopProductController;
use App\Http\Controllers\Supplier\AuthController as SupplierAuthController;
use App\Http\Controllers\Supplier\DashboardController;
use App\Http\Controllers\Supplier\OrderController as SupplierOrderController;
use App\Http\Controllers\Supplier\ProductController;
use App\Http\Controllers\Supplier\SalesController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Home route - show products
Route::get('/', [ShopProductController::class, 'index'])->name('home')->middleware('role:customer_or_guest');

// Shop routes (for customers)
Route::prefix('shop')->name('shop.')->middleware('role:customer_or_guest')->group(function () {
    Route::get('products', [ShopProductController::class, 'index'])->name('products.index');
    Route::get('products/{product}', [ShopProductController::class, 'show'])->name('products.show');

    // Cart routes (require auth)
    Route::middleware('auth')->group(function () {
        Route::get('cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('cart', [CartController::class, 'store'])->name('cart.store');
        Route::patch('cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
        Route::delete('cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');
        Route::delete('cart', [CartController::class, 'clear'])->name('cart.clear');
        Route::get('cart/count', [CartController::class, 'count'])->name('cart.count');

        // Checkout routes
        Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout.index');
        Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');

        // Order routes
        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    });
});

// Supplier routes
Route::prefix('supplier')->name('supplier.')->group(function () {
    // Redirect /supplier to /supplier/login
    Route::get('/', function () {
        return redirect()->route('supplier.login');
    });

    // Supplier Authentication Routes (guest only)
    Route::middleware('guest')->group(function () {
        Route::get('login', [SupplierAuthController::class, 'create'])->name('login');
        Route::post('login', [SupplierAuthController::class, 'store']);
    });

    // Supplier Dashboard Routes (auth + supplier role required)
    Route::middleware(['auth', 'role:supplier'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Products
        Route::resource('products', ProductController::class);
        Route::patch('products/{product}/toggle-status', [ProductController::class, 'toggleStatus'])
            ->name('products.toggle-status');

        // Sales
        Route::get('sales', [SalesController::class, 'index'])->name('sales.index');

        // Customers
        Route::get('customers', [SalesController::class, 'customers'])->name('customers.index');

        // Orders
        Route::get('orders', [SupplierOrderController::class, 'index'])->name('orders.index');
        Route::patch('orders/{order}/update-status', [SupplierOrderController::class, 'updateStatus'])->name('orders.update-status');

        // Logout
        Route::post('logout', [SupplierAuthController::class, 'destroy'])->name('logout');
    });
});

// Dashboard route - redirect based on role
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        if (Auth::user()->isSupplier()) {
            return redirect()->route('supplier.dashboard');
        }

        return redirect()->route('shop.products.index');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
