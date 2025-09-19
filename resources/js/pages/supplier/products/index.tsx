import EmptyPlaceholderCard from '@/components/empty-placeholder-card';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import ProductStatusBadge from '@/components/product-status-badge';
import ProductStockQuantityBadge from '@/components/product-stock-quantity-badge';
import SearchFilter from '@/components/search-filter';
import SelectFilter from '@/components/select-filter';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SupplierLayout from '@/layouts/supplier-layout';
import { destroy, edit, index as productsIndex, toggleStatus } from '@/routes/supplier/products';
import { Paginated, Product } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDownIcon, MoveDownIcon, MoveUpIcon, PackageIcon, PenIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

interface ProductsIndexProps {
    products: Paginated<Product>;
    categories: string[];
    filter?: {
        search?: string;
        category?: string;
        status?: string;
        min_price?: number;
        max_price?: number;
        stock_status?: string;
    };
    sort?: string;
}

export default function ProductsIndex({ products, categories, filter, sort }: ProductsIndexProps) {
    const [priceRange, setPriceRange] = useState<[number, number]>([filter?.min_price || 0, filter?.max_price || 1000]);

    const hasFilter = Object.keys(filter || {}).length > 0;

    const handleFilter = (key: string, value: string) => {
        router.get(productsIndex().url, {
            filter: {
                ...filter,
                [key]: value,
            },
            sort,
        });
    };

    const handlePriceRangeFilter = ([min, max]: [number, number]) => {
        router.get(productsIndex().url, {
            filter: {
                ...filter,
                min_price: min,
                max_price: max,
            },
            sort,
        });
    };

    const handleSort = (sortBy: string) => {
        // Parse current sort to determine direction
        const currentSort = sort || '';
        let newSort = sortBy;

        // If clicking the same field, toggle direction
        if (currentSort === sortBy) {
            newSort = `-${sortBy}`;
        } else if (currentSort === `-${sortBy}`) {
            newSort = sortBy;
        }

        router.get(productsIndex().url, {
            filter,
            sort: newSort,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getSortIcon = (field: string) => {
        const currentSort = sort || '';

        if (currentSort !== field && currentSort !== `-${field}`) {
            return <ArrowUpDownIcon />;
        }

        return currentSort === field ? <MoveDownIcon /> : <MoveUpIcon />;
    };

    return (
        <SupplierLayout
            header={<Heading title="Products" description="Manage your product catalog" />}
            action={
                <Button asChild>
                    <Link href="/supplier/products/create">
                        <PlusIcon />
                        Add Product
                    </Link>
                </Button>
            }
        >
            <Head title="Products" />

            {/* Advanced Filters */}
            <Card className="mb-6">
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:grid-rows-2">
                        {/* Search */}
                        <SearchFilter
                            onEnter={(value) => handleFilter('search', value)}
                            value={filter?.search}
                            placeholder="Search products, SKU, category..."
                        />

                        {/* Category Filter */}
                        <SelectFilter
                            options={categories}
                            placeholder="All Categories"
                            defaultValue={filter?.category || ''}
                            onValueChange={(value) => handleFilter('category', value)}
                        />

                        {/* Status Filter */}
                        <SelectFilter
                            options={['active', 'inactive']}
                            placeholder="All Status"
                            defaultValue={filter?.status || ''}
                            onValueChange={(value) => handleFilter('status', value)}
                        />

                        {/* Stock Status Filter */}
                        <SelectFilter
                            options={['in_stock', 'low_stock', 'out_of_stock']}
                            placeholder="All Stock"
                            defaultValue={filter?.stock_status || ''}
                            onValueChange={(value) => handleFilter('stock_status', value)}
                        />

                        {/* Price Range Filter */}
                        <div className="col-span-4 row-start-2 flex items-center gap-4">
                            {formatCurrency(priceRange[0])}
                            <Slider
                                max={1000}
                                step={10}
                                defaultValue={[filter?.min_price || 0, filter?.max_price || 1000]}
                                onValueChange={(value) => setPriceRange(value as any)}
                                onValueCommit={(values) => handlePriceRangeFilter(values as any)}
                            />
                            {formatCurrency(priceRange[1])}
                        </div>

                        {/* Reset */}
                        <div className="col-start-5 row-span-2">
                            <Button variant="outline" onClick={() => router.get(productsIndex().url)} disabled={!hasFilter && !sort}>
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <div>
                {products.data.length > 0 ? (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow className="[&_button]:-ms-2">
                                    <TableHead colSpan={2}>
                                        <Button variant="ghost" size="sm" onClick={() => handleSort('name')}>
                                            Product
                                            {getSortIcon('name')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" size="sm" onClick={() => handleSort('category')}>
                                            Category
                                            {getSortIcon('category')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" size="sm" onClick={() => handleSort('price')}>
                                            Price
                                            {getSortIcon('price')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" size="sm" onClick={() => handleSort('stock_quantity')}>
                                            Stock
                                            {getSortIcon('stock_quantity')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" size="sm" onClick={() => handleSort('is_active')}>
                                            Status
                                            {getSortIcon('is_active')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Sales</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="w-12">
                                            <Avatar className="size-12">
                                                <AvatarImage src={product.image_url} alt={product.name} />
                                            </Avatar>
                                        </TableCell>

                                        <TableCell>
                                            <div className="line-clamp-1 font-medium">{product.name}</div>
                                            <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="outline">{product.category || 'Uncategorized'}</Badge>
                                        </TableCell>

                                        <TableCell>{formatCurrency(product.price)}</TableCell>

                                        <TableCell>
                                            <ProductStockQuantityBadge value={product.stock_quantity} />
                                        </TableCell>

                                        <TableCell>
                                            <ProductStatusBadge
                                                className="cursor-pointer"
                                                active={product.is_active}
                                                onClick={() => router.patch(toggleStatus(product.id).url)}
                                            />
                                        </TableCell>

                                        <TableCell>{(product as any).order_items_count || 0} orders</TableCell>

                                        <TableCell className="space-x-2 text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={edit(product.id).url}>
                                                    <PenIcon />
                                                </Link>
                                            </Button>

                                            <Button variant="ghost" size="icon" className="hover:text-destructive-foreground" asChild>
                                                <Link
                                                    href={destroy(product.id).url}
                                                    method="delete"
                                                    as="button"
                                                    onClick={(e) => {
                                                        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <TrashIcon />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Separator />

                        <Pagination {...products} />
                    </>
                ) : (
                    <EmptyPlaceholderCard
                        icon={<PackageIcon />}
                        title="No products found"
                        description="Get started by creating your first product."
                        action={
                            <Link href="/supplier/products/create">
                                <PlusIcon /> Add Product
                            </Link>
                        }
                    />
                )}
            </div>
        </SupplierLayout>
    );
}
