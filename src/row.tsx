import { ParentProps, JSX, mergeProps } from "solid-js";
import { StackArgs, stackLayout } from "./stackLayout";
import withBluefish from "./withBluefish";
import Layout from "./layout";
import { BBox, Transform, ChildNode } from "./scenegraph";
import { AlignmentVertical } from "./align";

export type RowProps = ParentProps<
  Omit<StackArgs, "direction"> & { alignment?: AlignmentVertical }
>;

export const Row = withBluefish((props: RowProps) => {
  const layout = (childNodes: ChildNode[]) => {
    return stackLayout(
      mergeProps(
        {
          direction: "horizontal" as const,
          alignment: "centerY" as const,
          spacing: 10,
        },
        props
      )
    )(childNodes);
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
