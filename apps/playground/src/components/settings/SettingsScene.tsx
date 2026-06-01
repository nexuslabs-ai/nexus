import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from '@nexus/react';

import type { ThemeConfig } from '../../hooks/useTheme';

import { AppearanceSettings } from './AppearanceSettings';

type SettingsSceneProps = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
};

/** Placeholder for tabs whose content lands in a later phase of this PR. */
function ComingUp({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>This section is part of the scene.</CardDescription>
      </CardHeader>
    </Card>
  );
}

/**
 * The composed Settings scene — a realistic product screen assembled entirely
 * from @nexus/react. Its Appearance tab drives the live theme; the others are
 * realistic settings forms. Layers background → container (Card) → popover /
 * overlay (Select / AlertDialog) to exercise the surface contract.
 */
export function SettingsScene({ theme, setTheme }: SettingsSceneProps) {
  const handleSave = () => {
    toast.success('Settings saved', {
      description: 'Your preferences have been updated.',
    });
  };

  return (
    <div className="nx:mx-auto nx:max-w-3xl nx:space-y-6 nx:p-6">
      <div className="nx:space-y-1">
        <h2 className="nx:typography-heading-large nx:text-foreground">
          Settings
        </h2>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Manage your profile, account, notifications, and appearance.
        </p>
      </div>

      <Tabs defaultValue="appearance" className="nx:gap-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ComingUp title="Profile" />
        </TabsContent>
        <TabsContent value="account">
          <ComingUp title="Account" />
        </TabsContent>
        <TabsContent value="notifications">
          <ComingUp title="Notifications" />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSettings theme={theme} setTheme={setTheme} />
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="nx:flex nx:justify-end nx:gap-3">
        <Button variant="outline" onClick={() => toast('Changes discarded')}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save changes</Button>
      </div>
    </div>
  );
}
