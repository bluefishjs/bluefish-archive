import { SetStoreFunction, createStore, produce } from "solid-js/store";
import { getLCAChainSuffixes } from "./util/lca";
import _ from "lodash";
import { maybeAdd, maybeAddAll, maybeDiv, maybeSub } from "./util/maybe";
import { createContext, useContext } from "solid-js";
import { BBox, Dim, Axis, axisMap, inferenceRules } from "./util/bbox";
import { resolveName } from "./createName";

export type Id = string;
export type Inferred = { inferred: true };
export const inferred: Inferred = { inferred: true };

export type { BBox, Dim, Axis };
export { axisMap };

export type BBoxOwners = { [key in Dim]?: Id | Inferred };

export type Transform = {
  translate: {
    x?: number;
    y?: number;
  };
};

export type RequiredTransform = {
  translate: {
    x: number;
    y: number;
  };
};

export type TransformOwners = {
  translate: {
    x?: Id;
    y?: Id;
  };
};

export type ChildNode = {
  name: Id;
  bbox: BBox;
  owned: { [key in Dim]: boolean };
};

export type ScenegraphNode =
  | {
      type: "node";
      bbox: BBox;
      bboxOwners: BBoxOwners;
      transform: Transform;
      transformOwners: TransformOwners;
      children: Set<Id>;
      parent: Id | null;
      customData?: any;
    }
  | {
      type: "ref";
      refId: Id;
      parent: Id | null;
    };

export type Scenegraph = {
  [key: Id]: ScenegraphNode;
};

// Propagates bbox dims to other dims that can be inferred
export function propagateBBoxValues(bbox: BBox, owners: BBoxOwners): void {
  // const inferredBBox = { ...bbox };

  inferenceRules.forEach((rule) => {
    if (
      rule.from.every((key) => bbox[key] !== undefined) &&
      bbox[rule.to] === undefined
    ) {
      bbox[rule.to] = rule.calculate(rule.from.map((key) => bbox[key]!));
      owners[rule.to] = inferred;
    }
  });
}

