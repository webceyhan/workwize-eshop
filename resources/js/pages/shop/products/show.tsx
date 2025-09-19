import ShopLayout from '@/layouts/shop-layout';
import { login } from '@/routes';
import { store as addToCartRoute } from '@/routes/shop/cart';
import { show as productShow, index as productsIndex } from '@/routes/shop/products';
import type { Product } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductShow({ product, relatedProducts }: Props) {
    const { auth, cartProductIds } = usePage<{
        auth: { user?: any };
        cartProductIds: number[];
    }>().props;
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const isInCart = cartProductIds?.includes(product.id) || false;

    const addToCart = async (productId: number, quantity: number = 1) => {
        if (!auth.user) return;

        setIsAddingToCart(true);
        try {
            await router.post(addToCartRoute().url, {
                product_id: productId,
                quantity: quantity,
            });
            // Optionally show success message
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
            setQuantity(newQuantity);
        }
    };

    return (
        <ShopLayout>
            <Head title={product.name} />

            {/* Breadcrumb */}
            <nav className="mb-8 flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                    <li>
                        <Link href={productsIndex().url} className="hover:text-blue-600">
                            Products
                        </Link>
                    </li>
                    <li>
                        <span>/</span>
                    </li>
                    <li>
                        <span className="font-medium">{product.name}</span>
                    </li>
                </ol>
            </nav>

            {/* Product Details */}
            <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Product Image */}
                <div className="aspect-w-1 aspect-h-1">
                    <img
                        src={product.image_url || '/logo.svg'}
                        alt={product.name}
                        className="h-96 w-full rounded-lg object-cover object-center shadow-lg"
                    />
                </div>

                {/* Product Information */}
                <div className="flex flex-col">
                    <div className="flex-1">
                        <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>

                        <div className="mb-4">
                            <span className="inline-block rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">{product.category}</span>
                        </div>

                        <div className="mb-6">
                            <span className="text-3xl font-bold">${product.price}</span>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-2 text-lg font-medium">Description</h3>
                            <p className="leading-relaxed text-muted-foreground">{product.description}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-2 text-lg font-medium">Product Details</h3>
                            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">SKU</dt>
                                    <dd className="text-sm">{product.sku}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Stock</dt>
                                    <dd className="text-sm">{product.stock_quantity} available</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Supplier</dt>
                                    <dd className="text-sm">{product.supplier.company_name || product.supplier.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                                    <dd className="text-sm">{product.category}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Add to Cart Section */}
                    {auth.user && (
                        <div className="mt-6 flex items-center gap-4 border-t pt-6">
                            {isInCart ? (
                                <div className="flex w-full items-center justify-center space-x-2 rounded-md bg-green-100 px-6 py-3 text-green-800">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-base font-medium">Already in Cart</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center rounded-md ring-1 ring-gray-600">
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            disabled={quantity <= 1}
                                            className="px-3 text-2xl text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            id="quantity"
                                            min="1"
                                            max={product.stock_quantity}
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                            className="border-0 p-3 text-center focus:ring-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            disabled={quantity >= product.stock_quantity}
                                            className="px-3 text-2xl text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => addToCart(product.id, quantity)}
                                        disabled={isAddingToCart || product.stock_quantity === 0}
                                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Add to Cart
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {!auth.user && (
                        <div className="mt-6 border-t pt-6">
                            <p className="mb-4 text-gray-600">Please log in to add items to your cart.</p>
                            <Link
                                href={login().url}
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                            >
                                Login to Purchase
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div>
                    <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {relatedProducts.map((relatedProduct) => {
                            const isRelatedInCart = cartProductIds?.includes(relatedProduct.id) || false;

                            return (
                                <div key={relatedProduct.id} className="flex flex-col rounded-lg bg-white shadow transition-shadow hover:shadow-lg">
                                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
                                        <img
                                            src={relatedProduct.image_url || '/logo.svg'}
                                            alt={relatedProduct.name}
                                            className="h-48 w-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col p-4">
                                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                                            <Link href={productShow(relatedProduct.id).url} className="hover:text-blue-600">
                                                {relatedProduct.name}
                                            </Link>
                                        </h3>
                                        <p className="mb-2 line-clamp-2 text-sm text-gray-600">{relatedProduct.description}</p>
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">${relatedProduct.price}</span>
                                            <span className="text-sm text-muted-foreground">{relatedProduct.stock_quantity} in stock</span>
                                        </div>
                                        <div className="mb-3">
                                            <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                                                {relatedProduct.category}
                                            </span>
                                        </div>
                                        <div className="mb-3 flex-1 text-sm text-gray-600">
                                            by {relatedProduct.supplier.company_name || relatedProduct.supplier.name}
                                        </div>
                                        {auth.user && (
                                            <div className="mt-auto">
                                                {isRelatedInCart ? (
                                                    <div className="flex items-center justify-center space-x-2 rounded bg-green-100 px-4 py-2 text-green-800">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="text-sm font-medium">In Cart</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(relatedProduct.id)}
                                                        className="w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </ShopLayout>
    );
}
