import { SetStoreFunction, produce } from "solid-js/store";
import { getLCAChainSuffixes } from "./lcaUtil";
import _ from "lodash";

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
      children: Set<string>;
      parent: string | null;
    }
  | {
      type: "ref";
      refId: string;
      parent: string | null;
    };

export type Scenegraph = {
  [key: string]: ScenegraphNode;
};

// returns resolved node (either the input node or the node it references)
// if the input node is a ref, then it returns the accumulated transform from the node to the ref
// TODO: this function problem breaks if the ref is a ref
export const resolveRef = (
  scenegraph: Scenegraph,
  setScenegraph: SetStoreFunction<Scenegraph>,
  id: string,
  accumulatedTransform?: Transform
): {
  node: ScenegraphNode & { type: "node" };
  transform?: Transform;
} => {
  const node = scenegraph[id];

  if (node === undefined) {
    throw new Error(`Node ${id} not found`);
  }

  // base case
  if (node.type === "node") {
    return {
      node,
      transform: accumulatedTransform,
    };
  }

  // we are in the ref case now so initialize the accumulated transform if it's undefined
  if (accumulatedTransform === undefined) {
    accumulatedTransform = { translate: {} };
  }

  const refNode = scenegraph[node.refId];

  if (refNode === undefined) {
    throw new Error(`Ref node ${node.refId} not found`);
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
      [node.refId, ...refIdSuffix],
      (id) => scenegraph[id].transform.translate.x !== undefined
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

    if (accumulatedTransform.translate.x === undefined) {
      accumulatedTransform.translate.x = 0;
    }
    // NOTE: this creates a read dependency on both suffix chains' transforms
    for (const id of refIdSuffix) {
      accumulatedTransform.translate.x += scenegraph[id].transform.translate.x;
    }
    accumulatedTransform.translate.x += refNode.transform.translate.x;

    for (const id of idSuffix) {
      accumulatedTransform.translate.x -= scenegraph[id].transform.translate.x;
    }
  }

  if (
    _.every(
      [node.refId, ...refIdSuffix],
      (id) => scenegraph[id].transform.translate.y !== undefined
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

    if (accumulatedTransform.translate.y === undefined) {
      accumulatedTransform.translate.y = 0;
    }
    // NOTE: this creates a read dependency on both suffix chains' transforms
    for (const id of refIdSuffix) {
      accumulatedTransform.translate.y += scenegraph[id].transform.translate.y;
    }
    accumulatedTransform.translate.y += refNode.transform.translate.y;

    for (const id of idSuffix) {
      accumulatedTransform.translate.y -= scenegraph[id].transform.translate.y;
    }
  }

  return resolveRef(
    scenegraph,
    setScenegraph,
    node.refId,
    accumulatedTransform
  );
};
