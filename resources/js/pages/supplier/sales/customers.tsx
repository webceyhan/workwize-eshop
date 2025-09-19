import EmptyPlaceholderCard from '@/components/empty-placeholder-card';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SupplierLayout from '@/layouts/supplier-layout';
import { Paginated } from '@/types';
import { Head } from '@inertiajs/react';
import { UsersIcon, UserStarIcon } from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    total_orders: number;
    total_spent: number;
}

interface Props {
    customers: Paginated<Customer>;
}

export default function SalesCustomers({ customers }: Props) {
    return (
        <SupplierLayout header={<Heading title="Customer Analytics" description="View your top customers and their purchase history." />}>
            <Head title="Customer Analytics" />

            {/* Customers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                    <CardDescription>Customers ranked by total spending on your products.</CardDescription>
                </CardHeader>

                <CardContent>
                    {customers.data.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead colSpan={2}>Customer</TableHead>
                                    <TableHead>Total Orders</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Average Order</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {customers.data.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="w-12">
                                            <Avatar className="size-12">
                                                <AvatarFallback>
                                                    <UserStarIcon />
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>

                                        <TableCell>
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                                        </TableCell>

                                        <TableCell>{customer.total_orders}</TableCell>

                                        <TableCell>${(+customer.total_spent).toFixed(2)}</TableCell>

                                        <TableCell>${(customer.total_spent / customer.total_orders).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyPlaceholderCard
                            icon={<UsersIcon />}
                            title="No customers yet"
                            description="When customers purchase your products, they will appear here."
                        />
                    )}
                </CardContent>
            </Card>
        </SupplierLayout>
    );
}
