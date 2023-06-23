import { LayoutV2 } from "./layoutv2";
import { BBox, Transform } from "./scenegraphv2";

export type RectProps = {
  id: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  fill: string;
};

export function RectV2(props: RectProps) {
  const layout = () => {
    return {
      bbox: {
        left: 0,
        top: 0,
        width: props.width,
        height: props.height,
      },
      transform: {
        translate: {
          x: props.x,
          y: props.y,
        },
      },
    };
  };

  const paint = (paintProps: { bbox: BBox; transform: Transform }) => {
    return (
      <rect
        x={
          (paintProps.bbox.left ?? 0) + (paintProps.transform.translate.x ?? 0)
        }
        y={(paintProps.bbox.top ?? 0) + (paintProps.transform.translate.y ?? 0)}
        width={paintProps.bbox.width}
        height={paintProps.bbox.height}
        fill={props.fill}
      />
    );
  };

  return <LayoutV2 id={props.id} layout={layout} paint={paint} />;
}

export default RectV2;
