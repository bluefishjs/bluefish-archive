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
    const id = () => props.name ?? contextId() ?? genId;

    // component scope id
    const [scope, setScope] = useContext(ScopeContext);
    const scopeId = createMemo(() => {
      if (props.name !== undefined) {
        return props.name;
      }

      // TODO: check if already defined?

      setScope(genId, {});
      return genId;
    });

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
