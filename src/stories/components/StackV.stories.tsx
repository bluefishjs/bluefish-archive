import type { Meta, StoryObj } from "storybook-solidjs";
import { StackV } from "../../stackv";
import { Bluefish } from "../../bluefish";
import Rect from "../../rect";

/**
 * Bluefish's `StackV` component places its children into one vertical stack, through defining either the spacing between each item or total height that the vertical stack should occupy.
 *
 * Options for alignment of the children are: `left`, `centerX`, and `right`.
 */
const meta: Meta<typeof StackV> = {
  title: "Components/StackV",
  component: StackV,
  tags: ["autodocs"],
  argTypes: {
    alignment: { control: "radio", options: ["left", "centerX", "right"] },
  },
};

export default meta;
type Story = StoryObj<typeof StackV>;

export const DefinedSpacing: Story = {
  args: {
    spacing: 20,
    alignment: "centerX",
  },
  render: (props) => {
    return (
      <Bluefish>
        <StackV {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </StackV>
      </Bluefish>
    );
  },
};

export const TotalSpacing: Story = {
  args: {
    total: 110,
    alignment: "centerX",
  },
  render: (props) => {
    return (
      <Bluefish>
        <StackV {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </StackV>
      </Bluefish>
    );
  },
};

export const TotalAndSpacing: Story = {
  args: {
    spacing: 20,
    total: 100,
    alignment: "centerX",
  },
  render: (props) => {
    return (
      <Bluefish>
        <StackV {...props}>
          <Rect width={30} />
          <Rect width={20} />
          <Rect width={50} />
        </StackV>
      </Bluefish>
    );
  },
};
