<?php

namespace App\Http\Controllers\Supplier;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $supplier = Auth::user();

        $baseQuery = Order::with(['customer', 'orderItems.product'])
            ->whereHas('orderItems.product', function ($query) use ($supplier) {
                $query->where('supplier_id', $supplier->id);
            });

        // Get orders that contain products from this supplier
        $orders = QueryBuilder::for($baseQuery)
            ->allowedFilters([
                AllowedFilter::exact('status'),
            ])
            ->allowedSorts([
                'created_at',
            ])
            ->defaultSort('-created_at')
            ->paginate(15)
            ->withQueryString();

        // Filter order items to only show this supplier's products
        $orders->getCollection()->transform(function ($order) use ($supplier) {
            $order->setRelation(
                'orderItems',
                $order->orderItems->filter(function ($item) use ($supplier) {
                    return $item->product->supplier_id === $supplier->id;
                })
            );

            return $order;
        });

        return Inertia::render('supplier/orders/index', [
            'orders' => $orders,
            'orderStatuses' => OrderStatus::cases(),
            ...$request->only(['filter', 'sort']),
        ]);
    }

    public function updateStatus(Order $order, Request $request): RedirectResponse
    {
        $supplier = Auth::user();

        // Verify this order contains products from this supplier
        if (! $order->canBeManagedBySupplier($supplier->id)) {
            abort(403, 'You can only update orders containing your products.');
        }

        $request->validate([
            'status' => 'required|in:processing,shipped',
        ]);

        // Only allow certain status transitions
        $allowedTransitions = [
            OrderStatus::Pending->value => [OrderStatus::Processing->value],
            OrderStatus::Processing->value => [OrderStatus::Shipped->value],
        ];

        $currentStatus = $order->status->value;
        $newStatus = $request->status;

        if (
            ! isset($allowedTransitions[$currentStatus]) ||
            ! in_array($newStatus, $allowedTransitions[$currentStatus])
        ) {
            return back()->with('error', 'Invalid status transition.');
        }

        $order->update([
            'status' => $newStatus,
            'shipped_at' => $newStatus === OrderStatus::Shipped->value ? now() : null,
        ]);

        $statusLabel = ucfirst($newStatus);

        return back()->with('success', "Order #{$order->id} has been marked as {$statusLabel}.");
    }
}
