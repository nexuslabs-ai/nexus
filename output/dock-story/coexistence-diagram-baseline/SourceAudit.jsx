import { useEffect, useId, useState } from 'react';

import { Button, Card, Label, Switch } from '@nxds/react';

import './source-audit.css';

// Source-reviewed boundaries. Container ownership never certifies its descendants.
const boundaries = [
  [
    '[data-external-ui]',
    'Intentional coexistence example: real MUI, Ant Design or shadcn components; not Nexus components',
    'external',
  ],
  [
    '.live-comparison, .workspace-columns, .workspace-column',
    'Application comparison and workspace layout; library components and Nexus addition keep their own styling',
    'composition',
  ],
  [
    '[data-slot="nexus-property-controls"]',
    'Nexus PropertySlider and compact AppearanceColorField with normal Field, NativeSelect and Switch composition; library-owned behavior and styling',
    'composition',
  ],
  [
    '.compact-property-controls',
    'Compact application composition of Nexus Field, NativeSelect, Slider, Input, Switch and AppearanceColorField; property-row presentation is local',
    'composition',
  ],
  [
    '.nexus-hug-dock',
    'Nexus Dock with a local content-width comparison; selection, focus and panel behavior remain Nexus-owned',
    'composition',
  ],
  [
    '.appearance-choices',
    'Application picker layout and token specimens composed with Nexus Field and ToggleGroup; choices use core appearance options',
    'composition',
  ],
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
    const documents = new Map();
    function observeDocument(doc) {
      if (!doc?.body || documents.has(doc)) return;
      const observer = new MutationObserver(annotate);
      observer.observe(doc.body, { childList: true, subtree: true });
      documents.set(doc, observer);
      doc.addEventListener('pointerover', inspect);
      doc.addEventListener('focusin', inspect);
    }
    function annotate() {
      for (const element of marked) {
        element.removeAttribute('data-nexus-audit');
        element.removeAttribute('data-nexus-audit-kind');
      }
      marked.clear();
      const currentDocuments = new Set([document]);
      document
        .querySelectorAll(
          '.appearance-preview-frame, .library-comparison-frame'
        )
        .forEach((frame) => {
          if (frame.contentDocument)
            currentDocuments.add(frame.contentDocument);
        });
      for (const [doc, observer] of documents) {
        if (currentDocuments.has(doc)) continue;
        observer.disconnect();
        doc.removeEventListener('pointerover', inspect);
        doc.removeEventListener('focusin', inspect);
        documents.delete(doc);
      }
      for (const doc of currentDocuments) observeDocument(doc);
      for (const doc of documents.keys()) {
        for (const [selector, label, kind] of boundaries) {
          doc.querySelectorAll(selector).forEach((element) => {
            if (element.closest('.nexus-source-audit')) return;
            // Radix form bridges are hidden inputs, never visitor-facing controls.
            if (
              element.matches(
                'input[type="hidden"], input[aria-hidden="true"][tabindex="-1"]'
              )
            )
              return;
            // This input is source-owned by NexusAppearanceColorField (verified),
            // unlike arbitrary native controls inside a data-slot ancestor.
            if (
              element.matches(
                '[data-slot="appearance-color-field"] input[type="color"]'
              )
            )
              return;
            marked.add(element);
            element.setAttribute('data-nexus-audit', label);
            element.setAttribute('data-nexus-audit-kind', kind);
            if (
              element.matches('.context-panel-content') &&
              element.querySelector('.nexus-appearance-controls')
            ) {
              element.setAttribute(
                'data-nexus-audit',
                'Application panel layout containing genuine Nexus appearance controls'
              );
              element.setAttribute('data-nexus-audit-kind', 'composition');
            }
            if (
              element.matches('.showcase-card') &&
              element.closest('.appearance-preview')
            ) {
              element.setAttribute(
                'data-nexus-audit',
                'Nexus Card surface with application-owned grid sizing and scrolling'
              );
              element.setAttribute('data-nexus-audit-kind', 'composition');
            }
          });
        }
      }
    }
    function inspect(event) {
      const element = event.target.closest?.('[data-nexus-audit]');
      if (element) setDetail(element.getAttribute('data-nexus-audit'));
    }
    annotate();
    document.addEventListener('load', annotate, true);
    return () => {
      document.removeEventListener('load', annotate, true);
      for (const [doc, observer] of documents) {
        observer.disconnect();
        doc.removeEventListener('pointerover', inspect);
        doc.removeEventListener('focusin', inspect);
      }
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
            Nexus in the new showcase. Customize now offers real Nexus
            appearance controls and an isolated preview. Use Showcase and
            Customize in Dock studio to compare earlier versions.
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
