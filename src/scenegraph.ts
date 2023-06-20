import { createContext, untrack, useContext } from "solid-js";
import { SetStoreFunction, createStore, produce } from "solid-js/store";
import { getLCAChainSuffixes, getTransformDiff } from "./lcaUtil";
import _ from "lodash";
import { maybeAdd, maybeDiv, maybeSub } from "./maybeUtil";

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

export type TransformOwners = {
  translate: {
    x?: string;
    y?: string;
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

export type Transform = {
  translate: {
    x?: number;
    y?: number;
  };
};

export type LayoutFn = (
  childIds: Id[],
  getBBox?: (id: string) => BBox
) => {
  bbox: Partial<BBox>;
  transform: Transform;
};

export type ScenegraphNode =
  | {
      type: "node";
      bbox: BBox;
      transform: Transform;
      bboxOwners: BBoxOwners;
      transformOwners: TransformOwners;
      children: Set<string>;
      parent: string | null;
      // parents?: string[];
      layout: LayoutFn;
      // paint?
    }
  | {
      type: "ref";
      refId: string;
      transform: Transform;
      parent: string | null;
    };

export type Scenegraph = {
  [key: string]: ScenegraphNode;
};

export const getNode = (
  scenegraph: { [key: string]: ScenegraphNode },
  id: string,
  setScenegraph?: SetStoreFunction<Scenegraph>
): ScenegraphNode & { type: "node" } => {
  if (scenegraph[id] === undefined) {
    throw new Error(`getNode: scenegraph[${id}] is undefined`);
  }
  const node = scenegraph[id];
  if (node.type === "ref") {
    // console.log('getNode: node.type === ref', id);
    let transform: { translate: { x?: number; y?: number } } = {
      translate: { x: 0, y: 0 },
    };
    const currNode = untrack(() => {
      let currNode: ScenegraphNode = node;
      while (currNode.type === "ref") {
        // console.log('looking up', currNode.refId);
        // console.log('currNode', JSON.parse(JSON.stringify(currNode)));
        let transformDiff = getTransformDiff(scenegraph, id, currNode.refId);

        if (setScenegraph !== undefined) {
          if (scenegraph[node.refId].type === "node") {
            // if the refId's translates are fully defined, then define all undefined id translates
            const [idSuffix, refIdSuffix] = getLCAChainSuffixes(
              scenegraph,
              id,
              node.refId
            );
            if (
              _.every(
                [currNode.refId, ...refIdSuffix],
                (id) => scenegraph[id].transform.translate.x !== undefined
              )
            ) {
              for (const id of idSuffix) {
                if (scenegraph[id].transform.translate.x === undefined) {
                  setScenegraph(
                    id,
                    produce((node: ScenegraphNode) => {
                      node.transform.translate.x = 0;
                    })
                  );
                }
              }
            }
          }

          if (scenegraph[node.refId].type === "node") {
            // if the refId's translates are fully defined, then define all undefined id translates
            const [idSuffix, refIdSuffix] = getLCAChainSuffixes(
              scenegraph,
              id,
              node.refId
            );
            if (
              _.every(
                [currNode.refId, ...refIdSuffix],
                (id) => scenegraph[id].transform.translate.y !== undefined
              )
            ) {
              for (const id of idSuffix) {
                if (scenegraph[id].transform.translate.y === undefined) {
                  setScenegraph(
                    id,
                    produce((node: ScenegraphNode) => {
                      node.transform.translate.y = 0;
                    })
                  );
                }
              }
            }
          }
        }

        // add currNode.refId's transform to transformDiff
        const refIdTransform = scenegraph[currNode.refId].transform;
        transformDiff = {
          translate: {
            x: maybeAdd(transformDiff.translate.x, refIdTransform.translate.x),
            y: maybeAdd(transformDiff.translate.y, refIdTransform.translate.y),
          },
        };
        transform = {
          translate: {
            x: maybeAdd(transform.translate.x, transformDiff.translate.x),
            y: maybeAdd(transform.translate.y, transformDiff.translate.y),
          },
        };
        currNode = scenegraph[currNode.refId];
      }
      return currNode;
    });

    untrack(() => {
      if (currNode.transformOwners.translate.x === undefined)
        console.log(
          "debug getNode",
          id,
          JSON.parse(JSON.stringify(currNode.transformOwners))
        );
    });

    return {
      ...currNode,
      transform,
    };
  }
  return node;
};

export const createScenegraph = (): BBoxStore => {
  const [scenegraph, setScenegraph] = createStore<{
    [key: string]: ScenegraphNode;
  }>({});

  // TODO: use a Proxy for each object to make objects appear as simply left, right, top, bottom, etc. even though
  // they are composed of internal dimensions and transform.

  const createNode = (
    id: string,
    parentId: string | null,
    layout: LayoutFn
  ) => {
    setScenegraph(id, {
      type: "node",
      bbox: {},
      bboxOwners: {},
      transform: {
        translate: {},
      },
      transformOwners: {
        translate: {},
      },
      children: new Set(),
      parent: parentId,
      layout,
    });

    if (parentId !== null) {
      setScenegraph(parentId, (node: ScenegraphNode) => {
        if (node.type === "ref") {
          console.error("Cannot add children to a ref node.");
          return node;
        }
        return {
          ...node,
          children: new Set([...Array.from(node.children), id]),
        };
      });
    }
  };

  const createRef = (id: string, refId: string, parentId: string | null) => {
    setScenegraph(id, {
      type: "ref",
      refId,
      transform: {
        translate: {},
      },
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
          children: new Set([...Array.from(node.children), id]),
        };
      });
    }
  };

  const getBBox = (id: string) => {
    const node = getNode(scenegraph, id, setScenegraph);
    // const node = untrack(() => {
    //   const node = getNode(scenegraph, id, setScenegraph);
    //   return {
    //     bbox: {
    //       left: node.bbox.left,
    //       top: node.bbox.top,
    //       width: node.bbox.width,
    //       height: node.bbox.height,
    //     },
    //     transform: {
    //       translate: {
    //         x: node.transform.translate.x,
    //         y: node.transform.translate.y,
    //       },
    //     },
    //   };
    // });
    return {
      get left() {
        return maybeAdd(node.bbox.left, node.transform.translate.x);
      },
      get top() {
        return maybeAdd(node.bbox.top, node.transform.translate.y);
      },
      get width() {
        return node.bbox.width;
      },
      get height() {
        return node.bbox.height;
      },
      get right() {
        // calculated using left and width
        return maybeAdd(this.left, this.width);
      },
      get bottom() {
        // calculated using top and height
        return maybeAdd(this.top, this.height);
      },
      get centerX() {
        return maybeAdd(this.left, maybeDiv(this.width, 2));
      },
      get centerY() {
        return maybeAdd(this.top, maybeDiv(this.height, 2));
      },
    };
  };

  const setSmartBBox = (id: string, bbox: BBox, owner: string) => {
    // if any of the bbox values are NaN (undefined is ok), console.error and skip
    if (
      (bbox.left !== undefined && isNaN(bbox.left)) ||
      (bbox.top !== undefined && isNaN(bbox.top)) ||
      (bbox.width !== undefined && isNaN(bbox.width)) ||
      (bbox.height !== undefined && isNaN(bbox.height))
    ) {
      // error message should include id, bbox, owner
      console.error(
        `setSmartBBox: ${owner} tried to update ${id}'s bbox with ${JSON.stringify(
          bbox
        )}, but the bbox contains NaN values. Skipping...`
      );
      return;
    }

    setScenegraph(id, (node: ScenegraphNode) => {
      if (node.type === "ref") {
        untrack(() => {
          const transform = getTransformDiff(scenegraph, id, node.refId);

          if (
            transform.translate.x === undefined &&
            scenegraph[node.refId].type === "node"
          ) {
            // set all the x translates in the chains to 0 if they are not yet defined
            const [idSuffix, refIdSuffix] = getLCAChainSuffixes(
              scenegraph,
              id,
              node.refId
            );
            for (const id of idSuffix) {
              if (scenegraph[id].transform.translate.x === undefined) {
                setScenegraph(
                  id,
                  produce((node: ScenegraphNode) => {
                    node.transform.translate.x = 0;
                  })
                );
              }
            }
            for (const id of refIdSuffix) {
              if (scenegraph[id].transform.translate.x === undefined) {
                setScenegraph(
                  id,
                  produce((node: ScenegraphNode) => {
                    node.transform.translate.x = 0;
                  })
                );
              }
            }
          }

          if (
            transform.translate.y === undefined &&
            scenegraph[node.refId].type === "node"
          ) {
            // set all the y translates in the chains to 0 if they are not yet defined
            const [idSuffix, refIdSuffix] = getLCAChainSuffixes(
              scenegraph,
              id,
              node.refId
            );
            for (const id of idSuffix) {
              if (scenegraph[id].transform.translate.y === undefined) {
                setScenegraph(
                  id,
                  produce((node: ScenegraphNode) => {
                    node.transform.translate.y = 0;
                  })
                );
              }
              for (const id of refIdSuffix) {
                if (scenegraph[id].transform.translate.y === undefined) {
                  setScenegraph(
                    id,
                    produce((node: ScenegraphNode) => {
                      node.transform.translate.y = 0;
                    })
                  );
                }
              }
            }
          }

          const newBBox = {
            left: maybeSub(bbox.left, transform.translate.x ?? 0),
            top: maybeSub(bbox.top, transform.translate.y ?? 0),
            width: bbox.width,
            height: bbox.height,
          };

          console.log(
            "newBBox",
            JSON.parse(JSON.stringify(newBBox)),
            bbox.left,
            transform.translate.x
          );

          setSmartBBox(node.refId, newBBox, owner);
        });
        return node;
      }

      if (
        bbox.left !== undefined &&
        node.transformOwners.translate.x !== undefined &&
        node.transformOwners.translate.x !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s left to ${
            bbox.left
          } but it was already set to ${
            (node.bbox.left ?? 0) + (node.transform.translate.x ?? 0)
          } by ${
            node.transformOwners.translate.x
          }. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      } else if (
        bbox.top !== undefined &&
        node.transformOwners.translate.y !== undefined &&
        node.transformOwners.translate.y !== owner
      ) {
        console.error(
          `${owner} tried to set ${id}'s top to ${
            bbox.top
          } but it was already set to ${
            (node.bbox.top ?? 0) + (node.transform.translate.y ?? 0)
          } by ${
            node.transformOwners.translate.y
          }. Only one component can set a bbox property. We skipped this update.`
        );
        return node;
      }

      const proposedBBox: BBox = {};
      const proposedTransform: Transform = {
        translate: {},
      };

      if (bbox.left !== undefined) {
        if (node.bboxOwners.left === owner) {
          proposedBBox.left = bbox.left;
          proposedTransform.translate.x = 0;
        } else if (node.transformOwners.translate.x === owner) {
          console.log("bbox.left", bbox.left);
          console.log("node.bbox.left", node.bbox.left);
          console.log("node.transform.translate.x", node.transform.translate.x);
          // proposedTransform.translate.x = bbox.left - node.bbox.left!;
          proposedTransform.translate.x = bbox.left - node.bbox.left!;
        }
      }

      if (bbox.top !== undefined) {
        if (node.bboxOwners.top === owner) {
          proposedBBox.top = bbox.top;
          proposedTransform.translate.y = 0;
        } else if (node.transformOwners.translate.y === owner) {
          proposedTransform.translate.y = bbox.top - node.bbox.top!;
        }
      }

      if (proposedBBox.left !== undefined)
        console.log("proposedBBox", proposedBBox);

      if (proposedTransform.translate.x !== undefined) {
        console.log("proposedTransform", JSON.stringify(proposedTransform));
      }

      const newBBoxOwners = {
        ...node.bboxOwners,
        ...(bbox.left !== undefined && node.bboxOwners.left === undefined
          ? { left: owner }
          : {}),
        ...(bbox.top !== undefined && node.bboxOwners.top === undefined
          ? { top: owner }
          : {}),
        // ...(bbox.width ? { width: owner } : {}),
        // ...(bbox.height ? { height: owner } : {}),
      };

      const newTransformOwners: TransformOwners = {
        translate: {
          x:
            node.transformOwners.translate.x ??
            (bbox.left !== undefined ? owner : undefined),
          y:
            node.transformOwners.translate.y ??
            (bbox.top !== undefined ? owner : undefined),
        },
      };

      const newBBox = mergeObjects(node.bbox, proposedBBox);

      const newTranslate = mergeObjects(
        node.transform.translate,
        proposedTransform.translate
      );

      const newTransform = {
        translate: newTranslate,
      };

      return {
        bbox: newBBox,
        bboxOwners: newBBoxOwners,
        transform: newTransform,
        transformOwners: newTransformOwners,
        children: node.children,
      };
    });
  };

  const setBBox = (
    id: string,
    bbox: Partial<BBox>,
    owner: string,
    transform?: Transform
  ) => {
    setScenegraph(id, (node: ScenegraphNode) => {
      if (node.type === "ref") {
        // console.error("Mutating refs is not currently supported. Skipping.");
        // return node;
        setBBox(node.refId, bbox, owner, transform);
        return node;
      }

      // check bbox ownership
      for (const key of Object.keys(bbox) as Array<keyof BBox>) {
        if (
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

      const newTranslate = mergeObjects(
        node.transform.translate,
        transform?.translate ?? {}
      );

      const newTransform = {
        translate: newTranslate,
      };

      return {
        bbox: newBBox,
        bboxOwners: newBBoxOwners,
        transform: newTransform,
        transformOwners: newTransformOwners,
        children: node.children,
      };
    });
  };

  return [
    scenegraph,
    {
      getBBox,
      setSmartBBox,
      setBBox,
      createNode,
      createRef,
      getNode,
    },
  ];
};

export type BBoxStore = [
  get: { [key: string]: ScenegraphNode },
  set: {
    // TODO: move this out of set...
    getBBox: (id: string) => BBox;
    getNode: (
      scenegraph: { [key: string]: ScenegraphNode },
      id: string
    ) => ScenegraphNode & { type: "node" };
    setSmartBBox: (id: string, bbox: BBox, owner: string) => void;
    setBBox: (
      id: string,
      bbox: Partial<BBox>,
      owner: string,
      transform?: Transform
    ) => void;
    createNode: (
      id: string,
      parentId: string | null,
      layout: (
        childIds: Id[],
        getBBox?: (id: string) => BBox
      ) => {
        bbox: Partial<BBox>;
        transform: Transform;
      }
    ) => void;
    createRef: (id: string, refId: string, parentId: string | null) => void;
  }
];

export const BBoxContext = createContext<BBoxStore | null>(null);

export const useScenegraph = (): [
  get: { [key: string]: ScenegraphNode },
  set: (
    id: string,
    bbox: Partial<BBox>,
    owner: string,
    transform?: Transform
  ) => void,
  smartGet: (id: string) => BBox,
  smartSet: (id: string, bbox: BBox, owner: string) => void,
  getNode: (
    scenegraph: { [key: string]: ScenegraphNode },
    id: string
  ) => ScenegraphNode & { type: "node" }
] => {
  const context = useContext(BBoxContext);

  if (context === null) {
    throw new Error(
      "useScenegraph must be used within a top-level Bluefish component."
    );
  }

  const [scenegraph, { setBBox, getBBox, setSmartBBox, getNode }] = context;
  return [scenegraph, setBBox, getBBox, setSmartBBox, getNode];
};

export const ParentIDContext = createContext<string | null>(null);
