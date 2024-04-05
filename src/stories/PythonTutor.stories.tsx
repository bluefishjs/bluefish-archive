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
import { PythonTutor } from "../python-tutor/python-tutor";

const meta: Meta = {
  title: "Example/PythonTutor",
};

export default meta;
type Story = StoryObj;

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
        name="python-tutor"
        {...props}
        heap={props.heap}
        heapArrangement={props.heapArrangement}
        stack={props.stack}
      />
    </Bluefish>
  ),
};
