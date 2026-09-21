'use client';
import { useState } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@nexus_ds/react';

export default function PaginationDemo() {
  const [page, setPage] = useState(1);
  function navigate(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    setPage(Math.max(1, Math.min(5, next)));
  }
  return (
    <div className="nx:space-y-4">
      <p role="status">
        Page {page} of 5 · Showing items {(page - 1) * 10 + 1}–{page * 10}
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#previous"
              onClick={(event) => navigate(event, page - 1)}
              aria-disabled={page === 1}
            />
          </PaginationItem>
          {[1, 2, 3, 4, 5].map((value) => (
            <PaginationItem key={value}>
              <PaginationLink
                href={'#page-' + value}
                isActive={page === value}
                onClick={(event) => navigate(event, value)}
              >
                {value}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#next"
              onClick={(event) => navigate(event, page + 1)}
              aria-disabled={page === 5}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
