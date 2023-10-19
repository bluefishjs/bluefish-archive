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
import { Address, HeapObject, StackSlot } from "../python-tutor/types";
import { For } from "solid-js";

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
    <Group id={props.id}>
      <GlobalFrame id={`globalFrame-${props.id}`} variables={props.stack} />
      <Heap
        id={`heap-${props.id}`}
        heap={props.heap}
        heapArrangement={props.heapArrangement}
      />
      <Distribute direction="horizontal" spacing={60}>
        <Ref refId={`globalFrame-${props.id}`} />
        <Ref refId={`heap-${props.id}`} />
      </Distribute>
      <Align alignment="top">
        <Ref refId={`globalFrame-${props.id}`} />
        <Ref refId={`heap-${props.id}`} />
      </Align>

      {/* Make arrows from stack slots to heap objects */}
      <For each={props.stack}>
        {(stackSlot, slackSlotIndex) =>
          typeof stackSlot.value !== "string" &&
          typeof stackSlot.value !== "number" ? (
            <Arrow bow={0} stretch={0} flip stroke="#1A5683">
              <Ref
                refId={`valueName_stackSlot${slackSlotIndex()}_globalFrame-${
                  props.id
                }`}
              />
              <Ref
                refId={`elm_0_${objectIdToComponentId.get(
                  stackSlot.value.value
                )}`}
              />
            </Arrow>
          ) : null
        }
      </For>
    </Group>
  );
});

export const PythonTutorExample: Story = {
  args: {
    id: "pt0",
    stack: [
      { variable: "c", value: { type: "pointer", value: 0 } },
      { variable: "d", value: { type: "pointer", value: 1 } },
      { variable: "x", value: "5" },
    ],
    heap: [
      {
        type: "tuple",
        values: [
          "1",
          { type: "pointer", value: 1 },
          { type: "pointer", value: 2 },
        ],
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
