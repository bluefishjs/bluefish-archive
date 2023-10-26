import { For, createUniqueId } from "solid-js";
import { Id } from "../../src/scenegraph";
import Rect from "../../src/rect";
import Group from "../../src/group";
import Align from "../../src/align";
import Ref from "../../src/ref";
import { StackSlot } from "./stack-slot";
import Distribute from "../../src/distribute";
import Text from "../../src/text";
import { Value } from "./types";

export type GlobalFrameProps = {
  id?: Id;
  variables: { variable: string; value: Value }[];
};

export function GlobalFrame(props: GlobalFrameProps) {
  const id = props.id ?? createUniqueId();

  // Font declaration
  const fontFamily = "Andale mono, monospace";

  return (
    <Group x={0} y={0} name={props.id ?? `group_${id}`}>
      {/* Global Frame and relevant text */}
      <Rect name={`frame${id}`} height={300} width={200} fill={"#e2ebf6"} />
      <Rect name={`frameBorder${id}`} height={300} width={5} fill={"#a6b3b6"} />
      {/* TODO: there is a bug where the text is showing up lower than I expect it to... */}
      <Text
        name={`label${id}`}
        font-size={"24px"}
        font-family={fontFamily}
        fill={"black"}
      >
        Global Frame
      </Text>
      <Align alignment="topCenter">
        <Ref select={`label${id}`} />
        <Ref select={`frame${id}`} />
      </Align>
      <Align alignment="centerLeft">
        <Ref select={`frameBorder${id}`} />
        <Ref select={`frame${id}`} />
      </Align>
      <Group name={`frameVariables${id}`}>
        <For each={props.variables}>
          {(variable: any, i) => (
            <StackSlot
              id={`stackSlot${i()}_${id}`}
              variable={variable.variable}
              value={variable.value}
            />
          )}
        </For>
        <Align alignment="right">
          <For each={props.variables}>
            {(variable: any, i) => <Ref select={`stackSlot${i()}_${id}`} />}
          </For>
        </Align>
        <Distribute direction="vertical" spacing={10}>
          <For each={props.variables}>
            {(variable: any, i) => <Ref select={`stackSlot${i()}_${id}`} />}
          </For>
        </Distribute>
      </Group>
      <Distribute direction="vertical" spacing={10}>
        <Ref select={`label${id}`} />
        <Ref select={`frameVariables${id}`} />
      </Distribute>
      <Align alignment="right">
        <Ref select={`frameVariables${id}`} />
        <Ref select={`label${id}`} />
      </Align>
    </Group>
  );
}

export default GlobalFrame;
