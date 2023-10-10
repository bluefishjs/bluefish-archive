import { ParentProps } from "solid-js";
import { Id, withBluefish } from "../../src";
import Background from "../../src/background";

export type ImageProps = ParentProps<{
  id: Id;
}>;

export const Image = withBluefish((props: ImageProps) => {
  return (
    <Background id={props.id} padding={20}>
      {props.children}
    </Background>
  );
});
