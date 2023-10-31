import {
  Accessor,
  Component,
  JSX,
  createContext,
  createUniqueId,
  mergeProps,
  useContext,
} from "solid-js";
import { Id } from "./scenegraph";

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
    const contextId = useContext(IdContext);
    const genId = createUniqueId();
    const id = () => props.name ?? contextId() ?? genId;

    return (
      <IdContext.Provider value={id}>
        <WrappedComponent
          {...(props as WithBluefishProps<ComponentProps>)}
          name={id()}
        />
      </IdContext.Provider>
    );
  };
}

export default withBluefish;
