'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbMenuTrigger,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/breadcrumb/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';

export default function BreadcrumbWithMenu() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbMenuTrigger aria-label="Show other workspaces" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href="#personal">Personal</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#team">Team</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#archived">Archived</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Billing</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
