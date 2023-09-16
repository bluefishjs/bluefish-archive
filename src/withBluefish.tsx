import { Component, JSX, createUniqueId, mergeProps } from "solid-js";
import { Id } from "./scenegraph";

export type WithBluefishProps<T = {}> = T & {
  id: Id;
};

export function withBluefish<ComponentProps>(
  WrappedComponent: Component<WithBluefishProps<ComponentProps>>
) {
  return function (props: Omit<ComponentProps, "id"> & { id?: Id }) {
    const id = createUniqueId();
    const mergedProps = mergeProps(
      { id },
      props
    ) as WithBluefishProps<ComponentProps>;

    return <WrappedComponent {...mergedProps} />;
  };
}

export default withBluefish;
