import { JSX, ParentProps, untrack } from "solid-js";
import { Layout } from "./layout";
import _, { get, startsWith } from "lodash";
import { maybe, maybeAdd, maybeMax, maybeMin, maybeSub } from "./maybeUtil";
import { BBox, Id, Transform, useScenegraph } from "./scenegraph";
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
  const { getBBox, setBBox, ownedByOther } = useScenegraph();

  const layout = (childIds: Id[] /* , getBBox: (id: string) => BBox */) => {
    childIds = Array.from(childIds);

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

    const verticalAlignments = childIds
      .map((m) => /* m.guidePrimary ?? */ props.alignment)
      .map((alignment) => maybe(alignment, verticalAlignment));

    const horizontalAlignments = childIds
      .map((m) => /* m.guidePrimary ?? */ props.alignment)
      .map((alignment) => maybe(alignment, horizontalAlignment));

    const verticalPlaceables = _.zip(childIds, verticalAlignments).filter(
      ([placeable, alignment]) => alignment !== undefined
    );

    const horizontalPlaceables = _.zip(childIds, horizontalAlignments).filter(
      ([placeable, alignment]) => alignment !== undefined
    );

    // TODO: should be able to filter by ownership instead
    const verticalValueArr = verticalPlaceables
      .filter(([placeable, _]) => ownedByOther(props.id, placeable!, "y"))
      .map(([placeable, alignment]) => {
        return [
          placeable,
          alignment !== undefined ? getBBox(placeable!)[alignment] : undefined,
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
      .filter(([placeable, _]) => ownedByOther(props.id, placeable!, "x"))
      .map(([placeable, alignment]) => {
        return [
          placeable,
          alignment !== undefined ? getBBox(placeable!)[alignment] : undefined,
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
      if (ownedByOther(props.id, placeable!, "y")) continue;
      if (alignment === "top") {
        setBBox(props.id, placeable!, { top: verticalValue });
      } else if (alignment === "centerY") {
        const height = getBBox(placeable!).height;
        if (height === undefined) {
          continue;
        }
        setBBox(props.id, placeable!, { top: verticalValue - height / 2 });
      } else if (alignment === "bottom") {
        setBBox(props.id, placeable!, {
          top: verticalValue - getBBox(placeable!).height!,
        });
      }
    }

    for (const [placeable, alignment] of horizontalPlaceables) {
      if (ownedByOther(props.id, placeable!, "x")) continue;
      if (alignment === "left") {
        setBBox(props.id, placeable!, { left: horizontalValue });
      } else if (alignment === "centerX") {
        const width = getBBox(placeable!).width;
        if (width === undefined) {
          continue;
        }
        setBBox(props.id, placeable!, { left: horizontalValue - width / 2 });
      } else if (alignment === "right") {
        // placeable!.right = horizontalValue;
        const width = getBBox(placeable!).width;
        if (width === undefined) {
          continue;
        }
        setBBox(props.id, placeable!, { left: horizontalValue - width });
      }
    }

    // TODO: this part seems like it might cause a loop...
    const bboxes = {
      left: childIds.map((childId) => getBBox(childId).left),
      top: childIds.map((childId) => getBBox(childId).top),
      width: childIds.map((childId) => getBBox(childId).width),
      height: childIds.map((childId) => getBBox(childId).height),
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
