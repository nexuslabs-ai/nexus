/** Where an anchor jump lands below the viewport top: the page's `scroll-padding-top`, clear of the sticky header. */
export function getScrollOffset(): number {
  return (
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  );
}
