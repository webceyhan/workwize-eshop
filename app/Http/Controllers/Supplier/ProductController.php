<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\Enums\FilterOperator;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $supplier = Auth::user();

        $baseQuery = $supplier->products()->withCount('orderItems');

        $products = QueryBuilder::for($baseQuery)
            ->allowedFilters([
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->whereAny(['name', 'description', 'category', 'sku'], 'like', "%$value%");
                }),
                AllowedFilter::exact('category'),
                AllowedFilter::callback('status', function ($query, $value) {
                    $query->where('is_active', $value === 'active');
                }),
                AllowedFilter::operator('min_price', FilterOperator::GREATER_THAN_OR_EQUAL, internalName: 'price'),
                AllowedFilter::operator('max_price', FilterOperator::LESS_THAN_OR_EQUAL, internalName: 'price'),
                AllowedFilter::callback('stock_status', function ($query, $value) {
                    if ($value === 'in_stock') {
                        $query->where('stock_quantity', '>', 0);
                    } elseif ($value === 'low_stock') {
                        $query->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10);
                    } elseif ($value === 'out_of_stock') {
                        $query->where('stock_quantity', 0);
                    }
                }),
            ])
            ->allowedSorts([
                'name',
                'price',
                'created_at',
                'category',
                'stock_quantity',
                'is_active',
            ])
            ->defaultSort('-created_at')
            ->paginate(10)
            ->withQueryString();

        // Get unique categories for filter
        $categories = $supplier->products()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('supplier/products/index', [
            'products' => $products,
            'categories' => $categories,
            ...$request->only(['filter', 'sort']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('supplier/products/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
            'sku' => 'required|string|unique:products,sku',
        ]);

        $product = Auth::user()->products()->create($validated);

        return redirect()->route('supplier.products.index')
            ->with('success', 'Product created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $this->authorize('view', $product);

        return Inertia::render('supplier/products/show', [
            'product' => $product->load('orderItems.order.customer'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $this->authorize('update', $product);

        return Inertia::render('supplier/products/edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
            'sku' => ['required', 'string', Rule::unique('products')->ignore($product->id)],
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return redirect()->route('supplier.products.index')
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();

        return redirect()->route('supplier.products.index')
            ->with('success', 'Product deleted successfully!');
    }

    /**
     * Toggle the active status of the specified product.
     */
    public function toggleStatus(Product $product)
    {
        $this->authorize('update', $product);

        $product->update([
            'is_active' => ! $product->is_active,
        ]);

        $status = $product->is_active ? 'activated' : 'deactivated';

        return redirect()->route('supplier.products.index')
            ->with('success', "Product {$status} successfully!");
    }
}
