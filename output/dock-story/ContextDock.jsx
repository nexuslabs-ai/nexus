import { useEffect, useRef, useState } from 'react';

import { IconX } from '@tabler/icons-react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
} from 'motion/react';

import { tabIcons } from './dock-icons';

import './context-dock.css';

export function ContextDock({
  chapter,
  title,
  tabs,
  selected,
  onSelect,
  duration,
  reduceMotion,
  hasControls,
  children,
}) {
  const root = useRef(null);
  const [open, setOpen] = useState(false);
  const activeTool = tabs[selected];

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
    : { type: 'spring', visualDuration: duration, bounce: 0.08 };

  return (
    <MotionConfig
      reducedMotion={reduceMotion ? 'always' : 'never'}
      transition={transition}
    >
      <LayoutGroup id={`dock-${chapter}`}>
        <div
          ref={root}
          className="context-dock"
          role="group"
          aria-label="Dock"
          onBlur={handleBlur}
          style={{ '--tool-x': `${((selected + 0.5) / tabs.length) * 100}%` }}
        >
          <div
            className="context-dock-bar"
            role="toolbar"
            tabIndex={-1}
            aria-label={title}
            onKeyDown={navigateTools}
          >
            {tabs.map((tab, index) => {
              const Icon = tabIcons[tab];
              const active = selected === index;
              return (
                <button
                  key={tab}
                  type="button"
                  id={`story-tab-${chapter}-${index}`}
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
                  <span className="context-tool-icon">
                    <Icon size={23} stroke={1.65} aria-hidden="true" />
                    {tab === 'Colors' && (
                      <i style={{ background: 'var(--canvas-accent)' }} />
                    )}
                  </span>
                  <span className="context-tool-label">{tab}</span>
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {open && hasControls && (
              <motion.div
                className="context-panel-layer"
                key="panel"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                style={{ transformOrigin: 'var(--tool-x) bottom' }}
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
