import {
  JSX,
  ParentProps,
  Show,
  createEffect,
  mergeProps,
  untrack,
} from "solid-js";
import Layout from "../layout";
import withBluefish from "../withBluefish";
import _, { get, startsWith } from "lodash";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const maybeClamp = (c, a, b) =>
  a !== undefined && b !== undefined && c !== undefined
    ? clamp(c, a, b)
    : undefined;
const maybeSub = (a, b) =>
  a !== undefined && b !== undefined ? a - b : undefined;
const maybeMin = (a, b) =>
  a !== undefined && b !== undefined ? Math.min(a, b) : undefined;
const maybeMax = (a, b) =>
  a !== undefined && b !== undefined ? Math.max(a, b) : undefined;

export const Line = withBluefish(
  (props) => {
    props = mergeProps(
      {
        "stroke-width": 3,
        stroke: "black",
      },
      props
    );
    // const { children, id } = props;

    const layout = (childIds) => {
      childIds = Array.from(childIds);

      const fromBBox = childIds[0].bbox;
      const toBBox = childIds[1].bbox;

      // take the combined bbox of the two children
      const left = maybeMin(fromBBox.left, toBBox.left);
      const top = maybeMin(fromBBox.top, toBBox.top);
      const right = maybeMax(fromBBox.right, toBBox.right);
      const bottom = maybeMax(fromBBox.bottom, toBBox.bottom);
      const width = maybeSub(right, left);
      const height = maybeSub(bottom, top);

      const data = {
        fromX: fromBBox.left + fromBBox.width / 2,
        fromY: fromBBox.top + fromBBox.height / 2,
        toX: toBBox.left + toBBox.width / 2,
        toY: toBBox.top + toBBox.height / 2,
      };

      return {
        transform: {
          translate: {
            x: maybeSub(props.x, left),
            y: maybeSub(props.y, top),
          },
        },
        bbox: { left, top, right, bottom, width, height },
        customData: {
          fromX: maybeClamp(data.toX, fromBBox.left, fromBBox.right),
          fromY: maybeClamp(data.toY, fromBBox.top, fromBBox.bottom),
          toX: maybeClamp(data.fromX, toBBox.left, toBBox.right),
          toY: maybeClamp(data.fromY, toBBox.top, toBBox.bottom),
        },
      };
    };

    /*
        {
          bbox: BBox;
          transform: Transform;
          children: JSX.Element;
          customData?: any;
        }
        */
    const paint = (paintProps) => {
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
            ></line>
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
