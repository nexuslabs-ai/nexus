import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  emptyMemberQuery,
  MemberDirectory,
  type MemberPage,
  type MemberQuery,
  type MemberResults,
} from './member-directory';
import recipeSource from './member-directory.tsx?raw';
import {
  readMemberQuery,
  useMemberQueryUrl,
  writeMemberQuery,
} from './member-query-url';
import { members } from './quick-fixtures';

type LoadMembers = (
  query: MemberQuery,
  signal: AbortSignal
) => Promise<MemberPage>;
const loadMembers: LoadMembers = async (query, signal) => {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 150);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
  const filtered = members.filter(
    (member) =>
      member.name.toLowerCase().includes(query.name.toLowerCase()) &&
      (!query.status || member.status === query.status) &&
      (!query.team || member.team === query.team)
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 3));
  const page = Math.min(query.page, pageCount);
  return {
    members: filtered
      .slice((page - 1) * 3, page * 3)
      .map((member) => ({ ...member, id: member.name })),
    total: filtered.length,
    page,
    pageCount,
  };
};

// Story-only async service harness. A consuming application uses its existing query cache or loader.
function ConnectedDirectory({
  load,
  query,
  onQueryChange,
}: {
  load: LoadMembers;
  query: MemberQuery;
  onQueryChange: (query: MemberQuery) => void;
}) {
  const [attempt, retry] = React.useReducer((value: number) => value + 1, 0);
  const [response, setResponse] = React.useState<{
    key: string;
    results: MemberResults;
  } | null>(null);
  const key = JSON.stringify([query, attempt]);
  React.useEffect(() => {
    const controller = new AbortController();
    let current = true;
    load(query, controller.signal).then(
      (data) => {
        if (current) setResponse({ key, results: { state: 'ready', data } });
      },
      () => {
        if (current)
          setResponse({
            key,
            results: {
              state: 'error',
              message: 'We couldn’t load members. Try again.',
            },
          });
      }
    );
    return () => {
      current = false;
      controller.abort();
    };
  }, [key, load, query]);
  const results: MemberResults =
    response?.key === key ? response.results : { state: 'loading' };
  return (
    <MemberDirectory
      query={query}
      onQueryChange={onQueryChange}
      results={results}
      onRetry={retry}
    />
  );
}
function DirectoryExample({ load }: { load: LoadMembers }) {
  const [query, setQuery] = React.useState(emptyMemberQuery);
  return (
    <ConnectedDirectory load={load} query={query} onQueryChange={setQuery} />
  );
}
function UrlDirectory({ load }: { load: LoadMembers }) {
  const [query, changeQuery] = useMemberQueryUrl();
  return (
    <ConnectedDirectory load={load} query={query} onQueryChange={changeQuery} />
  );
}
const meta = {
  title: 'Internal/Filtering/Request and URL states',
  tags: ['!dev', '!autodocs'],
  component: DirectoryExample,
  args: { load: fn(loadMembers) },
  decorators: [
    (Story) => (
      <main className="nx:mx-auto nx:w-full nx:max-w-3xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      source: { code: recipeSource, language: 'tsx', type: 'code' },
      story: { inline: false, height: 620 },
      description: {
        component:
          'Experimental recipe: a member directory with simple, implicit matching. Copy member-directory.tsx; connect query, results and retry to your application loader. Stories simulate asynchronous requests with local data, including loading, failure, pagination and stale responses. They are not a live backend integration. URL persistence is an optional separate recipe; open that story in its own tab to inspect its URL.',
      },
    },
  },
} satisfies Meta<typeof DirectoryExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const PaginationAndFiltering: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Page 1 of 2')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(await canvas.findByText('Page 2 of 2')).toBeVisible();
    await userEvent.selectOptions(canvas.getByLabelText('Team'), 'Design');
    await expect(await canvas.findByText('Page 1 of 1')).toBeVisible();
    await expect(canvas.getByRole('status')).toHaveTextContent('3 members');
    await userEvent.type(canvas.getByLabelText('Name'), 'no matching name');
    await expect(await canvas.findByText('No matching members')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset filters' })
    );
    await expect(await canvas.findByText('Page 1 of 2')).toBeVisible();
  },
};
export const FailureAndRetry: Story = {
  args: { load: fn(loadMembers) },
  beforeEach: ({ args }) => {
    (args.load as ReturnType<typeof fn<LoadMembers>>).mockRejectedValueOnce(
      new Error('offline')
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'couldn’t load members'
    );
    await expect(
      canvas.queryByText('No matching members')
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(await canvas.findByText('Page 1 of 2')).toBeVisible();
  },
};
export const LatestRequestWins: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Page 1 of 2')).toBeVisible();
    const pending: Array<{
      resolve: (value: MemberPage) => void;
      reject: (reason: Error) => void;
    }> = [];
    const loader = args.load as ReturnType<typeof fn<LoadMembers>>;
    loader.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          pending.push({ resolve, reject });
        })
    );
    await userEvent.selectOptions(canvas.getByLabelText('Status'), 'Active');
    await waitFor(() => expect(pending).toHaveLength(1));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Loading members'
    );
    await userEvent.selectOptions(canvas.getByLabelText('Status'), 'Invited');
    await waitFor(() => expect(pending).toHaveLength(2));
    const newest = await loadMembers(
      { ...emptyMemberQuery, status: 'Invited' },
      new AbortController().signal
    );
    pending[1]!.resolve(newest);
    await expect(await canvas.findByText('Maya Chen')).toBeVisible();
    pending[0]!.resolve(
      await loadMembers(emptyMemberQuery, new AbortController().signal)
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('2 members');
    await expect(canvas.queryByText('Priya Shah')).not.toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByLabelText('Status'), 'Active');
    await userEvent.selectOptions(canvas.getByLabelText('Status'), 'Invited');
    await waitFor(() => expect(pending).toHaveLength(4));
    pending[3]!.resolve(newest);
    await expect(await canvas.findByText('Maya Chen')).toBeVisible();
    pending[2]!.reject(new Error('stale failure'));
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
export const UrlPersistence: Story = {
  render: (args) => <UrlDirectory {...args} />,
  beforeEach: () => {
    const original = window.location.href;
    const seed = writeMemberQuery(new URL(original), {
      ...emptyMemberQuery,
      team: 'Design',
    });
    window.history.replaceState(null, '', seed);
    return () => window.history.replaceState(null, '', original);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const originalId = new URL(window.location.href).searchParams.get('id');
    await expect(canvas.getByLabelText('Team')).toHaveValue('Design');
    await expect(await canvas.findByText('3 members')).toBeVisible();
    await userEvent.selectOptions(canvas.getByLabelText('Status'), 'Invited');
    await expect(await canvas.findByText('1 member')).toBeVisible();
    await expect(new URL(window.location.href).searchParams.get('id')).toBe(
      originalId
    );
    window.history.back();
    await waitFor(() =>
      expect(canvas.getByLabelText('Status')).toHaveValue('')
    );
    await expect(await canvas.findByText('3 members')).toBeVisible();
    window.history.forward();
    await waitFor(() =>
      expect(canvas.getByLabelText('Status')).toHaveValue('Invited')
    );
    await expect(await canvas.findByText('1 member')).toBeVisible();
    const entries = window.history.length;
    await userEvent.type(canvas.getByLabelText('Name'), 'Ma');
    await expect(window.history.length).toBe(entries);
    await expect(
      new URL(window.location.href).searchParams.get('members.name')
    ).toBe('Ma');
    const malformed = new URL(window.location.href);
    malformed.searchParams.set('members.page', '-3');
    malformed.searchParams.set('members.status', 'not-a-status');
    await expect(readMemberQuery(malformed)).toMatchObject({
      page: 1,
      status: '',
      team: 'Design',
    });
  },
};
export const NarrowContainer: Story = {
  decorators: [
    (Story) => (
      <div className="nx:w-full nx:max-w-sm">
        <Story />
      </div>
    ),
  ],
};
