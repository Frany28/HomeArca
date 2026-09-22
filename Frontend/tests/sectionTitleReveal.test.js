import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { transformSync } from "esbuild";
import { getSectionRevealClip, getSectionRevealTransition } from "../src/pages/publicSite/utils/sectionReveal.js";

const read = (path) => readFileSync(new URL(`../src/pages/publicSite/${path}`, import.meta.url), "utf8");

test("the unclipped heading detects viewport reentry while its content animates", () => {
  const source = read("components/SectionTitleReveal.jsx")
    .replace(/import[^;]+;\s*/g, "")
    .replace("export default function", "function");
  const { code } = transformSync(source, { loader: "jsx", jsxFactory: "element" });
  const ref = { current: null };
  let inView = false;
  let reduceMotion = false;
  const dependencies = {
    useRef: () => ref,
    useInView: (observedRef, options) => {
      assert.equal(observedRef, ref);
      assert.equal(options.amount, 0.2);
      assert.notEqual(options.once, true);
      return inView;
    },
    useReducedMotion: () => reduceMotion,
    Motion: { div: "animated-content" },
    getSectionRevealClip, getSectionRevealTransition,
    element: (type, props, ...children) => ({ type, props, children }),
  };
  const render = new Function(...Object.keys(dependencies), `${code}; return SectionTitleReveal;`)(...Object.values(dependencies));
  for (const entered of [false, true, false, true]) {
    inView = entered;
    const heading = render({ children: "Heading", className: "original-layout" });
    assert.equal(heading.type, "div");
    assert.equal(heading.props.ref, ref);
    assert.equal(heading.props.className, "original-layout");
    assert.equal(heading.props.animate, undefined);
    const content = heading.children.find((child) => child?.type === "animated-content");
    assert.equal(content.props.ref, undefined);
    assert.equal(content.props.animate.clipPath, getSectionRevealClip(entered));
    assert.deepEqual(content.children, ["Heading"]);
  }
  inView = false;
  for (const requestedVisible of [false, true]) {
    inView = true;
    const content = render({ children: "Heading", visible: requestedVisible }).children.find((child) => child?.type === "animated-content");
    assert.equal(content.props.animate.clipPath, getSectionRevealClip(requestedVisible));
  }
  inView = false;
  reduceMotion = true;
  const content = render({ children: "Heading" }).children.find((child) => child?.type === "animated-content");
  assert.equal(content.props.animate.clipPath, getSectionRevealClip(true));
  assert.deepEqual(content.props.transition, { duration: 0 });
});

test("section headings share the hero reveal and replay on viewport reentry", () => {
  const shared = read("components/SectionTitleReveal.jsx");
  for (const path of ["services/components/ServicesHeading.jsx", "featuredProjects/components/FeaturedProjectsSection.jsx"]) {
    assert.match(read(path), /<SectionTitleReveal/);
    assert.doesNotMatch(read(path), /SplitText|whileInView/);
  }
  for (const source of [shared, read("home/components/HomeHeroTitle/HomeHeroTitle.jsx")]) {
    assert.match(source, /getSectionRevealTransition\(visible, reduceMotion\)/);
    assert.match(source, /getSectionRevealClip\(visible\)/);
  }
  assert.match(shared, /useInView\(ref, \{ amount: 0\.2 \}\)/);
  assert.doesNotMatch(shared, /once: true/);
  assert.match(shared, /Boolean\(reduceMotion\) \|\| \(requestedVisible \?\? inView\)/);
});

test("the shared mask opens and closes with the same spring, with no reduced-motion delay", () => {
  assert.equal(getSectionRevealClip(false), "inset(0 0 100% 0)");
  assert.equal(getSectionRevealClip(true), "inset(0 0 0 0)");
  assert.deepEqual(getSectionRevealTransition(true, false), {
    type: "spring", duration: 0.9, bounce: 0.12, delay: 0.1,
  });
  assert.equal(getSectionRevealTransition(false, false).delay, 0);
  assert.deepEqual(getSectionRevealTransition(true, true), { duration: 0 });
});
