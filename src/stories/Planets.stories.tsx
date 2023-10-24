import type { Meta, StoryObj } from "storybook-solidjs";
import Align from "../align";
import Arrow from "../arrow";
import Background from "../background";
import Bluefish from "../bluefish";
import Circle from "../circle";
import Distribute from "../distribute";
import Group from "../group";
import Ref from "../ref";
import Text from "../text";
import { HStack } from "../hstack";
import { Col } from "../col";
import Rect from "../rect";

const meta: Meta = {
  title: "Example/Planets",
};

export default meta;
type Story = StoryObj;

export const PlanetsAlignDistribute: Story = {
  render: () => {
    return (
      <Bluefish id="bluefish-planets" padding={20}>
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
          <Ref refId="label" />
          <Ref refId="mercury" />
        </Align>
        <Distribute direction="vertical" spacing={60}>
          <Ref refId="label" />
          <Ref refId="mercury" />
        </Distribute>
        <Background id="background">
          <Ref refId="mercury" />
          <Ref refId="venus" />
          <Ref refId="earth" />
          <Ref refId="mars" />
        </Background>
        <Arrow id="arrow">
          <Ref refId="label" />
          <Ref refId="mercury" />
        </Arrow>
      </Bluefish>
    );
  },
};

export const PlanetsRowCol: Story = {
  render: () => {
    return (
      <Bluefish id="bluefish-planets" padding={20}>
        <HStack spacing={50}>
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
        </HStack>
        <Col spacing={60}>
          <Text id="label" vertical-anchor="start" width={500}>
            Mercury
          </Text>
          <Ref refId="mercury" />
        </Col>
        <Background>
          <Ref refId="mercury" />
          <Ref refId="venus" />
          <Ref refId="earth" />
          <Ref refId="mars" />
        </Background>
        <Arrow>
          <Ref refId="label" />
          <Ref refId="mercury" />
        </Arrow>
      </Bluefish>
    );
  },
};

export const PlanetsTutorial: Story = {
  render: () => {
    return (
      <Bluefish padding={20}>
        <Background id="planets" padding={20}>
          <HStack spacing={50}>
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
          </HStack>
        </Background>
        <Align alignment="centerX">
          <Text id="label">Mercury</Text>
          <Ref refId="mercury" />
        </Align>
        <Distribute direction="vertical" spacing={20}>
          <Ref refId="label" />
          <Ref refId="planets" />
        </Distribute>
        <Arrow>
          <Ref refId="label" />
          <Ref refId="mercury" />
        </Arrow>
      </Bluefish>
    );
  },
};
