<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $customer = Auth::user();

        $cartItems = $customer->cartItems()->with('product.supplier')->get();

        $total = $cartItems->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });

        return Inertia::render('shop/cart/index', [
            'cartItems' => $cartItems,
            'total' => $total,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if product is available
        if (! $product->is_active || $product->stock_quantity < $request->quantity) {
            return back()->with('error', 'Product is not available or insufficient stock');
        }

        $cartItem = CartItem::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            // Update existing cart item
            $newQuantity = $cartItem->quantity + $request->quantity;

            if ($newQuantity > $product->stock_quantity) {
                return back()->with('error', 'Cannot add more items. Insufficient stock.');
            }

            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            // Create new cart item
            CartItem::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return back()->with('message', 'Product added to cart successfully!');
    }

    public function update(Request $request, CartItem $cartItem)
    {
        // Ensure user owns this cart item
        if ($cartItem->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if ($request->quantity > $cartItem->product->stock_quantity) {
            return back()->with('error', 'Insufficient stock available');
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return back()->with('message', 'Cart updated successfully!');
    }

    public function destroy(CartItem $cartItem)
    {
        // Ensure user owns this cart item
        if ($cartItem->user_id !== Auth::id()) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('message', 'Item removed from cart!');
    }

    public function clear()
    {
        Auth::user()->cartItems()->delete();

        return back()->with('message', 'Cart cleared successfully!');
    }

    public function count()
    {
        $count = Auth::user()->cartItems()->sum('quantity');

        return back()->with('count', $count);
    }
}
