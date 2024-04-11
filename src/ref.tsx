import {
  Component,
  createEffect,
  createRenderEffect,
  onCleanup,
  untrack,
  useContext,
} from "solid-js";
import {
  Id,
  UNSAFE_useScenegraph,
  ParentIDContext,
  ScenegraphTokenizer,
} from "./scenegraph";
import withBluefish from "./withBluefish";
import { Name, Scope, ScopeContext } from "./createName";
import { useError } from "./errorContext";
import { createToken } from "@solid-primitives/jsx-tokenizer";
import { produce } from "solid-js/store";

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

export const Ref = withBluefish(
  createToken(ScenegraphTokenizer, (props: RefProps) => {
    const error = useError();
    // const parentId = useContext(ParentIDContext);
    const [scope, setScope] = useContext(ScopeContext);
    const { createRef, deleteRef, scenegraph } = UNSAFE_useScenegraph();

    // if (parentId === null) {
    //   throw new Error("Ref must be a child of a Layout");
    // }

    const normalizedSelection = () => normalizeSelection(props.select);

    // TODO: what do we do if the layout node isn't defined?
    // createRenderEffect(() => {
    //   onCleanup(() => {
    //     deleteRef(error, props.name, setScope);
    //   });
    // });

    onCleanup(() => {
      // filter out scopes that have this id as their layoutNode
      setScope(
        produce((scope) => {
          for (const key of Object.keys(scope) as Array<Id>) {
            if (scope[key].layoutNode === props.name) {
              delete scope[key];
            }
          }
        })
      );
    });

    // return <></>;
    return {
      jsx: <></>,
      layout: (parentId: Id | null) => {
        if (parentId === null) {
          throw new Error("Ref must be a child of a Layout");
        }

        createRef(
          props.name,
          resolveSelection(scope, normalizedSelection()),
          parentId
        );
      },
    };
  }),
  { displayName: "Ref" }
);

export default Ref;
