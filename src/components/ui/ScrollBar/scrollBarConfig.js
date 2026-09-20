export const SCROLL_BAR_DEFAULT_PROPS = {
  length: 0.75,
  position: 0,
  height: 240,
  width: 240,
  orientation: "vertical",
  interactive: false,
  minThumbSize: 24,
};

export function createScrollBarProps(overrides = {}) {
  return {
    ...SCROLL_BAR_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createScrollBarShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createScrollBarProps(overrides),
  };
}
