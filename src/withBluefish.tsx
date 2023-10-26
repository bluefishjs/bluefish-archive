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
  id: Id;
};

export const IdContext = createContext<Accessor<Id | undefined>>(
  () => undefined
);

export function withBluefish<ComponentProps>(
  WrappedComponent: Component<WithBluefishProps<ComponentProps>>
) {
  return function (props: Omit<ComponentProps, "id"> & { id?: Id }) {
    const contextId = useContext(IdContext);
    const genId = createUniqueId();
    const id = () => props.id ?? contextId() ?? genId;

    return (
      <IdContext.Provider value={id}>
        <WrappedComponent
          {...(props as WithBluefishProps<ComponentProps>)}
          id={id()}
        />
      </IdContext.Provider>
    );
  };
}

export default withBluefish;
