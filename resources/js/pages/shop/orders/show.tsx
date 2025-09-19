import OrderStatusBadge from '@/components/order-status-badge';
import { Button } from '@/components/ui/button';
import ShopLayout from '@/layouts/shop-layout';
import { index as ordersIndex, cancel as orderCancel } from '@/routes/shop/orders';
import { show as productShow, index as productsIndex } from '@/routes/shop/products';
import type { Order } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    order: Order;
    success?: string;
    error?: string;
}

export default function OrderShow({ order, success, error }: Props) {
    const [isCancelling, setIsCancelling] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCancelOrder = () => {
        if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            setIsCancelling(true);
            router.patch(orderCancel(order.id).url, {}, {
                onFinish: () => setIsCancelling(false),
            });
        }
    };

    const canCancelOrder = order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing';

    return (
        <ShopLayout>
            <Head title={`Order #${order.id}`} />

            {/* Flash Messages */}
            {success && (
                <div className="mb-6 rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-800">{success}</div>
                </div>
            )}
            {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">{error}</div>
                </div>
            )}

            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                        <p className="mt-2 text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <OrderStatusBadge value={order.status} />
                        <Link href={ordersIndex().url} className="text-sm text-blue-600 hover:text-blue-500">
                            ← Back to Orders
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
                {/* Order Items */}
                <div className="space-y-6">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-medium text-gray-900">Order Items</h2>
                        <div className="space-y-4">
                            {order.order_items?.map((item) => (
                                <div key={item.id} className="flex space-x-4 border-b border-gray-200 py-4 last:border-b-0">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={item.product?.image_url || '/logo.svg'}
                                            alt={item.product?.name}
                                            className="h-20 w-20 rounded-md object-cover"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            <Link href={productShow(item.product_id).url} className="hover:text-blue-600">
                                                {item.product?.name}
                                            </Link>
                                        </h3>
                                        <p className="line-clamp-2 text-sm text-gray-500">{item.product?.description}</p>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">by</span>
                                            <span className="text-sm text-gray-700">
                                                {item.product?.supplier?.company_name || item.product?.supplier?.name}
                                            </span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                                                {item.product?.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quantity & Price */}
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">${item.total_price.toFixed(2)}</div>
                                        <div className="text-sm text-gray-500">
                                            ${item.unit_price.toFixed(2)} × {item.quantity}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping & Billing Addresses */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Shipping Address */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Shipping Address</h2>
                            <div className="text-sm whitespace-pre-line text-gray-700">{order.shipping_address}</div>
                        </div>

                        {/* Billing Address */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Billing Address</h2>
                            <div className="text-sm whitespace-pre-line text-gray-700">{order.billing_address}</div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="min-w-80">
                    <div className="sticky top-4 space-y-6">
                        {/* Order Summary */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Order Summary</h2>
                            <div className="space-y-3 text-primary-foreground">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Subtotal ({order.order_items?.reduce((sum, item) => sum + item.quantity, 0)} items)
                                    </span>
                                    <span className="font-medium">${(order.total_amount / 1.08).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">${(order.total_amount - order.total_amount / 1.08).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-base font-medium text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-gray-900">${order.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Need Help?</h2>
                            <div className="space-y-3 [&>*]:w-full">
                                <Button variant={'outline'} asChild>
                                    <Link href={productsIndex().url}>Continue Shopping</Link>
                                </Button>

                                <Button variant={'outline'} onClick={() => window.print()}>
                                    Print Order
                                </Button>

                                {canCancelOrder && (
                                    <Button
                                        variant={'destructive'}
                                        onClick={handleCancelOrder}
                                        disabled={isCancelling}
                                    >
                                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
