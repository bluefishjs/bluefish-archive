import { ParentProps } from "solid-js";
import { Id, withBluefish } from "../../src";
import Background from "../../src/background";

export type NeighborhoodProps = ParentProps<{
  id: Id;
}>;

export const Neighborhood = withBluefish((props: NeighborhoodProps) => {
  return (
    <Background id={props.id} padding={20}>
      {props.children}
    </Background>
  );
});
