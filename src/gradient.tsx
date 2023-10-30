import withBluefish from "./withBluefish";

type ColorOffset = { offset: number; color: string };

type GradientProps = {
  name: string;
  colorOffsets: ColorOffset[];
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
};

export const Gradient = withBluefish((props: GradientProps) => {
  return (
    <g>
      <linearGradient
        id={props.name}
        x1={props.x1}
        x2={props.x2}
        y1={props.y1}
        y2={props.y2}
      >
        {props.colorOffsets.map((colorOffset) => (
          <stop
            offset={`${colorOffset.offset}%`}
            stop-color={colorOffset.color}
          />
        ))}
      </linearGradient>
    </g>
  );
});

export default Gradient;
