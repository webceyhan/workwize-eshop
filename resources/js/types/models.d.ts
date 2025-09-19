export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: string;
    company_name?: string;
    company_description?: string;
    phone?: string;
    [key: string]: unknown;
}

export interface Supplier {
    id: number;
    name: string;
    email: string;
    company_name?: string;
    company_description?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    category: string;
    supplier: Supplier;
    stock_quantity: number;
    is_active: boolean;
    sku: string;
    created_at: string;
    updated_at?: string;
}

export interface CartItem {
    id: number;
    quantity: number;
    product: Product;
    user_id: number;
    created_at?: string;
    updated_at?: string;
}

export interface Order {
    id: number;
    customer_id: number;
    total_amount: number;
    status: string;
    shipping_address?: string;
    billing_address?: string;
    shipped_at?: string;
    delivered_at?: string;
    created_at: string;
    updated_at: string;
    customer?: User;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    updated_at: string;
    product?: Product;
    order?: Order;
}
