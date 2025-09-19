<?php

namespace App\Http\Controllers\Shop;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $customer = Auth::user();

        $orders = $customer->orders()
            ->with('orderItems.product.supplier')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('shop/orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order)
    {
        // Ensure user owns this order
        if ($order->customer_id !== Auth::id()) {
            abort(403);
        }

        $order->load('orderItems.product.supplier');

        return Inertia::render('shop/orders/show', [
            'order' => $order,
        ]);
    }

    public function cancel(Order $order): RedirectResponse
    {
        // Ensure user owns this order
        if ($order->customer_id !== Auth::id()) {
            abort(403);
        }

        // Only allow cancellation of pending or processing orders
        if (! $order->canBeCancelled()) {
            return back()->with('error', 'This order cannot be cancelled.');
        }

        // Update order status to cancelled
        $order->update(['status' => OrderStatus::Cancelled]);

        return back()->with('success', 'Order has been cancelled successfully.');
    }
}
