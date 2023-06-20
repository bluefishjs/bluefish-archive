import { JSX, ParentProps, untrack } from "solid-js";
import { Layout } from "./layout";
import { Id, BBox, Transform, useScenegraph, Scenegraph } from "./scenegraph";
import _, { get } from "lodash";
import { maybeAdd, maybeMax, maybeMin, maybeSub } from "./maybeUtil";

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

export type AlignAuxProps = {
  alignments: [
    AlignmentVertical | undefined,
    AlignmentHorizontal | undefined
  ][];
} & {
  x?: number;
  y?: number;
};

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

export function Align(props: AlignProps) {
  // const { children, id } = props;
  const [scenegraph, setNode, reactiveGetBBox, setSmartBBox, reactiveGetNode] =
    useScenegraph();

  // prevent reads from causing updates
  // COMBAK(jmp): this is a hack around getting the correct reactive behavior... we're just baking
  // it in ourselves
  const getBBox = (id: string) =>
    untrack(() => {
      const bbox = reactiveGetBBox(id);
      return {
        left: bbox.left,
        top: bbox.top,
        width: bbox.width,
        height: bbox.height,
        right: bbox.right,
        bottom: bbox.bottom,
        centerX: bbox.centerX,
        centerY: bbox.centerY,
      };
    });
  const getNode = (scenegraph: Scenegraph, id: string) =>
    untrack(() => {
      const node = reactiveGetNode(scenegraph, id);
      return {
        transformOwners: {
          translate: {
            x: node.transformOwners.translate.x,
            y: node.transformOwners.translate.y,
          },
        },
      };
    });

  const layout = (childIds: Id[] /* , getBBox: (id: string) => BBox */) => {
    childIds = Array.from(childIds);
    // console.log("align", id);
    // TODO: this is currently side-effectful and cannot be removed. I think this is because the ref
    // bbox is not updated until it is read, and this update does not seem propagate until the
    // next read.
    // we either need to change how we maintain ref invariants, or we just need to call getBBox
    // before invoking layout
    // childIds.forEach(getBBox);

    const alignments: [
      AlignmentVertical | undefined,
      AlignmentHorizontal | undefined
    ][] = childIds
      .map((m) => /* m.guidePrimary ?? */ props.alignment)
      .map((alignment) =>
        alignment !== undefined
          ? splitAlignment(alignment)
          : [undefined, undefined]
      );

    const verticalPlaceables = _.zip(childIds, alignments).filter(
      ([placeable, alignment]) => {
        if (alignment === undefined) {
          return false;
        }
        const [verticalAlignment, horizontalAlignment] = alignment;
        return verticalAlignment !== undefined;
      }
    );

    const horizontalPlaceables = _.zip(childIds, alignments).filter(
      ([placeable, alignment]) => {
        if (alignment === undefined) {
          return false;
        }
        const [verticalAlignment, horizontalAlignment] = alignment;
        return horizontalAlignment !== undefined;
      }
    );

    console.log(
      "align child owners",
      props.id,
      childIds.map(
        (placeable) =>
          `${placeable}: ${
            getNode(scenegraph, placeable! as any).transformOwners.translate.x
          }, ${
            getNode(scenegraph, placeable! as any).transformOwners.translate.y
          }`
      )
    );

    // TODO: should be able to filter by ownership instead
    const verticalValueArr = verticalPlaceables
      .filter(
        ([placeable, _]) =>
          getNode(scenegraph, placeable! as any).transformOwners.translate.y !==
          props.id
      )
      .map(([placeable, alignment]) => {
        const [verticalAlignment, horizontalAlignment] = alignment!;
        if (verticalAlignment === undefined) {
          return [placeable, undefined];
        }
        return [placeable, reactiveGetBBox(placeable!)[verticalAlignment]];
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
      .filter(
        ([placeable, _]) =>
          getNode(scenegraph, placeable! as any).transformOwners.translate.x !==
          props.id
      )
      .map(([placeable, alignment]) => {
        const [verticalAlignment, horizontalAlignment] = alignment!;
        if (horizontalAlignment === undefined) {
          return [placeable, undefined];
        }
        return [placeable, reactiveGetBBox(placeable!)[horizontalAlignment]];
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
      if (
        // scenegraph[placeable!].transformOwners.translate.y !== undefined &&
        // scenegraph[placeable!].transformOwners.translate.y !== id
        getNode(scenegraph, placeable! as any).transformOwners.translate.y !==
          undefined &&
        getNode(scenegraph, placeable! as any).transformOwners.translate.y !==
          props.id
      )
        continue;
      console.log(
        "vertical owner",
        getNode(scenegraph, placeable! as any).transformOwners.translate.y
      );
      const [verticalAlignment, horizontalAlignment] = alignment!;
      if (verticalAlignment === "top") {
        console.log("setting smart bbox", props.id, placeable!, verticalValue);
        setSmartBBox(placeable!, { top: verticalValue }, props.id);
      } else if (verticalAlignment === "centerY") {
        const height = getBBox(placeable!).height;
        if (height === undefined) {
          continue;
        }
        setSmartBBox(placeable!, { top: verticalValue - height / 2 }, props.id);
      } else if (verticalAlignment === "bottom") {
        // placeable!.bottom = verticalValue;
        setSmartBBox(
          placeable!,
          { top: verticalValue - getBBox(placeable!).height! },
          props.id
        );
      }
    }

    for (const [placeable, alignment] of horizontalPlaceables) {
      if (
        // scenegraph[placeable!].transformOwners.translate.x !== undefined &&
        // scenegraph[placeable!].transformOwners.translate.x !== id
        getNode(scenegraph, placeable! as any).transformOwners.translate.x !==
          undefined &&
        getNode(scenegraph, placeable! as any).transformOwners.translate.x !==
          props.id
      )
        continue;
      console.log(
        "horizontal owner",
        getNode(scenegraph, placeable! as any).transformOwners.translate.x
      );
      const [verticalAlignment, horizontalAlignment] = alignment!;
      if (horizontalAlignment === "left") {
        setSmartBBox(placeable!, { left: horizontalValue }, props.id);
      } else if (horizontalAlignment === "centerX") {
        const width = getBBox(placeable!).width;
        if (width === undefined) {
          continue;
        }
        setSmartBBox(
          placeable!,
          { left: horizontalValue - width / 2 },
          props.id
        );
      } else if (horizontalAlignment === "right") {
        // placeable!.right = horizontalValue;
        const width = getBBox(placeable!).width;
        if (width === undefined) {
          continue;
        }
        console.log(
          "setting smart bbox",
          props.id,
          placeable!,
          horizontalValue - width
        );
        setSmartBBox(placeable!, { left: horizontalValue - width }, props.id);
      }
    }

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
}
Align.displayName = "Align";

export default Align;
