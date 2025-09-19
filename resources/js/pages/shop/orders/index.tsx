import OrderStatusBadge from '@/components/order-status-badge';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import ShopLayout from '@/layouts/shop-layout';
import { show as orderShow } from '@/routes/shop/orders';
import { index as productsIndex } from '@/routes/shop/products';
import type { Order, Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Props {
    orders: Paginated<Order>;
}

export default function OrdersIndex({ orders }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <ShopLayout>
            <Head title="My Orders" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold">My Orders</h1>
                <p className="mt-2 text-muted-foreground">Track and manage your order history</p>
            </div>

            {orders.data.length === 0 ? (
                <div className="py-12 text-center">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-2 text-sm text-gray-500">You haven't placed any orders yet.</p>
                    <div className="mt-6">
                        <Link
                            href={productsIndex().url}
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.data.map((order: Order) => (
                        <div key={order.id} className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
                                    </div>
                                    <OrderStatusBadge value={order.status} />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">${order.total_amount.toFixed(2)}</div>
                                        <div className="text-sm text-gray-500">
                                            {order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0)} items
                                        </div>
                                    </div>
                                    <Button variant={'outline'} asChild>
                                        <Link href={orderShow(order.id).url}>View Details</Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            {order.order_items && order.order_items.length > 0 && (
                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <div className="space-y-4 overflow-x-auto">
                                        {order.order_items.slice(0, 4).map((item: any) => (
                                            <div key={item.id} className="flex flex-shrink-0 items-center space-x-2">
                                                <img
                                                    src={item.product?.image_url || '/logo.svg'}
                                                    alt={item.product?.name}
                                                    className="h-12 w-12 rounded object-cover"
                                                />
                                                <div>
                                                    <p className="line-clamp-1 text-sm font-medium text-gray-900">{item.product?.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {order.order_items && order.order_items.length > 4 && (
                                            <div className="flex items-center text-sm text-gray-500">+{order.order_items.length - 4} more</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    <Pagination {...orders} />
                </div>
            )}
        </ShopLayout>
    );
}
