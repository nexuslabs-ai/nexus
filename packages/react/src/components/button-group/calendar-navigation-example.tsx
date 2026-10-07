import { useState } from 'react';

import { Button } from '../button';

import { ButtonGroup } from './button-group';

export function CalendarNavigationExample() {
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const previousMonth = () =>
    setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1));
  const nextMonth = () =>
    setMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1));
  const resetMonth = () =>
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  return (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <span className="nx:typography-body-small nx:text-muted-foreground">
        Team calendar
      </span>
      <span role="status" className="nx:typography-label-default">
        {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </span>
      <ButtonGroup aria-label="Calendar navigation">
        <Button variant="outline" onClick={previousMonth}>
          Previous
        </Button>
        <Button variant="outline" onClick={resetMonth}>
          Today
        </Button>
        <Button variant="outline" onClick={nextMonth}>
          Next
        </Button>
      </ButtonGroup>
    </div>
  );
}
