import EmptyPlaceholderCard from '@/components/empty-placeholder-card';
import Heading from '@/components/heading';
import StatsCard from '@/components/stats-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SupplierLayout from '@/layouts/supplier-layout';
import { OrderItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3Icon, DollarSignIcon, PackageIcon, ShoppingBagIcon, TruckIcon } from 'lucide-react';

interface SalesAnalytics {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: any[];
    salesByMonth: any[];
}

interface Props {
    orderItems: {
        data: OrderItem[];
        links: any[];
        meta: any;
    };
    analytics: SalesAnalytics;
    filters: {
        start_date?: string;
        end_date?: string;
    };
}

export default function SalesIndex({ orderItems, analytics, filters }: Props) {
    return (
        <SupplierLayout header={<Heading title="Sales Analytics" description="Track your product sales performance and revenue." />}>
            <Head title="Sales Analytics" />

            {/* Analytics Cards */}
            <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    content={`$${(+analytics.totalRevenue).toFixed(2) || '0.00'}`}
                    description="Total sales revenue"
                    icon={<DollarSignIcon className="text-green-800" />}
                />

                <StatsCard
                    title="Total Orders"
                    content={analytics.totalOrders || 0}
                    description="Orders processed"
                    icon={<TruckIcon className="text-red-800" />}
                />

                <StatsCard
                    title="Average Order"
                    content={`$${(+analytics.averageOrderValue).toFixed(2) || '0.00'}`}
                    description="Average order value"
                    icon={<BarChart3Icon className="text-yellow-800" />}
                />

                <StatsCard
                    title="Top Products"
                    content={analytics.topProducts?.length || 0}
                    description="Best performing products"
                    icon={<PackageIcon className="text-blue-800" />}
                />
            </div>

            {/* Sales Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>Your latest product sales and order details.</CardDescription>
                </CardHeader>
                <CardContent>
                    {orderItems.data.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead colSpan={2}>Product</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderItems.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="w-12">
                                            <Avatar className="size-12">
                                                <AvatarFallback>
                                                    <ShoppingBagIcon />
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>

                                        <TableCell className="font-medium">{item.product?.name}</TableCell>

                                        <TableCell>{item.order?.customer?.name || 'Unknown'}</TableCell>

                                        <TableCell>{item.quantity}</TableCell>

                                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>

                                        <TableCell>${item.total_price.toFixed(2)}</TableCell>

                                        <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyPlaceholderCard
                            icon={<ShoppingBagIcon />}
                            title="No sales data found"
                            description="Once you start selling products, your sales will appear here."
                        />
                    )}
                </CardContent>
            </Card>
        </SupplierLayout>
    );
}
