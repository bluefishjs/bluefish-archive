import { ParentProps, JSX, mergeProps } from "solid-js";
import { StackArgs, stackLayout } from "./stackLayout";
import withBluefish from "./withBluefish";
import Layout from "./layout";
import { BBox, Transform, ChildNode } from "./scenegraph";
import { AlignmentHorizontal } from "./align";

export type StackVProps = ParentProps<
  Omit<StackArgs, "direction"> & { alignment?: AlignmentHorizontal }
>;

export const StackV = withBluefish((props: StackVProps) => {
  const layout = (childNodes: ChildNode[]) => {
    const stackProps = mergeProps(
      {
        direction: "vertical" as const,
        alignment: "centerX" as const,
        spacing: 10,
      },
      props
    );

    return stackLayout(stackProps)(childNodes);
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
