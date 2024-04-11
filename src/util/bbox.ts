import { createMemo } from "solid-js";
import { maybeAdd, maybeDiv, maybeMax, maybeMin, maybeSub } from "./maybe";
import { createStore, produce } from "solid-js/store";
import { BBoxOwners, Id, Inferred, inferred } from "../scenegraph";

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
  if (bboxes.length === 0)
    return {
      centerX: 0,
      centerY: 0,
      width: 0,
      height: 0,
    };

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
    // left,
    // top,
    // right,
    // bottom,
    centerX,
    centerY,
    width,
    height,
  };
};

export const dimensionVectors: {
  [key in Axis]: { [key in string]: [number, number] };
} = {
  x: {
    left: [1, -0.5],
    right: [1, 0.5],
    centerX: [1, 0],
    width: [0, 1],
  },
  y: {
    top: [1, -0.5],
    bottom: [1, 0.5],
    centerY: [1, 0],
    height: [0, 1],
  },
};

// solve 2x2 system given two equations e1 and e2
export const solveSystem = (
  e1: [[number, number], number],
  e2: [[number, number], number]
): [number, number] => {
  const a = e1[0][0];
  const b = e1[0][1];
  const c = e1[1];
  const d = e2[0][0];
  const e = e2[0][1];
  const f = e2[1];

  const det = a * e - b * d;

  if (det === 0) {
    throw new Error("system is not solvable");
  }

  const center = (e * c - b * f) / det;
  const size = (a * f - c * d) / det;

  return [center, size];
};

