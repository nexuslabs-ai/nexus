import React from 'react';

import {
  Button as MuiButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  Button as AntButton,
  Input,
  Select,
  Typography as AntTypography,
} from 'antd';

export const exampleNames = {
  billing: 'Billing & subscription',
  article: 'Help article',
  team: 'Team management',
  product: 'Product and order summary',
};

export function ComparisonExample({
  example,
  library,
  action,
  message,
  onAction,
}) {
  const isMui = library === 'MUI';
  const title = exampleNames[example];
  const inputLabel =
    example === 'team'
      ? 'Email address'
      : example === 'article'
        ? 'Search documentation'
        : example === 'product'
          ? 'Delivery postcode'
          : 'Billing email';
  const input = isMui ? (
    <TextField
      data-probe="input"
      label={inputLabel}
      size="small"
      fullWidth
      defaultValue={
        example === 'team'
          ? 'alex@example.com'
          : example === 'billing'
            ? 'billing@acme.design'
            : ''
      }
    />
  ) : (
    <div className="comparison-field">
      <label htmlFor="example-input">{inputLabel}</label>
      <Input
        data-probe="input"
        id="example-input"
        defaultValue={
          example === 'team'
            ? 'alex@example.com'
            : example === 'billing'
              ? 'billing@acme.design'
              : ''
        }
      />
    </div>
  );
  const options =
    example === 'team'
      ? ['Editor', 'Viewer']
      : example === 'product'
        ? ['Graphite', 'Silver']
        : ['Monthly', 'Yearly'];
  const select = isMui ? (
    <TextField
      select
      label={
        example === 'team'
          ? 'Role'
          : example === 'product'
            ? 'Finish'
            : 'Billing period'
      }
      defaultValue={options[0]}
      size="small"
      fullWidth
    >
      {options.map((value) => (
        <MenuItem key={value} value={value}>
          {value}
        </MenuItem>
      ))}
    </TextField>
  ) : (
    <Select
      aria-label={
        example === 'team'
          ? 'Role'
          : example === 'product'
            ? 'Finish'
            : 'Billing period'
      }
      defaultValue={options[0]}
      options={options.map((value) => ({ value, label: value }))}
    />
  );
  const hostButton = isMui ? (
    <MuiButton data-probe="button" variant="outlined" onClick={onAction}>
      Save changes
    </MuiButton>
  ) : (
    <AntButton data-probe="button" onClick={onAction}>
      Save changes
    </AntButton>
  );
  const content = {
    billing: (
      <>
        <div className="comparison-eyebrow">YOUR SUBSCRIPTION</div>
        <h2 data-probe="help-title">Team plan</h2>
        <p data-probe="help-copy">
          <strong className="comparison-price">$29</strong> / member per month
        </p>
        <ul data-probe="help-list">
          <li>Unlimited projects and shared libraries</li>
          <li>Version history and priority support</li>
          <li>Advanced team permissions</li>
        </ul>
        <p>Renews November 1. Cancel any time.</p>
        <ul>
          <li>3 active seats on your workspace</li>
        </ul>
      </>
    ),
    article: (
      <>
        <div className="comparison-eyebrow">GUIDES / GETTING STARTED</div>
        <h2 data-probe="help-title">Set up your first workspace</h2>
        <p data-probe="help-copy">
          Bring your team and projects together in one shared space.
        </p>
        <h3>Before you start</h3>
        <p>You’ll need an account and a name for your workspace.</p>
        <ol data-probe="help-list">
          <li>Create a workspace from your dashboard.</li>
          <li>Invite your teammates by email.</li>
          <li>Choose permissions and publish your first project.</li>
        </ol>
        <h3>Need a hand?</h3>
        <p>Our support team can help you get started.</p>
      </>
    ),
    team: (
      <>
        <div className="comparison-eyebrow">WORKSPACE MEMBERS</div>
        <div className="comparison-member">
          <span>Jordan Lee</span>
          <span>Owner</span>
        </div>
        <div className="comparison-member">
          <span>Sam Patel</span>
          <span>Editor</span>
        </div>
        <h3 data-probe="help-title">Invite someone to your team</h3>
        <p data-probe="help-copy">
          Editors can collaborate across the workspace.
        </p>
        <ul data-probe="help-list">
          <li>Create and edit projects</li>
          <li>Comment and share feedback</li>
        </ul>
      </>
    ),
    product: (
      <>
        <div
          className="comparison-product-art"
          aria-label="Graphite desk lamp illustration"
        >
          <span>◒</span>
        </div>
        <div className="comparison-eyebrow">STUDIO COLLECTION</div>
        <h2 data-probe="help-title">Arc desk lamp</h2>
        <p data-probe="help-copy">
          A softer light for your workspace. <strong>$129</strong>
        </p>
        <ul data-probe="help-list">
          <li>Dimmable warm light</li>
          <li>Recycled aluminium body</li>
          <li>Free delivery · 2 year warranty</li>
        </ul>
      </>
    ),
  }[example];
  return (
    <div className="comparison-screen">
      {isMui ? (
        <Typography data-probe="title" variant="h6">
          {title}
        </Typography>
      ) : (
        <AntTypography.Title data-probe="title" level={4}>
          {title}
        </AntTypography.Title>
      )}
      <section className="comparison-help">{content}</section>
      {example === 'billing' && (
        <div className="comparison-member">
          <span>Visa ending in 4242</span>
          <span>3 members · $87 / month</span>
        </div>
      )}
      {example === 'product' && (
        <div className="comparison-member">
          <span>Order total · delivery included</span>
          <strong>$129</strong>
        </div>
      )}
      {example === 'team' ? (
        <dialog
          open
          className="comparison-invite-dialog"
          aria-label="Invite a teammate"
        >
          <strong>Invite a teammate</strong>
          {input}
          {select}
          <div className="comparison-actions">
            {hostButton}
            {action}
          </div>
        </dialog>
      ) : (
        <>
          <div className="comparison-fields">
            {input}
            {example !== 'article' && select}
          </div>
          <div className="comparison-actions">
            {hostButton}
            {action}
          </div>
        </>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
