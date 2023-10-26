import { For } from "solid-js";
import Align from "../../src/align";
import Distribute from "../../src/distribute";
import Group from "../../src/group";
import Rect from "../../src/rect";
import { Id } from "../../src/scenegraph";
import withBluefish from "../../src/withBluefish";
import HeapObject from "./heap-object";
import { Address, HeapObject as HeapObjectType, formatValue } from "./types";
import Ref from "../../src/ref";

export type HeapProps = {
  name: Id;
  heap: HeapObjectType[];
  heapArrangement: (Address | null)[][];
};

export const Heap = withBluefish((props: HeapProps) => {
  return (
    <Group name={props.name}>
      <For each={props.heapArrangement}>
        {(row, index) => (
          <Group name={`row${index()}~${props.name}`}>
            <For each={row}>
              {(obj, objIndex) =>
                obj === null ? (
                  <Rect
                    name={`row${index()}_col${objIndex()}`}
                    height={60}
                    width={140}
                    fill={"none"}
                    stroke={"none"}
                  />
                ) : (
                  <HeapObject
                    name={`row${index()}_col${objIndex()}`}
                    objectType={props.heap[obj].type}
                    // TODO: this is just a hack to get things to work for now...
                    objectValues={props.heap[obj].values.map((value) => ({
                      type: "string",
                      value: formatValue(value),
                    }))}
                  />
                )
              }
            </For>
            <Distribute direction="horizontal" spacing={50}>
              <For each={row}>
                {(obj, objIndex) => (
                  <Ref select={`row${index()}_col${objIndex()}`} />
                )}
              </For>
            </Distribute>
            <Align alignment="bottom">
              <For each={row}>
                {(obj, objIndex) => (
                  <Ref select={`row${index()}_col${objIndex()}`} />
                )}
              </For>
            </Align>
          </Group>
        )}
      </For>
      <Distribute direction="vertical" spacing={75}>
        <For each={props.heapArrangement}>
          {(row, index) => <Ref select={`row${index()}~${props.name}`} />}
        </For>
      </Distribute>
      <Align alignment="left">
        <For each={props.heapArrangement}>
          {(row, index) => <Ref select={`row${index()}~${props.name}`} />}
        </For>
      </Align>
    </Group>
  );
});

export default Heap;
