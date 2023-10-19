import Group from "../../src/group";
import Rect from "../../src/rect";
import Align from "../../src/align";
import Distribute from "../../src/distribute";
import Ref from "../../src/ref";
import Text from "../../src/text";
import { createUniqueId } from "solid-js";
import { Id } from "../../src/scenegraph";
import { Pointer } from "./types";

export type StackSlotProps = {
  id?: Id;
  variable: string;
  value: string | Pointer;
};

export function StackSlot(props: StackSlotProps) {
  const id = props.id ?? `stackSlot_${createUniqueId()}`;

  const fontFamily = "verdana, arial, helvetica, sans-serif";

  return (
    <Group id={id}>
      <Rect id={`box_${id}`} y={0} height={40} width={40} fill={"#e2ebf6"} />
      <Text id={`name_${id}`} font-size={"24px"} font-family={fontFamily}>
        {props.variable}
      </Text>
      {/* TODO: if we only align or distribute on a single dimension, then their bounding boxes should be null or something along the unconstrained dimension... */}
      <Align alignment="centerY">
        <Ref refId={`name_${id}`} />
        <Ref refId={`box_${id}`} />
      </Align>
      <Distribute direction="horizontal" spacing={5}>
        <Ref refId={`name_${id}`} />
        <Ref refId={`box_${id}`} />
      </Distribute>
      <Align alignment="bottomCenter">
        <Rect
          id={`boxBorderBottom${id}`}
          height={2}
          width={40}
          fill={"#a6b3b6"}
        />
        <Ref refId={`box_${id}`} />
      </Align>
      <Align alignment="centerLeft">
        <Rect
          id={`boxBorderLeft${id}`}
          height={40}
          width={2}
          fill={"#a6b3b6"}
        />
        <Ref refId={`box_${id}`} />
      </Align>

      {typeof props.value === "string" ? (
        <Align alignment="center">
          <Text
            id={`valueName_${id}`}
            font-size="24px"
            font-family={fontFamily}
          >
            {props.value}
          </Text>
          <Ref refId={`box_${id}`} />
        </Align>
      ) : (
        <Align alignment="center">
          <Text
            id={`valueName_${id}`}
            font-size="24px"
            font-family={fontFamily}
          >
            {""}
          </Text>
          <Ref refId={`box_${id}`} />
        </Align>
      )}
    </Group>
  );
}
