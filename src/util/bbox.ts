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
