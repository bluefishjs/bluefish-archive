import _ from "lodash";
import Layout from "./layout";
import { BBox, Id, Transform, useScenegraph } from "./scenegraph";
import { JSX } from "solid-js/jsx-runtime";
import { ParentProps, Show, mergeProps } from "solid-js";
import { maybeMax } from "./maybeUtil";
import withBluefish from "./withBluefish";
import Rect from "./rect";

export type BackgroundProps = ParentProps<{
  id: Id;
  background?: JSX.Element;
  padding?: number;
}>;

export const Background = withBluefish((props: BackgroundProps) => {
  const { getBBox, setBBox, ownedByOther } = useScenegraph();
  props = mergeProps(
    {
      padding: 5,
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

    if (!ownedByOther(props.id, backgroundChild, "x")) {
      // infer x from rest
      let x = Infinity;
      for (const childId of rest) {
        x = Math.min(x, getBBox(childId).left!);
      }
      setBBox(props.id, backgroundChild, { left: x - props.padding! });
    } else {
      throw new Error("Background x must be inferred from children");
    }
    if (!ownedByOther(props.id, backgroundChild, "y")) {
      // infer y from rest
      let y = Infinity;
      for (const childId of rest) {
        y = Math.min(y, getBBox(childId).top!);
      }
      setBBox(props.id, backgroundChild, { top: y - props.padding! });
    } else {
      throw new Error("Background y must be inferred from children");
    }

    let right = -Infinity;
    let bottom = -Infinity;
    for (const childId of rest) {
      const bbox = getBBox(childId);
      right = Math.max(right, bbox.left! + bbox.width!);
      bottom = Math.max(bottom, bbox.top! + bbox.height!);
    }
    setBBox(props.id, backgroundChild, {
      width: right - getBBox(backgroundChild).left! + props.padding!,
      height: bottom - getBBox(backgroundChild).top! + props.padding!,
    });

    return {
      bbox: getBBox(backgroundChild),
      transform: {
        translate: {},
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
        {props.background}
      </Show>
      {props.children}
    </Layout>
  );
});

export default Background;
