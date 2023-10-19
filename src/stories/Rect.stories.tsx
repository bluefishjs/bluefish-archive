import type { Meta, StoryObj } from "storybook-solidjs";
import { Rect } from "../rect";
import { Bluefish } from "../bluefish";

const meta: Meta<typeof Rect> = {
  title: "Component/Rect",
  component: Rect,
};

export default meta;
type Story = StoryObj<typeof Rect>;

export const FirstStory: Story = {
  args: {
    width: 300,
    height: 200,
    fill: "red",
    x: 30,
    y: 30,
  },
  render: (props) => (
    <Bluefish width={500} height={500} positioning="absolute">
      <Rect {...props} />
    </Bluefish>
  ),
};

export const SecondStory: Story = {
  args: {
    width: 100,
    height: 100,
    fill: "steelblue",
    x: 30,
    y: 30,
  },
  render: (props) => (
    <Bluefish width={500} height={500} positioning="absolute">
      <Rect {...props} />
    </Bluefish>
  ),
};
