import { InputGroup, InputGroupAddon, InputGroupInput } from '@nexus/react';
import { IconSearch } from '@tabler/icons-react';

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * The search box that filters the mobile card lists — mirrors the filter box
 * built into {@link DataTable} so the table (≥lg) and card (<lg) views share one
 * look. Controlled: the parent owns the query string.
 */
export function FilterInput({
  value,
  onChange,
  placeholder = 'Filter…',
}: FilterInputProps) {
  return (
    <InputGroup className="nx:max-w-xs">
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      <InputGroupInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </InputGroup>
  );
}
