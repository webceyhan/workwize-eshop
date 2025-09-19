import EmptyPlaceholderCard from '@/components/empty-placeholder-card';
import Heading from '@/components/heading';
import OrderStatusBadge from '@/components/order-status-badge';
import Pagination from '@/components/pagination';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupplierLayout from '@/layouts/supplier-layout';
import type { Order, Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Package, Truck, User } from 'lucide-react';

interface Props {
    orders: Paginated<Order>;
    orderStatuses: string[];
    filter?: {
        status?: string;
    };
    sort?: string;
    success?: string;
    error?: string;
}

export default function SupplierOrdersIndex({ orders, orderStatuses, filter, sort, success, error }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStatusUpdate = (orderId: number, newStatus: string) => {
        if (confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
            router.patch(`/supplier/orders/${orderId}/update-status`, { status: newStatus });
        }
    };

    const getOrderTotal = (order: Order) => {
        return order.order_items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
    };

    const canProcess = (order: Order) => order.status === 'pending';
    const canShip = (order: Order) => order.status === 'processing';

    return (
        <SupplierLayout header={<Heading title="Orders" description="Manage orders containing your products" />}>
            <Head title="Orders" />

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

            {/* Status Filter */}
            <div className="mb-6">
                <div className="flex gap-2">
                    <Button variant={filter?.status ? 'outline' : 'default'} asChild>
                        <Link href="/supplier/orders">All Orders</Link>
                    </Button>

                    {orderStatuses.map((status) => (
                        <Button variant={filter?.status === status ? 'default' : 'outline'} key={status} asChild>
                            <Link href={`/supplier/orders?filter[status]=${status}`}>{status}</Link>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {orders.data.length === 0 ? (
                <EmptyPlaceholderCard
                    icon={<Package />}
                    title="No orders found"
                    description={filter?.status ? `No ${filter.status} orders containing your products.` : 'No orders containing your products yet.'}
                />
            ) : (
                <div className="space-y-4">
                    {orders.data.map((order: Order) => (
                        <Card key={order.id}>
                            <CardHeader className="flex-row items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                        <CardTitle>Order #{order.id}</CardTitle>
                                        <OrderStatusBadge value={order.status} />
                                    </div>

                                    <CardDescription className="flex items-center gap-1">
                                        <User className="size-4" />
                                        {order.customer?.name}
                                    </CardDescription>

                                    <CardDescription className="mt-4 space-y-1 text-xs">
                                        <div>Ordered on {formatDate(order.created_at)}</div>
                                        {order.shipped_at && (
                                            <div>
                                                Shipped on {formatDate(order.shipped_at)} to {order.shipping_address}
                                            </div>
                                        )}
                                    </CardDescription>
                                </div>

                                <div className="flex flex-col justify-between gap-2">
                                    <div className="text-right">
                                        <div className="text-lg font-bold">${getOrderTotal(order).toFixed(2)}</div>
                                        <div className="text-sm text-muted-foreground">{order.order_items?.length || 0} item(s)</div>
                                    </div>

                                    {canProcess(order) && (
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'processing')}>
                                            <Package /> Process
                                        </Button>
                                    )}

                                    {canShip(order) && (
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'shipped')}>
                                            <Truck /> Ship
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            {/* Order Items Preview */}
                            <CardContent>
                                <div className="divide-y border-t">
                                    {order.order_items!.map((item: any, index: number) => (
                                        <div key={item.id} className="flex items-center gap-4 py-6">
                                            <h4 className="text-2xl text-muted-foreground/25">{index + 1}</h4>

                                            <Avatar className="size-12 rounded-md">
                                                <AvatarImage src={item.product?.image_url} alt={item.product?.name} />
                                            </Avatar>

                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{item.product?.name}</p>
                                                <p className="text-xs text-muted-foreground">SKU: {item.product?.sku}</p>
                                            </div>

                                            <p className="px-6 text-muted-foreground">${item.unit_price.toFixed(2)}</p>

                                            <p className="px-6 text-muted-foreground">× {item.quantity}</p>

                                            <p className="min-w-20 text-end font-medium">${item.total_price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Pagination */}
                    <Pagination {...orders} />
                </div>
            )}
        </SupplierLayout>
    );
}
