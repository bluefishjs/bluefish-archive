import { createUniqueId } from "solid-js";
import { Align } from "../../src/align";
import { Group } from "../../src/group";
import { Rect } from "../../src/rect";
import { Ref } from "../../src/ref";
import { Id } from "../../src/scenegraph";
import { Text } from "../../src/text";
import { Value } from "./types";

export type ElmTupleProps = {
  x?: number;
  y?: number;
  name?: Id;
  tupleIndex: string;
  tupleData: { type: string; value: Value };
  objectId: string;
};

export function ElmTuple(props: ElmTupleProps) {
  const id = createUniqueId();
  const fontFamily = "verdana, arial, helvetica, sans-serif";

  return (
    <Group
      name={props.name ?? `elm_${props.tupleIndex}_${props.objectId}`}
      x={props.x}
      y={props.y}
    >
      <Rect
        name={`elmBox_${props.tupleIndex}_${props.objectId}`}
        height={60}
        width={70}
        fill={"#ffffc6"}
        stroke={"grey"}
      />
      <Text
        name={`elmLabel_${props.tupleIndex}_${props.objectId}`}
        font-family={fontFamily}
        font-size={"16px"}
        fill={"gray"}
      >
        {props.tupleIndex}
      </Text>

      {props.tupleData.type === "string" ? (
        <Text
          name={`elmVal_${props.tupleIndex}_${props.objectId}`}
          font-size={"24px"}
          font-family={fontFamily}
          fill={"black"}
        >
          {props.tupleData.value as string}
        </Text>
      ) : (
        <Text
          name={`elmVal_${props.tupleIndex}_${props.objectId}`}
          fill={"none"}
        >
          {""}
        </Text>
      )}
      <Align alignment="center">
        <Ref select={`elmVal_${props.tupleIndex}_${props.objectId}`} />
        <Ref select={`elmBox_${props.tupleIndex}_${props.objectId}`} />
      </Align>
      <Align alignment="topLeft">
        <Ref select={`elmLabel_${props.tupleIndex}_${props.objectId}`} />
        <Ref select={`elmBox_${props.tupleIndex}_${props.objectId}`} />
      </Align>
    </Group>
  );
}

export default ElmTuple;
