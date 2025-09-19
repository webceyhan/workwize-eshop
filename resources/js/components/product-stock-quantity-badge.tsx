import { Badge } from '@/components/ui/badge';
import { ChevronsDownIcon, ChevronsUpIcon, ZapIcon } from 'lucide-react';
import { createElement } from 'react';

interface ProductStockQuantityBadgeProps {
    value?: number;
}

const STATE_MAP = {
    high: { icon: ChevronsUpIcon, color: 'text-green-400' },
    low: { icon: ChevronsDownIcon, color: 'text-yellow-400' },
    out: { icon: ZapIcon, color: 'text-red-400' },
};

export default function ProductStockQuantityBadge({ value = 0 }: ProductStockQuantityBadgeProps) {
    const state = value > 10 ? 'high' : value === 0 ? 'out' : 'low';

    const { icon, color } = STATE_MAP[state];

    return (
        <Badge variant="outline" className="border-0">
            {createElement(icon, { className: color })} {value}
        </Badge>
    );
}
