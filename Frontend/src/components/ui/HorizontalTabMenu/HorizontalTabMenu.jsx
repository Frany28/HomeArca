import { useId, useState } from "react";
import clsx from "clsx";
import {
  HORIZONTAL_TAB_MENU_DEFAULT_ITEMS,
  HORIZONTAL_TAB_MENU_DEFAULT_PROPS,
} from "./horizontalTabMenuConfig.js";

const HORIZONTAL_TAB_MENU_NODE_IDS = {
  light: {
    Brand: {
      off: {
        wrapper: "2061:23099",
        activeItem: "2061:23100",
        inactiveItem: "2061:23101",
      },
      on: {
        wrapper: "2061:23106",
        activeItem: "2061:23107",
        inactiveItem: "2061:23108",
      },
    },
    Underlined: {
      off: {
        wrapper: "2061:23112",
        activeItem: "2061:23113",
        inactiveItem: "2061:23114",
      },
      on: {
        wrapper: "2061:23119",
        activeItem: "2061:23120",
        inactiveItem: "2061:23121",
      },
    },
  },
};

function getVariant(style, filled) {
  const resolvedStyle = style === "Underlined" ? "Underlined" : "Brand";
  const resolvedFilled = filled === "on" ? "on" : "off";

  return {
    style: resolvedStyle,
    filled: resolvedFilled,
  };
}

function getItemNodeId(style, filled, isActive) {
  return isActive
    ? HORIZONTAL_TAB_MENU_NODE_IDS.light[style][filled].activeItem
    : HORIZONTAL_TAB_MENU_NODE_IDS.light[style][filled].inactiveItem;
}

function getNextIndex(currentIndex, itemCount, direction) {
  if (itemCount <= 0) {
    return currentIndex;
  }

  if (currentIndex < 0) {
    return direction > 0 ? 0 : itemCount - 1;
  }

  return (currentIndex + direction + itemCount) % itemCount;
}

