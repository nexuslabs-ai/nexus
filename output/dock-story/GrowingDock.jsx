import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { IconX } from '@tabler/icons-react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
} from 'motion/react';

import { tabIcons } from './dock-icons';
import { TactileTool } from './TactileTool';

import './context-dock.css';
import './growing-dock.css';
import './dialkit-dock.css';
import './markup-dock.css';

function GrowingDock({
  className,
  toolIcons,
  chapter,
  title,
  tabs,
  selected,
  onSelect,
  duration,
  reduceMotion,
  theme,
  hasControls,
  panelWidth = 440,
  children,
}) {
  const root = useRef(null);
  const [open, setOpen] = useState(false);
  const activeTool = tabs[selected];

  useLayoutEffect(() => {
    const dock = root.current;
    const button = dock.querySelector(`[data-tool-index="${selected}"]`);
    function measureAnchor() {
      const boundary = dock.getBoundingClientRect();
      const tool = button.getBoundingClientRect();
      const center = tool.left + tool.width / 2 - boundary.left;
      const width = Math.min(boundary.width, panelWidth);
      const panelLeft = Math.max(
        0,
        Math.min(center - width / 2, boundary.width - width)
      );
      dock.style.setProperty('--tool-x', `${center}px`);
      dock.style.setProperty('--panel-left', `${panelLeft}px`);
    }
    measureAnchor();
    const observer = new ResizeObserver(measureAnchor);
    observer.observe(dock);
    observer.observe(button);
    return () => observer.disconnect();
  }, [selected, panelWidth]);

  useEffect(() => {
    if (!open) return;
    function dismiss(event) {
      if (!root.current.contains(event.target)) setOpen(false);
    }
    function dismissOnEscape(event) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      root.current
        .querySelector(`[data-tool-index="${selected}"]`)
        .focus({ preventScroll: true });
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [open, selected]);

  function chooseTool(index) {
    onSelect(index);
    if (hasControls) setOpen(index === selected ? !open : true);
  }

  function closePanel() {
    setOpen(false);
    root.current
      .querySelector(`[data-tool-index="${selected}"]`)
      .focus({ preventScroll: true });
  }

  function navigateTools(event) {
    let next = selected;
    if (event.key === 'ArrowRight') next = (selected + 1) % tabs.length;
    else if (event.key === 'ArrowLeft')
      next = (selected + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else if (event.key === 'ArrowUp' && hasControls) {
      event.preventDefault();
      setOpen(true);
      return;
    } else return;
    event.preventDefault();
    onSelect(next);
    event.currentTarget
      .querySelector(`[data-tool-index="${next}"]`)
      .focus({ preventScroll: true });
  }

  function handleBlur(event) {
    if (
      event.relatedTarget &&
      !event.currentTarget.contains(event.relatedTarget)
    )
      setOpen(false);
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring', visualDuration: duration, bounce: 0.12 };

  return (
    <MotionConfig
      reducedMotion={reduceMotion ? 'always' : 'never'}
      transition={transition}
    >
      <LayoutGroup id={`dock-${chapter}`}>
        <div
          ref={root}
          className={`context-dock growing-dock ${className}`}
          role="group"
          aria-label="Dock"
          data-theme={theme}
          onBlur={handleBlur}
          style={{
            '--dock-duration': `${duration}s`,
            '--dock-panel-width': `${panelWidth}px`,
          }}
        >
          <div
            className="context-dock-bar"
            role="toolbar"
            tabIndex={-1}
            aria-label={title}
            onKeyDown={navigateTools}
          >
            {tabs.map((tab, index) => {
              const active = selected === index;
              return (
                <button
                  key={tab}
                  type="button"
                  id={`story-tab-${chapter}-${index}`}
                  aria-label={tab}
                  data-tool-index={index}
                  data-active={active}
                  aria-pressed={hasControls ? undefined : active}
                  aria-expanded={hasControls ? active && open : undefined}
                  aria-controls={
                    hasControls
                      ? active && open
                        ? 'dock-controls'
                        : undefined
                      : 'story-panel'
                  }
                  tabIndex={active ? 0 : -1}
                  onClick={() => chooseTool(index)}
                >
                  {active && (
                    <motion.span
                      className="context-dock-selection"
                      layoutId="selection"
                    />
                  )}
                  <span className="context-tool-icon" aria-hidden="true">
                    {toolIcons[index]}
                  </span>
                  <span className="context-tool-label" aria-hidden="true">
                    {tab}
                  </span>
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {open && hasControls && (
              <motion.div
                className="context-panel-layer"
                key="panel"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.12 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.12 }}
                transition={{
                  ...transition,
                  opacity: { duration: reduceMotion ? 0 : 0.14 },
                }}
                style={{ transformOrigin: 'var(--tool-x) calc(100% + 52px)' }}
              >
                <motion.section
                  layout="size"
                  id="dock-controls"
                  className="context-panel"
                  aria-label={`${activeTool} controls`}
                >
                  <div className="context-panel-heading">
                    <h2>{activeTool}</h2>
                    <button
                      type="button"
                      onClick={closePanel}
                      aria-label="Close controls"
                    >
                      <IconX size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <motion.div
                    key={activeTool}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.16 }}
                    className="context-panel-content"
                  >
                    {children}
                  </motion.div>
                </motion.section>
                <span className="context-panel-pointer" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

export function TactileDock(props) {
  const icons = props.tabs.map((tab) => <TactileTool key={tab} name={tab} />);
  return <GrowingDock {...props} className="tactile-dock" toolIcons={icons} />;
}

export function ActiveLabelDock(props) {
  const icons = props.tabs.map((tab) => {
    const Icon = tabIcons[tab];
    return <Icon key={tab} size={23} stroke={1.7} />;
  });
  return (
    <GrowingDock
      {...props}
      className="active-label-dock dialkit-root"
      toolIcons={icons}
      panelWidth={280}
    />
  );
}

export function MarkupPortraitDock(props) {
  const icons = props.tabs.map((tab) => {
    const Icon = tabIcons[tab];
    return <Icon key={tab} size={26} stroke={1.6} />;
  });
  return (
    <GrowingDock
      {...props}
      className="active-label-dock markup-dock dialkit-root"
      toolIcons={icons}
      panelWidth={280}
    />
  );
}
