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
import './morphing-dock.css';

export function MorphingDock({
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
      const width = Math.min(280, dock.clientWidth);
      const center = button.offsetLeft + button.offsetWidth / 2;
      const next = {
        left: button.offsetLeft,
        top: button.offsetTop,
        width: button.offsetWidth,
        height: button.offsetHeight,
        panelLeft: Math.max(
          0,
          Math.min(center - width / 2, dock.clientWidth - width)
        ),
        panelWidth: width,
        panelHeight: content.current?.offsetHeight ?? 0,
        center,
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

  const surface =
    bounds &&
    (expanded
      ? {
          left: bounds.panelLeft,
          top: -bounds.panelHeight - 8,
          width: bounds.panelWidth,
          height: bounds.panelHeight,
          borderRadius: 24,
        }
      : {
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
          borderRadius: bounds.height / 2,
        });

  return (
    <MotionConfig
      reducedMotion={still ? 'always' : 'never'}
      transition={transition}
    >
      <LayoutGroup id={`morph-dock-${chapter}`}>
        <motion.div
          ref={root}
          layoutRoot
          className="context-dock growing-dock active-label-dock markup-dock morph-dock dialkit-root"
          role="group"
          aria-label="Dock"
          data-theme={theme}
          data-open={expanded}
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
                  {active && (
                    <motion.span
                      layoutId="active-base"
                      className="context-dock-selection"
                      initial={false}
                      animate={{ opacity: expanded ? 1 : 0 }}
                      transition={{ opacity: { duration: still ? 0 : 0.12 } }}
                    />
                  )}
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
          {surface && (
            <motion.div
              layout
              initial={false}
              className="morph-surface"
              style={surface}
              aria-hidden="true"
            />
          )}
          {bounds && (
            <motion.div
              layout="position"
              className="morph-bridge"
              style={{ left: bounds.center - 32 }}
              initial={false}
              animate={{
                opacity: expanded ? 1 : 0,
                scaleY: expanded ? 1 : 0.5,
              }}
              transition={{
                ...transition,
                opacity: { duration: still ? 0 : 0.12 },
              }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 64 20">
                <path d="M0 0H64C48 0 48 20 64 20H0C16 20 16 0 0 0Z" />
              </svg>
            </motion.div>
          )}
          {hasControls && (
            <motion.section
              ref={content}
              layout="position"
              id="dock-controls"
              aria-label={`${activeTool} controls`}
              aria-hidden={!expanded}
              inert={!expanded}
              className="context-panel morph-content"
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
