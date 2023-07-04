import Align from "../align";
import Distribute from "../distribute";
import Group from "../group";
import Ref from "../ref";
import { Id } from "../scenegraph";
import withBluefish from "../withBluefish";
import GlobalFrame from "./global-frame";
import Heap from "./heap";
import { Address, HeapObject, StackSlot } from "./types";

export type PythonTutorProps = {
  id: Id;
  stack: StackSlot[];
  heap: HeapObject[];
  heapArrangement: (Address | null)[][];
};

export const PythonTutor = withBluefish((props: PythonTutorProps) => {
  return (
    <Group id={props.id}>
      <GlobalFrame id={`globalFrame~${props.id}`} variables={props.stack} />
      <Heap
        id={`heap~${props.id}`}
        heap={props.heap}
        heapArrangement={props.heapArrangement}
      />
      <Distribute direction="horizontal" spacing={60}>
        <Ref refId={`globalFrame~${props.id}`} />
        <Ref refId={`heap~${props.id}`} />
      </Distribute>
      <Align alignment="top">
        <Ref refId={`globalFrame~${props.id}`} />
        <Ref refId={`heap~${props.id}`} />
      </Align>
    </Group>
  );
});

export default PythonTutor;
