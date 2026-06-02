import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ContactsView } from './contacts-search';

export type SavedView = {
  id: string;
  name: string;
  view: ContactsView;
};

type SavedViewsState = {
  views: SavedView[];
  save: (name: string, view: ContactsView) => void;
  remove: (id: string) => void;
};

/**
 * User-saved Contacts views (a named view + status-filter combo), persisted to
 * localStorage. Applying one navigates the table to its search params; this
 * store only owns the saved list, not the live view (which lives in the URL).
 */
export const useSavedViews = create<SavedViewsState>()(
  persist(
    (set) => ({
      views: [],
      save: (name, view) =>
        set((state) => ({
          views: [...state.views, { id: crypto.randomUUID(), name, view }],
        })),
      remove: (id) =>
        set((state) => ({ views: state.views.filter((v) => v.id !== id) })),
    }),
    { name: 'nexus-console-crm-views' }
  )
);
