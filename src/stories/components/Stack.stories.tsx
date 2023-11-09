import type { Meta, StoryObj } from "storybook-solidjs";
import { Stack } from "../../stack";
import { Bluefish } from "../../bluefish";
import Rect from "../../rect";

/**
 * TODO: write some docs
 */
const meta: Meta<typeof Stack> = {
  title: "Components/Stack",
  component: Stack,
  tags: ["autodocs"],
  argTypes: {
    alignment: { control: "radio", options: ["left", "centerX", "right"] },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Horizontal: Story = {
  args: {
    spacing: 20,
    alignment: "centerY",
    direction: "horizontal",
  },
  render: (props) => {
    return (
      <Bluefish>
        <Stack {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </Stack>
      </Bluefish>
    );
  },
};

export const Vertical: Story = {
  args: {
    spacing: 20,
    alignment: "centerX",
    direction: "vertical",
  },
  render: (props) => {
    return (
      <Bluefish>
        <Stack {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </Stack>
      </Bluefish>
    );
  },
};
