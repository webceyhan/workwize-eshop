import EmptyPlaceholderCard from '@/components/empty-placeholder-card';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import SearchFilter from '@/components/search-filter';
import SelectFilter from '@/components/select-filter';
import SortFilter from '@/components/sort-filter';
import { Button } from '@/components/ui/button';
import ShopLayout from '@/layouts/shop-layout';
import { store as addToCartRoute } from '@/routes/shop/cart';
import { show as productShow, index as productsIndex } from '@/routes/shop/products';
import type { Paginated, Product } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckIcon, PackageIcon, ShoppingCartIcon } from 'lucide-react';

interface Props {
    products: Paginated<Product>;
    categories: string[];
    filter?: {
        search?: string;
        category?: string;
    };
    sort?: string;
}

export default function ProductsIndex({ products, categories, filter, sort }: Props) {
    const { auth, cartProductIds } = usePage<{
        auth: { user?: any };
        cartProductIds: number[];
    }>().props;

    const sortOptions = [
        { value: '-created_at', label: 'Newest First' },
        { value: 'name', label: 'Name A-Z' },
        { value: '-name', label: 'Name Z-A' },
        { value: 'price', label: 'Price Low to High' },
        { value: '-price', label: 'Price High to Low' },
    ];

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

    const handleSort = (value: string) => {
        router.get(productsIndex().url, {
            filter,
            sort: value,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const addToCart = (productId: number) => {
        try {
            router.post(
                addToCartRoute().url,
                {
                    product_id: productId,
                    quantity: 1,
                },
                { preserveScroll: true },
            );
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    return (
        <ShopLayout>
            <Head title="Products" />

            <Heading title="Products" description="Discover products from multiple suppliers" />

            {/* Advanced Filters */}
            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
                {/* Search Filter */}
                <SearchFilter onEnter={(value) => handleFilter('search', value)} value={filter?.search} placeholder="Search products..." />

                {/* Category Filter */}
                <SelectFilter
                    options={categories}
                    placeholder="All Categories"
                    defaultValue={filter?.category || ''}
                    onValueChange={(value) => handleFilter('category', value)}
                />

                {/* Sort */}
                <SortFilter options={sortOptions} defaultValue={sort} onValueChange={(value) => handleSort(value)} />

                {/* Reset */}
                <div>
                    <Button variant="outline" onClick={() => router.get(productsIndex().url)} disabled={!hasFilter && !sort}>
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.data.map((product) => {
                    const isInCart = cartProductIds?.includes(product.id) || false;

                    return (
                        <div key={product.id} className="group flex flex-col rounded-lg bg-white shadow transition-shadow hover:shadow-lg">
                            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
                                <img
                                    src={product.image_url || '/logo.svg'}
                                    alt={product.name}
                                    className="h-64 w-full object-cover transition-all group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="mb-2 line-clamp-1 text-lg font-medium text-gray-900">
                                    <Link href={productShow(product.id).url} className="hover:text-blue-600">
                                        {product.name}
                                    </Link>
                                </h3>
                                <p className="mb-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                                    <span className="text-xs text-gray-500">{product.stock_quantity} in stock</span>
                                </div>

                                {auth.user && (
                                    <div className="mt-auto">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className={`w-full border-0 ${isInCart ? 'bg-green-100 text-black' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                            onClick={() => addToCart(product.id)}
                                            disabled={isInCart}
                                        >
                                            {isInCart ? <CheckIcon /> : <ShoppingCartIcon />}
                                            {isInCart ? 'In Cart' : 'Add to Cart'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {products.data.length === 0 && (
                <EmptyPlaceholderCard
                    icon={<PackageIcon />}
                    title="No products found"
                    description="Try adjusting your search or filter to find what you're looking for."
                />
            )}

            {/* Pagination */}
            <Pagination {...products} />
        </ShopLayout>
    );
}
