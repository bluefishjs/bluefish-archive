import Group from "../group";
import Rect from "../rect";
import Align from "../align";
import Distribute from "../distribute";
import Ref from "../ref";
import { createUniqueId } from "solid-js";
import { Id } from "../scenegraph";

export type StackSlotProps = {
  id?: Id;
};

export function StackSlot(props: StackSlotProps) {
  const id = createUniqueId();

  return (
    <Group id={props.id ?? `group${id}`}>
      <Rect id={`box${id}`} y={0} height={40} width={40} fill={"#e2ebf6"} />
      <Rect id={`name${id}`} x={0} width={10} height={10} fill="magenta" />
      {/* TODO: if we only align or distribute on a single dimension, then their bounding boxes should be null or something along the unconstrained dimension... */}
      <Align id={`alignRow${id}`} alignment="centerY">
        <Ref id={`alignrowRef1${id}`} refId={`name${id}`} />
        <Ref id={`alignrowRef2${id}`} refId={`box${id}`} />
      </Align>
      <Distribute id={`distribute${id}`} direction="horizontal" spacing={5}>
        <Ref id={`rowRef1${id}`} refId={`name${id}`} />
        <Ref id={`rowRef2${id}`} refId={`box${id}`} />
      </Distribute>
      <Align id={`align1${id}`} alignment="bottomCenter">
        <Rect
          id={`boxBorderBottom${id}`}
          height={2}
          width={40}
          fill={"#a6b3b6"}
        />
        <Ref id={`ref2${id}`} refId={`box${id}`} />
      </Align>
      <Align id={`align2${id}`} alignment="centerLeft">
        <Rect
          id={`boxBorderLeft${id}`}
          height={40}
          width={2}
          fill={"#a6b3b6"}
        />
        <Ref id={`ref4${id}`} refId={`box${id}`} />
      </Align>
      <Align id={`align3${id}`} alignment="center">
        <Rect id={`valueName${id}`} width={10} height={10} fill="green" />
        <Ref id={`ref6${id}`} refId={`box${id}`} />
      </Align>
    </Group>
  );
}
