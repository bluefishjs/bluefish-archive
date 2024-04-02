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
  
  export const maybeSub = (a, b) =>
    a !== undefined && b !== undefined ? a - b : undefined;
  const maybeMin = (a, b) =>
    a !== undefined && b !== undefined ? Math.min(a, b) : undefined;
  const maybeMax = (a, b) =>
    a !== undefined && b !== undefined ? Math.max(a, b) : undefined;
  
  export const SetHorizontalLayout = withBluefish(
    (props) => {
      props = mergeProps({}, props);
  
      const layout = (childNodes) => {
        const fromBBox = childNodes[0].bbox;
        const toBBox = childNodes[1].bbox;
  
        if (!childNodes[1].owned.width) toBBox.width = fromBBox.width;
        if (!childNodes[1].owned.left) toBBox.left = fromBBox.left;
        // toBBox.right = fromBBox.right;
  
        const left = maybeMin([fromBBox.left, toBBox.left]);
        const top = maybeMin([fromBBox.top, toBBox.top]);
        const right = maybeMax([fromBBox.right, toBBox.right]);
        const bottom = maybeMax([fromBBox.bottom, toBBox.bottom]);
        const bbox = {
          left,
          top,
          right,
          bottom,
          width: maybeSub(right, left),
          height: maybeSub(bottom, top),
        };
  
        return {
          transform: {
            translate: {
              x: props.x,
              y: props.y,
            },
          },
          bbox,
        };
      };
  
      const paint = (paintProps) => {
        return <g>{paintProps.children}</g>;
      };
  
      return (
        <Layout name={props.name} layout={layout} paint={paint}>
          {props.children}
        </Layout>
      );
    },
    { displayName: "SetWidth" }
  );
  
  export default SetHorizontalLayout;
  