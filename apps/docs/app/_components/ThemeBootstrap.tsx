import { DOCS_THEME_BOOTSTRAP_SCRIPT } from '../_lib/theme-bootstrap-script';

export function ThemeBootstrap() {
  return (
    <script
      data-nexus-theme-bootstrap=""
      dangerouslySetInnerHTML={{ __html: DOCS_THEME_BOOTSTRAP_SCRIPT }}
    />
  );
}
