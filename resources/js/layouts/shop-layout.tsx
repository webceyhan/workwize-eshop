import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';
import { index as cartIndex } from '@/routes/shop/cart';
import { index as ordersIndex } from '@/routes/shop/orders';
import { Link, usePage } from '@inertiajs/react';
import { LogOutIcon } from 'lucide-react';
import { type PropsWithChildren } from 'react';

export default function ShopLayout({ children }: PropsWithChildren) {
    const { auth, cartItemsCount } = usePage<{ auth: { user?: any }; cartItemsCount: number }>().props;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-primary shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <Link href="/" className="text-xl font-bold text-primary-foreground">
                                <AppLogoIcon /> eShop
                            </Link>
                        </div>

                        <nav className="flex items-center space-x-4">
                            {auth.user ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href={cartIndex().url}
                                        className="relative font-medium text-primary-foreground hover:text-primary-foreground/80"
                                    >
                                        Cart
                                        {cartItemsCount > 0 && (
                                            <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                                                {cartItemsCount ?? 0}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href={ordersIndex().url} className="text-primary-foreground hover:text-primary-foreground/80">
                                        Orders
                                    </Link>
                                    <span className="text-primary-foreground">|</span>
                                    <span className="text-sm text-primary-foreground">Welcome, {auth.user.name}</span>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex cursor-pointer items-center space-x-1 text-primary-foreground hover:text-primary-foreground/80"
                                        title="Logout"
                                    >
                                        <LogOutIcon className="size-4" />
                                        <span className="text-sm">Logout</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link href={login().url} className="text-primary-foreground hover:text-primary-foreground/80">
                                        Login
                                    </Link>
                                    <Button variant="secondary" asChild>
                                        <Link href={register().url}>Register</Link>
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
    );
}
