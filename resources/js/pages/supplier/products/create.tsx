import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import SupplierLayout from '@/layouts/supplier-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function CreateProduct() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
        sku: '',
        image_url: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/supplier/products');
    };

    return (
        <SupplierLayout header={<Heading title="Create Product" description="Add a new product to your catalog" />}>
            <Head title="Create Product" />

            <div className="max-w-2xl">
                <Card>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="mb-4 text-lg font-medium">Basic Information</h3>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-1 sm:col-span-2">
                                        <label htmlFor="name" className="block text-sm font-medium">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter product name"
                                        />
                                        {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                        <label htmlFor="description" className="block text-sm font-medium">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <Textarea
                                            id="description"
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe your product"
                                        />
                                        {errors.description && <div className="text-sm text-red-600">{errors.description}</div>}
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="sku" className="block text-sm font-medium">
                                            SKU <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="sku"
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            placeholder="e.g., SKU-001"
                                        />
                                        {errors.sku && <div className="text-sm text-red-600">{errors.sku}</div>}
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="category" className="block text-sm font-medium">
                                            Category
                                        </label>
                                        <Input
                                            id="category"
                                            type="text"
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            placeholder="e.g., Electronics, Clothing"
                                        />
                                        {errors.category && <div className="text-sm text-red-600">{errors.category}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div>
                                <h3 className="mb-4 text-lg font-medium">Pricing & Inventory</h3>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label htmlFor="price" className="block text-sm font-medium">
                                            Price <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="0.00"
                                        />

                                        {errors.price && <div className="text-sm text-red-600">{errors.price}</div>}
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="stock_quantity" className="block text-sm font-medium">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="stock_quantity"
                                            type="number"
                                            min="0"
                                            value={data.stock_quantity}
                                            onChange={(e) => setData('stock_quantity', e.target.value)}
                                            placeholder="0"
                                        />
                                        {errors.stock_quantity && <div className="text-sm text-red-600">{errors.stock_quantity}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Media */}
                            <div>
                                <h3 className="mb-4 text-lg font-medium">Media</h3>

                                <div className="space-y-1">
                                    <label htmlFor="image_url" className="block text-sm font-medium">
                                        Image URL
                                    </label>
                                    <Input
                                        id="image_url"
                                        type="url"
                                        value={data.image_url}
                                        onChange={(e) => setData('image_url', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.image_url && <div className="text-sm text-red-600">{errors.image_url}</div>}
                                    <p className="text-sm text-muted-foreground">Enter a direct URL to your product image</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h3 className="mb-4 text-lg font-medium">Status</h3>
                                <div className="flex items-center">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm">
                                        Product is active and visible to customers
                                    </label>
                                </div>
                            </div>

                            <Separator />

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-4 pt-6">
                                <Button variant="outline" asChild>
                                    <Link href="/supplier/products">Cancel</Link>
                                </Button>

                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Product'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SupplierLayout>
    );
}
