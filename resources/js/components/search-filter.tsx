import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { ComponentProps, useState } from 'react';

interface SearchFilterProps extends ComponentProps<'input'> {
    onEnter?: (value: string) => void;
}

export default function SearchFilter({ onEnter, value, className, ...props }: SearchFilterProps) {
    const [searchTerm, setSearchTerm] = useState(`${value || ''}`);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onEnter?.(searchTerm);
    };

    return (
        <form onSubmit={handleSearch} className={`relative ${className}`}>
            <SearchIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" {...props} onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
        </form>
    );
}
