import ShopLayout from '@/layouts/shop-layout';
import { clear as cartClear, destroy as cartDestroy, update as cartUpdate } from '@/routes/shop/cart';
import { store as checkoutStore, index as checkoutIndex } from '@/routes/shop/checkout';
import { show as productShow, index as productsIndex } from '@/routes/shop/products';
import type { CartItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    cartItems: CartItem[];
    total: number;
}

export default function CartIndex({ cartItems, total }: Props) {
    const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
    const [isClearing, setIsClearing] = useState(false);

    const updateQuantity = async (cartItemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setUpdatingItems((prev) => new Set(prev).add(cartItemId));
        try {
            await router.patch(cartUpdate(cartItemId).url, {
                quantity: newQuantity,
            });
        } catch (error) {
            console.error('Failed to update cart:', error);
        } finally {
            setUpdatingItems((prev) => {
                const newSet = new Set(prev);
                newSet.delete(cartItemId);
                return newSet;
            });
        }
    };

    const removeItem = async (cartItemId: number) => {
        try {
            await router.delete(cartDestroy(cartItemId).url);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const clearCart = async () => {
        setIsClearing(true);
        try {
            await router.delete(cartClear().url);
        } catch (error) {
            console.error('Failed to clear cart:', error);
        } finally {
            setIsClearing(false);
        }
    };

    const proceedToCheckout = () => {
        router.visit(checkoutIndex().url);
    };

    return (
        <ShopLayout>
            <Head title="Shopping Cart" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                <p className="mt-2 text-muted-foreground">Review your items before checkout</p>
            </div>

            {cartItems.length === 0 ? (
                <div className="py-12 text-center">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m4.5-5a2 2 0 11-4 0 2 2 0 014 0zm7 0a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
                    <p className="mt-2 text-sm text-gray-500">Start shopping to add items to your cart.</p>
                    <div className="mt-6">
                        <Link
                            href={productsIndex().url}
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
                    {/* Cart Items */}

                    <div className="rounded-lg border border-muted-foreground dark:bg-primary shadow">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">Cart Items ({cartItems.length})</h2>
                                {cartItems.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        disabled={isClearing}
                                        className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
                                    >
                                        {isClearing ? 'Clearing...' : 'Clear Cart'}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex space-x-4 border-b border-gray-200 py-4 last:border-b-0">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={item.product.image_url || '/logo.svg'}
                                                alt={item.product.name}
                                                className="h-20 w-20 rounded-md object-cover"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                <Link href={productShow(item.product.id).url} className="hover:text-blue-600">
                                                    {item.product.name}
                                                </Link>
                                            </h3>
                                            <p className="line-clamp-2 text-sm text-gray-500">{item.product.description}</p>
                                            <div className="mt-1 flex items-center space-x-2">
                                                <span className="text-sm text-gray-500">by</span>
                                                <span className="text-sm text-gray-700">
                                                    {item.product.supplier.company_name || item.product.supplier.name}
                                                </span>
                                            </div>
                                            <div className="mt-1">
                                                <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                                                    {item.product.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-2 place-self-end text-gray-500">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                                                className="hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            </button>
                                            <span className="mx-2 text-center font-medium">{updatingItems.has(item.id) ? '...' : item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= item.product.stock_quantity || updatingItems.has(item.id)}
                                                className="hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Price & Remove */}
                                        <div className="place-self-end text-right">
                                            <div className="text-lg font-bold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</div>
                                            <div className="text-sm text-gray-500">${item.product.price} each</div>
                                            <button onClick={() => removeItem(item.id)} className="mt-2 text-sm text-red-600 hover:text-red-500">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="min-w-xs">
                        <div className="sticky top-4 rounded-lg bg-white shadow">
                            <div className="px-4 py-5 sm:p-6">
                                <h2 className="mb-4 text-lg font-medium text-gray-900">Order Summary</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                                        </span>
                                        <span className="font-medium">${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">Free</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium">Calculated at checkout</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-base font-medium text-gray-900">Total</span>
                                            <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={proceedToCheckout}
                                    className="mt-6 w-full rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="mt-4 text-center">
                                    <Link href={productsIndex().url} className="text-sm text-blue-600 hover:text-blue-500">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ShopLayout>
    );
}
