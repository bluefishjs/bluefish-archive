import type { Meta, StoryObj } from "storybook-solidjs";
import { Align } from "../../align";
import { Bluefish } from "../../bluefish";
import { Rect } from "../../rect";
import Group from "../../group";
import Distribute from "../../distribute";

/**
 * Bluefish's `Align` component contains many different options for aligning its children components. Taking in any number of components as children,
 * the alignments can be split into:
 * - Alignments that just set Y positions: `top`, `centerY`, `bottom`,
 * - Alignments that just set X positions: `left`, `centerX`, `right`,
 * - and Alignments that set both X and Y positions: `center`, `topLeft`, `topCenter`, `topRight`, `centerLeft`, `centerRight`, `bottomLeft`, `bottomMiddle`, `bottomRight`
 */
const meta: Meta = {
  title: "Components/Align",
  component: Align,
  tags: ["autodocs"],
  argTypes: {
    alignment1: {
      control: "radio",
      options: ["top", "centerY", "bottom"],
    },
    alignment2: {
      control: "radio",
      options: ["left", "centerX", "right"],
    },
    alignment3: {
      control: "radio",
      options: [
        "center",
        "topLeft",
        "topCenter",
        "topRight",
        "centerLeft",
        "centerRight",
        "bottomLeft",
        "bottomMiddle",
        "bottomRight",
      ],
    },
  },
};

export default meta;
type Story = StoryObj;

export const AlignComponent: Story = {
  args: {
    alignment1: "centerY",
    alignment2: "right",
    alignment3: "center",
  },
  render: (props) => {
    return (
      <Bluefish>
        <Distribute direction="horizontal" spacing={50}>
          <Group>
            <Align id="verticalAlign" alignment={props.alignment1}>
              <Rect x={20} width={30} height={30} fill={"red"} />
              <Rect x={70} width={50} height={50} fill={"blue"} />
              <Rect x={160} width={80} height={80} fill={"green"} />
            </Align>
          </Group>
          <Group>
            <Align id="horizontalAlign" alignment={props.alignment2}>
              <Rect y={20} width={30} height={30} fill={"red"} />
              <Rect y={60} width={50} height={50} fill={"blue"} />
            </Align>
          </Group>
          <Group>
            <Align id="otherAlign" alignment={props.alignment3}>
              <Rect width={50} height={50} fill={"blue"} />
              <Rect width={30} height={30} fill={"red"} />
            </Align>
          </Group>
        </Distribute>
      </Bluefish>
    );
  },
};
