import { maybeAdd, maybeDiv, maybeMax, maybeMin, maybeSub } from "./maybe";

export type Dim =
  | "left"
  | "top"
  | "centerX"
  | "centerY"
  | "right"
  | "bottom"
  | "width"
  | "height";

export type Axis = "x" | "y";

export const axisMap: { [key in Dim]: "x" | "y" } = {
  left: "x",
  centerX: "x",
  right: "x",
  top: "y",
  centerY: "y",
  bottom: "y",
  width: "x",
  height: "y",
};

export type BBox = { [key in Dim]?: number };

export const from = (bboxes: BBox[]): BBox => {
  const bboxesStructOfArray = {
    left: bboxes.map((bbox) => bbox.left),
    top: bboxes.map((bbox) => bbox.top),
    width: bboxes.map((bbox) => bbox.width),
    height: bboxes.map((bbox) => bbox.height),
  };

  const left = maybeMin(bboxesStructOfArray.left);

  const right = maybeMax(
    bboxesStructOfArray.left.map((left, i) =>
      maybeAdd(left, bboxesStructOfArray.width[i])
    )
  );

  const top = maybeMin(bboxesStructOfArray.top);

  const bottom = maybeMax(
    bboxesStructOfArray.top.map((top, i) =>
      maybeAdd(top, bboxesStructOfArray.height[i])
    )
  );

  const width = maybeSub(right, left);
  const height = maybeSub(bottom, top);

  const centerX = maybeAdd(left, maybeDiv(width, 2));
  const centerY = maybeAdd(top, maybeDiv(height, 2));

  return {
    left,
    top,
    right,
    bottom,
    centerX,
    centerY,
    width,
    height,
  };
};

// This is basically a baked version of an LP solver for bbox constraints.
// TODO: These rules are not complete. e.g. left = centerX - width / 2 is missing.
export const inferenceRules: {
  from: Dim[];
  to: Dim;
  calculate: (dims: number[]) => number;
}[] = [
  // width = right - left
  {
    from: ["right", "width"],
    to: "left",
    calculate: ([right, width]) => right - width,
  },
  {
    from: ["left", "width"],
    to: "right",
    calculate: ([left, width]) => left + width,
  },
  {
    from: ["left", "right"],
    to: "width",
    calculate: ([left, right]) => right - left,
  },
  // height = bottom - top
  {
    from: ["bottom", "height"],
    to: "top",
    calculate: ([bottom, height]) => bottom - height,
  },
  {
    from: ["top", "height"],
    to: "bottom",
    calculate: ([top, height]) => top + height,
  },
  {
    from: ["top", "bottom"],
    to: "height",
    calculate: ([top, bottom]) => bottom - top,
  },
  // centerX = (left + right) / 2
  {
    from: ["left", "right"],
    to: "centerX",
    calculate: ([left, right]) => (left + right) / 2,
  },
  {
    from: ["left", "centerX"],
    to: "right",
    calculate: ([left, centerX]) => centerX * 2 - left,
  },
  {
    from: ["right", "centerX"],
    to: "left",
    calculate: ([right, centerX]) => centerX * 2 - right,
  },
  // centerY = (top + bottom) / 2
  {
    from: ["top", "bottom"],
    to: "centerY",
    calculate: ([top, bottom]) => (top + bottom) / 2,
  },
  {
    from: ["top", "centerY"],
    to: "bottom",
    calculate: ([top, centerY]) => centerY * 2 - top,
  },
  {
    from: ["bottom", "centerY"],
    to: "top",
    calculate: ([bottom, centerY]) => centerY * 2 - bottom,
  },
];
