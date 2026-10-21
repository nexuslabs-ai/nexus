import React from 'react';

import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { Skeleton, Tabs } from 'antd';

export function VerifiedConflictExample({ example }) {
  let content;
  if (example === 'ant-tabs')
    content = (
      <Tabs
        type="editable-card"
        items={[
          { key: 'overview', label: 'Overview', children: 'Project overview' },
          { key: 'team', label: 'Team', children: 'Team members' },
          { key: 'disabled', label: 'Disabled', disabled: true },
        ]}
      />
    );
  if (example === 'mui-accordion')
    content = (
      <Accordion defaultExpanded>
        <AccordionSummary>Project details</AccordionSummary>
        <AccordionDetails>
          Manage your project and invite your team.
        </AccordionDetails>
      </Accordion>
    );
  if (example === 'ant-skeleton')
    content = <Skeleton active={false} paragraph={false} />;
  if (example === 'native-form')
    content = (
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset>
          <legend>Invite a teammate</legend>
          <label>
            Email{' '}
            <input
              data-native-input
              type="email"
              defaultValue="alex@example.com"
            />
          </label>
          <p>
            <label>
              Role{' '}
              <select defaultValue="editor">
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
          </p>
          <button type="submit">Send invitation</button>
        </fieldset>
      </form>
    );
  if (example === 'native-links')
    content = (
      <nav aria-label="Project links">
        <p>
          <a data-native-link href="#overview">
            Project overview
          </a>
        </p>
        <p>
          <a href="#team">Team members</a>
        </p>
        <p>
          <a href="#settings">Workspace settings</a>
        </p>
      </nav>
    );
  if (example === 'native-content')
    content = (
      <section>
        <h2 data-native-heading>Get your team started</h2>
        <p>Three steps to your first project.</p>
        <ol>
          <li>Create your workspace</li>
          <li>Invite your teammates</li>
          <li>Share your first project</li>
        </ol>
      </section>
    );
  if (example === 'native-table')
    content = (
      <table data-native-table>
        <caption>Workspace members</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Alex Morgan</td>
            <td>Editor</td>
          </tr>
          <tr>
            <td>Sam Patel</td>
            <td>Viewer</td>
          </tr>
        </tbody>
      </table>
    );
  return <div className="comparison-screen">{content}</div>;
}
