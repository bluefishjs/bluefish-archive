import { ParentProps } from "solid-js";
import { Id, withBluefish } from "../../src";
import Background from "../../src/background";

export type SpaceProps = ParentProps<{
  id: Id;
}>;

export const Space = withBluefish((props: SpaceProps) => {
  return (
    <Background id={props.id} padding={50}>
      {props.children}
    </Background>
  );
});
