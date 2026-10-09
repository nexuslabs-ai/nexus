import { useState } from 'react';

import { IconChevronDown } from '@tabler/icons-react';

import { Button } from '../../components/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '../../components/button-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/dropdown-menu';

export function ReplyExample() {
  const [result, setResult] = useState('Demo only — no email will be sent.');
  const sendAndArchive = () =>
    setResult('Demo: reply sent and conversation archived.');
  const sendOnly = () =>
    setResult('Demo: reply sent. Conversation stays in the inbox.');
  return (
    <Card>
      <CardHeader>
        <CardDescription>Draft reply · Project update</CardDescription>
        <CardTitle>Ready for your review</CardTitle>
      </CardHeader>
      <CardContent className="nx:flex nx:flex-col nx:items-start nx:gap-4">
        <p className="nx:typography-body-default">
          Hi Alex, the updated proposal is ready. Let me know what you think.
        </p>
        <ButtonGroup aria-label="Send email">
          <Button onClick={sendAndArchive}>Send &amp; archive</Button>
          <ButtonGroupSeparator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" aria-label="Send options">
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={sendOnly}>Send only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
        <p
          role="status"
          className="nx:typography-body-small nx:text-muted-foreground"
        >
          {result}
        </p>
      </CardContent>
    </Card>
  );
}
