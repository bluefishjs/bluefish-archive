import { JSX } from "solid-js/jsx-runtime";
import paper from "paper";
import withBluefish from "./withBluefish";
import Layout from "./layout";
import { BBox, Id, Transform } from "./scenegraph";
import { splitProps } from "solid-js";

export type BlobProps = {
  id: Id;
  path: InstanceType<typeof paper.Path>;
} & Omit<JSX.PathSVGAttributes<SVGPathElement>, "d">;

export const Blob = withBluefish((props: BlobProps) => {
  const [_, pathOptions] = splitProps(props, ["id", "path"]);

  const blobPath = () => {
    let blobPath = props.path.clone();
    blobPath.closed = true;
    // apply smoothing twice to make the curves a bit less sharp
    blobPath.smooth({ type: "continuous" });
    blobPath.flatten(4);
    blobPath.smooth({ type: "continuous" });
    return blobPath;
  };

  const layout = () => {
    const bounds = blobPath().strokeBounds;
    return {
      bbox: {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      },
      transform: {
        translate: {},
      },
    };
  };

  const paint = (paintProps: { bbox: BBox; transform: Transform }) => {
    const path = () =>
      (blobPath().exportSVG() as SVGElement).getAttribute("d") ?? "";

    return (
      <g
        transform={`translate(${paintProps.transform.translate.x}, ${paintProps.transform.translate.y})`}
      >
        <path {...pathOptions} d={path()} />
      </g>
    );
  };

  return <Layout id={props.id} layout={layout} paint={paint}></Layout>;
});
