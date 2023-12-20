import {
  Component,
  createEffect,
  createRenderEffect,
  onCleanup,
  useContext,
} from "solid-js";
import { Id, UNSAFE_useScenegraph, ParentIDContext } from "./scenegraph";
import withBluefish from "./withBluefish";
import { Name, Scope, ScopeContext } from "./createName";

// The properties we want:
// every time the refId's bbox is updated, it should be propagated to the id
//   (passing through worldTransforms)
// every time the id's bbox is updated, it should be propagated to the refId
//   (passing through worldTransforms)
// I guess owners are the same for both?

// TODO: actually the Ref's bbox should be completely derived from the refId's bbox that way we
// avoid cycles. whenever the Ref's bbox is requested, we'll compute it. whenever the Ref's bbox is
// "modified," we'll instead modify the refId's bbox.

export type Selection = Id | [Id, ...Name[]];
export type NormalizedSelection = [Id, ...Name[]];

export type RefProps = {
  name: Id;
  select: Selection;
};

export const normalizeSelection = (select: Selection): NormalizedSelection => {
  if (Array.isArray(select)) {
    return select;
  } else {
    return [select];
  }
};

// TODO: probably scopeIds and layoutIds should have different types...
export const resolveSelection = (
  scope: Scope,
  select: NormalizedSelection
): Id => {
  const [id, ...names] = select;

  let currId = id;

  if (!(id in scope)) {
    throw new Error(
      `Could not find ${id}. Available names: ${Object.keys(scope).join(", ")}`
    );
  }

  for (const name of names) {
    const child = scope[currId].children[name];
    if (child === undefined) {
      console.log(JSON.parse(JSON.stringify(scope)));
      throw new Error(
        `Could not find ${name} in ${currId}. Available names: ${Object.keys(
          scope[currId].children
        ).join(", ")}`
      );
    }
    currId = child;
  }

  const layoutId = scope[currId].layoutNode;

  if (layoutId === undefined) {
    console.log(JSON.parse(JSON.stringify(scope)));
    throw new Error(
      `Could not find layout node for ${currId}. Available names: ${Object.keys(
        scope[currId].children
      ).join(", ")}`
    );
  }

  return layoutId;
};

export const Ref = withBluefish((props: RefProps) => {
  const parentId = useContext(ParentIDContext);
  const [scope] = useContext(ScopeContext);
  const { createRef, deleteRef } = UNSAFE_useScenegraph();

  if (parentId === null) {
    throw new Error("Ref must be a child of a Layout");
  }

  // TODO: what do we do if the layout node isn't defined?
  createRenderEffect(() => {
    const normalizedSelection = normalizeSelection(props.select);

    createRef(
      props.name,
      resolveSelection(scope, normalizedSelection),
      parentId
    );

    onCleanup(() => {
      deleteRef(props.name);
    });
  });

  return <></>;
});

export default Ref;
