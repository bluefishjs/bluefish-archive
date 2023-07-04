import Group from "../group";
import Text from "../text";
import { Id } from "../scenegraph";
import Distribute from "../distribute";
import Ref from "../ref";
import Align from "../align";
import { For, createUniqueId } from "solid-js";
import ElmTuple from "./elm-tuple";
import withBluefish from "../withBluefish";

export type ObjectProps = {
  id: Id;
  objectType: string;
  objectValues: {
    type: string;
    value: string;
  }[];
};

export const HeapObject = withBluefish((props: ObjectProps) => {
  const id = () => props.id;

  const fontFamily = "verdana, arial, helvetica, sans-serif";

  const objectRef = `objectRef${id()}`;

  return (
    <Group id={id()}>
      <Text
        id={`objectTypeRef${id()}`}
        contents={props.objectType}
        font-family={fontFamily}
        font-size={"16px"}
        fill={"grey"}
      />
      <Group id={objectRef}>
        <For each={props.objectValues}>
          {(elementData, index) => (
            <ElmTuple
              id={`elm_${index()}_${id()}`}
              tupleIndex={`${index()}`}
              tupleData={elementData}
              objectId={id()}
            />
          )}
        </For>
        <Align alignment="centerY">
          <For each={props.objectValues}>
            {(elementData, index) => <Ref refId={`elm_${index()}_${id()}`} />}
          </For>
        </Align>
        <Distribute direction="horizontal" spacing={0}>
          <For each={props.objectValues}>
            {(elementData, index) => <Ref refId={`elm_${index()}_${id()}`} />}
          </For>
        </Distribute>
      </Group>
      <Distribute direction={"vertical"} spacing={10}>
        <Ref refId={`objectTypeRef${id()}`} />
        <Ref refId={objectRef} />
      </Distribute>
      <Align alignment={"left"}>
        <Ref refId={`objectTypeRef${id()}`} />
        <Ref refId={objectRef} />
      </Align>
    </Group>
  );
});

export default HeapObject;
