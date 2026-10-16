import { HomeHero } from '../_components/home-hero/HomeHero';
import {
  ComponentGallery,
  HomePageSections,
} from '../_components/home-page/HomePageSections';

export default function Home() {
  return (
    <div className="nx:max-w-7xl nx:mx-auto nx:px-6">
      <HomeHero>
        <ComponentGallery />
        <HomePageSections />
      </HomeHero>
    </div>
  );
}
