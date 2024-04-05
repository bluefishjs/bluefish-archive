import type { Meta, StoryObj } from "storybook-solidjs";
import { Brownies } from "../example-gallery/brownie";
import { DFSCQLogFigure } from "../example-gallery/DFSCQ-log-figure";
import { InsertionSort } from "../example-gallery/insertion-sort";
import Bluefish from "../bluefish";
import { OhmParser } from "../example-gallery/ohm-parser";
import { PythonTutor } from "../python-tutor/python-tutor";
import { pointer } from "../python-tutor/types";
import { Pulley } from "../example-gallery/pulley";
import { QCText } from "../example-gallery/qc-text";
import { Topology } from "../example-gallery/topology";

const meta: Meta = {
  title: "Example/UIST Example Gallery",
};

export default meta;
type Story = StoryObj;

export const InsertionSortDiagram: Story = {
  args: {
    // unsortedArray: [43, 9, 15, 95, 5, 23, 75],
    unsortedArrayString: "[43, 9, 15, 95, 5, 23, 75]",
  },
  render: (args) => {
    try {
      const convertedArray = JSON.parse(args.unsortedArrayString).map(
        (val: string) => +val
      );
      if (convertedArray.filter((val) => isNaN(val)).length > 0) {
        throw new Error("Non-numeric value in array");
      }
      return <InsertionSort unsortedArray={convertedArray} />;
    } catch {
      return <pre>Please input a valid, numeric array</pre>;
    }
  },
};

export const DFSCQLogDiagram: Story = {
  render: () => {
    return <DFSCQLogFigure />;
  },
};

export const PythonTutorDiagram: Story = {
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
export const BrownieDiagram: Story = {
  render: () => {
    return <Brownies />;
  },
};

export const PulleyDiagram: Story = {
  render: () => {
    return <Pulley />;
  },
};

export const QuantumCircuitDiagram: Story = {
  render: () => {
    return <QCText />;
  },
};

export const ThreePointSetTopologiesDiagram: Story = {
  render: () => {
    return <Topology />;
  },
};

export const OhmParserDiagram: Story = {
  args: {
    expression: "3 + 4 * 5",
  },
  render: (args) => {
    return (
        <OhmParser expression={args.expression} />
    );
  },
};