export const createScenegraph = (): ScenegraphContextType => {
  const [scenegraph, setScenegraph] = createStore<Scenegraph>({});

  // constructors //
  const createNode = (id: Id, parentId: Id | null) => {
    setScenegraph(id, {
      type: "node",
      bbox: {},
      bboxOwners: {},
      transform: { translate: {} },
      transformOwners: { translate: {} },
      children: new Set(),
      parent: parentId,
      customData: { customData: {} },
    });

    if (parentId !== null) {
      setScenegraph(parentId, (node: ScenegraphNode) => {
        if (node.type === "ref") {
          console.error("Cannot add children to a ref node.");
          return node;
        }

        return {
          ...node,
          children: new Set([...node.children, id]),
        };
      });
    }
  };

  const createRef = (id: Id, refId: Id, parentId: Id) => {
    setScenegraph(id, {
      type: "ref",
      refId,
      parent: parentId,
    });

    if (parentId !== null) {
      setScenegraph(parentId, (node: ScenegraphNode) => {
        if (node.type === "ref") {
          console.error("Cannot add children to a ref node.");
          return node;
        }

        return {
          ...node,
          children: new Set([...node.children, id]),
        };
      });
    }
  };

  // returns resolved node (either the input node or the node it references)
  // if the input node is a ref, then it returns the accumulated transform from the node to the ref
  // TODO: doesn't support ref of ref
  const resolveRef = (
    id: Id,
    mode: "read" | "write" | "check",
    accumulatedTransform: RequiredTransform = {
      translate: { x: 0, y: 0 },
    }
  ): {
    id: Id;
    transform: RequiredTransform;
  } => {
    const node = scenegraph[id];

    // base case
    if (node.type === "node") {
      return {
        id,
        transform: accumulatedTransform,
      };
    }

    const refNode = scenegraph[node.refId];

    if (refNode === undefined) {
      throw new Error(`Ref node ${node.refId} not found`);
    }

    if (refNode.type === "ref") {
      throw new Error("Ref of ref not supported");
    }

    if (mode === "check") {
      // skip materialization
      return {
        id: node.refId,
        transform: accumulatedTransform,
      };
    }

    // To resolve a reference we have to do two things:
    // 1. If the node side's transform is fully resolved, we default transforms on the ref side to 0
    // 2. Accumulate the transform from the node to the ref
    /* 
Suppose we have the following graph:
Example {x: ...}
  Circle {x: 50} #circle
  Align {x: ?}
    Ref #circle

Then we will fill in Align's x transform.
Example {x: ...}
  Circle {x: 50} # circle
  Align {x: 0}
    Ref circle

The accumulated transform will be {x: 50}, which is the transform of the circle as it appears to
the align node.
*/
    const [idSuffix, refIdSuffix] = getLCAChainSuffixes(
      scenegraph,
      id,
      node.refId
    );

    if (
      // if mode is read and the ref node's left is undefined, then we don't want to materialize
      // transforms b/c we can't resolve the ref node's left anyway
      !(
        mode === "read" &&
        (refNode as ScenegraphNode & { type: "node" }).bbox.left === undefined
      )
    ) {
      // default all undefined transforms to 0 on the id side
      for (const idSf of idSuffix) {
        setScenegraph(
          idSf,
          produce((n: ScenegraphNode) => {
            const node = n as ScenegraphNode & { type: "node" };
            if (node.transform.translate.x === undefined) {
              node.transform.translate.x = 0;
              node.transformOwners.translate.x = id;
            }
          })
        );

        accumulatedTransform.translate.x -= (
          scenegraph[idSf] as ScenegraphNode & { type: "node" }
        ).transform.translate.x!;
      }

      for (const refIdSf of refIdSuffix) {
        setScenegraph(
          refIdSf,
          produce((n: ScenegraphNode) => {
            const node = n as ScenegraphNode & { type: "node" };
            if (node.transform.translate.x === undefined) {
              node.transform.translate.x = 0;
              node.transformOwners.translate.x = id;
            }
          })
        );

        accumulatedTransform.translate.x += (
          scenegraph[refIdSf] as ScenegraphNode & { type: "node" }
        ).transform.translate.x!;
      }
    }

    if (
      // if mode is read and the ref node's top is undefined, then we don't want to materialize
      // transforms b/c we can't resolve the ref node's top anyway
      !(
        mode === "read" &&
        (refNode as ScenegraphNode & { type: "node" }).bbox.top === undefined
      )
    ) {
      // default all undefined transforms to 0 on the id side
      for (const idSf of idSuffix) {
        setScenegraph(
          idSf,
          produce((n: ScenegraphNode) => {
            const node = n as ScenegraphNode & { type: "node" };
            if (node.transform.translate.y === undefined) {
              node.transform.translate.y = 0;
              node.transformOwners.translate.y = id;
            }
          })
        );

        accumulatedTransform.translate.y -= (
          scenegraph[idSf] as ScenegraphNode & { type: "node" }
        ).transform.translate.y!;
      }

      for (const refIdSf of refIdSuffix) {
        setScenegraph(
          refIdSf,
          produce((n: ScenegraphNode) => {
            const node = n as ScenegraphNode & { type: "node" };
            if (node.transform.translate.y === undefined) {
              node.transform.translate.y = 0;
              node.transformOwners.translate.y = id;
            }
          })
        );

        accumulatedTransform.translate.y += (
          scenegraph[refIdSf] as ScenegraphNode & { type: "node" }
        ).transform.translate.y!;
      }
    }
    return resolveRef(node.refId, mode, accumulatedTransform);
  };

  const getBBox = (id: string): BBox => {
    const { id: resolvedId, transform } = resolveRef(id, "read");
    const node = scenegraph[resolvedId] as ScenegraphNode & { type: "node" }; // guaranteed by resolveRef

    return {
      get left() {
        return maybeAddAll(
          node.bbox.left,
          node.transform.translate.x,
          transform.translate.x
        );
      },
      get centerX() {
        return maybeAddAll(
          node.bbox.centerX,
          node.transform.translate.x,
          transform.translate.x
        );
      },
      get right() {
        return maybeAddAll(
          node.bbox.right,
          node.transform.translate.x,
          transform.translate.x
        );
      },
      get top() {
        return maybeAddAll(
          node.bbox.top,
          node.transform.translate.y,
          transform.translate.y
        );
      },
      get centerY() {
        return maybeAddAll(
          node.bbox.centerY,
          node.transform.translate.y,
          transform.translate.y
        );
      },
      get bottom() {
        return maybeAddAll(
          node.bbox.bottom,
          node.transform.translate.y,
          transform.translate.y
        );
      },
      get width() {
        return node.bbox.width;
      },
      get height() {
        return node.bbox.height;
      },
    };
  };

  // merge bbox and transform into the id node. these properties are owned by the owner node
  const mergeBBoxAndTransform = (
    owner: Id,
    id: Id,
    bbox: BBox,
    transform: Transform
  ) => {
    // TODO: should I untrack this?
    // const { id: resolvedId, transform: accumulatedTransform } = resolveRef(id);

    // if any of the bbox values are NaN (undefined is ok), console.error and skip
    for (const key of Object.keys(bbox) as Array<Dim>) {
      if (bbox[key] !== undefined && isNaN(bbox[key]!)) {
        console.error(
          `setBBox: ${resolveName(owner)} tried to update ${resolveName(
            id
          )}'s bbox with ${JSON.stringify(
            bbox
          )}, but the bbox contains NaN values. Skipping...`
        );
        return;
      }
    }

    setScenegraph(
      id,
      produce((n: ScenegraphNode) => {
        const node = n as ScenegraphNode & { type: "node" }; // guaranteed by resolveRef

        // check bbox ownership
        for (const key of Object.keys(bbox) as Array<Dim>) {
          if (
            bbox[key] !== undefined &&
            node.bboxOwners[key] !== undefined &&
            node.bboxOwners[key] !== owner
          ) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                id
              )}'s ${key} to ${
                bbox[key]
              } but it was already set by ${resolveName(
                node.bboxOwners[key]! as any /* TODO: handle inferred case */
              )}. Only one component can set a bbox property. We skipped this update.`
            );
            return node;
          }
        }

        // check transform ownership
        for (const key of Object.keys(transform?.translate ?? {}) as Array<
          keyof Transform["translate"]
        >) {
          if (
            transform?.translate[key] !== undefined &&
            node.transformOwners.translate[key] !== undefined &&
            node.transformOwners.translate[key] !== owner
          ) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                id
              )}'s translate.${key} to ${
                transform?.translate[key]
              } but it was already set by ${resolveName(
                node.transformOwners.translate[
                  key
                ]! as any /* TODO: handle inferred case */
              )}. Only one component can set a transform property. We skipped this update.`
            );
            return node;
          }
        }

        const newBBoxOwners: BBoxOwners = {
          ...(bbox.left !== undefined ? { left: owner } : {}),
          ...(bbox.centerX !== undefined ? { centerX: owner } : {}),
          ...(bbox.right !== undefined ? { right: owner } : {}),
          ...(bbox.top !== undefined ? { top: owner } : {}),
          ...(bbox.centerY !== undefined ? { centerY: owner } : {}),
          ...(bbox.bottom !== undefined ? { bottom: owner } : {}),
          ...(bbox.width !== undefined ? { width: owner } : {}),
          ...(bbox.height !== undefined ? { height: owner } : {}),
        };

        const newTransformOwners: TransformOwners = {
          translate: {
            x: transform?.translate.x !== undefined ? owner : undefined,
            y: transform?.translate.y !== undefined ? owner : undefined,
          },
        };

        const newTransform = {
          translate: transform?.translate ?? {},
        };

        for (const key of Object.keys(bbox) as Array<Dim>) {
          if (bbox[key] !== undefined) {
            node.bbox[key] = bbox[key];
          }
        }

        for (const key of Object.keys(newBBoxOwners) as Array<Dim>) {
          if (newBBoxOwners[key] !== undefined) {
            node.bboxOwners[key] = newBBoxOwners[key];
          }
        }

        if (newTransform.translate.x !== undefined) {
          node.transform.translate.x = newTransform.translate.x;
        }

        if (newTransform.translate.y !== undefined) {
          node.transform.translate.y = newTransform.translate.y;
        }

        if (newTransformOwners.translate.x !== undefined) {
          node.transformOwners.translate.x = newTransformOwners.translate.x;
        }

        if (newTransformOwners.translate.y !== undefined) {
          node.transformOwners.translate.y = newTransformOwners.translate.y;
        }

        propagateBBoxValues(node.bbox, node.bboxOwners);
      })
    );
  };

  const setCustomData = (id: Id, customData: any) => {
    setScenegraph(
      id,
      produce((n: ScenegraphNode) => {
        const node = n as ScenegraphNode & { type: "node" }; // guaranteed by resolveRef

        if (customData !== undefined) {
          node.customData = customData;
        }
      })
    );
  };

  const setBBox = (owner: Id, id: Id, bbox: BBox) => {
    const { id: resolvedId, transform: accumulatedTransform } = resolveRef(
      id,
      "write"
    );

    // if any of the bbox values are NaN (undefined is ok), console.error and skip
    for (const key of Object.keys(bbox) as Array<Dim>) {
      if (bbox[key] !== undefined && isNaN(bbox[key]!)) {
        // error message should include id, bbox, owner
        console.error(
          `setBBox: ${resolveName(owner)} tried to update ${resolveName(
            resolvedId
          )}'s bbox with ${JSON.stringify(
            bbox
          )}, but the bbox contains NaN values. Skipping...`
        );
        return;
      }
    }

    const node = scenegraph[resolvedId] as ScenegraphNode & { type: "node" }; // guaranteed by resolveRef

    const proposedBBox: BBox = {};
    const proposedTransform: Transform = {
      translate: {},
    };

    for (const dim of [
      "left",
      "centerX",
      "right",
      "top",
      "centerY",
      "bottom",
    ] as const) {
      if (bbox[dim] === undefined) continue;

      const axis = axisMap[dim];
      if (accumulatedTransform.translate[axis] === undefined) {
        console.error(
          `setBBox: ${resolveName(owner)} tried to update ${resolveName(
            resolvedId
          )}'s bbox.${dim} with ${
            bbox[dim]
          }, but the accumulated transform.translate.${axis} is undefined. Skipping...`
        );
        continue;
      }

      if (
        node.bboxOwners[dim] === owner ||
        node.bboxOwners[dim] === undefined
      ) {
        if (node.transformOwners.translate[axis] === undefined) {
          // need to set the translate[axis] so that the dim doesn't move
          // NOTE: this case doesn't always happen. e.g. `right` could be set before `left` in which
          // case `right` has already set the translate.x
          proposedTransform.translate[axis] = 0;
          proposedBBox[dim] = bbox[dim]!;
        } else {
          proposedBBox[dim] = bbox[dim]! - node.transform.translate[axis]!;
        }
      } else if (
        node.transformOwners.translate[axis] === owner ||
        node.transformOwners.translate[axis] === undefined
      ) {
        proposedTransform.translate[axis] = bbox[dim]! - node.bbox[dim]!;
      } else {
        console.error(
          `setBBox: ${resolveName(owner)} tried to update ${resolveName(
            resolvedId
          )}'s bbox.${dim} with ${
            bbox[dim]
          }, but it was already set by ${resolveName(
            node.bboxOwners[dim]! as any /* TODO: handle inferred case */
          )}. Only one component can set a bbox property. We skipped this update.`
        );
        return;
      }
    }

    for (const dim of ["width", "height"] as const) {
      if (bbox[dim] === undefined) continue;

      if (
        node.bboxOwners[dim] === owner ||
        node.bboxOwners[dim] === undefined
      ) {
        proposedBBox[dim] = bbox[dim]!;
      } else {
        console.error(
          `setBBox: ${resolveName(owner)} tried to update ${resolveName(
            resolvedId
          )}'s bbox.${dim} with ${
            bbox[dim]
          }, but it was already set by ${resolveName(
            node.bboxOwners[dim]! as any /* TODO: handle inferred case */
          )}. Only one component can set a bbox property. We skipped this update.`
        );
        return;
      }
    }

    proposedTransform.translate.x = maybeAdd(
      proposedTransform.translate.x,
      accumulatedTransform.translate.x
    );

    proposedTransform.translate.y = maybeAdd(
      proposedTransform.translate.y,
      accumulatedTransform.translate.y
    );

    mergeBBoxAndTransform(owner, resolvedId, proposedBBox, proposedTransform);
  };

  const ownedByOther = (
    id: Id, // with respect to `id`
    check: Id, // is `check` already owned
    dim: Dim // on this `dim`?
  ): boolean => {
    const { id: resolvedId } = resolveRef(check, "check");
    const node = scenegraph[resolvedId] as ScenegraphNode & { type: "node" }; // guaranteed by resolveRef

    if (dim === "left" || dim === "centerX" || dim === "right") {
      return !(
        node.bboxOwners[dim] === undefined ||
        node.bboxOwners[dim] === id ||
        node.transformOwners.translate.x === undefined ||
        node.transformOwners.translate.x === id
      );
    } else if (dim === "top" || dim === "centerY" || dim === "bottom") {
      return !(
        node.bboxOwners[dim] === undefined ||
        node.bboxOwners[dim] === id ||
        node.transformOwners.translate.y === undefined ||
        node.transformOwners.translate.y === id
      );
    } else if (dim === "width" || dim === "height") {
      return !(
        node.bboxOwners[dim] === undefined || node.bboxOwners[dim] === id
      );
    } else {
      throw new Error(`Invalid dim: ${dim}`);
    }
  };

  const createChildRepr = (owner: Id, childId: Id): ChildNode => {
    return {
      name: childId,
      bbox: {
        get left() {
          return getBBox(childId).left;
        },
        set left(left: number | undefined) {
          if (left === undefined) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                childId
              )}'s left to undefined. Skipping...`
            );
            return;
          }

          setBBox(owner, childId, { left });
        },
        get centerX() {
          return getBBox(childId).centerX;
        },
        set centerX(centerX: number | undefined) {
          if (centerX === undefined) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                childId
              )}'s centerX to undefined. Skipping...`
            );
            return;
          }

          setBBox(owner, childId, { centerX });
        },
        get right() {
          return getBBox(childId).right;
        },
        set right(right: number | undefined) {
          if (right === undefined) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                childId
              )}'s right to undefined. Skipping...`
            );
            return;
          }

          setBBox(owner, childId, { right });
        },
        get top() {
          return getBBox(childId).top;
        },
        set top(top: number | undefined) {
          if (top === undefined) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                childId
              )}'s top to undefined. Skipping...`
            );
            return;
          }

          setBBox(owner, childId, { top });
        },
        get centerY() {
          return getBBox(childId).centerY;
        },
        set centerY(centerY: number | undefined) {
          if (centerY === undefined) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                childId
              )}'s centerY to undefined. Skipping...`
            );
            return;
          }

          setBBox(owner, childId, { centerY });
        },
        get bottom() {
          return getBBox(childId).bottom;
        },
        set bottom(bottom: number | undefined) {
          if (bottom === undefined) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                childId
              )}'s bottom to undefined. Skipping...`
            );
            return;
          }

          setBBox(owner, childId, { bottom });
        },
        get width() {
          return getBBox(childId).width;
        },
        set width(width: number | undefined) {
          if (width === undefined) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                childId
              )}'s width to undefined. Skipping...`
            );
            return;
          }

          setBBox(owner, childId, { width });
        },
        get height() {
          return getBBox(childId).height;
        },
        set height(height: number | undefined) {
          if (height === undefined) {
            console.error(
              `${resolveName(owner)} tried to set ${resolveName(
                childId
              )}'s height to undefined. Skipping...`
            );
            return;
          }

          setBBox(owner, childId, { height });
        },
      },
      owned: {
        get left() {
          return ownedByOther(owner, childId, "left");
        },
        get centerX() {
          return ownedByOther(owner, childId, "centerX");
        },
        get right() {
          return ownedByOther(owner, childId, "right");
        },
        get top() {
          return ownedByOther(owner, childId, "top");
        },
        get centerY() {
          return ownedByOther(owner, childId, "centerY");
        },
        get bottom() {
          return ownedByOther(owner, childId, "bottom");
        },
        get width() {
          return ownedByOther(owner, childId, "width");
        },
        get height() {
          return ownedByOther(owner, childId, "height");
        },
      },
    };
  };

  return {
    scenegraph,
    // constructors
    createNode,
    createRef,
    // mid-level API
    resolveRef,
    mergeBBoxAndTransform,
    // API
    setCustomData,
    getBBox,
    setBBox,
    ownedByOther,
    createChildRepr,
  };
};

