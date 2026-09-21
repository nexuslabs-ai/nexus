'use client';
import { lazy } from 'react';

import type { ComponentId } from '../gallery';
const Demo0 = lazy(() => import('./accordion'));
const Demo1 = lazy(() => import('./alert'));
const Demo2 = lazy(() => import('./alert-dialog'));
const Demo3 = lazy(() => import('./aspect-ratio'));
const Demo4 = lazy(() => import('./attachment'));
const Demo5 = lazy(() => import('./avatar'));
const Demo6 = lazy(() => import('./badge'));
const Demo7 = lazy(() => import('./breadcrumb'));
const Demo8 = lazy(() => import('./bubble'));
const Demo9 = lazy(() => import('./button'));
const Demo10 = lazy(() => import('./button-group'));
const Demo11 = lazy(() => import('./card'));
const Demo12 = lazy(() => import('./carousel'));
const Demo13 = lazy(() => import('./chart'));
const Demo14 = lazy(() => import('./checkbox'));
const Demo15 = lazy(() => import('./choice-card'));
const Demo16 = lazy(() => import('./choice-row'));
const Demo17 = lazy(() => import('./collapsible'));
const Demo18 = lazy(() => import('./combobox'));
const Demo19 = lazy(() => import('./command'));
const Demo20 = lazy(() => import('./context-menu'));
const Demo21 = lazy(() => import('./date-picker'));
const Demo22 = lazy(() => import('./dialog'));
const Demo23 = lazy(() => import('./drawer'));
const Demo24 = lazy(() => import('./dropdown-menu'));
const Demo25 = lazy(() => import('./empty-state'));
const Demo26 = lazy(() => import('./field'));
const Demo27 = lazy(() => import('./hide'));
const Demo28 = lazy(() => import('./hover-card'));
const Demo29 = lazy(() => import('./input'));
const Demo30 = lazy(() => import('./input-group'));
const Demo31 = lazy(() => import('./input-otp'));
const Demo32 = lazy(() => import('./item'));
const Demo33 = lazy(() => import('./kbd'));
const Demo34 = lazy(() => import('./label'));
const Demo35 = lazy(() => import('./menubar'));
const Demo36 = lazy(() => import('./multi-select'));
const Demo37 = lazy(() => import('./native-select'));
const Demo38 = lazy(() => import('./navigation-menu'));
const Demo39 = lazy(() => import('./pagination'));
const Demo40 = lazy(() => import('./popover'));
const Demo41 = lazy(() => import('./progress'));
const Demo42 = lazy(() => import('./radio-group'));
const Demo43 = lazy(() => import('./resizable'));
const Demo44 = lazy(() => import('./scroll-area'));
const Demo45 = lazy(() => import('./select'));
const Demo46 = lazy(() => import('./separator'));
const Demo47 = lazy(() => import('./sheet'));
const Demo48 = lazy(() => import('./show'));
const Demo49 = lazy(() => import('./sidebar'));
const Demo50 = lazy(() => import('./skeleton'));
const Demo51 = lazy(() => import('./slider'));
const Demo52 = lazy(() => import('./sonner'));
const Demo53 = lazy(() => import('./spinner'));
const Demo54 = lazy(() => import('./switch'));
const Demo55 = lazy(() => import('./table'));
const Demo56 = lazy(() => import('./tabs'));
const Demo57 = lazy(() => import('./textarea'));
const Demo58 = lazy(() => import('./toggle'));
const Demo59 = lazy(() => import('./toggle-group'));
const Demo60 = lazy(() => import('./tooltip'));
const AppearanceDemo = lazy(() => import('./appearance'));
export function GalleryDemo({ id }: { id: ComponentId }) {
  switch (id) {
    case 'appearance':
      return <AppearanceDemo />;
    case 'accordion':
      return <Demo0 />;
    case 'alert':
      return <Demo1 />;
    case 'alert-dialog':
      return <Demo2 />;
    case 'aspect-ratio':
      return <Demo3 />;
    case 'attachment':
      return <Demo4 />;
    case 'avatar':
      return <Demo5 />;
    case 'badge':
      return <Demo6 />;
    case 'breadcrumb':
      return <Demo7 />;
    case 'bubble':
      return <Demo8 />;
    case 'button':
      return <Demo9 />;
    case 'button-group':
      return <Demo10 />;
    case 'card':
      return <Demo11 />;
    case 'carousel':
      return <Demo12 />;
    case 'chart':
      return <Demo13 />;
    case 'checkbox':
      return <Demo14 />;
    case 'choice-card':
      return <Demo15 />;
    case 'choice-row':
      return <Demo16 />;
    case 'collapsible':
      return <Demo17 />;
    case 'combobox':
      return <Demo18 />;
    case 'command':
      return <Demo19 />;
    case 'context-menu':
      return <Demo20 />;
    case 'date-picker':
      return <Demo21 />;
    case 'dialog':
      return <Demo22 />;
    case 'drawer':
      return <Demo23 />;
    case 'dropdown-menu':
      return <Demo24 />;
    case 'empty-state':
      return <Demo25 />;
    case 'field':
      return <Demo26 />;
    case 'hide':
      return <Demo27 />;
    case 'hover-card':
      return <Demo28 />;
    case 'input':
      return <Demo29 />;
    case 'input-group':
      return <Demo30 />;
    case 'input-otp':
      return <Demo31 />;
    case 'item':
      return <Demo32 />;
    case 'kbd':
      return <Demo33 />;
    case 'label':
      return <Demo34 />;
    case 'menubar':
      return <Demo35 />;
    case 'multi-select':
      return <Demo36 />;
    case 'native-select':
      return <Demo37 />;
    case 'navigation-menu':
      return <Demo38 />;
    case 'pagination':
      return <Demo39 />;
    case 'popover':
      return <Demo40 />;
    case 'progress':
      return <Demo41 />;
    case 'radio-group':
      return <Demo42 />;
    case 'resizable':
      return <Demo43 />;
    case 'scroll-area':
      return <Demo44 />;
    case 'select':
      return <Demo45 />;
    case 'separator':
      return <Demo46 />;
    case 'sheet':
      return <Demo47 />;
    case 'show':
      return <Demo48 />;
    case 'sidebar':
      return <Demo49 />;
    case 'skeleton':
      return <Demo50 />;
    case 'slider':
      return <Demo51 />;
    case 'sonner':
      return <Demo52 />;
    case 'spinner':
      return <Demo53 />;
    case 'switch':
      return <Demo54 />;
    case 'table':
      return <Demo55 />;
    case 'tabs':
      return <Demo56 />;
    case 'textarea':
      return <Demo57 />;
    case 'toggle':
      return <Demo58 />;
    case 'toggle-group':
      return <Demo59 />;
    case 'tooltip':
      return <Demo60 />;
  }
}
