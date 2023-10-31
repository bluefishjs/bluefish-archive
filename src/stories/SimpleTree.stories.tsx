import type { Meta, StoryObj } from "storybook-solidjs";
import { Bluefish } from "../bluefish";
import { For, createUniqueId, mergeProps } from "solid-js";
import withBluefish, { WithBluefishProps } from "../withBluefish";
import { Group } from "../group";
import { Rect } from "../rect";
import { Ref } from "../ref";
import { Text } from "../text";
import { StackV } from "../stackv";
import { StackH } from "../stackh";
import { Arrow } from "../arrow";
import { Align } from "../align";

const meta: Meta = {
  title: "Example/SimpleTree",
};

export default meta;
type Story = StoryObj;

// Component to render Tree node
type NodeProps = WithBluefishProps<{
  nodeValue: string;
  id?: string;
}>;

const Node = withBluefish((props: NodeProps) => {
  props = mergeProps({ nodeValue: "?", id: createUniqueId() }, props);
  const nodeValueId = `${props.name}_value`;
  const nodeOutlineId = `${props.name}_outline`;

  return (
    <Group>
      <Rect
        name={nodeOutlineId}
        width={50}
        height={65}
        rx={5}
        fill={"cornflowerblue"}
        stroke={"black"}
        opacity={0.5}
      />
      <Text name={nodeValueId} font-size="24px">
        {props.nodeValue}
      </Text>
      <Align alignment="centerY">
        <Ref select={nodeValueId} />
        <Ref select={nodeOutlineId} />
      </Align>
      <Align alignment="centerX">
        <Ref select={nodeValueId} />
        <Ref select={nodeOutlineId} />
      </Align>
    </Group>
  );
});

// Component to render Tree
type TreeData = {
  subtrees?: TreeData[];
  nodeId?: string;
  nodeValue?: string;
};

type TreeProps = WithBluefishProps<{
  data: TreeData;
}>;

const Tree = withBluefish((props: TreeProps) => {
  // merge props.data with default
  props.data = mergeProps(
    {
      subtrees: [] as TreeData[],
      nodeId: createUniqueId(),
      nodeValue: "?",
    },
    props.data
  );

  // merge props with default
  props = mergeProps({ id: createUniqueId() }, props);

  const data = props.data;
  const subtreeRowId = `subtrees_of_${data.nodeId}`;

  let subtreeIds: string[] = data.subtrees.map(
    (subtree) => `${subtree.nodeId}_subtree`
  );

  return (
    <Group>
      <Node name={data.nodeId} nodeValue={data.nodeValue} />

      {data.subtrees?.length ? (
        <>
          <StackV spacing={50} alignment="centerX">
            <Ref select={data.nodeId} />
            <StackH name={subtreeRowId} alignment="centerY" spacing={50}>
              <For each={data.subtrees}>
                {(child, i) => <Tree name={subtreeIds[i()]} data={child} />}
              </For>
            </StackH>
          </StackV>
          <For each={data.subtrees}>
            {(child, i) => (
              <Arrow bow={0} stretch={0.1} flip>
                <Ref select={data.nodeId} />
                <Ref select={child.nodeId} />
              </Arrow>
            )}
          </For>
        </>
      ) : null}
    </Group>
  );
});

export const TwoLevelTree: Story = {
  args: {
    id: "tree0",
    data: {
      nodeId: "node0",
      nodeValue: "A",
      subtrees: [
        { nodeValue: "B", nodeId: "node1" },
        { nodeValue: "C", nodeId: "node2" },
      ],
    },
  },
  render: (props) => (
    <Bluefish width={500} height={500}>
      <Tree {...props} data={props.data} />
    </Bluefish>
  ),
};

export const ThreeLevelTree: Story = {
  args: {
    id: "tree1",
    data: {
      nodeId: "node0",
      nodeValue: "A",
      subtrees: [
        {
          nodeValue: "B",
          nodeId: "node1",
          subtrees: [
            { nodeId: "node3", nodeValue: "D" },
            { nodeId: "node4", nodeValue: "E" },
          ],
        },
        {
          nodeValue: "C",
          nodeId: "node2",
          subtrees: [
            { nodeId: "node5", nodeValue: "F" },
            { nodeId: "node6", nodeValue: "G" },
          ],
        },
      ],
    },
  },
  render: (props) => (
    <Bluefish width={500} height={500}>
      <Tree {...props} data={props.data} />
    </Bluefish>
  ),
};