export type ScenegraphContextType = {
  scenegraph: Scenegraph;
  createNode: (id: Id, parentId: Id | null) => void;
  createRef: (id: Id, refId: Id, parentId: Id) => void;
  resolveRef: (
    id: Id,
    mode: "read" | "write" | "check"
  ) => { id: Id; transform: Transform };
  mergeBBoxAndTransform: (
    owner: Id,
    id: Id,
    bbox: BBox,
    transform: Transform
  ) => void;
  setCustomData: (id: Id, customData: any) => void;
  getBBox: (id: Id) => BBox;
  setBBox: (owner: Id, id: Id, bbox: BBox) => void;
  ownedByOther: (id: Id, check: Id, dim: Dim) => boolean;
  createChildRepr: (owner: Id, childId: Id) => ChildNode;
};

export const ScenegraphContext = createContext<ScenegraphContextType | null>(
  null
);

export const useScenegraph = () => {
  const context = useContext(ScenegraphContext);

  if (context === null) {
    throw new Error("useScenegraph must be used within a ScenegraphProvider");
  }

  const { getBBox, setBBox, ownedByOther } = context;
  return { getBBox, setBBox, ownedByOther };
};

export const UNSAFE_useScenegraph = () => {
  const context = useContext(ScenegraphContext);

  if (context === null) {
    throw new Error("useScenegraph must be used within a ScenegraphProvider");
  }

  return context;
};

export const ParentIDContext = createContext<Id | null>(null);

export type LayoutFn = (childNodes: ChildNode[]) => {
  bbox: Partial<BBox>;
  transform: Transform;
  customData?: any;
};
