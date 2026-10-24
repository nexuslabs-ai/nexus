import { useEffect, useId, useState } from 'react';

import { Button, Card, Label, Switch } from '@nxds/react';

import './source-audit.css';

// Source-reviewed boundaries. Container ownership never certifies its descendants.
const boundaries = [
  [
    '.story-header',
    'Custom header composition using Nexus utilities and Buttons',
    'composition',
  ],
  [
    '.dock-chapter-stage',
    'Custom sticky chapter layout and scroll behavior',
    'composition',
  ],
  [
    '.dock-chapter-heading',
    'Custom heading sizing and CTA layout',
    'composition',
  ],
  [
    '.story-header nav a, .story-header > a',
    'Native link composed with Nexus utilities; not a Nexus navigation component',
    'composition',
  ],
  [
    '.story-box-grid',
    'Custom responsive grid and bottom gradient mask',
    'composition',
  ],
  [
    '.showcase-card',
    'Nexus Card with custom surface, radius, shadow and responsive layout overrides',
    'mixed',
  ],
  [
    '.showcase-body',
    'Custom block composition and responsive density; controls inside are Nexus',
    'composition',
  ],
  [
    '.showcase-person, .showcase-metric, .showcase-price, .showcase-chart-summary, .showcase-prose, .showcase-status, .showcase-fieldset > legend',
    'Application typography/composition; person rows have a Nexus Item replacement',
    'custom',
  ],
  [
    '.showcase-field, .showcase-check, .showcase-member',
    'Replaceable field or row layout; Nexus Field, ChoiceRow and Item are available',
    'replaceable',
  ],
  [
    '.showcase-message',
    'Replaceable message styling; Nexus Message and Bubble are available',
    'replaceable',
  ],
  [
    '.showcase-file, .showcase-mail-item',
    'Nexus Button with custom list-item styling',
    'mixed',
  ],
  [
    '.showcase-team-permissions, .showcase-delivery',
    'Custom section border and spacing around Nexus controls',
    'mixed',
  ],
  [
    '.context-dock, .story-segmented, .story-test-segmented-dock',
    'Custom dock, tool selection and motion; not Nexus Tabs',
    'custom',
  ],
  [
    '.context-panel',
    'Custom expanding dock panel and surface animation',
    'custom',
  ],
  [
    '.dialkit-panel, .dialkit-trigger, .context-panel-content, .story-test-tool-controls, .story-test-option-fields',
    'External DialKit: visitor controls are migration candidates; developer comparison studio is intentional tooling',
    'external',
  ],
  [
    '.story-comparison',
    'Custom before/after composition with a native range input',
    'custom',
  ],
  [
    '.story-empty-box',
    'Custom placeholder surface; not a Nexus component',
    'custom',
  ],
  [
    '.framework-flow',
    'Custom framework diagram layout, SVG traces and interactions',
    'custom',
  ],
  [
    '.framework-token, .chip-token-container, .chip-core, .chip-module, .framework-core, .framework-destination, .foundation-core',
    'Custom diagram surface and typography',
    'custom',
  ],
  [
    '.story-specimen, .story-test-card, .story-test-caption',
    'Custom story demonstration layout; the test subject uses Nexus',
    'composition',
  ],
  [
    '.story-footer',
    'Custom footer composition and native links',
    'composition',
  ],
  [
    '.story-page button:not([data-slot]), .story-page input:not([data-slot]), .story-page select:not([data-slot])',
    'Native/custom control authored in the prototype, outside Nexus',
    'custom',
  ],
  [
    '.context-dock svg:not(.tabler-icon):not([data-slot]), .framework-flow svg:not(.tabler-icon):not([data-slot]), .chip-traces, .foundation-traces',
    'Custom or third-party SVG; inspect its enclosing component',
    'custom',
  ],
  [
    '.story-page [data-prototype-icon]',
    'Consumer-supplied icon: supported Nexus extension point, not a missing Nexus component',
    'consumer',
  ],
];

export function SourceAudit() {
  const id = useId();
  const [enabled, setEnabled] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(
    'Hover or focus a red outline to inspect its source.'
  );

  useEffect(() => {
    if (!enabled) return;
    const marked = new Set();
    function annotate() {
      for (const element of marked) {
        element.removeAttribute('data-nexus-audit');
        element.removeAttribute('data-nexus-audit-kind');
      }
      marked.clear();
      for (const [selector, label, kind] of boundaries) {
        document.querySelectorAll(selector).forEach((element) => {
          if (element.closest('.nexus-source-audit')) return;
          // Radix form bridges are hidden inputs, never visitor-facing controls.
          if (
            element.matches(
              'input[type="hidden"], input[aria-hidden="true"][tabindex="-1"]'
            )
          )
            return;
          marked.add(element);
          element.setAttribute('data-nexus-audit', label);
          element.setAttribute('data-nexus-audit-kind', kind);
        });
      }
    }
    function inspect(event) {
      const element = event.target.closest?.('[data-nexus-audit]');
      if (element) setDetail(element.getAttribute('data-nexus-audit'));
    }
    annotate();
    const observer = new MutationObserver(annotate);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('pointerover', inspect);
    document.addEventListener('focusin', inspect);
    return () => {
      observer.disconnect();
      document.removeEventListener('pointerover', inspect);
      document.removeEventListener('focusin', inspect);
      for (const element of marked) {
        element.removeAttribute('data-nexus-audit');
        element.removeAttribute('data-nexus-audit-kind');
      }
    };
  }, [enabled]);

  return (
    <Card className="nexus-source-audit nx:p-3" aria-label="Nexus source audit">
      <div className="nx:flex nx:items-center nx:gap-3">
        <Switch id={id} checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor={id}>Mark non-Nexus UI</Label>
        <Button
          size="sm"
          variant="ghost"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Hide' : 'Details'}
        </Button>
      </div>
      {expanded && (
        <div className="nx:mt-3 nx:typography-body-small">
          <p className="source-audit-key">
            Red identifies ownership outside Nexus, not a defect count.
          </p>
          <p>{detail}</p>
          <p>
            Baseline: fields, choices, people/list rows and messages now use
            Nexus in the new showcase. Choose Original in Dock studio to
            compare.
          </p>
          <p>
            Replaceable UI and style overrides are migration work. Page layout,
            consumer icons and deliberate external demos are separate ownership
            categories. A red container can contain genuine Nexus components.
            The map is source-reviewed; DOM slots alone are not certification.
          </p>
        </div>
      )}
    </Card>
  );
}
