import type { Meta, StoryObj } from "storybook-solidjs";
import Align from "../align";
import Arrow from "../arrow";
import Background from "../background";
import Bluefish from "../bluefish";
import Circle from "../circle";
import Distribute from "../distribute";
import Group from "../group";
import Ref from "../ref";
import Text from "../text/text";

const meta: Meta = {
  title: "Example/Planets",
};

export default meta;
type Story = StoryObj;

export const Planets: Story = {
  render: () => {
    return (
      <Bluefish id="bluefish-planets" padding={20}>
        <Group x={10} y={10}>
          <Circle
            id="mercury"
            r={15}
            fill={"#EBE3CF"}
            stroke-width={3}
            stroke={"black"}
          />
          <Circle
            id="venus"
            r={36}
            fill={"#DC933C"}
            stroke-width={3}
            stroke={"black"}
          />
          <Circle
            id="earth"
            r={38}
            fill={"#179DD7"}
            stroke-width={3}
            stroke={"black"}
          />
          <Circle
            id="mars"
            r={21}
            fill={"#F1CF8E"}
            stroke-width={3}
            stroke={"black"}
          />
          <Align alignment="centerY">
            <Ref refId="mercury" />
            <Ref refId="venus" />
            <Ref refId="earth" />
            <Ref refId="mars" />
          </Align>
          <Distribute direction="horizontal" spacing={50}>
            <Ref refId="mercury" />
            <Ref refId="venus" />
            <Ref refId="earth" />
            <Ref refId="mars" />
          </Distribute>
          <Text id="label" vertical-anchor="start" width={500}>
            Mercury
          </Text>
          <Align alignment="centerX">
            <Ref id="mercuryRefAlign" refId="label" />
            <Ref id="labelRefAlign" refId="mercury" />
          </Align>
          <Distribute direction="vertical" spacing={60}>
            <Ref id="mercuryRefDistribute" refId="label" />
            <Ref id="labelRefDistribute" refId="mercury" />
          </Distribute>
          <Background id="background">
            <Ref refId="mercury" />
            <Ref refId="venus" />
            <Ref refId="earth" />
            <Ref refId="mars" />
          </Background>
          <Arrow id="arrow">
            <Ref id="labelRefArrow" refId="label" />
            <Ref id="mercuryRefArrow" refId="mercury" />
          </Arrow>
        </Group>
      </Bluefish>
    );
  },
};
