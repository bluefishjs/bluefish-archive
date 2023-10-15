import { Meta, StoryObj } from "storybook-solidjs";
import Bluefish from "../bluefish";
import Group from "../group";
import Rect from "../rect";
import Distribute from "../distribute";
import Align from "../align";
import Ref from "../ref";

const meta: Meta = {
  title: "Regression/#4",
};

export default meta;
type Story = StoryObj;

export const App: Story = {
  name: "#4",
  render: () => {
    return (
      <Bluefish id="root" debug>
        <Group id="group" y={10}>
          <Rect width={200} height={20} id="top-rect" fill="blue" x={0} />
          <Distribute id="distribute" direction="vertical" spacing={20}>
            <Rect width={100} height={20} id="rect-1" />
            <Rect width={50} height={20} id="rect-2" />
          </Distribute>
          <Align id="align" alignment="right">
            <Ref id="ref-rect-1" refId="rect-1" />
            <Ref id="ref-top-rect" refId="top-rect" />
          </Align>
        </Group>
      </Bluefish>
    );
  },
};