/* 
Ok so the problem is that we always want a property to be readable if it has been set. At the very
least the width should be readable if it has been set even if left and right are undefined. But also
if right is defined and nothing else it should probably be readable as well I think?

So if a field is read
- first check if it is in the equations list
  - if so we can return the value
- otherwise check if the system has been solved (i.e. there are two equations)
  - if so we can return the value
- otherwise we can return undefined

Only the fields in the equations list are owned. The rest are inferred.
*/
export const createLinSysBBox = (): {
  bbox: BBox;
  owners: BBoxOwners;
} => {
  const [equations, setEquations] = createStore<{
    [key in Axis]: { [key in Dim]?: [[number, number], number] };
  }>({
    x: {},
    y: {},
  });

  const [owners, setOwners] = createStore<{
    [key in Axis]: { [key in Dim]?: Id | Inferred };
  }>({
    x: {},
    y: {},
  });

  const centerXAndWidth = createMemo(() => {
    const xEqs = Object.values(equations.x);
    if (xEqs.length < 2) return undefined;
    else {
      const [centerX, width] = solveSystem(xEqs[0], xEqs[1]);
      if (xEqs.length > 2) {
        // check the other equations
        for (const eq of xEqs.slice(2)) {
          if (Math.abs(eq[0][0] * centerX + eq[0][1] * width - eq[1]) > 1e-6) {
            throw new Error(
              `System is not solvable. Equations: ${JSON.stringify(xEqs)}`
            );
          }
        }
      }
      return [centerX, width];
    }
  });

  const centerYAndHeight = createMemo(() => {
    const yEqs = Object.values(equations.y);
    if (yEqs.length < 2) return undefined;
    else {
      const [centerY, height] = solveSystem(yEqs[0], yEqs[1]);
      if (yEqs.length > 2) {
        // check the other equations
        for (const eq of yEqs.slice(2)) {
          if (Math.abs(eq[0][0] * centerY + eq[0][1] * height - eq[1]) > 1e-6) {
            throw new Error(
              `System is not solvable. Equations: ${JSON.stringify(yEqs)}`
            );
          }
        }
      }
      return [centerY, height];
    }
  });

  return {
    bbox: {
      get left() {
        if ("left" in equations.x) {
          return equations.x.left![1];
        } else if (centerXAndWidth() === undefined) {
          return undefined;
        } else {
          return centerXAndWidth()![0] - centerXAndWidth()![1] / 2;
        }
      },
      set left(left: number | undefined) {
        if (left === undefined) {
          setEquations(
            "x",
            produce((dims) => {
              delete dims.left;
            })
          );
        } else {
          setEquations("x", "left", [[1, -0.5], left]);
        }
      },
      get centerX() {
        if ("centerX" in equations.x) {
          return equations.x.centerX![1];
        } else if (centerXAndWidth() === undefined) {
          return undefined;
        } else {
          return centerXAndWidth()![0];
        }
      },
      set centerX(centerX: number | undefined) {
        if (centerX === undefined) {
          setEquations(
            "x",
            produce((dims) => {
              delete dims.centerX;
            })
          );
        } else {
          setEquations("x", "centerX", [[1, 0], centerX]);
        }
      },
      get right() {
        if ("right" in equations.x) {
          return equations.x.right![1];
        } else if (centerXAndWidth() === undefined) {
          return undefined;
        } else {
          return centerXAndWidth()![0] + centerXAndWidth()![1] / 2;
        }
      },
      set right(right: number | undefined) {
        if (right === undefined) {
          setEquations(
            "x",
            produce((dims) => {
              delete dims.right;
            })
          );
        } else {
          setEquations("x", "right", [[1, 0.5], right]);
        }
      },
      get width() {
        if ("width" in equations.x) {
          return equations.x.width![1];
        } else if (centerXAndWidth() === undefined) {
          return undefined;
        } else {
          return centerXAndWidth()![1];
        }
      },
      set width(width: number | undefined) {
        if (width === undefined) {
          setEquations(
            "x",
            produce((dims) => {
              delete dims.width;
            })
          );
        } else {
          setEquations("x", "width", [[0, 1], width]);
        }
      },
      get top() {
        if ("top" in equations.y) {
          return equations.y.top![1];
        } else if (centerYAndHeight() === undefined) {
          return undefined;
        } else {
          return centerYAndHeight()![0] - centerYAndHeight()![1] / 2;
        }
      },
      set top(top: number | undefined) {
        if (top === undefined) {
          setEquations(
            "y",
            produce((dims) => {
              delete dims.top;
            })
          );
        } else {
          setEquations("y", "top", [[1, -0.5], top]);
        }
      },
      get centerY() {
        if ("centerY" in equations.y) {
          return equations.y.centerY![1];
        } else if (centerYAndHeight() === undefined) {
          return undefined;
        } else {
          return centerYAndHeight()![0];
        }
      },
      set centerY(centerY: number | undefined) {
        if (centerY === undefined) {
          setEquations(
            "y",
            produce((dims) => {
              delete dims.centerY;
            })
          );
        } else {
          setEquations("y", "centerY", [[1, 0], centerY]);
        }
      },
      get bottom() {
        if ("bottom" in equations.y) {
          return equations.y.bottom![1];
        } else if (centerYAndHeight() === undefined) {
          return undefined;
        } else {
          return centerYAndHeight()![0] + centerYAndHeight()![1] / 2;
        }
      },
      set bottom(bottom: number | undefined) {
        if (bottom === undefined) {
          setEquations(
            "y",
            produce((dims) => {
              delete dims.bottom;
            })
          );
        } else {
          setEquations("y", "bottom", [[1, 0.5], bottom]);
        }
      },
      get height() {
        if ("height" in equations.y) {
          return equations.y.height![1];
        } else if (centerYAndHeight() === undefined) {
          return undefined;
        } else {
          return centerYAndHeight()![1];
        }
      },
      set height(height: number | undefined) {
        if (height === undefined) {
          setEquations(
            "y",
            produce((dims) => {
              delete dims.height;
            })
          );
        } else {
          setEquations("y", "height", [[0, 1], height]);
        }
      },
    },
    owners: {
      get left() {
        if ("left" in owners.x) {
          return owners.x.left;
        } else if (Object.keys(equations.x).length === 2) {
          return inferred;
        } else {
          return undefined;
        }
      },
      set left(left: Id | undefined | Inferred) {
        if (left === undefined) {
          setOwners(
            "x",
            produce((dims) => {
              delete dims.left;
            })
          );
        } else {
          setOwners("x", "left", left);
        }
      },
      get centerX() {
        if ("centerX" in owners.x) {
          return owners.x.centerX;
        } else if (Object.keys(equations.x).length === 2) {
          return inferred;
        } else {
          return undefined;
        }
      },
      set centerX(centerX: Id | undefined | Inferred) {
        if (centerX === undefined) {
          setOwners(
            "x",
            produce((dims) => {
              delete dims.centerX;
            })
          );
        } else {
          setOwners("x", "centerX", centerX);
        }
      },
      get right() {
        if ("right" in owners.x) {
          return owners.x.right;
        } else if (Object.keys(equations.x).length === 2) {
          return inferred;
        } else {
          return undefined;
        }
      },
      set right(right: Id | undefined | Inferred) {
        if (right === undefined) {
          setOwners(
            "x",
            produce((dims) => {
              delete dims.right;
            })
          );
        } else {
          setOwners("x", "right", right);
        }
      },
      get width() {
        if ("width" in owners.x) {
          return owners.x.width;
        } else if (Object.keys(equations.x).length === 2) {
          return inferred;
        } else {
          return undefined;
        }
      },
      set width(width: Id | undefined | Inferred) {
        if (width === undefined) {
          setOwners(
            "x",
            produce((dims) => {
              delete dims.width;
            })
          );
        } else {
          setOwners("x", "width", width);
        }
      },
      get top() {
        if ("top" in owners.y) {
          return owners.y.top;
        } else if (Object.keys(equations.y).length === 2) {
          return inferred;
        } else {
          return undefined;
        }
      },
      set top(top: Id | undefined | Inferred) {
        if (top === undefined) {
          setOwners(
            "y",
            produce((dims) => {
              delete dims.top;
            })
          );
        } else {
          setOwners("y", "top", top);
        }
      },
      get centerY() {
        if ("centerY" in owners.y) {
          return owners.y.centerY;
        } else if (Object.keys(equations.y).length === 2) {
          return inferred;
        } else {
          return undefined;
        }
      },
      set centerY(centerY: Id | undefined | Inferred) {
        if (centerY === undefined) {
          setOwners(
            "y",
            produce((dims) => {
              delete dims.centerY;
            })
          );
        } else {
          setOwners("y", "centerY", centerY);
        }
      },
      get bottom() {
        if ("bottom" in owners.y) {
          return owners.y.bottom;
        } else if (Object.keys(equations.y).length === 2) {
          return inferred;
        } else {
          return undefined;
        }
      },
      set bottom(bottom: Id | undefined | Inferred) {
        if (bottom === undefined) {
          setOwners(
            "y",
            produce((dims) => {
              delete dims.bottom;
            })
          );
        } else {
          setOwners("y", "bottom", bottom);
        }
      },
      get height() {
        if ("height" in owners.y) {
          return owners.y.height;
        } else if (Object.keys(equations.y).length === 2) {
          return inferred;
        } else {
          return undefined;
        }
      },
      set height(height: Id | undefined | Inferred) {
        if (height === undefined) {
          setOwners(
            "y",
            produce((dims) => {
              delete dims.height;
            })
          );
        } else {
          setOwners("y", "height", height);
        }
      },
    },
  };
};
