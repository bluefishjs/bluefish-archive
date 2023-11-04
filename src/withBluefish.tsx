import {
  Accessor,
  Component,
  JSX,
  createContext,
  createMemo,
  createUniqueId,
  mergeProps,
  useContext,
} from "solid-js";
import { Id } from "./scenegraph";
import { ParentScopeIdContext, ScopeContext } from "./createName";

export type WithBluefishProps<T = object> = T & {
  name: Id;
};

export const IdContext = createContext<Accessor<Id | undefined>>(
  () => undefined
);

export function withBluefish<ComponentProps>(
  WrappedComponent: Component<WithBluefishProps<ComponentProps>>
) {
  return function (props: Omit<ComponentProps, "name"> & { name?: Id }) {
    // scenegraph id
    const contextId = useContext(IdContext);
    const genId = createUniqueId();
    const genScopeId = createUniqueId();
    // const id = () => props.name ?? contextId() ?? genId;
    const id = () => contextId() ?? genId;
    const scopeId = () => props.name ?? genScopeId;

    // component scope id
    const [scope, setScope] = useContext(ScopeContext);

    // TODO: might have to initialize the scope in the store if the scope id was auto-generated

    if (scope[scopeId()] === undefined) {
      setScope(scopeId(), {
        parent: contextId(),
        layoutNode: undefined,
        children: {},
      });
    }
    setScope(scopeId(), "layoutNode", id());

    return (
      <ParentScopeIdContext.Provider value={scopeId}>
        <IdContext.Provider value={id}>
          <WrappedComponent
            {...(props as WithBluefishProps<ComponentProps>)}
            name={id()}
          />
        </IdContext.Provider>
      </ParentScopeIdContext.Provider>
    );
  };
}

export default withBluefish;
