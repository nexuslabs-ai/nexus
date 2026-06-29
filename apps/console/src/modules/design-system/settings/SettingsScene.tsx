import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nexus/react';

import { NexusAppearanceSettings } from '../appearance';

import { AccountTab } from './AccountTab';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';

/**
 * The composed Settings scene — a realistic product screen assembled entirely
 * from @nexus/react. Its Appearance tab drives the live theme; the others are
 * realistic settings forms. Layers background → container (Card) → popover /
 * overlay (Select / AlertDialog) to exercise the surface contract.
 */
export function SettingsScene() {
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
          <ProfileTab />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="appearance">
          <NexusAppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
