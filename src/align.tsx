import { JSX, ParentProps, untrack } from "solid-js";
import { Layout } from "./layout";
import _, { get, startsWith } from "lodash";
import { maybe, maybeAdd, maybeMax, maybeMin, maybeSub } from "./maybeUtil";
import { BBox, ChildNode, Id, Transform, useScenegraph } from "./scenegraph";
import withBluefish from "./withBluefish";

export type Alignment2D =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "centerLeft"
  | "center"
  | "centerRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

// generate a union of single-key objects using Alignment2D as the keys
export type Alignment2DObjs = {
  [K in Alignment2D]: { [k in K]: boolean };
}[Alignment2D];

export type AlignmentVertical = "top" | "centerY" | "bottom";
export type AlignmentHorizontal = "left" | "centerX" | "right";

// export type Alignment1DHorizontal = "left" | "centerHorizontally" | "right";
// export type Alignment1DVertical = "top" | "centerVertically" | "bottom";

export type Alignment1D = AlignmentVertical | AlignmentHorizontal;

export type Alignment1DObjs = {
  [K in Alignment1D]: { [k in K]: boolean };
}[Alignment1D];

const verticalAlignmentMap: {
  [K in Alignment2D | Alignment1D]: AlignmentVertical | undefined;
} = {
  topLeft: "top",
  topCenter: "top",
  topRight: "top",
  centerLeft: "centerY",
  center: "centerY",
  centerRight: "centerY",
  bottomLeft: "bottom",
  bottomCenter: "bottom",
  bottomRight: "bottom",
  top: "top",
  centerY: "centerY",
  bottom: "bottom",
  left: undefined,
  centerX: undefined,
  right: undefined,
};

export const verticalAlignment = (
  alignment: Alignment2D | Alignment1D
): AlignmentVertical | undefined => {
  return verticalAlignmentMap[alignment];
};

const horizontalAlignmentMap: {
  [K in Alignment2D | Alignment1D]: AlignmentHorizontal | undefined;
} = {
  topLeft: "left",
  topCenter: "centerX",
  topRight: "right",
  centerLeft: "left",
  center: "centerX",
  centerRight: "right",
  bottomLeft: "left",
  bottomCenter: "centerX",
  bottomRight: "right",
  top: undefined,
  centerY: undefined,
  bottom: undefined,
  left: "left",
  centerX: "centerX",
  right: "right",
};

export const horizontalAlignment = (
  alignment: Alignment2D | Alignment1D
): AlignmentHorizontal | undefined => {
  return horizontalAlignmentMap[alignment];
};

export const splitAlignment = (
  alignment: Alignment2D | Alignment1D
): [AlignmentVertical | undefined, AlignmentHorizontal | undefined] => {
  return [verticalAlignment(alignment), horizontalAlignment(alignment)];
};

export type AlignProps = ParentProps<{
  id: Id;
  x?: number;
  y?: number;
  alignment?: Alignment2D | Alignment1D;
}>;

export const Align = withBluefish((props: AlignProps) => {
  // const { children, id } = props;
  const layout = (childNodes: ChildNode[]) => {
    childNodes = Array.from(childNodes);

    if (props.id.endsWith("DEBUG")) {
      debugger;
    }

    // console.log("align", id);
    // TODO: this is currently side-effectful and cannot be removed. I think this is because the ref
    // bbox is not updated until it is read, and this update does not seem propagate until the
    // next read.
    // we either need to change how we maintain ref invariants, or we just need to call getBBox
    // before invoking layout
    // childIds.forEach(getBBox);

    // for (const childId of childIds) {
    //   // runLayout
    //   const node = getNode(scenegraph, childId);
    //   if (node.runLayout) {
    //     untrack(() => node.runLayout());
    //   }
    // }

    const verticalAlignments = childNodes
      .map((m) => /* m.guidePrimary ?? */ props.alignment)
      .map((alignment) => maybe(alignment, verticalAlignment));

    const horizontalAlignments = childNodes
      .map((m) => /* m.guidePrimary ?? */ props.alignment)
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

    // TODO: we should probably make it so that the default value depends on the x & y props
    const verticalValue =
      verticalValueArr.length === 0 ? 0 : (verticalValueArr[0][1] as number);
    // let verticalValue: number;
    // if (verticalValueArr.length === 0) {
    //   // get the first alignment, and use the first bbox to set the default value based on the y
    //   // prop
    //   const firstAlignment = alignments[0];
    //   const firstBBox = getBBox(childIds[0]);

    // } else {
    //   verticalValue = verticalValueArr[0][1] as number;
    // }
    // TODO: we maybe have the invariant that value is always defined when the placeable is owned...

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
        console.log("setting bbox top", verticalValue, placeable!.bbox.height);
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

    // TODO: this part seems like it might cause a loop...
    const bboxes = {
      left: childNodes.map((childNode) => childNode.bbox.left),
      top: childNodes.map((childNode) => childNode.bbox.top),
      width: childNodes.map((childNode) => childNode.bbox.width),
      height: childNodes.map((childNode) => childNode.bbox.height),
    };

    const left = maybeMin(bboxes.left);

    const right = maybeMax(
      bboxes.left.map((left, i) => maybeAdd(left, bboxes.width[i]))
    );

    const top = maybeMin(bboxes.top);

    const bottom = maybeMax(
      bboxes.top.map((top, i) => maybeAdd(top, bboxes.height[i]))
    );

    const width = maybeSub(right, left);
    const height = maybeSub(bottom, top);

    return {
      transform: {
        translate: {
          x: maybeSub(props.x, left),
          y: maybeSub(props.y, top),
        },
      },
      bbox: { left, top, right, bottom, width, height },
    };
  };

  const paint = (paintProps: {
    bbox: BBox;
    transform: Transform;
    children: JSX.Element;
  }) => {
    return (
      <g
        transform={`translate(${paintProps.transform.translate.x ?? 0}, ${
          paintProps.transform.translate.y ?? 0
        })`}
      >
        {paintProps.children}
      </g>
    );
  };

  return (
    <Layout id={props.id} layout={layout} paint={paint}>
      {props.children}
    </Layout>
  );
});

export default Align;
