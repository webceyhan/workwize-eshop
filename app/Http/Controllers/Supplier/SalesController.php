<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $supplier = Auth::user();

        $query = OrderItem::with(['order.customer', 'product'])
            ->whereHas('product', function ($q) use ($supplier) {
                $q->where('supplier_id', $supplier->id);
            });

        // Filter by date range if provided
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $orderItems = $query->orderBy('created_at', 'desc')->paginate(15);

        // Sales analytics
        $analytics = [
            'totalRevenue' => $query->sum('total_price'),
            'totalOrders' => $query->distinct('order_id')->count(),
            'averageOrderValue' => $query->avg('total_price'),
            'topProducts' => $this->getTopProducts($supplier),
            'salesByMonth' => $this->getSalesByMonth($supplier),
        ];

        return Inertia::render('supplier/sales/index', [
            'orderItems' => $orderItems,
            'analytics' => $analytics,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    public function customers()
    {
        $supplier = Auth::user();

        $customers = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('users', 'orders.customer_id', '=', 'users.id')
            ->where('products.supplier_id', $supplier->id)
            ->select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                DB::raw('SUM(order_items.total_price) as total_spent')
            )
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_spent', 'desc')
            ->paginate(15);

        return Inertia::render('supplier/sales/customers', [
            'customers' => $customers,
        ]);
    }

    private function getTopProducts($supplier)
    {
        return OrderItem::with('product')
            ->whereHas('product', function ($q) use ($supplier) {
                $q->where('supplier_id', $supplier->id);
            })
            ->select('product_id', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(total_price) as total_revenue'))
            ->groupBy('product_id')
            ->orderBy('total_revenue', 'desc')
            ->limit(5)
            ->get();
    }

    private function getSalesByMonth($supplier)
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            $yearExpression = "strftime('%Y', created_at) as year";
            $monthExpression = "strftime('%m', created_at) as month";
        } else {
            // MySQL, PostgreSQL, etc.
            $yearExpression = 'YEAR(created_at) as year';
            $monthExpression = 'MONTH(created_at) as month';
        }

        return OrderItem::whereHas('product', function ($q) use ($supplier) {
            $q->where('supplier_id', $supplier->id);
        })
            ->where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw($yearExpression),
                DB::raw($monthExpression),
                DB::raw('SUM(total_price) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
    }
}
