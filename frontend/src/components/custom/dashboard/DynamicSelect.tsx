import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  id: string | number;
  label: string;
}

interface DynamicSelectProps {
  value?: string | number;
  onChange: (value: number | undefined) => void;
  options: SelectOption[];
  placeholder: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function DynamicSelect({
  value,
  onChange,
  options,
  placeholder,
  isLoading = false,
  disabled = false,
}: DynamicSelectProps) {
  const stringValue = value ? value.toString() : "all";

  const handleValueChange = (val: string) => {
    if (val === "all") {
      onChange(undefined);
    } else {
      onChange(parseInt(val, 10));
    }
  };

  return (
    <Select
      value={stringValue}
      onValueChange={handleValueChange}
      disabled={isLoading || disabled}
    >
      <SelectTrigger className="bg-background w-full">
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
