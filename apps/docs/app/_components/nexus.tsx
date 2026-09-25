'use client';

/**
 * @nexus_ds/react ships without the "use client" directive at the bundle
 * level, so Next's RSC compiler refuses direct imports from server
 * components. This barrel re-exports the surface as a single client
 * module, so server pages render Nexus components as client islands.
 */
export {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from '@nexus_ds/react';
