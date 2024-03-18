import type { Meta, StoryObj } from "storybook-solidjs";
import { Bluefish } from "../bluefish";
import withBluefish, { WithBluefishProps } from "../withBluefish";
import { Show, For, ParentProps, mergeProps, splitProps } from "solid-js";
import Group from "../group";
import Text from "../text";
import { StackH } from "../stackh";
import Background from "../background";
import Circle from "../circle";
import Ref from "../ref";
import { StackV } from "../stackv";
import Rect from "../rect";
import { createName } from "../createName";
import Layout from "../layout";
import { PaperScope } from "paper/dist/paper-core";
import { BBox, Transform } from "../scenegraph";
import { maybeSub } from "../util/maybe";

const meta: Meta = {
  title: "Example/ThreePointTopologies",
};

export default meta;
type Story = StoryObj;

const Path = withBluefish(
  (rawProps: WithBluefishProps<{ d: string; x?: number; y?: number }>) => {
    const props = mergeProps(
      {
        "stroke-width": 3,
        stroke: "black",
        position: "relative",
        fill: "none",
        d: "",
        x: undefined,
        y: undefined,
      },
      rawProps
    );

    const canvas = document.createElement("canvas");
    const paperScope = new PaperScope();
    paperScope.setup(canvas);

    const layout = () => {
      const path = new paperScope.Path(props.d);
      const bounds = path.bounds;

      return {
        transform: {
          translate: {
            x:
              props.position === "absolute"
                ? 0
                : maybeSub(props.x, bounds.left),
            y:
              props.position === "absolute" ? 0 : maybeSub(props.y, bounds.top),
          },
        },
        bbox: {
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
        },
        customData: {
          path,
        },
      };
    };

    const paint = (paintProps: {
      bbox: BBox;
      transform: Transform;
      customData?: { path: { pathData: string } };
    }) => {
      const [_, rest] = splitProps(props, ["name", "x", "y", "d", "position"]);

      return (
        <g
          transform={`translate(${paintProps.transform.translate.x ?? 0}, ${
            paintProps.transform.translate.y ?? 0
          })`}
        >
          <path {...rest} d={paintProps.customData?.path?.pathData ?? ""} />
        </g>
      );
    };

    return <Layout name={props.name} layout={layout} paint={paint} />;
  }
);

const PathContainAandC =
  "M68.5011 48H53.0011H37.501C32.001 48 29.039 47.7419 24.001 46.02C14.431 42.76 8.50201 33.96 7.00201 31C5.50201 28.039 2.00201 19.42 2.00201 13.5C2.00201 7.58 5.15102 2 11.502 2C17.862 2 22.002 4.11 23.002 13.5C24.002 22.887 34.001 42.07 41.501 42.07H53.0011H64.5011C72.0011 42.07 82.0001 22.887 83.0001 13.5C84.0001 4.11 88.1401 2 94.5001 2C100.851 2 104 7.58 104 13.5C104 19.42 100.5 28.039 99.0001 31C97.5001 33.96 91.5711 42.76 82.0011 46.02C76.9631 47.7419 74.0011 48 68.5011 48Z";
const Point = withBluefish(() => <Circle r={5} fill="black" />);
const EllipseBackground = withBluefish(
  (
    props: ParentProps<{
      padding: number;
    }>
  ) => (
    <Background
      padding={props.padding}
      background={() => (
        <Rect rx="60" fill="transparent" stroke="black" stroke-width="3" />
      )}
    >
      {props.children}
    </Background>
  )
);
const isAandCNeighbourhood = (neighbourhood: string[]) =>
  neighbourhood.length === 2 &&
  neighbourhood.includes("a") &&
  neighbourhood.includes("c");
const ThreePointTopology = withBluefish(
  (
    props: WithBluefishProps<{
      topology: string[][];
      showLabels?: boolean;
    }>
  ) => {
    const stack = createName("stack");
    const points: { [key: string]: string } = {
      a: createName("a"),
      b: createName("b"),
      c: createName("c"),
    };
    return (
      <Group>
        <StackH name={stack} spacing={30}>
          <Point name={points.a} />
          <Point name={points.b} />
          <Point name={points.c} />
        </StackH>

        <Show when={props.showLabels}>
          <StackV spacing={2}>
            <Ref select={points.a} />
            <Text font-style="italic">a</Text>
          </StackV>
          <StackV spacing={2}>
            <Ref select={points.b} />
            <Text font-style="italic">b</Text>
          </StackV>
          <StackV spacing={2}>
            <Ref select={points.c} />
            <Text font-style="italic">c</Text>
          </StackV>
        </Show>

        <Show when={props.topology.some(isAandCNeighbourhood)}>
          <Path d={PathContainAandC} x={-7} y={-10} />
        </Show>
        <For each={props.topology}>
          {(neighbourhood) =>
            isAandCNeighbourhood(neighbourhood) ? null : (
              <EllipseBackground padding={neighbourhood.length * 17 - 12}>
                <For each={neighbourhood}>
                  {(point) => <Ref select={points[point]} />}
                </For>
              </EllipseBackground>
            )
          }
        </For>
        <EllipseBackground padding={36}>
          <Ref select={stack} />
        </EllipseBackground>
      </Group>
    );
  }
);

const ThreePointTopologies = () => {
  return (
    <StackH>
      <StackV>
        <ThreePointTopology topology={[]} showLabels />
        <ThreePointTopology topology={[["b"]]} />
        <ThreePointTopology topology={[["a", "b"]]} />
      </StackV>
      <StackV>
        <ThreePointTopology topology={[["a", "b"], ["a"]]} showLabels />
        <ThreePointTopology topology={[["a", "b"], ["c"]]} />
        <ThreePointTopology topology={[["a", "b"], ["a"], ["b"]]} />
      </StackV>
      <StackV>
        <ThreePointTopology
          topology={[["a", "b"], ["b", "c"], ["b"]]}
          showLabels
        />
        <ThreePointTopology topology={[["a", "b"], ["b", "c"], ["b"], ["c"]]} />
        <ThreePointTopology
          topology={[["a", "b"], ["a", "c"], ["b", "c"], ["b"]]}
        />
      </StackV>
    </StackH>
  );
};

export const ThreePointTopologiesExample: Story = {
  args: {},
  render: (props) => (
    <Bluefish>
      <ThreePointTopologies {...props} />
    </Bluefish>
  ),
};
