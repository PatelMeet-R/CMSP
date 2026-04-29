import * as React from "react";
import { Check, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";

export interface ComboboxOption<T = any> {
  value: string;
  label: string;
  subLabel?: string;
  rawData?: T;
}

interface AsyncComboboxProps<T = any> {
  value?: string | null;
  onChange: (value: string | null, rawData?: T | null) => void;
  fetchOptions: (searchTerm: string) => Promise<ComboboxOption<T>[]>;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

export function AsyncCombobox<T>({
  value,
  onChange,
  fetchOptions,
  placeholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState<ComboboxOption<T>[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedOption, setSelectedOption] =
    React.useState<ComboboxOption<T> | null>(null);

  //  1. NEW: Create a ref and state to manually track the exact pixel width
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [popoverWidth, setPopoverWidth] = React.useState<number>(0);

  const debouncedSearchTerm = useDebounce(inputValue, 400);

  //  2. NEW: Measure the input box the exact moment the user clicks it
  React.useEffect(() => {
    if (open && containerRef.current) {
      setPopoverWidth(containerRef.current.offsetWidth);
    }
  }, [open]);

  // Fetch logic
  React.useEffect(() => {
    let isMounted = true;
    const loadOptions = async () => {
      if (debouncedSearchTerm.length < 2) return;
      if (selectedOption && selectedOption.label === debouncedSearchTerm)
        return;

      setIsLoading(true);
      try {
        const results = await fetchOptions(debouncedSearchTerm);
        if (isMounted) {
          const uniqueResults = Array.from(
            new Map(results.map((item) => [item.value, item])).values(),
          );
          setOptions(uniqueResults);
        }
      } catch (error) {
        console.error("Failed to fetch options", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (open) loadOptions();
  }, [debouncedSearchTerm, open, fetchOptions, selectedOption]);

  // Sync external form resets
  React.useEffect(() => {
    if (!value) {
      setSelectedOption(null);
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }

    if (selectedOption && val !== selectedOption.label) {
      setSelectedOption(null);
      onChange(null, null);
    }
  };

  const handleSelect = (option: ComboboxOption<T>) => {
    setInputValue(option.label);
    setSelectedOption(option);
    onChange(option.value, option.rawData);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        {/*  3. Attach the ref to the wrapper div so we can measure it! */}
        <div className="relative w-full" ref={containerRef}>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (inputValue.length > 0) setOpen(true);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-9 bg-background h-10 shadow-sm font-medium"
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        //  4. Force the Popover to use our exact pixel measurement!
        style={{ width: popoverWidth ? `${popoverWidth}px` : "100%" }}
        className="p-0 shadow-lg border-border"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {inputValue.length < 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Please type at least 2 characters to search...
              </div>
            )}
            {!isLoading && options.length === 0 && inputValue.length >= 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            )}

            <CommandGroup>
              {!isLoading &&
                options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                    className="flex items-center justify-between cursor-pointer px-1 py-2 rounded-md text-sm data-[selected='true']:bg-muted"
                  >
                    <div className="flex items-center justify-start w-full">
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 text-primary shrink-0",
                          value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="font-medium text-xs truncate">
                        {option.label}

                        {option.subLabel && (
                          <span className="text-xs text-muted-foreground ml-1 shrink-0">
                            {option.subLabel}
                          </span>
                        )}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
