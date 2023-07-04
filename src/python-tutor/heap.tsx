import { For } from "solid-js";
import Align from "../align";
import Distribute from "../distribute";
import Group from "../group";
import Rect from "../rect";
import { Id } from "../scenegraph";
import withBluefish from "../withBluefish";
import HeapObject from "./heap-object";
import { Address, HeapObject as HeapObjectType, formatValue } from "./types";
import Ref from "../ref";

export type HeapProps = {
  id: Id;
  heap: HeapObjectType[];
  heapArrangement: (Address | null)[][];
};

export const Heap = withBluefish((props: HeapProps) => {
  return (
    <Group id={props.id}>
      <For each={props.heapArrangement}>
        {(row, index) => (
          <Group id={`row${index()}~${props.id}`}>
            <For each={row}>
              {(obj, objIndex) =>
                obj === null ? (
                  <Rect
                    id={`row${index()}_col${objIndex()}`}
                    height={60}
                    width={140}
                    fill={"none"}
                    stroke={"none"}
                  />
                ) : (
                  <HeapObject
                    id={`row${index()}_col${objIndex()}`}
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
                  <Ref refId={`row${index()}_col${objIndex()}`} />
                )}
              </For>
            </Distribute>
            <Align alignment="bottom">
              <For each={row}>
                {(obj, objIndex) => (
                  <Ref refId={`row${index()}_col${objIndex()}`} />
                )}
              </For>
            </Align>
          </Group>
        )}
      </For>
      <Distribute direction="vertical" spacing={75}>
        <For each={props.heapArrangement}>
          {(row, index) => <Ref refId={`row${index()}~${props.id}`} />}
        </For>
      </Distribute>
      <Align alignment="left">
        <For each={props.heapArrangement}>
          {(row, index) => <Ref refId={`row${index()}~${props.id}`} />}
        </For>
      </Align>
    </Group>
  );
});

export default Heap;
