import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DebouncedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

export function DebouncedSearchInput({
  value: initialValue,
  onChange,
  placeholder = "Search...",
  delay = 500,
}: DebouncedSearchInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay, initialValue, onChange]);

  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-9 bg-background"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
