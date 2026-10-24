import {
  Button as MuiButton,
  Card as MuiCard,
  CardContent as MuiCardContent,
  FormControlLabel,
  Stack,
  Switch as MuiSwitch,
  TextField,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Switch,
} from '@nxds/react';

const description = 'Manage how your team works together.';

export function MuiSettings({
  theme,
  values,
  onChange,
  invalid,
  disabled,
  onSave,
  saved,
}) {
  return (
    <ThemeProvider theme={theme}>
      <MuiCard variant="outlined" data-external-ui="mui" data-specimen="mui">
        <MuiCardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Stack
            component="form"
            spacing={2.5}
            onSubmit={onSave}
            noValidate
            aria-label="MUI workspace settings"
          >
            <div>
              <Typography variant="h6" component="h2">
                Workspace settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </div>
            <TextField
              id="mui-workspace-name"
              label="Workspace name"
              size="small"
              value={values.name}
              onChange={(event) => onChange('name', event.target.value)}
              error={invalid}
              disabled={disabled}
              helperText={
                invalid
                  ? 'Enter a workspace name.'
                  : 'Visible to everyone in your workspace.'
              }
              fullWidth
            />
            <TextField
              id="mui-workspace-email"
              label="Contact email"
              size="small"
              type="email"
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
              disabled={disabled}
              fullWidth
            />
            <FormControlLabel
              control={
                <MuiSwitch
                  checked={values.digest}
                  onChange={(_, checked) => onChange('digest', checked)}
                  disabled={disabled}
                />
              }
              label="Weekly activity digest"
            />
            <div>
              <MuiButton type="submit" variant="contained" disabled={disabled}>
                Save changes
              </MuiButton>
            </div>
            <Typography role="status" variant="caption" color="text.secondary">
              {saved
                ? 'Settings saved in this preview.'
                : 'Local preview. Nothing is sent.'}
            </Typography>
          </Stack>
        </MuiCardContent>
      </MuiCard>
    </ThemeProvider>
  );
}

export function NexusSettings({
  values,
  onChange,
  invalid,
  disabled,
  onSave,
  saved,
}) {
  return (
    <Card data-specimen="nexus">
      <CardHeader>
        <CardTitle asChild>
          <h2>Workspace settings</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="nx:space-y-5"
          onSubmit={onSave}
          noValidate
          aria-label="Nexus workspace settings"
        >
          <Field data-invalid={invalid}>
            <FieldLabel htmlFor="nexus-workspace-name">
              Workspace name
            </FieldLabel>
            <Input
              id="nexus-workspace-name"
              value={values.name}
              onChange={(event) => onChange('name', event.target.value)}
              aria-invalid={invalid}
              aria-describedby="nexus-name-hint"
              disabled={disabled}
            />
            {invalid ? (
              <FieldError id="nexus-name-hint">
                Enter a workspace name.
              </FieldError>
            ) : (
              <FieldDescription id="nexus-name-hint">
                Visible to everyone in your workspace.
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="nexus-workspace-email">
              Contact email
            </FieldLabel>
            <Input
              id="nexus-workspace-email"
              type="email"
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field orientation="horizontal">
            <Switch
              id="nexus-workspace-digest"
              checked={values.digest}
              onCheckedChange={(checked) => onChange('digest', checked)}
              disabled={disabled}
            />
            <FieldLabel htmlFor="nexus-workspace-digest">
              Weekly activity digest
            </FieldLabel>
          </Field>
          <Button type="submit" disabled={disabled}>
            Save changes
          </Button>
          <p
            role="status"
            className="nx:m-0 nx:typography-body-small nx:text-muted-foreground"
          >
            {saved
              ? 'Settings saved in this preview.'
              : 'Local preview. Nothing is sent.'}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
