import { Meta, StoryObj } from "storybook-solidjs";
import Bluefish from "../bluefish";
import Group from "../group";
import Rect from "../rect";
import Ref from "../ref";
import withBluefish from "../withBluefish";
import { HStack } from "../hstack";
import { Col } from "../col";

const meta: Meta = {
  title: "Feat/Id Inference",
};

export default meta;
type Story = StoryObj;

const CustomComponent = withBluefish(() => {
  return <Rect width={100} height={20} />;
});

export const App: Story = {
  name: "Id Inference",
  render: () => {
    return (
      <Bluefish>
        <Group x={0} y={0}>
          <HStack>
            <Rect width={200} height={20} fill="blue" x={0} />
            <CustomComponent id="custom" />
          </HStack>
          <Col>
            <Ref refId="custom" />
            <Rect width={100} height={20} fill="magenta" />
          </Col>
        </Group>
      </Bluefish>
    );
  },
};
