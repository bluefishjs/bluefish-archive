import Group from "../group";
import Text from "../text";
import { Id } from "../scenegraph";
import Distribute from "../distribute";
import Ref from "../ref";
import Align from "../align";
import { For, createUniqueId } from "solid-js";
import ElmTuple from "./elm-tuple";

export type ObjectProps = {
  id?: Id;
  objectType: string;
  objectValues: {
    type: string;
    value: string;
  }[];
};

// TODO: this doesn't work yet...
export function HeapObject(props: ObjectProps) {
  const uid = createUniqueId();

  const id = () => props.id ?? uid;

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
        <Align id={`align1-${id()}`} alignment="centerY">
          <For each={props.objectValues}>
            {(elementData, index) => (
              <Ref
                id={`ref1-${index()}-${id()}`}
                refId={`elm_${index()}_${id()}`}
              />
            )}
          </For>
        </Align>
        <Distribute
          id={`distribute1-${id()}`}
          direction="horizontal"
          spacing={0}
        >
          <For each={props.objectValues}>
            {(elementData, index) => (
              <Ref
                id={`ref2-${index()}-${id()}`}
                refId={`elm_${index()}_${id()}`}
              />
            )}
          </For>
        </Distribute>
      </Group>
      <Distribute
        id={`distribute2-${id()}`}
        direction={"vertical"}
        spacing={10}
      >
        <Ref id={`ref3-${id()}`} refId={`objectTypeRef${id()}`} />
        <Ref id={`ref4-${id()}`} refId={objectRef} />
      </Distribute>
      <Align id={`align2-${id()}`} alignment={"left"}>
        <Ref id={`ref5-${id()}`} refId={`objectTypeRef${id()}`} />
        <Ref id={`ref6-${id()}`} refId={objectRef} />
      </Align>
    </Group>
  );
}

export default HeapObject;
