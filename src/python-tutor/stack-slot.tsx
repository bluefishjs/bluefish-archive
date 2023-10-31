import Group from "../../src/group";
import Rect from "../../src/rect";
import Align from "../../src/align";
import Distribute from "../../src/distribute";
import Ref from "../../src/ref";
import Text from "../../src/text";
import { createUniqueId } from "solid-js";
import { Id } from "../../src/scenegraph";
import { Pointer } from "./types";
import withBluefish from "../withBluefish";

export type StackSlotProps = {
  name?: Id;
  variable: string;
  value: string | Pointer;
};

export const StackSlot = withBluefish((props: StackSlotProps) => {
  const id = props.name;
  const fontFamily = "verdana, arial, helvetica, sans-serif";

  return (
    <Group>
      <Rect name={`box_${id}`} y={0} height={40} width={40} fill={"#e2ebf6"} />
      <Text name={`name_${id}`} font-size={"24px"} font-family={fontFamily}>
        {props.variable}
      </Text>
      {/* TODO: if we only align or distribute on a single dimension, then their bounding boxes should be null or something along the unconstrained dimension... */}
      <Align alignment="centerY">
        <Ref select={`name_${id}`} />
        <Ref select={`box_${id}`} />
      </Align>
      <Distribute direction="horizontal" spacing={5}>
        <Ref select={`name_${id}`} />
        <Ref select={`box_${id}`} />
      </Distribute>
      <Align alignment="bottomCenter">
        <Rect
          name={`boxBorderBottom${id}`}
          height={2}
          width={40}
          fill={"#a6b3b6"}
        />
        <Ref select={`box_${id}`} />
      </Align>
      <Align alignment="centerLeft">
        <Rect
          name={`boxBorderLeft${id}`}
          height={40}
          width={2}
          fill={"#a6b3b6"}
        />
        <Ref select={`box_${id}`} />
      </Align>

      {typeof props.value === "string" ? (
        <Align alignment="center">
          <Text
            name={`valueName_${id}`}
            font-size="24px"
            font-family={fontFamily}
          >
            {props.value}
          </Text>
          <Ref select={`box_${id}`} />
        </Align>
      ) : (
        <Align alignment="center">
          <Text
            name={`valueName_${id}`}
            font-size="24px"
            font-family={fontFamily}
          >
            {""}
          </Text>
          <Ref select={`box_${id}`} />
        </Align>
      )}
    </Group>
  );
});
