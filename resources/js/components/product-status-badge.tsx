import { Badge } from '@/components/ui/badge';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { ComponentProps } from 'react';

interface ProductStatusBadgeProps extends ComponentProps<'span'> {
    active?: boolean;
}

export default function ProductStatusBadge({ active, ...props }: ProductStatusBadgeProps) {
    return (
        <Badge variant="outline" {...props}>
            {active ? <EyeIcon className="text-green-400" /> : <EyeOffIcon className="text-muted-foreground" />}
            {active ? 'Active' : 'Inactive'}
        </Badge>
    );
}
