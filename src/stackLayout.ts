import _ from "lodash";
import {
  Alignment1D,
  Alignment2D,
  horizontalAlignment,
  verticalAlignment,
} from "./align";
import { ChildNode, Id, LayoutFn } from "./scenegraph";
import { maybe, maybeMax, maybeSub } from "./util/maybe";
import { BBox } from "./util/bbox";

export type StackArgs = {
  id: Id;
  x?: number;
  y?: number;
  alignment?: Alignment1D;
  direction: "vertical" | "horizontal";
  total?: number;
  spacing?: number;
};

export const stackLayout =
  (args: StackArgs): LayoutFn =>
  (childNodes: ChildNode[]) => {
    if (args.id.endsWith("DEBUG")) {
      debugger;
    }

    /* ALIGNMENT */
    const verticalAlignments = childNodes
      .map((m) => /* m.guidePrimary ?? */ args.alignment)
      .map((alignment) => maybe(alignment, verticalAlignment));

    const horizontalAlignments = childNodes
      .map((m) => /* m.guidePrimary ?? */ args.alignment)
      .map((alignment) => maybe(alignment, horizontalAlignment));

    const verticalPlaceables = _.zip(childNodes, verticalAlignments).filter(
      ([placeable, alignment]) => alignment !== undefined
    );

    const horizontalPlaceables = _.zip(childNodes, horizontalAlignments).filter(
      ([placeable, alignment]) => alignment !== undefined
    );

    // TODO: should be able to filter by ownership instead
    const verticalValueArr = verticalPlaceables
      .filter(([placeable, _]) => placeable!.owned.y)
      .map(([placeable, alignment]) => {
        return [
          placeable,
          alignment !== undefined ? placeable!.bbox[alignment] : undefined,
        ];
      })
      .filter(
        ([placeable, value]) =>
          // scenegraph[placeable!].transformOwners.translate.y !== id &&
          value !== undefined
      );

    // TODO: we should probably make it so that the default value depends on the x & y args
    const verticalValue =
      verticalValueArr.length === 0 ? 0 : (verticalValueArr[0][1] as number);

    const horizontalValueArr = horizontalPlaceables
      .filter(([placeable, _]) => placeable!.owned.x)
      .map(([placeable, alignment]) => {
        return [
          placeable,
          alignment !== undefined ? placeable!.bbox[alignment] : undefined,
        ];
      })
      .filter(
        ([placeable, value]) =>
          // scenegraph[placeable!].transformOwners.translate.x !== id &&
          value !== undefined
      );

    const horizontalValue =
      horizontalValueArr.length === 0
        ? 0
        : (horizontalValueArr[0][1] as number);

    for (const [placeable, alignment] of verticalPlaceables) {
      if (placeable!.owned.y) continue;
      if (alignment === "top") {
        placeable!.bbox.top = verticalValue;
      } else if (alignment === "centerY") {
        const height = placeable!.bbox.height;
        if (height === undefined) {
          continue;
        }
        placeable!.bbox.top = verticalValue - height / 2;
      } else if (alignment === "bottom") {
        placeable!.bbox.top = verticalValue - placeable!.bbox.height!;
      }
    }

    for (const [placeable, alignment] of horizontalPlaceables) {
      if (placeable!.owned.x) continue;
      if (alignment === "left") {
        placeable!.bbox.left = horizontalValue;
      } else if (alignment === "centerX") {
        const width = placeable!.bbox.width;
        if (width === undefined) {
          continue;
        }
        placeable!.bbox.left = horizontalValue - width / 2;
      } else if (alignment === "right") {
        // placeable!.right = horizontalValue;
        const width = placeable!.bbox.width;
        if (width === undefined) {
          continue;
        }
        placeable!.bbox.left = horizontalValue - width;
      }
    }

    /* DISTRIBUTE */
    if (args.direction === "vertical") {
      let height: number;
      let spacing: number;

      if (args.spacing !== undefined && args.total !== undefined) {
        spacing = args.spacing;
        height = args.total;
        // assign additional space to items that don't have an extent
        // filter to only items whose heights are owned by other
        let unassignedHeight = height;
        for (const childId of childNodes) {
          if (!childId.owned.height) {
            continue;
          }

          unassignedHeight -= childId.bbox.height!;
        }

        const unassignedChildren = childNodes.filter(
          (childId) => !childId.owned.height
        );

        const unassignedSpacing = unassignedHeight / unassignedChildren.length;

        for (const childId of unassignedChildren) {
          childId.bbox.height = unassignedSpacing;
        }
      } else if (args.spacing !== undefined) {
        spacing = args.spacing;
        // we expect all heights to be owned by other
        for (const childId of childNodes) {
          if (!childId.owned.height) {
            // throw new Error(`${childId}'s height is undefined`);
            console.error(`Distribute: ${childId}'s height is undefined`);
            return { bbox: {}, transform: { translate: {} } };
          }
        }

        height =
          _.sumBy(childNodes, (childId) => childId.bbox.height!) +
          spacing * (childNodes.length - 1);
      } else if (args.total !== undefined) {
        height = args.total;
        // we expect all heights to be owned by other
        for (const childId of childNodes) {
          if (!childId.owned.height) {
            // throw new Error(`${childId}'s height is undefined`);
            console.error(`Distribute: ${childId}'s height is undefined`);
            return { bbox: {}, transform: { translate: {} } };
          }
        }

        const occupiedHeight = _.sumBy(
          childNodes,
          (childId) => childId.bbox.height!
        );

        spacing = (args.total - occupiedHeight) / (childNodes.length - 1);
      } else {
        // TODO: make this error message better
        throw new Error("invalid options");
      }

      const fixedElement = childNodes.findIndex((childId) => childId.owned.y);

      // use spacing and height to evenly distribute elements while ensuring that the fixed element
      // is fixed
      const startingY =
        fixedElement === -1
          ? 0
          : childNodes[fixedElement].bbox.top! -
            spacing * fixedElement -
            _.sumBy(
              childNodes.slice(0, fixedElement),
              (childId) => childId.bbox.height!
            );

      // subtract off spacing and the sizes of the first fixedElement elements
      let y = startingY;
      for (const childId of childNodes) {
        if (!childId.owned.y) {
          childId.bbox.top = y;
        }
        y += childId.bbox.height! + spacing;
      }

      const bbox = BBox.from(childNodes.map((childId) => childId.bbox));

      // TODO: is the width computation correct? should it take position into account?
      return {
        // bbox: {
        //   top: startingY,
        //   width: maybeMax(childNodes.map((childId) => childId.bbox.width)),
        //   height,
        // },
        bbox,
        transform: {
          translate: {
            x: maybeSub(args.x, bbox.left),
            y: maybeSub(args.y, bbox.top),
          },
        },
      };
    } else if (args.direction === "horizontal") {
      let width: number;
      let spacing: number;

      if (args.spacing !== undefined && args.total !== undefined) {
        spacing = args.spacing;
        width = args.total;
        // assign additional space to items that don't have an extent
        // filter to only items whose widths are owned by other
        let unassignedWidth = width;
        for (const childId of childNodes) {
          if (!childId.owned.width) {
            continue;
          }

          unassignedWidth -= childId.bbox.width!;
        }

        const unassignedChildren = childNodes.filter(
          (childId) => !childId.owned.width
        );

        const unassignedSpacing = unassignedWidth / unassignedChildren.length;

        for (const childId of unassignedChildren) {
          childId.bbox.width = unassignedSpacing;
        }
      } else if (args.spacing !== undefined) {
        spacing = args.spacing;
        // we expect all widths to be owned by other
        for (const childId of childNodes) {
          if (!childId.owned.width) {
            // throw new Error(`${childId}'s width is undefined`);
            console.error(`Distribute: ${childId}'s width is undefined`);
            return { bbox: {}, transform: { translate: {} } };
          }
        }

        width =
          _.sumBy(childNodes, (childId) => childId.bbox.width!) +
          spacing * (childNodes.length - 1);
      } else if (args.total !== undefined) {
        width = args.total;
        // we expect all widths to be owned by other
        for (const childId of childNodes) {
          if (!childId.owned.width) {
            // throw new Error(`${childId}'s width is undefined`);
            console.error(`Distribute: ${childId}'s width is undefined`);
            return { bbox: {}, transform: { translate: {} } };
          }
        }

        const occupiedWidth = _.sumBy(
          childNodes,
          (childId) => childId.bbox.width!
        );

        spacing = (args.total - occupiedWidth) / (childNodes.length - 1);
      } else {
        throw new Error("Invalid options for space");
      }

      const fixedElement = childNodes.findIndex((childId) => childId.owned.x);

      // use spacing and width to evenly distribute elements while ensuring that the fixed element
      // is fixed
      const startingX =
        fixedElement === -1
          ? 0
          : childNodes[fixedElement].bbox.left! -
            spacing * fixedElement -
            _.sumBy(
              childNodes.slice(0, fixedElement),
              (childId) => childId.bbox.width!
            );

      // subtract off spacing and the sizes of the first fixedElement elements
      let x = startingX;
      for (const childId of childNodes) {
        if (!childId.owned.x) {
          childId.bbox.left = x;
        }
        x += childId.bbox.width! + spacing;
      }

      const bbox = BBox.from(childNodes.map((childId) => childId.bbox));

      // TODO: is the height computation correct? should it take position into account?
      return {
        // bbox: {
        //   left: startingX,
        //   height: maybeMax(childNodes.map((childId) => childId.bbox.height)),
        //   width,
        // },
        bbox,
        transform: {
          translate: {
            x: maybeSub(args.x, bbox.left),
            y: maybeSub(args.y, bbox.top),
          },
        },
      };
    } else {
      throw new Error("Invalid direction");
    }
  };
