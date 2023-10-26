import Group from "../../src/group";
import Rect from "../../src/rect";
import Align from "../../src/align";
import Distribute from "../../src/distribute";
import Ref from "../../src/ref";
import Text from "../../src/text";
import { createUniqueId } from "solid-js";
import { Id } from "../../src/scenegraph";

export type StackSlotProps = {
  id?: Id;
  variable: string;
  value: string;
};

export function StackSlot(props: StackSlotProps) {
  const id = createUniqueId();

  const fontFamily = "verdana, arial, helvetica, sans-serif";

  return (
    <Group name={props.id ?? `group${id}`}>
      <Rect name={`box${id}`} y={0} height={40} width={40} fill={"#e2ebf6"} />
      <Text
        name={`name${id}`}
        font-size={"24px"}
        font-family={fontFamily}
        contents={props.variable}
      />
      {/* TODO: if we only align or distribute on a single dimension, then their bounding boxes should be null or something along the unconstrained dimension... */}
      <Align alignment="centerY">
        <Ref select={`name${id}`} />
        <Ref select={`box${id}`} />
      </Align>
      <Distribute direction="horizontal" spacing={5}>
        <Ref select={`name${id}`} />
        <Ref select={`box${id}`} />
      </Distribute>
      <Align alignment="bottomCenter">
        <Rect
          name={`boxBorderBottom${id}`}
          height={2}
          width={40}
          fill={"#a6b3b6"}
        />
        <Ref select={`box${id}`} />
      </Align>
      <Align alignment="centerLeft">
        <Rect
          name={`boxBorderLeft${id}`}
          height={40}
          width={2}
          fill={"#a6b3b6"}
        />
        <Ref select={`box${id}`} />
      </Align>
      <Align alignment="center">
        <Text
          name={`valueName${id}`}
          contents={props.value}
          font-size="24px"
          font-family={fontFamily}
        />
        <Ref select={`box${id}`} />
      </Align>
    </Group>
  );
}
