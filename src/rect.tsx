import { Layout } from "./layout";
import { BBox, Transform } from "./scenegraph";

export type RectProps = {
  id: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  fill: string;
};

export function Rect(props: RectProps) {
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

  const paint = ({ bbox, transform }: { bbox: BBox; transform: Transform }) => {
    console.log("paint rect", props.id, bbox, transform);
    return (
      <rect
        x={(bbox.left ?? 0) + (transform.translate.x ?? 0)}
        y={(bbox.top ?? 0) + (transform.translate.y ?? 0)}
        width={bbox.width}
        height={bbox.height}
        fill={props.fill}
      />
    );
  };

  return <Layout id={props.id} layout={layout} paint={paint} />;
}

export default Rect;
