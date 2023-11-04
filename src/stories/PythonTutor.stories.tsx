// Examples created based on Python Tutor: https://pythontutor.com/

import type { Meta, StoryObj } from "storybook-solidjs";
import { Bluefish } from "../bluefish";
import { Align } from "../align";
import { Arrow } from "../arrow";
import { Distribute } from "../distribute";
import { Group } from "../group";
import { Ref } from "../ref";
import { withBluefish, WithBluefishProps } from "../withBluefish";
import { GlobalFrame } from "../python-tutor/global-frame";
import { Heap } from "../python-tutor/heap";
import { Address, HeapObject, StackSlot, pointer } from "../python-tutor/types";
import { For } from "solid-js";
import { createName } from "../createName";
import { StackH } from "../stackh";

const meta: Meta = {
  title: "Example/PythonTutor",
};

export default meta;
type Story = StoryObj;

type PythonTutorProps = WithBluefishProps<{
  stack: StackSlot[];
  heap: HeapObject[];
  heapArrangement: (Address | null)[][];
}>;

const PythonTutor = withBluefish((props: PythonTutorProps) => {
  const globalFrameName = createName("globalFrame");
  const heapName = createName("heap");

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
      <StackH alignment="top" spacing={60}>
        <GlobalFrame name={globalFrameName} variables={props.stack} />
        <Heap
          name={heapName}
          heap={props.heap}
          heapArrangement={props.heapArrangement}
        />
      </StackH>

      {/* Make arrows from stack slots to heap objects */}
      <For each={props.stack}>
        {(stackSlot, stackSlotIndex) =>
          typeof stackSlot.value === "object" &&
          "type" in stackSlot.value &&
          stackSlot.value.type === "pointer" ? (
            <Arrow bow={0} stretch={0} flip stroke="#1A5683" padStart={0} start>
              {/* <Ref
                select={`valueName_stackSlot${slackSlotIndex()}_globalFrame-${
                  props.name
                }`}
              /> */}
              <Ref
                select={[globalFrameName, `stackSlot-${stackSlotIndex()}`]}
              />
              {/* <Ref
                select={`elm_0_${objectIdToComponentId.get(
                  stackSlot.value.value
                )}`}
              /> */}
              <Ref select={[heapName, `address-${stackSlot.value.value}`]} />
            </Arrow>
          ) : null
        }
      </For>
    </Group>
  );
});

export const PythonTutorExample: Story = {
  args: {
    stack: [
      { variable: "c", value: pointer(0) },
      { variable: "d", value: pointer(1) },
      { variable: "x", value: "5" },
    ],
    heap: [
      {
        type: "tuple",
        values: ["1", pointer(1), pointer(2)],
      },
      { type: "tuple", values: ["1", "4"] },
      { type: "tuple", values: ["3", "10"] },
    ],
    heapArrangement: [
      [0, null, null],
      [null, 1, 2],
    ],
  },
  render: (props) => (
    <Bluefish>
      <PythonTutor
        {...props}
        heap={props.heap}
        heapArrangement={props.heapArrangement}
        stack={props.stack}
      />
    </Bluefish>
  ),
};
