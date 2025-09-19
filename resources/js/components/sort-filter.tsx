import { SelectProps } from '@radix-ui/react-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SortFilterProps extends SelectProps {
    options: { value: string; label: string }[];
}

export default function SortFilter({ options, ...props }: SortFilterProps) {
    return (
        <Select {...props}>
            <SelectTrigger>
                <SelectValue placeholder="Sort By" />
            </SelectTrigger>

            <SelectContent>
                {options?.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                        {label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
