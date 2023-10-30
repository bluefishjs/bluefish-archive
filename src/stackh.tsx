import { ParentProps, JSX, mergeProps } from "solid-js";
import { StackArgs, stackLayout } from "./stackLayout";
import withBluefish from "./withBluefish";
import Layout from "./layout";
import { BBox, Transform, ChildNode } from "./scenegraph";
import { AlignmentVertical } from "./align";

export type StackHProps = ParentProps<
  Omit<StackArgs, "direction"> & { alignment?: AlignmentVertical }
>;

export const StackH = withBluefish((props: StackHProps) => {
  const layout = (childNodes: ChildNode[]) => {
    const stackProps = mergeProps(
      {
        direction: "horizontal" as const,
        alignment: "centerY" as const,
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
    <Layout name={props.name} layout={layout} paint={paint}>
      {props.children}
    </Layout>
  );
});
