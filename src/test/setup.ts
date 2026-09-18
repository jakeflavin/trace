import '@testing-library/jest-dom'

/*
 * jsdom has no media queries; the editor's theme falls back to prefers-color-scheme and
 * needs one to exist. Nothing matches, which is the honest answer for a headless DOM.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

/* The preview scales its pages to the width it is given; jsdom has no widths. */
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

/*
 * jsdom has no <dialog> behaviour: showModal and close do not exist, and an unopened
 * dialog is hidden from every query. Setting the attribute is what the real methods do
 * for the part a test can see.
 */
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
}
