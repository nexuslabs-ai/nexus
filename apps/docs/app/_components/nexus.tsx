'use client';

/**
 * @nexus/react ships without the "use client" directive at the bundle
 * level, so Next's RSC compiler refuses direct imports from server
 * components. This barrel re-exports the surface as a single client
 * module, so server pages render Nexus components as client islands.
 */
export {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@nexus/react';
