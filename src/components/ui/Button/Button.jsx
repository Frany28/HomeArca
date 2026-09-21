import clsx from "clsx";
import Tooltip from "../Tooltip/Tooltip.jsx";
import { resolveIconButtonTooltip } from "./buttonTooltip.js";
import {
  BUTTON_INTERACTIVE_STYLES,
  BUTTON_SIZE_STYLES,
  BUTTON_VISUALS,
} from "./buttonConfig.js";

function getSafeLinkRel(target, rel) {
  if (target !== "_blank") return rel;

  const tokens = new Set(
    String(rel ?? "")
      .split(/\s+/)
      .filter(Boolean),
  );

  tokens.add("noopener");
  tokens.add("noreferrer");

  return [...tokens].join(" ");
}

function Button({
  className,
  children = "Button",
  iconLeft = null,
  iconRight = null,
  showLeftIcon = true,
  showRightIcon = true,
  showText = true,
  fitContent = false,
  size = "S",
  state = "Default",
  theme = "Primary",
  type = "Solid",
  htmlType = "button",
  disabled = false,
  href,
  onClick,
  rel,
  style,
  target,
  tooltip,
  tooltipPosition = "Top center",
  "aria-label": ariaLabel,
  ...props
}) {
  const resolvedTheme = BUTTON_VISUALS[theme] ? theme : "Primary";
  const resolvedType = BUTTON_VISUALS[resolvedTheme]?.[type] ? type : "Solid";
  const resolvedSize = BUTTON_SIZE_STYLES[size] ? size : "S";
  const resolvedState = disabled ? "Disabled" : state;
  const visual = BUTTON_VISUALS[resolvedTheme][resolvedType];
  const isLink = resolvedType === "Link";
  const isAnchor = typeof href === "string" && href.length > 0;
  const iconOnly = !showText;
  const isDisabled = resolvedState === "Disabled";
  const Component = isAnchor ? "a" : "button";
  const safeRel = isAnchor ? getSafeLinkRel(target, rel) : undefined;
  const interactiveClassName =
    BUTTON_INTERACTIVE_STYLES[resolvedTheme]?.[resolvedType];
  const showFocusRing =
    !isLink && !isDisabled && resolvedState === "Focused";
  const focusStyle = showFocusRing
    ? {
        outline: `var(--stroke-2) solid ${visual.FocusedOuter}`,
        outlineOffset: "0px",
      }
    : undefined;

  const buttonClassName = clsx(
    "flex items-center justify-center overflow-visible rounded-[var(--radius-2)] font-medium tracking-[-0.5px] no-underline transition-colors duration-150 motion-reduce:transition-none",
    isDisabled ? "cursor-not-allowed" : "cursor-pointer",
    iconOnly
      ? BUTTON_SIZE_STYLES[resolvedSize].iconOnly
      : isLink
        ? fitContent
          ? BUTTON_SIZE_STYLES[resolvedSize].linkFitContent
          : BUTTON_SIZE_STYLES[resolvedSize].link
        : fitContent
          ? BUTTON_SIZE_STYLES[resolvedSize].defaultFitContent
          : BUTTON_SIZE_STYLES[resolvedSize].default,
    resolvedState === "Default" && visual.Default,
    resolvedState === "Hover" && visual.Hover,
    resolvedState === "Disabled" && visual.Disabled,
    resolvedState === "Focused" && visual.FocusedInner,
    resolvedState === "Default" && !disabled && interactiveClassName,
    className,
  );

  const handleClick = (event) => {
    if (isDisabled) {
      if (isAnchor) {
        event.preventDefault();
        event.stopPropagation();
      }

      return;
    }

    onClick?.(event);
  };

  const button = (
    <Component
      type={isAnchor ? undefined : htmlType}
      href={isAnchor && !isDisabled ? href : undefined}
      target={isAnchor ? target : undefined}
      rel={safeRel}
      className={buttonClassName}
      disabled={isAnchor ? undefined : isDisabled}
      aria-disabled={isAnchor && isDisabled ? true : undefined}
      tabIndex={isAnchor && isDisabled ? -1 : undefined}
      style={{
        ...style,
        ...focusStyle,
      }}
      aria-label={ariaLabel}
      onClick={onClick || isDisabled ? handleClick : undefined}
      {...props}
    >
      {showLeftIcon && iconLeft ? (
        <span
          className="inline-flex shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          {iconLeft}
        </span>
      ) : null}
      {showText ? (
        <span
          className={clsx(
            "inline-flex items-center justify-center",
            fitContent && "whitespace-nowrap",
            BUTTON_SIZE_STYLES[resolvedSize].text,
          )}
        >
          {children}
        </span>
      ) : null}
      {showText && showRightIcon && iconRight ? (
        <span
          className="inline-flex shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          {iconRight}
        </span>
      ) : null}
    </Component>
  );

  const tooltipText = resolveIconButtonTooltip({
    ariaLabel,
    showText,
    tooltip,
  });

  return tooltipText ? (
    <Tooltip
      asChild
      portal
      showTip
      text={tooltipText}
      tipPosition={tooltipPosition}
    >
      {button}
    </Tooltip>
  ) : (
    button
  );
}

export default Button;
