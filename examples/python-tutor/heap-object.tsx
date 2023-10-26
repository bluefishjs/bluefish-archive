import Group from "../../src/group";
import Text from "../../src/text";
import { Id } from "../../src/scenegraph";
import Distribute from "../../src/distribute";
import Ref from "../../src/ref";
import Align from "../../src/align";
import { For, createUniqueId } from "solid-js";
import ElmTuple from "./elm-tuple";
import withBluefish from "../../src/withBluefish";

export type ObjectProps = {
  name: Id;
  objectType: string;
  objectValues: {
    type: string;
    value: string;
  }[];
};

export const HeapObject = withBluefish((props: ObjectProps) => {
  const id = () => props.name;

  const fontFamily = "verdana, arial, helvetica, sans-serif";

  const objectRef = `objectRef${id()}`;

  return (
    <Group name={id()}>
      <Text
        name={`objectTypeRef${id()}`}
        contents={props.objectType}
        font-family={fontFamily}
        font-size={"16px"}
        fill={"grey"}
      />
      <Group name={objectRef}>
        <For each={props.objectValues}>
          {(elementData, index) => (
            <ElmTuple
              name={`elm_${index()}_${id()}`}
              tupleIndex={`${index()}`}
              tupleData={elementData}
              objectId={id()}
            />
          )}
        </For>
        <Align alignment="centerY">
          <For each={props.objectValues}>
            {(elementData, index) => <Ref select={`elm_${index()}_${id()}`} />}
          </For>
        </Align>
        <Distribute direction="horizontal" spacing={0}>
          <For each={props.objectValues}>
            {(elementData, index) => <Ref select={`elm_${index()}_${id()}`} />}
          </For>
        </Distribute>
      </Group>
      <Distribute direction={"vertical"} spacing={10}>
        <Ref select={`objectTypeRef${id()}`} />
        <Ref select={objectRef} />
      </Distribute>
      <Align alignment={"left"}>
        <Ref select={`objectTypeRef${id()}`} />
        <Ref select={objectRef} />
      </Align>
    </Group>
  );
});

export default HeapObject;
