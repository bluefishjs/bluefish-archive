import { SetStoreFunction, createStore, produce } from "solid-js/store";
import { getLCAChainSuffixes } from "./lcaUtil";
import _ from "lodash";
import { maybeAdd, maybeAddAll, maybeSub } from "./maybeUtil";
import { createContext, untrack, useContext } from "solid-js";

export type Id = string;

export type BBox = {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  centerX?: number;
  centerY?: number;
  width?: number;
  height?: number;
};

export type BBoxOwners = { [key in keyof BBox]?: Id };

export type Transform = {
  translate: {
    x?: number;
    y?: number;
  };
};

export type TransformOwners = {
  translate: {
    x?: Id;
    y?: Id;
  };
};

function mergeObjects<T, U>(
  obj1: Record<string, T>,
  obj2: Record<string, U>
): Record<string, T | U> {
  const result: Record<string, T | U> = { ...obj1 };

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      if (typeof obj2[key] !== "undefined") {
        result[key] = obj2[key];
      }
    }
  }

  return result;
}

export type ScenegraphNode =
  | {
      type: "node";
      bbox: BBox;
      bboxOwners: BBoxOwners;
      transform: Transform;
      transformOwners: TransformOwners;
      children: Set<Id>;
      parent: Id | null;
    }
  | {
      type: "ref";
      refId: Id;
      parent: Id | null;
    };

