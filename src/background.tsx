import _ from "lodash";
import Layout from "./layout";
import { BBox, Id, Transform, useScenegraph } from "./scenegraph";
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
  const { getBBox, setBBox, ownedByOther } = useScenegraph();
  props = mergeProps(
    {
      padding: 10,
    },
    props
  );

  const layout = (childIds: Id[]) => {
    // debugger;
    childIds = Array.from(childIds);

    if (props.id.endsWith("DEBUG")) {
      debugger;
    }

    const [backgroundChild, ...rest] = childIds;

    let left: number;
    let top: number;
    if (!ownedByOther(props.id, backgroundChild, "x")) {
      // infer x from rest
      const x =
        maybeMin(
          rest
            .filter((childId) => ownedByOther(props.id, childId, "x"))
            .map((childId) => getBBox(childId).left)
        ) ?? 0;
      left = x - props.padding!;
      setBBox(props.id, backgroundChild, { left });
    } else {
      throw new Error("Background x must be inferred from children");
    }
    if (!ownedByOther(props.id, backgroundChild, "y")) {
      // infer y from rest
      const y =
        maybeMin(
          rest
            .filter((childId) => ownedByOther(props.id, childId, "y"))
            .map((childId) => getBBox(childId).top)
        ) ?? 0;
      top = y - props.padding!;
      setBBox(props.id, backgroundChild, { top });
    } else {
      throw new Error("Background y must be inferred from children");
    }

    if (!ownedByOther(props.id, backgroundChild, "width")) {
      // infer width from rest
      const right = Math.max(
        ...rest
          .filter((childId) => ownedByOther(props.id, childId, "x"))
          .filter((childId) => ownedByOther(props.id, childId, "width"))
          .map((childId) => getBBox(childId).left! + getBBox(childId).width!)
      );
      setBBox(props.id, backgroundChild, {
        width: right - left + props.padding!,
      });
    } else {
      // center all children horizontally in the background
      const width = getBBox(backgroundChild).width!;

      for (const childId of rest) {
        if (ownedByOther(props.id, childId, "x")) continue;
        setBBox(props.id, childId, {
          // left: left + (width - getBBox(childId).width!) / 2,
          // left: 0,
          left: left,
        });
      }
    }

    if (!ownedByOther(props.id, backgroundChild, "height")) {
      // infer height from rest
      const bottom = Math.max(
        ...rest
          .filter((childId) => ownedByOther(props.id, childId, "y"))
          .filter((childId) => ownedByOther(props.id, childId, "height"))
          .map(
            (childId) =>
              (getBBox(childId).top ?? top) + getBBox(childId).height!
          )
      );
      setBBox(props.id, backgroundChild, {
        height: bottom - top + props.padding!,
      });
    } else {
      // center all children vertically in the background
      const height = getBBox(backgroundChild).height!;

      for (const childId of rest) {
        if (ownedByOther(props.id, childId, "y")) continue;
        const bbox = getBBox(childId);
        const childHeight = bbox.height!;
        const top = bbox.top!;
        setBBox(props.id, childId, {
          // top: top + (height - childHeight) / 2,
          top: 0,
        });
      }
    }

    return {
      bbox: getBBox(backgroundChild),
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
