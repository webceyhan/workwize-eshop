import AppLogoIcon from '@/components/app-logo-icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { LayoutGridIcon, LogOutIcon, PackageIcon, ShoppingBagIcon, TruckIcon, UsersIcon } from 'lucide-react';
import { PropsWithChildren, ReactNode } from 'react';

interface SupplierLayoutProps extends PropsWithChildren {
    header?: ReactNode;
    action?: ReactNode;
}

export default function SupplierLayout({ children, header, action }: SupplierLayoutProps) {
    const page = usePage();
    const auth = page.props.auth as { user: User };

    const navigation = [
        {
            name: 'Dashboard',
            href: '/supplier/dashboard',
            icon: LayoutGridIcon,
        },
        {
            name: 'Products',
            href: '/supplier/products',
            icon: PackageIcon,
        },
        {
            name: 'Orders',
            href: '/supplier/orders',
            icon: TruckIcon,
        },
        {
            name: 'Sales',
            href: '/supplier/sales',
            icon: ShoppingBagIcon,
        },
        {
            name: 'Customers',
            href: '/supplier/customers',
            icon: UsersIcon,
        },
    ];

    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen">
            <Head title="Supplier Dashboard" />

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 border-e">
                {/* Logo */}
                <div className="flex h-22 items-center justify-center border-b">
                    <Link href="/supplier/dashboard" className="flex items-center space-x-2">
                        <AppLogoIcon className="w-48" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = currentPath.startsWith(item.href);
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                            isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-primary hover:text-primary-foreground'
                                        }`}
                                    >
                                        <item.icon className="size-6" />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User info */}
                <div className="absolute right-0 bottom-0 left-0 border-t p-4">
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarFallback>{auth.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{auth.user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{auth.user.company_name || 'Supplier'}</p>
                        </div>

                        <Button size="icon" variant="link" asChild>
                            <Link href="/supplier/logout" method="post" as="button">
                                <LogOutIcon />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64">
                {/* Top header */}
                <header className="border-b">
                    <div className="flex h-22 items-center justify-between p-8 [&>*]:mb-0!">
                        {header} {action}
                    </div>
                </header>

                {/* Page content */}
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
