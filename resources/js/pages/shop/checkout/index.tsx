import ShopLayout from '@/layouts/shop-layout';
import { index as cartIndex } from '@/routes/shop/cart';
import { store as checkoutStore } from '@/routes/shop/checkout';
import { show as productShow } from '@/routes/shop/products';
import type { CartItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Props {
    cartItems: CartItem[];
    total: number;
}

interface CheckoutForm {
    shipping_address: string;
    billing_address: string;
    payment_method: string;
}

export default function CheckoutIndex({ cartItems, total }: Props) {
    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<CheckoutForm>({
        shipping_address: '',
        billing_address: '',
        payment_method: 'card',
    });

    // Update billing address when shipping address changes or checkbox is toggled
    const updateShippingAddress = (address: string) => {
        setData('shipping_address', address);
        if (sameAsShipping) {
            setData('billing_address', address);
        }
    };

    const toggleSameAsShipping = (checked: boolean) => {
        setSameAsShipping(checked);
        if (checked) {
            setData('billing_address', data.shipping_address);
        } else {
            setData('billing_address', '');
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(checkoutStore().url, {
            onSuccess: () => {
                // Handle successful checkout - redirect to order confirmation
                reset();
            },
            onError: () => {
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Calculate summary
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const shippingCost: number = 0; // Free shipping
    const taxRate = 0.08; // 8% tax
    const taxAmount = total * taxRate;
    const finalTotal = total + shippingCost + taxAmount;

    return (
        <ShopLayout>
            <Head title="Checkout" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold">Checkout</h1>
                <p className="mt-2 text-muted-foreground">Complete your order</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
                {/* Checkout Form */}
                <div className="space-y-8">
                    {/* General Errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg bg-red-50 p-4">
                            <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                            <ul className="mt-2 text-sm text-red-700">
                                {Object.values(errors).map((error, index) => (
                                    <li key={index} className="list-inside list-disc">
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Shipping Address */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Shipping Address</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700">
                                        Full Address
                                    </label>
                                    <textarea
                                        id="shipping_address"
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 text-primary-foreground"
                                        placeholder="Enter your full shipping address..."
                                        value={data.shipping_address}
                                        onChange={(e) => updateShippingAddress(e.target.value)}
                                        disabled={processing || isSubmitting}
                                        required
                                    />
                                    {errors.shipping_address && <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900">Billing Address</h2>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={sameAsShipping}
                                        onChange={(e) => toggleSameAsShipping(e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Same as shipping address</span>
                                </label>
                            </div>

                            {!sameAsShipping && (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="billing_address" className="block text-sm font-medium text-gray-700">
                                            Full Address
                                        </label>
                                        <textarea
                                            id="billing_address"
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 text-primary-foreground"
                                            placeholder="Enter your full billing address..."
                                            value={data.billing_address}
                                            onChange={(e) => setData('billing_address', e.target.value)}
                                            disabled={processing || isSubmitting}
                                            required={!sameAsShipping}
                                        />
                                        {errors.billing_address && <p className="mt-1 text-sm text-red-600">{errors.billing_address}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Payment Method</h2>
                            <div className="space-y-3">
                                <label className="flex items-center dark:text-primary-foreground">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="card"
                                        className="text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                                        checked={data.payment_method === 'card'}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        disabled={processing || isSubmitting}
                                    />
                                    <span className="ml-2">Credit/Debit Card</span>
                                </label>
                                <label className="flex items-center dark:text-primary-foreground">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="paypal"
                                        className="text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                                        checked={data.payment_method === 'paypal'}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        disabled={processing || isSubmitting}
                                    />
                                    <span className="ml-2">PayPal</span>
                                </label>
                                <label className="flex items-center dark:text-primary-foreground">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="bank_transfer"
                                        className="text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                                        checked={data.payment_method === 'bank_transfer'}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        disabled={processing || isSubmitting}
                                    />
                                    <span className="ml-2">Bank Transfer</span>
                                </label>
                                {errors.payment_method && <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="min-w-96">
                    <div className="sticky top-4 space-y-6">
                        {/* Cart Items Summary */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Your Order</h2>
                            <div className="space-y-3">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={item.product.image_url || '/logo.svg'}
                                                    alt={item.product.name}
                                                    className="h-12 w-12 rounded object-cover"
                                                />
                                                <div>
                                                    <Link
                                                        href={productShow(item.product.id).url}
                                                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                                    >
                                                        {item.product.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Order Summary</h2>
                            <div className="space-y-3 text-primary-foreground">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                                    <span className="font-medium">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-base font-medium text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-gray-900">${finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                onClick={handleSubmit}
                                disabled={processing || isSubmitting}
                                className="mt-6 w-full rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing || isSubmitting ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}`}
                            </button>

                            <div className="mt-4 text-center">
                                <Link href={cartIndex().url} className="text-sm text-blue-600 hover:text-blue-500">
                                    ← Back to Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
