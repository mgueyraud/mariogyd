"use client";
import type { CSSProperties } from "react";
import { DialRoot, useDialKit, type DialConfig } from "dialkit";
import "dialkit/styles.css";
import { GoArrowRight } from "react-icons/go";
import ComponentWrapper from "../ComponentWrapper";

/*
 * Every visual property of the button is a DialKit control. The panel only
 * shows in development (DialKit's default); in production the defaults below
 * are what renders. Use the panel's Copy button to export tuned values, then
 * paste them back in here as the new defaults.
 */
const CONFIG = {
  label: "Continue",
  showIcon: true,
  size: {
    height: [32, 24, 56, 1],
    paddingX: [12, 4, 32, 1],
    radius: [8, 0, 24, 1],
    gap: [6, 0, 16, 1],
    iconSize: [14, 8, 24, 1],
  },
  text: {
    color: "#fcfcfa",
    fontSize: [12, 10, 20, 1],
    fontWeight: [500, 300, 800, 100],
    shadowY: [1, 0, 4, 0.5],
    shadowBlur: [0, 0, 4, 0.5],
    shadowColor: "rgba(0, 0, 0, 0.5)",
  },
  gradient: {
    top: "#333333",
    bottom: "#2e2e2e",
    hoverTop: "#383838",
    hoverBottom: "#323232",
  },
  edge: {
    width: [1, 0, 3, 0.5],
    color: "rgba(0, 0, 0, 0.5)",
  },
  depth: {
    contact: {
      _collapsed: true,
      y: [1, 0, 8, 0.5],
      blur: [1, 0, 16, 0.5],
      spread: [0, -8, 8, 0.5],
      color: "rgba(0, 0, 0, 0.3)",
    },
    near: {
      _collapsed: true,
      y: [1.5, 0, 16, 0.5],
      blur: [4, 0, 32, 0.5],
      spread: [0, -8, 8, 0.5],
      color: "rgba(0, 0, 0, 0.25)",
    },
    far: {
      _collapsed: true,
      y: [4, 0, 32, 0.5],
      blur: [7, 0, 48, 0.5],
      spread: [-2, -16, 8, 0.5],
      color: "rgba(0, 0, 0, 0.2)",
    },
  },
  inner: {
    ring: {
      _collapsed: true,
      width: [1, 0, 3, 0.5],
      color: "rgba(255, 255, 255, 0.05)",
    },
    topHighlight: {
      _collapsed: true,
      y: [1, 0, 4, 0.5],
      color: "rgba(255, 255, 255, 0.1)",
    },
    pressedShadow: {
      _collapsed: true,
      y: [2, 0, 8, 0.5],
      blur: [3, 0, 12, 0.5],
      color: "rgba(0, 0, 0, 0.15)",
    },
  },
  press: {
    scale: [0.99, 0.85, 1, 0.01],
    duration: [150, 0, 600, 10],
  },
  focusRing: "rgba(255, 255, 255, 0.4)",
} satisfies DialConfig;

type Shadow = { y: number; blur: number; spread: number; color: string };
const drop = ({ y, blur, spread, color }: Shadow) =>
  `0 ${y}px ${blur}px ${spread}px ${color}`;

export default function ShadowBorderButton() {
  const p = useDialKit("Shadow Border Button", CONFIG);
  const { depth, inner } = p;

  const innerLight = [
    `inset 0 0 0 ${inner.ring.width}px ${inner.ring.color}`,
    `inset 0 ${inner.topHighlight.y}px 0 ${inner.topHighlight.color}`,
  ];
  const pressedInner = `inset 0 ${inner.pressedShadow.y}px ${inner.pressedShadow.blur}px ${inner.pressedShadow.color}`;
  const edge = `0 0 0 ${p.edge.width}px ${p.edge.color}`;

  /*
   * One full box-shadow list per state, fed to `shadow-(--var)`. Tailwind's
   * `inset-shadow-(--var)` puts a single `inset` in front of the whole
   * variable, so it can't hold a list of several inset shadows.
   */
  const vars = {
    "--sb-shadow": [
      ...innerLight,
      edge,
      drop(depth.contact),
      drop(depth.near),
      drop(depth.far),
    ].join(", "),
    // Pressed: far shadows drop away and the top inner edge darkens.
    "--sb-shadow-pressed": [
      ...innerLight,
      pressedInner,
      edge,
      drop(depth.contact),
    ].join(", "),
    "--sb-top": p.gradient.top,
    "--sb-bottom": p.gradient.bottom,
    "--sb-hover-top": p.gradient.hoverTop,
    "--sb-hover-bottom": p.gradient.hoverBottom,
    "--sb-press-scale": p.press.scale,
    "--sb-duration": `${p.press.duration}ms`,
    "--sb-focus": p.focusRing,
    "--sb-label-shadow": `0 ${p.text.shadowY}px ${p.text.shadowBlur}px ${p.text.shadowColor}`,
    height: p.size.height,
    paddingInline: p.size.paddingX,
    borderRadius: p.size.radius,
    color: p.text.color,
  } as CSSProperties;

  return (
    <ComponentWrapper>
      <div className="flex">
        <DialRoot theme="dark" />
        <button
          type="button"
          style={vars}
          className="inline-flex items-center justify-center bg-linear-to-b from-(--sb-top) to-(--sb-bottom) hover:from-(--sb-hover-top) hover:to-(--sb-hover-bottom) shadow-(--sb-shadow) active:shadow-(--sb-shadow-pressed) active:scale-(--sb-press-scale) transition-[scale,box-shadow] duration-(--sb-duration) ease-out motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sb-focus)"
        >
          <span
            className="inline-flex items-center drop-shadow-(--sb-label-shadow)"
            style={{
              gap: p.size.gap,
              fontSize: p.text.fontSize,
              fontWeight: p.text.fontWeight,
            }}
          >
            {p.label}
            {p.showIcon ? (
              <GoArrowRight
                aria-hidden
                style={{ width: p.size.iconSize, height: p.size.iconSize }}
              />
            ) : null}
          </span>
        </button>
      </div>
    </ComponentWrapper>
  );
}
