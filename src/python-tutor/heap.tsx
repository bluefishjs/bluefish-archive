import { For } from "solid-js";
import { Align } from "../../src/align";
import { Distribute } from "../../src/distribute";
import { Group } from "../../src/group";
import { Rect } from "../../src/rect";
import { Arrow } from "../../src/arrow";
import { Ref } from "../../src/ref";
import { Id } from "../../src/scenegraph";
import withBluefish from "../../src/withBluefish";
import { HeapObject } from "./heap-object";
import { Address, HeapObject as HeapObjectType, formatValue } from "./types";

export type HeapProps = {
  name: Id;
  heap: HeapObjectType[];
  heapArrangement: (Address | null)[][];
};

export const Heap = withBluefish((props: HeapProps) => {
  // Maps object number to the ID of the corresponding heap object
  // This will help generate Arrows between objects
  const objectIdToComponentId = new Map<number, string>();
  props.heapArrangement.forEach((row, rowIndex) => {
    row.forEach((obj, colIndex) => {
      if (obj !== null) {
        objectIdToComponentId.set(obj, `row${rowIndex}_col${colIndex}`);
      }
    });
  });

  return (
    <Group>
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
                    objectValues={props.heap[obj].values.map((value) => ({
                      type: typeof value === "string" ? "string" : "pointer",
                      value: formatValue(value),
                    }))}
                  />
                )
              }
            </For>
            <Distribute direction="horizontal" spacing={75}>
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

      {/* Add arrows between heap objects */}
      <For each={props.heap}>
        {(heapObject, heapObIndex) => (
          <For each={heapObject.values}>
            {(elmTupleValue, elmTupleIndex) => {
              if (
                typeof elmTupleValue !== "string" &&
                typeof elmTupleValue !== "number"
              ) {
                const fromId = `elmVal_${elmTupleIndex()}_${objectIdToComponentId.get(
                  heapObIndex()
                )}`;
                const toId = `elm_0_${objectIdToComponentId.get(
                  elmTupleValue.value
                )}`;
                if (fromId !== undefined && toId !== undefined) {
                  return (
                    <Arrow
                      bow={0}
                      padEnd={25}
                      stroke="#1A5683"
                      start
                      padStart={0}
                    >
                      <Ref select={fromId} />
                      <Ref select={toId} />
                    </Arrow>
                  );
                }
              }
            }}
          </For>
        )}
      </For>
    </Group>
  );
});

export default Heap;
