import Align from "../../src/align";
import Distribute from "../../src/distribute";
import Group from "../../src/group";
import Ref from "../../src/ref";
import { Id } from "../../src/scenegraph";
import withBluefish, { WithBluefishProps } from "../../src/withBluefish";
import GlobalFrame from "./global-frame";
import Heap from "./heap";
import { Address, HeapObject, StackSlot } from "./types";

export type PythonTutorProps = WithBluefishProps<{
  stack: StackSlot[];
  heap: HeapObject[];
  heapArrangement: (Address | null)[][];
}>;

export const PythonTutor = withBluefish((props: PythonTutorProps) => {
  return (
    <Group name={props.name}>
      <GlobalFrame id={`globalFrame~${props.name}`} variables={props.stack} />
      <Heap
        name={`heap~${props.name}`}
        heap={props.heap}
        heapArrangement={props.heapArrangement}
      />
      <Distribute direction="horizontal" spacing={60}>
        <Ref select={`globalFrame~${props.name}`} />
        <Ref select={`heap~${props.name}`} />
      </Distribute>
      <Align alignment="top">
        <Ref select={`globalFrame~${props.name}`} />
        <Ref select={`heap~${props.name}`} />
      </Align>
    </Group>
  );
});

export default PythonTutor;
