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
import { StackH } from "../stackh";
import { StackV } from "../stackv";
import { createName } from "../createName";

export type HeapProps = {
  name: Id;
  heap: HeapObjectType[];
  heapArrangement: (Address | null)[][];
};

export const Heap = withBluefish((props: HeapProps) => {
  const addressNames = props.heap.map((_, i) => createName(`address-${i}`));

  return (
    <Group>
      <StackV alignment="left" spacing={75}>
        <For each={props.heapArrangement}>
          {(row, index) => (
            <StackH alignment="bottom" spacing={75}>
              <For each={row}>
                {(address) =>
                  address === null ? (
                    <Rect
                      height={60}
                      width={140}
                      fill={"none"}
                      stroke={"none"}
                    />
                  ) : (
                    <HeapObject
                      name={addressNames[address]}
                      objectType={props.heap[address].type}
                      objectValues={props.heap[address].values.map((value) => ({
                        type: typeof value === "string" ? "string" : "pointer",
                        value: formatValue(value),
                      }))}
                    />
                  )
                }
              </For>
            </StackH>
          )}
        </For>
      </StackV>

      {/* Add arrows between heap objects */}
      {/*  <For each={props.heap}>
        {(heapObject, address) => (
          <For each={heapObject.values}>
            {(elmTupleValue, elmTupleIndex) => {
              if (
                typeof elmTupleValue === "object" &&
                "type" in elmTupleValue &&
                elmTupleValue.type === "pointer"
              ) {
                return (
                  <Arrow
                    bow={0}
                    padEnd={25}
                    stroke="#1A5683"
                    start
                    padStart={0}
                  >
                    <Ref
                      select={[
                        addressNames[address()],
                        `elm-${elmTupleIndex()}`,
                        "val",
                      ]}
                    />
                    <Ref
                      select={[addressNames[elmTupleValue.value], "elm-0"]}
                    />
                  </Arrow>
                );
              }
            }}
          </For>
        )}
      </For> */}
    </Group>
  );
});

export default Heap;