function HorizontalTabMenu({
  className,
  items = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.items,
  activeIndex,
  defaultActiveIndex = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.activeIndex,
  filled = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.filled,
  style = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.style,
  orientation = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.orientation,
  interactive = HORIZONTAL_TAB_MENU_DEFAULT_PROPS.interactive,
  presentation = "default",
  onChange,
  ...props
}) {
  const generatedId = useId();
  const [internalActiveIndex, setInternalActiveIndex] = useState(defaultActiveIndex);
  const normalizedItems =
    Array.isArray(items) && items.length > 0
      ? items
      : HORIZONTAL_TAB_MENU_DEFAULT_ITEMS;
  const isControlled = Number.isInteger(activeIndex);
  const resolvedActiveIndex = isControlled ? activeIndex : internalActiveIndex;
  const resolvedVariant = getVariant(style, filled);
  const isVertical = orientation === "vertical";
  const isPublicNavigation = presentation === "publicNavigation";
  const hasActiveItem =
    Number.isInteger(resolvedActiveIndex) &&
    resolvedActiveIndex >= 0 &&
    resolvedActiveIndex < normalizedItems.length;
  const isInteractive = interactive || typeof onChange === "function";

  function handleSelect(index) {
    if (!isInteractive || index === resolvedActiveIndex) {
      return;
    }

    if (!isControlled) {
      setInternalActiveIndex(index);
    }

    onChange?.(index);
  }

  function handleKeyDown(event, index) {
    if (!isInteractive) {
      return;
    }

    let nextIndex = null;

    if (event.key === "ArrowRight" || (isVertical && event.key === "ArrowDown")) {
      nextIndex = getNextIndex(index, normalizedItems.length, 1);
    } else if (event.key === "ArrowLeft" || (isVertical && event.key === "ArrowUp")) {
      nextIndex = getNextIndex(index, normalizedItems.length, -1);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = normalizedItems.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    handleSelect(nextIndex);

    const tabs = event.currentTarget.parentElement?.querySelectorAll('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  }

  return (
    <div
      className={clsx(
        "inline-flex max-w-full",
        isVertical
          ? "flex-col items-center overflow-visible"
          : "items-center overflow-x-auto",
        isPublicNavigation && !isVertical && "h-[52px] gap-[8px]",
        resolvedVariant.style === "Brand" &&
          !isVertical &&
          !isPublicNavigation &&
          "gap-[8px] pb-[2px]",
        resolvedVariant.style === "Brand" && isVertical && "w-full gap-[20px]",
        resolvedVariant.style === "Brand" &&
          resolvedVariant.filled === "on" &&
          (isVertical ? "w-full" : "flex w-full"),
        resolvedVariant.style === "Underlined" &&
          !isPublicNavigation &&
          (isVertical
            ? "w-full"
            : "gap-[16px] border-b border-[var(--color-neutral-200)]"),
        resolvedVariant.style === "Underlined" &&
          resolvedVariant.filled === "on" &&
          !isPublicNavigation &&
          (isVertical ? "w-full" : "flex w-full"),
        className,
      )}
      data-node-id={
        HORIZONTAL_TAB_MENU_NODE_IDS.light[resolvedVariant.style][
          resolvedVariant.filled
        ].wrapper
      }
      role="tablist"
      {...props}
    >
      {normalizedItems.map((item, index) => {
        const isActive = hasActiveItem && index === resolvedActiveIndex;
        const tabId = `${generatedId}-tab-${index}`;

        return (
          <button
            key={`${item}-${index}`}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isPublicNavigation && isActive ? "page" : undefined}
            tabIndex={isActive || !hasActiveItem ? 0 : -1}
            data-node-id={getItemNodeId(
              resolvedVariant.style,
              resolvedVariant.filled,
              isActive,
            )}
            className={clsx(
              "inline-flex items-center justify-center text-heading-8 whitespace-nowrap transition-colors duration-150",
              isPublicNavigation &&
                "h-[52px] shrink-0 bg-transparent px-[4px] pb-[14px] pt-[8px] text-[var(--color-neutral-100-uniform)] hover:text-[var(--color-neutral-950-uniform)] focus-visible:border-[var(--color-neutral-100-uniform)] focus-visible:ring-white/60",
              isPublicNavigation &&
                (isActive
                  ? "border-b-2 border-[var(--color-neutral-100-uniform)]"
                  : "border-b-2 border-transparent hover:border-[var(--color-neutral-100-uniform)] hover:bg-transparent"),
              resolvedVariant.style === "Brand" &&
                !isPublicNavigation &&
                "h-[36px] rounded-[var(--radius-2)] px-[12px] py-[8px]",
              resolvedVariant.style === "Brand" &&
                !isPublicNavigation &&
                isVertical &&
                "h-auto w-auto rounded-none px-0 py-0 text-center",
              resolvedVariant.style === "Brand" &&
                !isPublicNavigation &&
                resolvedVariant.filled === "on" &&
                "min-w-0 flex-1",
              resolvedVariant.style === "Brand" &&
                !isPublicNavigation &&
                resolvedVariant.filled === "off" &&
                (isVertical ? "w-auto shrink-0" : "shrink-0"),
              resolvedVariant.style === "Underlined" &&
                !isPublicNavigation &&
                "h-[32px] border-b-2 px-[4px] pb-[8px]",
              resolvedVariant.style === "Underlined" &&
                !isPublicNavigation &&
                isVertical &&
                "w-full justify-start border-b px-[12px] py-[10px]",
              resolvedVariant.style === "Underlined" &&
                !isPublicNavigation &&
                resolvedVariant.filled === "off" &&
                (isVertical ? "w-full" : "shrink-0"),
              resolvedVariant.style === "Underlined" &&
                !isPublicNavigation &&
                resolvedVariant.filled === "on" &&
                "min-w-0 flex-1",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-10)]",
              isInteractive && "cursor-pointer",
              resolvedVariant.style === "Brand" &&
                !isPublicNavigation &&
                (isActive
                  ? clsx(
                      isVertical
                        ? "bg-transparent text-[var(--color-text-300)]"
                        : "bg-[var(--color-neutral-200)] text-[var(--color-text-300)]",
                    )
                  : clsx(
                      "bg-transparent text-[var(--color-text-100)]",
                      isInteractive &&
                        (isVertical
                          ? "hover:bg-transparent hover:text-[var(--color-text-200)]"
                          : "hover:bg-[var(--color-neutral-10)] hover:text-[var(--color-text-200)]"),
                    )),
              resolvedVariant.style === "Underlined" &&
                !isPublicNavigation &&
                (isActive
                  ? "border-[var(--color-text-300)] text-[var(--color-text-300)]"
                  : clsx(
                      isVertical
                        ? "text-[var(--color-text-100)]"
                        : "border-transparent text-[var(--color-text-100)]",
                      isInteractive && "hover:text-[var(--color-text-200)]",
                    )),
            )}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onClick={() => handleSelect(index)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export default HorizontalTabMenu;
