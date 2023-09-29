import _ from "lodash";
import Layout from "./layout";
import { BBox, ChildNode, Id, Transform, useScenegraph } from "./scenegraph";
import { JSX } from "solid-js/jsx-runtime";
import { ParentProps, Show, mergeProps } from "solid-js";
import { maybeMax, maybeMin, maybeSub } from "./maybeUtil";
import withBluefish from "./withBluefish";
import Rect from "./rect";

export type BackgroundProps = ParentProps<{
  id: Id;
  x?: number;
  y?: number;
  background?: () => JSX.Element;
  padding?: number;
}>;

export const Background = withBluefish((props: BackgroundProps) => {
  props = mergeProps(
    {
      padding: 10,
    },
    props
  );

  const layout = (childIds: ChildNode[]) => {
    // debugger;
    childIds = Array.from(childIds);

    if (props.id.endsWith("DEBUG")) {
      debugger;
    }

    const [backgroundChild, ...rest] = childIds;

    let left: number;
    let top: number;
    if (!backgroundChild.owned.x) {
      // infer x from rest
      const x =
        maybeMin(
          rest
            .filter((childNode) => childNode.owned.x)
            .map((childNode) => childNode.bbox.left)
        ) ?? 0;
      left = x - props.padding!;
      backgroundChild.bbox.left = left;
    } else {
      throw new Error("Background x must be inferred from children");
    }
    if (!backgroundChild.owned.y) {
      // infer y from rest
      const y =
        maybeMin(
          rest
            .filter((childNode) => childNode.owned.y)
            .map((childNode) => childNode.bbox.top)
        ) ?? 0;
      top = y - props.padding!;
      backgroundChild.bbox.top = top;
    } else {
      throw new Error("Background y must be inferred from children");
    }

    if (!backgroundChild.owned.width) {
      // infer width from rest
      const right = Math.max(
        ...rest
          .filter((childNode) => childNode.owned.x && childNode.owned.width)
          .map((childNode) => childNode.bbox.left! + childNode.bbox.width!)
      );
      backgroundChild.bbox.width = right - left + props.padding!;
    } else {
      // center all children horizontally in the background
      for (const childId of rest) {
        if (childId.owned.x) continue;
        childId.bbox.left = left;
      }
    }

    if (!backgroundChild.owned.height) {
      // infer height from rest
      const bottom = Math.max(
        ...rest
          .filter((childNode) => childNode.owned.y && childNode.owned.height)
          .map((childNode) => childNode.bbox.top! + childNode.bbox.height!)
      );
      backgroundChild.bbox.height = bottom - top + props.padding!;
    } else {
      // center all children vertically in the background
      for (const childId of rest) {
        if (childId.owned.y) continue;
        childId.bbox.top = top;
      }
    }

    return {
      bbox: backgroundChild.bbox,
      transform: {
        translate: {
          x: maybeSub(props.x, left),
          y: maybeSub(props.y, top),
        },
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
    <Layout id={props.id} layout={layout} paint={paint}>
      <Show
        when={props.background}
        fallback={<Rect stroke="black" fill="none" stroke-width="3" />}
      >
        {props.background!()}
      </Show>
      {props.children}
    </Layout>
  );
});

export default Background;
