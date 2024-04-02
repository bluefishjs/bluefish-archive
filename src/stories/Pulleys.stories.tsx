import withBluefish from "../withBluefish.jsx";
import { Line } from "../line.js";
import { Path } from "../path.js";
import Circle from "../circle.jsx";
import Text from "../text.jsx";
import Bluefish from "../bluefish.jsx";
import Rect from "../rect.jsx";
import Distribute from "../distribute.jsx";
import Align from "../align.jsx";
import Ref from "../ref.jsx";
import { ParentProps } from "solid-js";
import { maybeSub } from "../util/maybe.js";
import { StackH } from "../stackh.jsx";
import Group from "../group.jsx";
import { Meta, StoryObj } from "storybook-solidjs";

const meta: Meta = {
  title: "Example/Pulleys",
};

export default meta;
type Story = StoryObj;

const Weight = withBluefish(
  (
    props: ParentProps<{
      x?: number;
      y?: number;
      width: number;
      height: number;
    }>
  ) => (
    <Align alignment="center" x={props.x} y={props.y}>
      <Path
        d={`M 10,0 l ${props.width - 20},0 l 10,${
          props.height
        } l ${-props.width},0 Z`}
      />
      <Text font-size="10">{props.children as string}</Text>
    </Align>
  )
);

const PulleyCircle = withBluefish(
  (props: { r?: number; cx?: number; cy?: number }) => (
    <Align
      alignment="center"
      x={maybeSub(props.cx, props.r ?? 20)}
      y={maybeSub(props.cy, props.r ?? 20)}
    >
      <Circle r={props.r ?? 20} stroke="black" stroke-width={3} fill="none" />
      <Circle r={5} />
    </Align>
  )
);

// Parts that could use work:
// - pixel based positioning

const r = 25;

const w2jut = 10;

const App = () => {
  return (
    <Bluefish>
      <Rect
        name="rect"
        height={20}
        width={9 * r}
        stroke="black"
        fill="none"
        stroke-width={3}
      />

      <PulleyCircle name="A" r={r} />
      <PulleyCircle name="B" r={r} />
      <PulleyCircle name="C" r={r} />

      <Distribute direction="horizontal" spacing={-r}>
        <Ref select="A" />
        <Ref select="B" />
      </Distribute>
      <Distribute direction="horizontal" spacing={0}>
        <Ref select="B" />
        <Ref select="C" />
      </Distribute>
      <Distribute direction="vertical" spacing={40}>
        <Ref select="rect" />
        <Ref select="B" />
      </Distribute>
      <Distribute direction="vertical" spacing={30}>
        <Ref select="B" />
        <Ref select="A" />
      </Distribute>
      <Distribute direction="vertical" spacing={50}>
        <Ref select="B" />
        <Ref select="C" />
      </Distribute>

      <Align alignment="center">
        <Ref select="B" />
        <Text x={r} y={-r}>
          B
        </Text>
      </Align>
      <Align alignment="center">
        <Ref select="A" />
        <Text x={-r} y={-r}>
          A
        </Text>
      </Align>
      <Align alignment="center">
        <Ref select="C" />
        <Text x={r} y={r}>
          C
        </Text>
      </Align>

      <Line target={[0.5, 0.5]} name="l0">
        <Ref select="rect" />
        <Ref select="B" />
      </Line>
      <StackH spacing={5}>
        <Text name="t0" y={-10}>
          t
        </Text>
        <Ref select="l0" />
      </StackH>

      <Line target={[1, 0.5]} name="l3">
        <Ref select="rect" />
        <Ref select="C" />
      </Line>
      <Line source={[0, 0.5]} target={[0.5, 0.5]} name="l1">
        <Ref select="B" />
        <Ref select="A" />
      </Line>
      <Line source={[1, 0.5]} target={[0, 0.5]} name="l2">
        <Ref select="B" />
        <Ref select="C" />
      </Line>

      <StackH spacing={5}>
        <Ref select="l1" />
        <Text name="t1">x</Text>
      </StackH>
      <Distribute spacing={5} direction="horizontal">
        <Ref select="l2" />
        <Text name="t2">y</Text>
      </Distribute>
      <Distribute spacing={5} direction="horizontal">
        <Ref select="l3" />
        <Text name="t3">z</Text>
      </Distribute>
      <Align alignment="centerY">
        <Ref select="t1" />
        <Ref select="t2" />
        <Ref select="t3" />
      </Align>

      <StackH name="w1">
        <Weight width={30} height={30}>
          W1
        </Weight>
        // hack to offset the centerX alignment of A and w1
        <Rect fill="transparent" width={r * 2 - 10} />
      </StackH>
      <StackH name="w2">
        // hack to offset the centerX alignment of A and w2
        <Rect fill="transparent" width={r + (r / 2 - 10) - w2jut / 2} />
        <Weight width={r * 3 + w2jut} height={30}>
          W2
        </Weight>
      </StackH>
      <Distribute spacing={50} direction="vertical">
        <Ref select="C" />
        <Ref select="w2" />
      </Distribute>
      <Align alignment="left">
        <Ref select="A" />
        <Ref select="w2" />
      </Align>
      <Align alignment="centerX">
        <Ref select="A" />
        <Ref select="w1" />
      </Align>
      <Align alignment="centerY">
        <Ref select="w1" />
        <Ref select="w2" />
      </Align>

      <Line source={[0, 0.5]} name="l4">
        <Ref select="A" />
        <Ref select="w1" />
      </Line>
      <Line source={[1, 0.5]} name="l5">
        <Ref select="A" />
        <Ref select="w2" />
      </Line>
      <Line source={[0.5, 0.5]} name="l6">
        <Ref select="C" />
        <Ref select="w2" />
      </Line>

      <Distribute spacing={5} direction="horizontal">
        <Ref select="l4" />
        <Text name="t4">p</Text>
      </Distribute>
      <Distribute spacing={5} direction="horizontal">
        <Ref select="l5" />
        <Text name="t5">q</Text>
      </Distribute>
      <StackH spacing={5}>
        <Ref select="l6" />
        <Text name="t6">s</Text>
      </StackH>
      <Align alignment="centerY">
        <Ref select="t6" />
        <Ref select="t5" />
        <Ref select="t4" />
      </Align>

      <Group name="G">
        <Ref select="A" />
        <Ref select="B" />
        <Ref select="C" />
      </Group>
      <Align alignment="centerX">
        <Ref select="rect" />
        <Ref select="G" />
      </Align>
    </Bluefish>
  );
};

export const Pulleys: Story = {
  args: {},
  render: () => <App />,
};
