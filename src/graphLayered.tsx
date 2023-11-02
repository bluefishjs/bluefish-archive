import { ParentProps, JSX, mergeProps } from "solid-js";
import { StackArgs, stackLayout } from "./stackLayout";
import withBluefish from "./withBluefish";
import Layout from "./layout";
import { Transform, ChildNode, Id, BBox } from "./scenegraph";
import * as BBoxUtil from "./util/bbox";
import { AlignmentVertical } from "./align";
import dagre from "dagre";
import { maybeSub } from "./util/maybe";

export type GraphLayeredProps = ParentProps<{
  name: Id;
  direction?: "left-right" | "right-left" | "top-bottom" | "bottom-top";
  x?: number;
  y?: number;
  // TODO: maybe there's a better interface for this?
  edges: { source: Id; target: Id }[];
}>;

export const convertDirection = {
  "left-right": "LR",
  "right-left": "RL",
  "top-bottom": "TB",
  "bottom-top": "BT",
};

/* 
TODO: Maybe add a `Nodes` component and an `Edges` component for specifying those. Like this:

<GraphLayered>
  <Nodes>
    <Rect name="a" ... />
    <Rect name="b" ... />
    <Rect name="c" ... />
    ...
  </Nodes>
  <Edges>
    <Edge source="a" target="b" />
    <Edge source="b" target="c" />
    ...
    OR
    <Arrow>
      <Ref select="a" />
      <Ref select="b" />
    </Arrow>
    <Arrow>
      <Ref select="b" />
      <Ref select="c" />
    </Arrow>
    ...
  </Edges>
</GraphLayered>
*/

export const GraphLayered = withBluefish((props: GraphLayeredProps) => {
  props = mergeProps(
    {
      direction: "top-bottom" as const,
    },
    props
  );

  const layout = (childNodes: ChildNode[]) => {
    // Create a new directed graph
    const g = new dagre.graphlib.Graph();

    // Set an object for the graph label
    g.setGraph({
      rankdir: convertDirection[props.direction!],
    });

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function () {
      return {};
    });

    for (const childNode of childNodes) {
      g.setNode(childNode.name, {
        width: childNode.bbox.width,
        height: childNode.bbox.height,
      });
    }

    // TODO: add code that asserts that the positions aren't fixed and the widths and heights are known

    // Add edges to the graph.
    for (const edge of props.edges) {
      g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    for (const node of g.nodes()) {
      const childNode = childNodes.find((childNode) => childNode.name === node);
      if (!childNode) {
        throw new Error(`Couldn't find node ${node}`);
      }

      childNode.bbox.left = g.node(node).x;
      childNode.bbox.top = g.node(node).y;
    }

    /* 
    TODO: draw arrows???
     */

    const bbox = BBoxUtil.from(childNodes.map((childId) => childId.bbox));

    return {
      bbox,
      transform: {
        translate: {
          x: maybeSub(props.x, bbox.left),
          y: maybeSub(props.y, bbox.top),
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
    <Layout name={props.name} layout={layout} paint={paint}>
      {props.children}
    </Layout>
  );
});
