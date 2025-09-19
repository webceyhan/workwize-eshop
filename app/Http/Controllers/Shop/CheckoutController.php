<?php

namespace App\Http\Controllers\Shop;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $customer = Auth::user();

        $cartItems = $customer->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('shop.cart.index')
                ->with('error', 'Your cart is empty!');
        }

        $total = $cartItems->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });

        return Inertia::render('shop/checkout/index', [
            'cartItems' => $cartItems,
            'total' => $total,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:500',
            'billing_address' => 'required|string|max:500',
            'payment_method' => 'required|string|in:card,paypal,bank_transfer',
        ]);

        $user = Auth::user();
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty!',
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request, $user, $cartItems) {
                // Calculate total
                $total = $cartItems->sum(function ($item) {
                    return $item->quantity * $item->product->price;
                });

                // Create order
                $order = Order::create([
                    'customer_id' => $user->id,
                    'total_amount' => $total,
                    'status' => OrderStatus::Pending,
                    'shipping_address' => $request->shipping_address,
                    'billing_address' => $request->billing_address,
                    'payment_method' => $request->payment_method,
                ]);

                // Create order items and update stock
                foreach ($cartItems as $cartItem) {
                    $product = $cartItem->product;

                    // Check stock availability
                    if ($product->stock_quantity < $cartItem->quantity) {
                        throw new \Exception("Insufficient stock for product: {$product->name}");
                    }

                    // Create order item
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $cartItem->quantity,
                        'unit_price' => $product->price,
                        'total_price' => $cartItem->quantity * $product->price,
                    ]);

                    // Update product stock
                    $product->decrement('stock_quantity', $cartItem->quantity);
                }

                // Clear cart
                $user->cartItems()->delete();

                // Redirect to order confirmation page
                return redirect()->route('shop.orders.show', $order)
                    ->with('success', 'Order placed successfully!');
            });
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
