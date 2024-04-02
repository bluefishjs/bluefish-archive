import { ParentProps } from "solid-js";
import { Id } from "../scenegraph";
import withBluefish from "../withBluefish";
import LayoutFunction from "./layoutfunction";

export const SetHorizontalLayout = withBluefish(
  (props: ParentProps<{ name?: Id }>) => (
    <LayoutFunction f={({ left, width, right }) => ({ left, width, right })}>
      {props.children}
    </LayoutFunction>
  )
);
export const SetVerticalLayout = withBluefish(
  (props: ParentProps<{ name?: Id }>) => (
    <LayoutFunction f={({ top, height, bottom }) => ({ top, height, bottom })}>
      {props.children}
    </LayoutFunction>
  )
);
