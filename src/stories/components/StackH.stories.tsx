import type { Meta, StoryObj } from "storybook-solidjs";
import { StackH } from "../../stackh";
import { Bluefish } from "../../bluefish";
import Rect from "../../rect";

/**
 * Bluefish's `StackH` component places its children into one horizontal stack, through defining either the spacing between each item or total width (not yet working?) that the horizontal stack should occupy.
 *
 * Options for alignment of the children are: `top`, `centerY`, and `bottom`.
 */
const meta: Meta<typeof StackH> = {
  title: "Components/StackH",
  component: StackH,
  tags: ["autodocs"],
  argTypes: {
    alignment: { control: "radio", options: ["top", "centerY", "bottom"] },
  },
};

export default meta;
type Story = StoryObj<typeof StackH>;

export const DefinedSpacing: Story = {
  args: {
    spacing: 20,
    alignment: "centerY",
  },
  render: (props) => {
    return (
      <Bluefish>
        <StackH {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </StackH>
      </Bluefish>
    );
  },
};

export const TotalSpacing: Story = {
  args: {
    total: 110,
    alignment: "centerY",
  },
  render: (props) => {
    return (
      <Bluefish>
        <StackH {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </StackH>
      </Bluefish>
    );
  },
};

export const TotalAndSpacing: Story = {
  args: {
    spacing: 20,
    total: 500,
    alignment: "centerY",
  },
  render: (props) => {
    return (
      <Bluefish>
        <StackH {...props}>
          <Rect height={30} />
          <Rect height={20} />
          <Rect height={50} />
        </StackH>
      </Bluefish>
    );
  },
};
