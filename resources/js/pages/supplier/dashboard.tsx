import Heading from '@/components/heading';
import StatsCard from '@/components/stats-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupplierLayout from '@/layouts/supplier-layout';
import { Head } from '@inertiajs/react';
import { BoxesIcon, PackageCheckIcon, PackageIcon, ShoppingBagIcon, TruckIcon } from 'lucide-react';

interface DashboardStats {
    totalProducts: number;
    activeProducts: number;
    totalStock: number;
    totalSales: number;
    totalOrders: number;
}

interface DashboardProps {
    stats: DashboardStats;
    recentOrders: any[];
    salesData: any[];
}

export default function SupplierDashboard({ stats, recentOrders, salesData }: DashboardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <SupplierLayout header={<Heading title="Dashboard" description="Welcome back! Here's what's happening with your store." />}>
            <Head title="Supplier Dashboard" />

            {/* Stats Cards */}
            <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Products" content={stats.totalProducts} description="Products in catalog" icon={<PackageIcon className='text-blue-800' />} />

                <StatsCard title="Active Products" content={stats.activeProducts} description="Currently active" icon={<PackageCheckIcon className='text-green-800' />} />

                <StatsCard title="Total Stock" content={stats.totalStock} description="Items in inventory" icon={<BoxesIcon className='text-yellow-800' />} />

                <StatsCard title="Total Orders" content={stats.totalOrders} description="Orders received" icon={<TruckIcon className='text-red-800' />} />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Latest orders from your customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length > 0 ? (
                            <div className="divide-y">
                                {recentOrders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center gap-4 py-4">
                                        <Avatar className="size-12">
                                            <AvatarFallback>
                                                <TruckIcon />
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <p className="text-xs font-medium">Order #{order.id}</p>
                                            <p className="text-sm font-semibold">
                                                {order.product?.name} × {order.quantity}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                        </div>

                                        <div className="ms-auto text-right">
                                            <p className="font-medium">{formatCurrency(order.total_price)}</p>
                                            <p className="text-xs text-muted-foreground">{order.order?.customer?.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <TruckIcon className="mx-auto size-12 text-muted" />
                                <h3 className="mt-2 text-sm font-medium">No orders yet</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first product.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sales Chart Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Your sales performance over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {salesData.length > 0 ? (
                            <div className="divide-y">
                                {salesData.map((data, index) => (
                                    <div key={index} className="flex items-center gap-4 py-4">
                                        <Avatar className="size-12">
                                            <AvatarFallback>
                                                <ShoppingBagIcon />
                                            </AvatarFallback>
                                        </Avatar>

                                        <span className="font-semibold">{formatDate(data.date)}</span>
                                        <span className="ms-auto font-medium">{formatCurrency(data.total)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <ShoppingBagIcon className="mx-auto size-12 text-muted" />

                                <h3 className="mt-2 text-sm font-medium">No sales data</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Sales data will appear here once you start selling.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SupplierLayout>
    );
}
