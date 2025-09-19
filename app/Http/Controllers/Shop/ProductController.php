<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Product::with('supplier')->active()->inStock();

        $products = QueryBuilder::for($baseQuery)
            ->allowedFilters([
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->whereAny(['name', 'description', 'category'], 'like', "%$value%");
                }),
                AllowedFilter::exact('category'),
            ])
            ->allowedSorts([
                'name',
                'price',
                'created_at',
            ])
            ->defaultSort('-created_at')
            ->paginate(12)
            ->withQueryString();

        // Get unique categories for filter
        $categories = Product::active()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('shop/products/index', [
            'products' => $products,
            'categories' => $categories,
            ...$request->only(['filter', 'sort']),
        ]);
    }

    public function show(Product $product)
    {
        if (! $product->is_active || $product->stock_quantity <= 0) {
            abort(404, 'Product not available');
        }

        $product->load('supplier');

        // Get related products from the same category
        $relatedProducts = Product::active()
            ->with('supplier')
            ->inStock()
            ->where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get();

        return Inertia::render('shop/products/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
