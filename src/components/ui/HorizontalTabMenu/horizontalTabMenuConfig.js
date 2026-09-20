export const HORIZONTAL_TAB_MENU_DEFAULT_ITEMS = [
  "Menu item1",
  "Menu item2",
  "Menu item3",
  "Menu item4",
  "Menu item5",
  "Menu item6",
];

export const HORIZONTAL_TAB_MENU_DEFAULT_PROPS = {
  items: HORIZONTAL_TAB_MENU_DEFAULT_ITEMS,
  activeIndex: 0,
  filled: "off",
  style: "Brand",
  orientation: "horizontal",
  interactive: false,
  "aria-label": "Horizontal tab menu",
};

export function createHorizontalTabMenuProps(overrides = {}) {
  return {
    ...HORIZONTAL_TAB_MENU_DEFAULT_PROPS,
    ...overrides,
  };
}

export function createHorizontalTabMenuShowcaseItem(label, overrides = {}) {
  return {
    label,
    props: createHorizontalTabMenuProps(overrides),
  };
}