export type Scenegraph = {
  [key: Id]: ScenegraphNode;
};

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
    accumulatedTransform: Transform = { translate: { x: 0, y: 0 } }
  ): {
    id: Id;
    transform: Transform;
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

    // TODO: this will break if node.refId is a ref b/c then it doesn't have a transform
    if (
      _.every(
        [/* node.refId, */ ...refIdSuffix],
        (id) =>
          (scenegraph[id] as ScenegraphNode & { type: "node" }).transform
            .translate.x !== undefined
      )
    ) {
      // the x value is defined on the refId side
      // default all undefined transforms to 0 on the id side
      for (const id of idSuffix) {
        setScenegraph(
          id,
          produce((n: ScenegraphNode) => {
            const node = n as ScenegraphNode & { type: "node" };
            if (node.transform.translate.x === undefined) {
              node.transform.translate.x = 0;
              node.transformOwners.translate.x = id;
            }
          })
        );
      }

      // NOTE: this creates a read dependency on both suffix chains' transforms
      for (const id of [...refIdSuffix /* , node.refId */]) {
        accumulatedTransform.translate.x = maybeAdd(
          accumulatedTransform.translate.x,
          (scenegraph[id] as ScenegraphNode & { type: "node" }).transform
            .translate.x
        );
      }

      for (const id of idSuffix) {
        accumulatedTransform.translate.x = maybeSub(
          accumulatedTransform.translate.x,
          (scenegraph[id] as ScenegraphNode & { type: "node" }).transform
            .translate.x
        );
      }
    } else {
      accumulatedTransform.translate.x = undefined;
    }

    if (
      _.every(
        [/* node.refId, */ ...refIdSuffix],
        (id) =>
          (scenegraph[id] as ScenegraphNode & { type: "node" }).transform
            .translate.y !== undefined
      )
    ) {
      // the y value is defined on the refId side
      // default all undefined transforms to 0 on the id side
      for (const id of idSuffix) {
        setScenegraph(
          id,
          produce((n: ScenegraphNode) => {
            const node = n as ScenegraphNode & { type: "node" };
            if (node.transform.translate.y === undefined) {
              node.transform.translate.y = 0;
              node.transformOwners.translate.y = id;
            }
          })
        );
      }

      // NOTE: this creates a read dependency on both suffix chains' transforms
      for (const id of [...refIdSuffix /* , node.refId */]) {
        accumulatedTransform.translate.y = maybeAdd(
          accumulatedTransform.translate.y,
          (scenegraph[id] as ScenegraphNode & { type: "node" }).transform
            .translate.y
        );
      }

      for (const id of idSuffix) {
        accumulatedTransform.translate.y = maybeSub(
          accumulatedTransform.translate.y,
          (scenegraph[id] as ScenegraphNode & { type: "node" }).transform
            .translate.y
        );
      }
    } else {
      accumulatedTransform.translate.y = undefined;
    }

    return resolveRef(node.refId, accumulatedTransform);
  };

  const getBBox = (id: string): BBox => {
    const { id: resolvedId, transform } = resolveRef(id);
    const node = scenegraph[resolvedId] as ScenegraphNode & { type: "node" }; // guaranteed by resolveRef

    return {
      get left() {
        return maybeAddAll(
          node.bbox.left,
          node.transform.translate.x,
          transform?.translate.x
        );
      },
      get right() {
        return maybeAddAll(
          node.bbox.right,
          node.transform.translate.x,
          transform?.translate.x
        );
      },
      get top() {
        return maybeAddAll(
          node.bbox.top,
          node.transform.translate.y,
          transform?.translate.y
        );
      },
      get bottom() {
        return maybeAddAll(
          node.bbox.bottom,
          node.transform.translate.y,
          transform?.translate.y
        );
      },
      get width() {
        return node.bbox.width;
      },
      get height() {
        return node.bbox.height;
      },
      get centerX() {
        return maybeAddAll(
          node.bbox.centerX,
          node.transform.translate.x,
          transform?.translate.x
        );
      },
      get centerY() {
        return maybeAddAll(
          node.bbox.centerY,
          node.transform.translate.y,
          transform?.translate.y
        );
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

    setScenegraph(id, (n: ScenegraphNode) => {
      const node = n as ScenegraphNode & { type: "node" }; // guaranteed by resolveRef

      // check bbox ownership
      for (const key of Object.keys(bbox) as Array<keyof BBox>) {
        if (
          bbox[key] !== undefined &&
          node.bboxOwners[key] !== undefined &&
          node.bboxOwners[key] !== owner
        ) {
          console.error(
            `${owner} tried to set ${id}'s ${key} to ${bbox[key]} but it was already set by ${node.bboxOwners[key]}. Only one component can set a bbox property. We skipped this update.`
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
            `${owner} tried to set ${id}'s translate.${key} to ${transform?.translate[key]} but it was already set by ${node.transformOwners.translate[key]}. Only one component can set a transform property. We skipped this update.`
          );
          return node;
        }
      }

      const newBBoxOwners = {
        ...node.bboxOwners,
        ...(bbox.left !== undefined ? { left: owner } : {}),
        ...(bbox.top !== undefined ? { top: owner } : {}),
        ...(bbox.width !== undefined ? { width: owner } : {}),
        ...(bbox.height !== undefined ? { height: owner } : {}),
      };

      const newTransformOwners: TransformOwners = {
        translate: {
          x:
            node.transformOwners.translate.x ??
            (transform?.translate.x !== undefined ? owner : undefined),
          y:
            node.transformOwners.translate.y ??
            (transform?.translate.y !== undefined ? owner : undefined),
        },
      };

      // merge currentBbox and bbox, but don't overwrite currentBbox values with undefined
      const newBBox = mergeObjects(node.bbox, bbox);

      // const convertedTransform = {
      //   translate: {
      //     x: maybeAdd(
      //       transform?.translate.x,
      //       accumulatedTransform?.translate.x
      //     ),
      //     y: maybeAdd(
      //       transform?.translate.y,
      //       accumulatedTransform?.translate.y
      //     ),
      //   },
      // };

      const newTranslate = mergeObjects(
        node.transform.translate,
        transform?.translate ?? {}
      );

      const newTransform = {
        translate: newTranslate,
      };

      return {
        type: "node",
        bbox: newBBox,
        bboxOwners: newBBoxOwners,
        transform: newTransform,
        transformOwners: newTransformOwners,
        children: node.children,
        parent: node.parent,
      };
    });
  };

  const setBBox = (owner: Id, id: Id, bbox: BBox) => {
    const { id: resolvedId, transform: accumulatedTransform } = untrack(() =>
      resolveRef(id)
    );

    // if any of the bbox values are NaN (undefined is ok), console.error and skip
    for (const key of Object.keys(bbox) as Array<keyof BBox>) {
      if (bbox[key] !== undefined && isNaN(bbox[key]!)) {
        // error message should include id, bbox, owner
        console.error(
          `setBBox: ${owner} tried to update ${resolvedId}'s bbox with ${JSON.stringify(
            bbox
          )}, but the bbox contains NaN values. Skipping...`
        );
        return;
      }
    }

    untrack(() => {
      const node = scenegraph[resolvedId] as ScenegraphNode & { type: "node" }; // guaranteed by resolveRef

      const proposedBBox: BBox = {};
      const proposedTransform: Transform = {
        translate: {},
      };

      if (bbox.left !== undefined) {
        if (accumulatedTransform.translate.x === undefined) {
          console.error(
            `setBBox: ${owner} tried to update ${resolvedId}'s bbox.left with ${bbox.left}, but the accumulated transform.translate.x is undefined. Skipping...`
          );
        }
        if (node.bboxOwners.left === owner) {
          proposedBBox.left = bbox.left;
          proposedTransform.translate.x = 0;
        } else if (node.transformOwners.translate.x === owner) {
          proposedTransform.translate.x = bbox.left;
        }
      }

      if (bbox.top !== undefined) {
        if (accumulatedTransform.translate.y === undefined) {
          console.error(
            `setBBox: ${owner} tried to update ${resolvedId}'s bbox.top with ${bbox.top}, but the accumulated transform.translate.y is undefined. Skipping...`
          );
        }
        if (node.bboxOwners.top === owner) {
          proposedBBox.top = bbox.top;
          proposedTransform.translate.y = 0;
        } else if (node.transformOwners.translate.y === owner) {
          proposedTransform.translate.y = bbox.top;
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
    });
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
    getBBox,
    setBBox,
  };
};

export type ScenegraphContextType = {
  scenegraph: Scenegraph;
  createNode: (id: Id, parentId: Id | null) => void;
  createRef: (id: Id, refId: Id, parentId: Id) => void;
  resolveRef: (id: Id) => { id: Id; transform: Transform };
  mergeBBoxAndTransform: (
    owner: Id,
    id: Id,
    bbox: BBox,
    transform: Transform
  ) => void;
  getBBox: (id: Id) => BBox;
  setBBox: (owner: Id, id: Id, bbox: BBox) => void;
};

export const ScenegraphContext = createContext<ScenegraphContextType | null>(
  null
);

export const useScenegraph = () => {
  const context = useContext(ScenegraphContext);

  if (context === null) {
    throw new Error("useScenegraph must be used within a ScenegraphProvider");
  }

  const { getBBox, setBBox } = context;
  return { getBBox, setBBox };
};

export const UNSAFE_useScenegraph = () => {
  const context = useContext(ScenegraphContext);

  if (context === null) {
    throw new Error("useScenegraph must be used within a ScenegraphProvider");
  }

  return context;
};
