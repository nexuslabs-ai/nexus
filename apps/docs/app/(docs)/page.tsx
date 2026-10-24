import { HomeHero } from '../_components/home-hero/HomeHero';
import {
  ComponentGallery,
  HomePageSections,
} from '../_components/home-page/HomePageSections';
import {
  NPM_CORE_URL,
  pageMetadata,
  REPO_URL,
  SITE_ALTERNATE_NAMES,
  SITE_DESCRIPTION,
  SITE_IMAGE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  STORYBOOK_URL,
} from '../_lib/site';

export const metadata = pageMetadata({
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  route: '/',
  image: SITE_IMAGE,
});

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      description: SITE_DESCRIPTION,
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_URL}/#software`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      codeRepository: REPO_URL,
      programmingLanguage: ['TypeScript', 'CSS'],
      license: 'https://opensource.org/licenses/MIT',
      author: {
        '@type': 'Organization',
        name: 'Nexus Labs',
        url: 'https://github.com/nexuslabs-ai',
      },
      sameAs: [REPO_URL, NPM_CORE_URL, STORYBOOK_URL],
    },
  ],
};

export default function Home() {
  return (
    <div className="nx:max-w-7xl nx:mx-auto nx:px-6">
      <script
        type="application/ld+json"
        // `<` is escaped so no string in the data can close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA).replaceAll('<', '\\u003c'),
        }}
      />
      <HomeHero>
        <ComponentGallery />
        <HomePageSections />
      </HomeHero>
    </div>
  );
}
