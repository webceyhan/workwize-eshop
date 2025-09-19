<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $supplier = Auth::user();

        // Get supplier's products statistics
        $totalProducts = $supplier->products()->count();
        $activeProducts = $supplier->products()->active()->count();
        $totalStock = $supplier->products()->sum('stock_quantity');

        // Get sales statistics
        $totalSales = OrderItem::whereHas('product', function ($query) use ($supplier) {
            $query->where('supplier_id', $supplier->id);
        })->sum('total_price');

        $totalOrders = OrderItem::whereHas('product', function ($query) use ($supplier) {
            $query->where('supplier_id', $supplier->id);
        })->distinct('order_id')->count();

        // Recent orders
        $recentOrders = OrderItem::with(['order.customer', 'product'])
            ->whereHas('product', function ($query) use ($supplier) {
                $query->where('supplier_id', $supplier->id);
            })
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Sales chart data (last 7 days)
        $salesData = OrderItem::with('product')
            ->whereHas('product', function ($query) use ($supplier) {
                $query->where('supplier_id', $supplier->id);
            })
            ->where('created_at', '>=', now()->subDays(7))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('supplier/dashboard', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'activeProducts' => $activeProducts,
                'totalStock' => $totalStock,
                'totalSales' => $totalSales,
                'totalOrders' => $totalOrders,
            ],
            'recentOrders' => $recentOrders,
            'salesData' => $salesData,
        ]);
    }
}
