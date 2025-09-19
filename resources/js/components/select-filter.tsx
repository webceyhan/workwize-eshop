import { SelectProps } from '@radix-ui/react-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SelectFilterProps extends SelectProps {
    options?: string[];
    placeholder?: string;
}

export default function SelectFilter({ options, placeholder, onValueChange, ...props }: SelectFilterProps) {
    // internal handler to convert 'null' string back to undefined
    const handleValueChange = (value: string) => {
        if (onValueChange) {
            onValueChange(value === 'null' ? (undefined as any) : value);
        }
    };

    return (
        <Select {...props} onValueChange={handleValueChange}>
            <SelectTrigger className="capitalize">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="null" className="capitalize">
                    {placeholder}
                </SelectItem>

                {options?.map((option) => (
                    <SelectItem key={option} value={option} className="capitalize">
                        {option.replaceAll('_', ' ')}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
