import { useId, useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  NativeSelectOption,
} from '@nxds/react';

export function NexusInvite({ onInvite }) {
  const id = useId();
  const [sent, setSent] = useState('');
  function invite(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email')).trim();
    onInvite({
      email,
      role: data.get('role'),
      name: email.split('@')[0],
      status: 'Invited',
    });
    setSent(email);
    event.currentTarget.reset();
  }
  return (
    <Card className="nx:gap-4 nx:py-4" data-comparison-nexus="true">
      <CardHeader className="nx:px-4">
        <Badge variant="outline" className="nx:w-fit">
          Added with Nexus
        </Badge>
        <CardTitle>Bring your team in.</CardTitle>
        <CardDescription>Invite someone to this workspace.</CardDescription>
      </CardHeader>
      <CardContent className="nx:px-4">
        <form onSubmit={invite} className="nx:flex nx:flex-col nx:gap-4">
          <FieldGroup className="nx:gap-4">
            <Field>
              <FieldLabel htmlFor={`${id}-email`}>Email address</FieldLabel>
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                placeholder="alex@company.com"
                required
              />
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor={`${id}-role`}>Role</FieldLabel>
              <NativeSelect id={`${id}-role`} name="role" defaultValue="Editor">
                <NativeSelectOption value="Editor">Editor</NativeSelectOption>
                <NativeSelectOption value="Viewer">Viewer</NativeSelectOption>
                <NativeSelectOption value="Admin">Admin</NativeSelectOption>
              </NativeSelect>
            </Field>
          </FieldGroup>
          <Button type="submit">Invite teammate</Button>
          {sent ? (
            <Alert role="status" variant="success">
              <AlertTitle>Added to this preview</AlertTitle>
              <AlertDescription>
                {sent} now appears in the team list. No email was sent.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
              Try it here. No email is sent.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
