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

  // const addressNames = new Map<Address, Id>();
  // for (const row of props.heapArrangement) {
  //   for (const address of row) {
  //     if (address !== null) {
  //       addressNames.set(address, createName(`address-${address}`));
  //     }
  //   }
  // }
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
      <For each={props.heap}>
        {(heapObject, address) => (
          <For each={heapObject.values}>
            {(elmTupleValue, elmTupleIndex) => {
              // TODO: probably should just box every value to make this simpler
              if (
                typeof elmTupleValue === "object" &&
                "type" in elmTupleValue &&
                elmTupleValue.type === "pointer"
              ) {
                // TODO: come back to this to get more precise starting point
                // const fromId = `elmVal_${elmTupleIndex()}_${objectIdToComponentId.get(
                //   address()
                // )}`;
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
                        // `elm-${elmTupleIndex()}`,
                      ]}
                    />
                    <Ref select={addressNames[elmTupleValue.value]} />
                  </Arrow>
                );
              }
            }}
          </For>
        )}
      </For>
    </Group>
  );
});

export default Heap;
