import type { Meta, StoryObj } from "storybook-solidjs";
import { Line } from "../../line";
import { Bluefish } from "../../bluefish";
import { Rect } from "../../rect";
import { Ref } from "../../ref";
/**
 * Bluefish's `Line` relation creates a line between two components. The first child component of the `Line` is the **source**, 
 * which dictates the start point of the line. The second child component of the `Line` is the **target**, which dictates the end point of the line.
 */
const meta: Meta<typeof Line> = {
  title: "Components/Line",
  component: Line,
  tags: ["autodocs"],
  argTypes: {
    "stroke-dasharray": {
        description: "The specification of dashes and gaps for the line. See [here](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray) for more details."
    },
    "stroke-width": {
        description: "The width of the line.",
        control: {
            type: "number", 
            step: 1
        }
    },
    stroke: {
        description: "The color of the line.",
        control: {
            type: "text"
        }
    },

    source: {
      description:
        "Either an array of 2 numbers [x, y] or undefined. \
        If an array, the start point of the line will be bound to the point x · width left of the \
        leftmost point of the source shape and y · height below the topmost point of the source shape. Otherwise, \
        the line will infer a starting point based on the positions of the two children.",
      control: {
        type: "array" || "undefined",
      },
    },
    target: {
        description: "Either an array of 2 numbers [x, y] or undefined. \
        If an array, the endpoint of the line will be bound to the point x · width left of the \
        leftmost point of the target shape and y · height below the topmost point of the target shape. Otherwise, \
        the line will infer a endpoint based on the positions of the two children.",
      control: {
        type: "array" || "undefined",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Line>;

export const LineComponent: Story = {
  args: {
    "stroke-width": 3,
    "stroke-dasharray": "0",
    stroke: "black",
    source: [1, 0.5],
    target: [0, 0.5],
  },
  render: (props) => {
    return (
      <Bluefish padding={30}>
        <Rect
          x={50}
          y={30}
          width={20}
          height={20}
          fill={"steelblue"}
          name="start"
        />
        <Rect
          x={200}
          y={40}
          width={50}
          height={50}
          fill={"steelblue"}
          name="end"
        />
        <Line name="line" {...props}>
          <Ref select="start" />
          <Ref select="end" />
        </Line>
      </Bluefish>
    );
  },
};
