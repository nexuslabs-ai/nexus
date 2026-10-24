export const cssConflictExamples = {
  'ant-tabs': {
    label: 'Editable tabs',
    library: 'Ant Design',
    selector: '.ant-tabs-tab-remove',
    properties: ['paddingLeft', 'width', 'height'],
    css: '/* Tailwind Preflight */\n*, ::before, ::after { padding: 0; }',
    explanation:
      'Ant editable-card close buttons do not set padding. Preflight removes their browser padding, narrowing the close targets and tabs. The tabs still function.',
  },
  'mui-accordion': {
    label: 'Accordion',
    library: 'MUI',
    selector: '.MuiAccordionSummary-content',
    properties: ['fontFamily', 'fontSize', 'lineHeight', 'height'],
    css: '/* Tailwind Preflight */\nbutton, input, select, textarea { font: inherit; }',
    explanation:
      'A plain-text MUI AccordionSummary inherits the reset button font. An explicit Typography child avoids this visible text change.',
  },
  'ant-skeleton': {
    label: 'Skeleton',
    library: 'Ant Design',
    selector: '.ant-skeleton-title',
    properties: ['fontSize', 'marginBottom', 'height'],
    css: '/* Tailwind Preflight */\nh1, h2, h3, h4, h5, h6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n/* Existing Ant reset */\nh3 { margin-bottom: 0.5em; }',
    explanation:
      'The skeleton title is an h3. Its inherited font size changes the em-based bottom margin. This is a small spacing shift, not a broken loading state.',
  },
  'native-form': {
    label: 'Native form',
    selector: '[data-native-input]',
    properties: ['backgroundColor', 'borderTopWidth', 'fontSize', 'height'],
    css: '/* Tailwind Preflight */\n* { padding: 0; border: 0 solid; }\nbutton, input, select, textarea {\n  font: inherit;\n  background-color: transparent;\n  border-radius: 0;\n}',
    explanation:
      'These are native HTML controls, not MUI or Ant inputs. Preflight removes browser borders and backgrounds. Nexus does not import Preflight; its dark color scheme may still change native colors.',
  },
  'native-links': {
    label: 'Native links',
    selector: '[data-native-link]',
    properties: ['color', 'textDecorationLine'],
    css: '/* Tailwind Preflight */\na { color: inherit; text-decoration: inherit; }',
    explanation:
      'Ordinary anchors lose their browser underline and link color. Explicitly styled host-library links can remain unchanged.',
  },
  'native-content': {
    label: 'Headings & lists',
    selector: '[data-native-heading]',
    properties: ['fontSize', 'fontWeight', 'marginBottom'],
    css: '/* Tailwind Preflight */\nh1, h2, h3, h4, h5, h6 {\n  font-size: inherit; font-weight: inherit;\n}\nol, ul, menu { list-style: none; }\n* { margin: 0; padding: 0; }',
    explanation:
      'Native headings lose their size and weight; ordered lists lose numbering. Explicit host Typography styles are a separate, protected case.',
  },
  'native-table': {
    label: 'Native table',
    selector: '[data-native-table]',
    properties: ['borderCollapse', 'borderSpacing', 'height'],
    css: '/* Tailwind Preflight */\ntable {\n  text-indent: 0;\n  border-color: inherit;\n  border-collapse: collapse;\n}\n* { padding: 0; }',
    explanation:
      'An ordinary HTML table changes spacing when browser cell padding and separate borders are reset. Ant and MUI tables supply their own styles.',
  },
};
