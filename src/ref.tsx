import { Component, createEffect, useContext } from "solid-js";
import { Id, UNSAFE_useScenegraph, ParentIDContext } from "./scenegraph";
import withBluefish from "./withBluefish";
import { ScopeContext } from "./createName";

// The properties we want:
// every time the refId's bbox is updated, it should be propagated to the id
//   (passing through worldTransforms)
// every time the id's bbox is updated, it should be propagated to the refId
//   (passing through worldTransforms)
// I guess owners are the same for both?

// TODO: actually the Ref's bbox should be completely derived from the refId's bbox that way we
// avoid cycles. whenever the Ref's bbox is requested, we'll compute it. whenever the Ref's bbox is
// "modified," we'll instead modify the refId's bbox.

export type RefProps = {
  name: Id;
  select: Id;
};

export const Ref = withBluefish((props: RefProps) => {
  const { name, select } = props;

  const parentId = useContext(ParentIDContext);
  const [scope] = useContext(ScopeContext);
  const { createRef, getBBox } = UNSAFE_useScenegraph();

  if (parentId === null) {
    throw new Error("Ref must be a child of a Layout");
  }

  // TODO: what do we do if the layout node isn't defined?
  createRef(name, scope[select].layoutNode!, parentId);

  // touch the refId's bbox to ensure ref is resolved immediately
  // createEffect(() => {
  //   console.log("ref", props.id, props.refId);
  //   getBBox(id);
  //   console.log("ref", props.id, JSON.parse(JSON.stringify(getBBox(id))));
  // });

  return <></>;
});

export default Ref;
