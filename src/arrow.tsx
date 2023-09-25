import { JSX, ParentProps, Show, createEffect, untrack } from "solid-js";
import { Layout } from "./layout";
import _, { get, startsWith } from "lodash";
import { maybe, maybeAdd, maybeMax, maybeMin, maybeSub } from "./maybeUtil";
import { BBox, Id, Transform, useScenegraph } from "./scenegraph";
import withBluefish from "./withBluefish";
import { getBoxToBoxArrow } from "perfect-arrows";

export type ArrowProps = ParentProps<{
  id: Id;
  x?: number;
  y?: number;
  start?: boolean;
}>;

export const Arrow = withBluefish((props: ArrowProps) => {
  // const { children, id } = props;
  const { getBBox, setBBox, ownedByUs, ownedByOther } = useScenegraph();

  const layout = (childIds: Id[] /* , getBBox: (id: string) => BBox */) => {
    childIds = Array.from(childIds);

    if (props.id.endsWith("DEBUG")) {
      debugger;
    }

    const fromBBox = getBBox(childIds[0]);
    const toBBox = getBBox(childIds[1]);

    const arrow = getBoxToBoxArrow(
      fromBBox.left ?? 0,
      fromBBox.top ?? 0,
      fromBBox.width ?? 0,
      fromBBox.height ?? 0,
      toBBox.left ?? 0,
      toBBox.top ?? 0,
      toBBox.width ?? 0,
      toBBox.height ?? 0,
      {
        // todo: make these props...
        bow: 0.2,
        stretch: 0.5,
        stretchMin: 40,
        stretchMax: 420,
        padStart: 5,
        padEnd: 20,
        flip: false,
        straights: true,
      }
    );

    // just take the combined bbox of the two children
    const left = maybeMin([fromBBox.left, toBBox.left]);
    const top = maybeMin([fromBBox.top, toBBox.top]);
    const right = maybeMax([fromBBox.right, toBBox.right]);
    const bottom = maybeMax([fromBBox.bottom, toBBox.bottom]);
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
      customData: {
        sx: arrow[0],
        sy: arrow[1],
        cx: arrow[2],
        cy: arrow[3],
        ex: arrow[4],
        ey: arrow[5],
        ae: arrow[6],
        as: arrow[7],
        ec: arrow[8],
      },
    };
  };

  const paint = (paintProps: {
    bbox: BBox;
    transform: Transform;
    children: JSX.Element;
    customData?: any;
  }) => {
    const endAngleAsDegrees = () => paintProps.customData.ae * (180 / Math.PI);

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
          <Show when={props.start} fallback={<></>}>
            <circle
              cx={paintProps.customData.sx}
              cy={paintProps.customData.sy}
              r={4}
            />
          </Show>
          <path
            d={`M${paintProps.customData.sx},${paintProps.customData.sy} Q${paintProps.customData.cx},${paintProps.customData.cy} ${paintProps.customData.ex},${paintProps.customData.ey}`}
            fill="none"
            stroke="black"
            stroke-width="3"
          />
          <polygon
            points="0,-6 12,0, 0,6"
            transform={`translate(${paintProps.customData.ex},${
              paintProps.customData.ey
            }) rotate(${endAngleAsDegrees()})`}
          />
          {paintProps.children}
        </g>
      </Show>
    );
  };

  return (
    <Layout id={props.id} layout={layout} paint={paint}>
      {props.children}
    </Layout>
  );
});

export default Arrow;
