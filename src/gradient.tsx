import { For } from "solid-js";
import withBluefish from "./withBluefish";

type ColorOffset = { offset: number; color: string };

type GradientProps = {
  id: string;
  colorOffsets: ColorOffset[];
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
};

export const Gradient = (props: GradientProps) => {
  return (
    <g>
      <linearGradient
        id={props.id}
        x1={props.x1}
        x2={props.x2}
        y1={props.y1}
        y2={props.y2}
      >
        <For each={props.colorOffsets}>
          {(colorOffset) => (
            <stop
              offset={`${colorOffset.offset}%`}
              stop-color={colorOffset.color}
            />
          )}
        </For>
      </linearGradient>
    </g>
  );
};

export default Gradient;
