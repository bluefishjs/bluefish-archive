import type { Meta, StoryObj } from "storybook-solidjs";
import { Rect } from "../rect";
import { Bluefish } from "../bluefish";
import { Planets as PlanetsComponent } from "./examples/planets";

const meta: Meta = {
  title: "Examples",
};

export default meta;
type Story = StoryObj;

export const Planets: Story = {
  render: PlanetsComponent,
};
