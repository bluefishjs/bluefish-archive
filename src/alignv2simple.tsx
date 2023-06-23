import { JSX, ParentProps, untrack } from "solid-js";
import { LayoutV2 } from "./layoutv2";
import _ from "lodash";
import { maybe, maybeAdd, maybeMax, maybeMin, maybeSub } from "./maybeUtil";
import { BBox, Id, Transform, useScenegraph } from "./scenegraphv2";

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

export function AlignV2Simple(props: AlignProps) {
  // const { children, id } = props;
  const { getBBox, setBBox, ownedByUs, ownedByOther } = useScenegraph();

  const layout = (childIds: Id[] /* , getBBox: (id: string) => BBox */) => {
    debugger;
    childIds = Array.from(childIds);

    const child1 = childIds[0];
    const child2 = childIds[1];

    const child1BBox = getBBox(child1);

    const child2BBox = getBBox(child2);

    if (child1BBox === undefined || child2BBox === undefined) {
      return {
        transform: { translate: {} },
        bbox: {},
      };
    }

    if (child1BBox.width === undefined || child2BBox.width === undefined) {
      return {
        transform: { translate: {} },
        bbox: {},
      };
    }

    if (child1BBox.height === undefined || child2BBox.height === undefined) {
      return {
        transform: { translate: {} },
        bbox: {},
      };
    }

    setBBox(props.id, child1, {
      left: -child1BBox.width! / 2,
      top: -child1BBox.height! / 2,
    });
    setBBox(props.id, child2, {
      left: -child2BBox.width! / 2,
      top: -child2BBox.height! / 2,
    });

    const child1BBoxAfter = untrack(() => getBBox(child1));
    const child2BBoxAfter = untrack(() => getBBox(child2));

    return {
      transform: {
        translate: {
          x: props.x ?? 0,
          y: props.y ?? 0,
        },
      },
      bbox: {
        left: -Math.max(child1BBox.width!, child2BBox.width!) / 2,
        top: -Math.max(child1BBox.height!, child2BBox.height!) / 2,
        width: Math.max(child1BBox.width!, child2BBox.width!),
        height: Math.max(child1BBox.height!, child2BBox.height!),
      },
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
    <LayoutV2 id={props.id} layout={layout} paint={paint}>
      {props.children}
    </LayoutV2>
  );
}
AlignV2Simple.displayName = "AlignSimple";

export default AlignV2Simple;
