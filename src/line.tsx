import {
  JSX,
  ParentProps,
  Show,
  createEffect,
  mergeProps,
  untrack,
} from "solid-js";
import { Layout } from "./layout";
import _, { get, startsWith } from "lodash";
import {
  maybe,
  maybeAdd,
  maybeMax,
  maybeMin,
  maybeSub,
  maybeDiv,
} from "./util/maybe";
import { BBox, Id, Transform, useScenegraph, ChildNode } from "./scenegraph";
import withBluefish from "./withBluefish";

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);
const lerp = (num: number, min: number, max: number) => min + (max - min) * num;

const maybeLerp = (num?: number, min?: number, max?: number) =>
  num !== undefined && min !== undefined && max !== undefined
    ? lerp(num, min, max)
    : undefined;
const maybeClamp = (num?: number, min?: number, max?: number) =>
  num !== undefined && min !== undefined && max !== undefined
    ? clamp(num, min, max)
    : undefined;

export type LineProps = ParentProps<{
  name: Id;
  "stroke-width"?: number;
  stroke?: string;
  source?: [number, number];
  target?: [number, number];
  x?: number;
  y?: number;
}>;

export const Line = withBluefish(
  (rawProps: LineProps) => {
    const props = mergeProps(
      {
        "stroke-width": 3,
        stroke: "black",
        source: undefined,
        target: undefined,
      },
      rawProps
    );
    // const { children, id } = props;

    const layout = (childIds: ChildNode[]) => {
      childIds = Array.from(childIds);

      const fromBBox = childIds[0].bbox;
      const toBBox = childIds[1].bbox;

      let customData: {
        fromX?: number;
        fromY?: number;
        toX?: number;
        toY?: number;
      } = {};
      if (props.source && props.target) {
        customData = {
          fromX: maybeLerp(props.source[0], fromBBox.left, fromBBox.right),
          fromY: maybeLerp(props.source[1], fromBBox.top, fromBBox.bottom),
          toX: maybeLerp(props.target[0], toBBox.left, toBBox.right),
          toY: maybeLerp(props.target[1], toBBox.top, toBBox.bottom),
        };
      } else if (props.source) {
        const fromX = maybeLerp(props.source[0], fromBBox.left, fromBBox.right);
        const fromY = maybeLerp(props.source[1], fromBBox.top, fromBBox.bottom);
        customData = {
          fromX,
          fromY,
          toX: maybeClamp(fromX, toBBox.left, toBBox.right),
          toY: maybeClamp(fromY, toBBox.top, toBBox.bottom),
        };
      } else if (props.target) {
        const toX = maybeLerp(props.target[0], toBBox.left, toBBox.right);
        const toY = maybeLerp(props.target[1], toBBox.top, toBBox.bottom);
        customData = {
          fromX: maybeClamp(toX, fromBBox.left, fromBBox.right),
          fromY: maybeClamp(toY, fromBBox.top, fromBBox.bottom),
          toX,
          toY,
        };
      } else {
        customData = {
          fromX: maybeLerp(0.5, fromBBox.left, fromBBox.right),
          fromY: maybeLerp(0.5, fromBBox.top, fromBBox.bottom),
          toX: maybeLerp(0.5, toBBox.left, toBBox.right),
          toY: maybeLerp(0.5, toBBox.top, toBBox.bottom),
        };
      }

      // only the bounding box of the line itself
      const left = maybeMin([customData.fromX, customData.toX]);
      const top = maybeMin([customData.fromY, customData.toY]);
      const right = maybeMax([customData.fromX, customData.toX]);
      const bottom = maybeMax([customData.fromY, customData.toY]);
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
        customData,
      };
    };

    const paint = (paintProps: {
      bbox: BBox;
      transform: Transform;
      children: JSX.Element;
      customData?: any;
    }) => {
      return (
        <Show
          when={paintProps.customData}
          fallback={<g>{paintProps.children}</g>}
        >
          <g
            transform={`translate(${paintProps.transform.translate.x ?? 0}, ${
              paintProps.transform.translate.y ?? 0
            })`}
          >
            <line
              x1={paintProps.customData.fromX}
              x2={paintProps.customData.toX}
              y1={paintProps.customData.fromY}
              y2={paintProps.customData.toY}
              stroke={props.stroke}
              stroke-width={props["stroke-width"]}
            />
            {paintProps.children}
          </g>
        </Show>
      );
    };

    return (
      <Layout name={props.name} layout={layout} paint={paint}>
        {props.children}
      </Layout>
    );
  },
  { displayName: "Line" }
);

export default Line;
