import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
    value: string;
}

export default function OrderStatusBadge({ value }: OrderStatusBadgeProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Badge variant="outline" className={getStatusColor(value)}>
            {value}
        </Badge>
    );
}
