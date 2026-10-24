import { tabIcons } from './dock-icons';

export function TactileTool({ name }) {
  if (name === 'Content')
    return (
      <span className="tactile-pencil">
        <i />
        <b />
      </span>
    );
  if (name === 'Colors' || name === 'Variants')
    return (
      <span className="tactile-swatches">
        <i />
        <i />
        <i />
      </span>
    );
  if (name === 'Theme')
    return (
      <span className="tactile-theme">
        <i />
      </span>
    );
  if (name === 'Typography') return <span className="tactile-type">Aa</span>;
  if (name === 'Spacing')
    return (
      <span className="tactile-ruler">
        <i />
      </span>
    );
  if (name === 'Radius')
    return (
      <span className="tactile-corner">
        <i />
      </span>
    );
  if (name === 'More')
    return (
      <span className="tactile-sliders">
        <i />
        <i />
        <i />
      </span>
    );
  const Icon = tabIcons[name];
  return (
    <span className={`tactile-object tactile-object-${name.toLowerCase()}`}>
      <Icon size={30} stroke={1.55} />
    </span>
  );
}
