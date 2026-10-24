import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { IconX } from '@tabler/icons-react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
} from 'motion/react';

import { tabIcons } from './dock-icons';

import './context-dock.css';
import './growing-dock.css';
import './dialkit-dock.css';
import './markup-dock.css';
import './straight-dock.css';

// One outline expands vertically while its sides stay aligned with the pill.
function surfaceOutline(bounds, expanded) {
  const left = bounds.left;
  const right = left + bounds.width;
  const top = expanded ? -bounds.panelHeight - 8 : bounds.top;
  const radius = expanded ? 24 : bounds.height / 2;
  const pillRadius = bounds.height / 2;
  const middle = bounds.top + pillRadius;
  const bottom = bounds.top + bounds.height;
  const k = 0.55228475;

  return `M ${left + radius} ${top}
    H ${right - radius}
    C ${right - radius + radius * k} ${top} ${right} ${top + radius - radius * k} ${right} ${top + radius}
    V ${middle}
    C ${right} ${middle + pillRadius * k} ${right - pillRadius + pillRadius * k} ${bottom} ${right - pillRadius} ${bottom}
    H ${left + pillRadius}
    C ${left + pillRadius - pillRadius * k} ${bottom} ${left} ${middle + pillRadius * k} ${left} ${middle}
    V ${top + radius}
    C ${left} ${top + radius - radius * k} ${left + radius - radius * k} ${top} ${left + radius} ${top} Z`;
}

export function StraightDock({
  className = '',
  chapter,
  title,
  tabs,
  selected,
  onSelect,
  duration,
  reduceMotion,
  theme,
  hasControls,
  children,
}) {
  const root = useRef(null);
  const content = useRef(null);
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const [bounds, setBounds] = useState(null);
  const activeTool = tabs[selected];
  const expanded = open && hasControls;
  const still = reduceMotion || instant;
  const transition = still
    ? { duration: 0 }
    : { type: 'spring', visualDuration: duration, bounce: 0 };

  useLayoutEffect(() => {
    const dock = root.current;
    const button = dock.querySelector(`[data-tool-index="${selected}"]`);
    function measure() {
      // Offset geometry excludes Motion's in-flight transforms.
      const next = {
        left: button.offsetLeft,
        top: button.offsetTop,
        width: button.offsetWidth,
        height: button.offsetHeight,
        panelLeft: button.offsetLeft,
        panelWidth: button.offsetWidth,
        panelHeight: content.current?.offsetHeight ?? 0,
      };
      setBounds((previous) =>
        previous &&
        Object.keys(next).every((key) => previous[key] === next[key])
          ? previous
          : next
      );
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    observer.observe(button);
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  }, [selected, hasControls]);

  useEffect(() => {
    if (!expanded) return;
    function dismiss(event) {
      if (root.current.contains(event.target)) return;
      setInstant(false);
      setOpen(false);
    }
    function escape(event) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      setInstant(true);
      setOpen(false);
      root.current
        .querySelector(`[data-tool-index="${selected}"]`)
        .focus({ preventScroll: true });
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [expanded, selected]);

  function chooseTool(index, event) {
    setInstant(event.detail === 0);
    onSelect(index);
    if (hasControls) setOpen(index === selected ? !open : true);
  }

  function closePanel(event) {
    setInstant(event.detail === 0);
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
      setInstant(true);
      setOpen(true);
      return;
    } else return;
    event.preventDefault();
    setInstant(true);
    onSelect(next);
    event.currentTarget
      .querySelector(`[data-tool-index="${next}"]`)
      .focus({ preventScroll: true });
  }

  function handleBlur(event) {
    if (
      !event.relatedTarget ||
      event.currentTarget.contains(event.relatedTarget)
    )
      return;
    setInstant(true);
    setOpen(false);
  }

  const outline = bounds && surfaceOutline(bounds, expanded);

  return (
    <MotionConfig
      reducedMotion={still ? 'always' : 'never'}
      transition={transition}
    >
      <LayoutGroup id={`straight-dock-${chapter}`}>
        <motion.div
          ref={root}
          layoutRoot
          className={`context-dock growing-dock active-label-dock markup-dock straight-dock dialkit-root ${className}`}
          role="group"
          aria-label="Dock"
          data-theme={theme}
          data-open={expanded}
          style={{ '--dock-tool-count': tabs.length }}
          onBlur={handleBlur}
        >
          <div
            className="context-dock-bar"
            role="toolbar"
            aria-label={title}
            onKeyDown={navigateTools}
          >
            {tabs.map((tab, index) => {
              const active = index === selected;
              const Icon = tabIcons[tab];
              return (
                <motion.button
                  layout="position"
                  key={tab}
                  type="button"
                  id={`story-tab-${chapter}-${index}`}
                  data-tool-index={index}
                  data-active={active}
                  aria-label={tab}
                  aria-pressed={hasControls ? undefined : active}
                  aria-expanded={hasControls ? active && expanded : undefined}
                  aria-controls={hasControls ? 'dock-controls' : 'story-panel'}
                  tabIndex={active ? 0 : -1}
                  onClick={(event) => chooseTool(index, event)}
                >
                  <span className="context-tool-icon" aria-hidden="true">
                    <Icon size={26} stroke={1.6} />
                  </span>
                  <span className="context-tool-label" aria-hidden="true">
                    {tab}
                  </span>
                </motion.button>
              );
            })}
          </div>
          {outline && (
            <svg className="straight-surface" aria-hidden="true">
              <motion.path
                initial={false}
                animate={{ d: outline }}
                transition={transition}
              />
            </svg>
          )}
          {hasControls && (
            <motion.section
              ref={content}
              layout="position"
              id="dock-controls"
              aria-label={`${activeTool} controls`}
              aria-hidden={!expanded}
              inert={!expanded}
              className="context-panel straight-content"
              initial={false}
              animate={{ opacity: expanded ? 1 : 0 }}
              transition={{
                ...transition,
                opacity: {
                  duration: still ? 0 : 0.1,
                  delay: expanded && !still ? 0.06 : 0,
                },
              }}
              style={{
                left: bounds?.panelLeft ?? 0,
                bottom: 80,
                width: bounds?.panelWidth ?? 280,
                pointerEvents: expanded ? 'auto' : 'none',
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={activeTool}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: still ? 0 : 0.1 }}
                >
                  <div className="context-panel-heading">
                    <h2>{activeTool}</h2>
                    <button
                      type="button"
                      aria-label="Close controls"
                      onClick={closePanel}
                    >
                      <IconX size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="context-panel-content">{children}</div>
                </motion.div>
              </AnimatePresence>
            </motion.section>
          )}
        </motion.div>
      </LayoutGroup>
    </MotionConfig>
  );
}
