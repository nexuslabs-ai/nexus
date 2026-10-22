'use client';
import { useId, useState } from 'react';

import { Button, Input } from '@nxds/react';
const projects = [
  ['Website refresh', 'In progress', 'Maya Chen', 'Oct 24'],
  ['Component library', 'In review', 'Alex Morgan', 'Oct 18'],
  ['Mobile onboarding', 'In progress', 'Sam Rivera', 'Oct 28'],
  ['Brand guidelines', 'Done', 'Maya Chen', 'Oct 12'],
  ['Customer portal', 'Planned', 'Alex Morgan', 'Nov 02'],
];
export function DataExample() {
  const id = useId();
  const [query, setQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const visible = projects.filter(
    ([name, status]) =>
      name.toLowerCase().includes(query.toLowerCase()) &&
      (!activeOnly || status === 'In progress')
  );
  return (
    <div className="example-data">
      <div className="example-heading">
        <span className="example-eyebrow">WORKSPACE / PROJECTS</span>
        <h3>Good work, in motion.</h3>
        <p>A little clarity for everything your team is building.</p>
      </div>
      <div className="example-metrics">
        <div>
          <strong>05</strong>
          <span>Total projects</span>
        </div>
        <div>
          <strong>02</strong>
          <span>In progress</span>
        </div>
        <div>
          <strong>01</strong>
          <span>Ready for review</span>
        </div>
      </div>
      <div className="example-toolbar">
        <label htmlFor={id}>
          Find a project
          <Input
            id={id}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects…"
          />
        </label>
        <Button
          variant="outline"
          aria-pressed={activeOnly}
          onClick={() => setActiveOnly(!activeOnly)}
        >
          {activeOnly ? 'Show all projects' : 'In progress only'}
        </Button>
      </div>
      <div className="example-table-wrap">
        <table className="example-table">
          <caption className="nx:sr-only">Studio North projects</caption>
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Status</th>
              <th scope="col">Owner</th>
              <th scope="col">Due</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(([name, status, owner, due]) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                <td>
                  <span className="example-badge">{status}</span>
                </td>
                <td>{owner}</td>
                <td>{due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="example-result" role="status">
        {visible.length
          ? `${visible.length} of ${projects.length} projects`
          : 'No projects found. Try another search.'}
      </p>
    </div>
  );
}
