import { Component, JSX, createUniqueId, mergeProps } from "solid-js";
import { Id } from "./scenegraph";

export function withBluefish<ComponentProps extends { id: Id }>(
  WrappedComponent: Component<ComponentProps>
) {
  return function (props: Omit<ComponentProps, "id"> & { id?: Id }) {
    const id = createUniqueId();
    const mergedProps = mergeProps({ id }, props) as ComponentProps & {
      id: Id;
    };

    return <WrappedComponent {...mergedProps} />;
  };
}

export default withBluefish;
