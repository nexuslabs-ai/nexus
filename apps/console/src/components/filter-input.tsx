import { InputGroup, InputGroupAddon, InputGroupInput } from '@nexus_ds/react';
import { IconSearch } from '@tabler/icons-react';

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * The shared search box for the console's table and card-list views. Controlled:
 * the parent owns the query string.
 */
export function FilterInput({
  value,
  onChange,
  placeholder,
}: FilterInputProps) {
  return (
    <InputGroup className="nx:max-w-xs">
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      <InputGroupInput
        placeholder={placeholder ?? 'Filter…'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder ?? 'Filter'}
      />
    </InputGroup>
  );
}
