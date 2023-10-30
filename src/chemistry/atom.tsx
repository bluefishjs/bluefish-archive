import { JSX } from "solid-js/jsx-runtime";
import { Layout } from "../layout";
import { BBox, Id, Transform } from "../scenegraph";
import { splitProps } from "solid-js";
import withBluefish from "../withBluefish";

type maxBondTypes = {
  [key: string]: number;
};

const maxBonds: maxBondTypes = {
  H: 1,
  C: 4,
  N: 3,
  O: 2,
  P: 3,
  S: 2,
  B: 3,
  F: 1,
  I: 1,
  Cl: 1,
  Br: 1,
};

type elementNameTypes = {
  [key: string]: string;
};

const elementName: elementNameTypes = {
  H: "Hydrogen",
  C: "Carbon",
  N: "Nitrogen",
  O: "Oxygen",
  P: "Phosphorus",
  S: "Sulfur",
  B: "Boron",
  F: "Flourine",
  I: "Iodine",
  Cl: "Chlorine",
  Br: "Bromine",
};

export type AtomProps = JSX.CircleSVGAttributes<SVGCircleElement> & {
  content: string;
  id: Id;
  isTerminal: boolean;
  bondCount: number;
  ariaHidden: boolean;
  r: number;
  cx?: number;
  cy?: number;
};

export const Atom = withBluefish((props: AtomProps) => {
  const numHydrogens = maxBonds[props.content] - props.bondCount;
  const hydrogenString = "H".repeat(numHydrogens);
  const atomContent =
    props.content === "C" ? "" : props.content + hydrogenString;
  const layout = () => {
    return {
      bbox: {
        left: -props.r,
        top: -props.r,
        width: props.r * 2,
        height: props.r * 2,
      },
      transform: {
        translate: {
          x: props.cx,
          y: props.cy,
        },
      },
    };
  };

  const paint = (paintProps: { bbox: BBox; transform: Transform }) => {
    const [_, rest] = splitProps(props, ["id", "cx", "cy", "r"]);

    const r = () => (paintProps.bbox.width ?? 0) / 2;

    return (
      <>
        <circle
          {...rest}
          cx={
            (paintProps.bbox.left ?? 0) +
            r() +
            (paintProps.transform.translate.x ?? 0)
          }
          cy={
            (paintProps.bbox.top ?? 0) +
            r() +
            (paintProps.transform.translate.y ?? 0)
          }
          r={r()}
          fill={atomContent.length === 0 ? "none" : "white"}
        />
        <text
          x={
            (paintProps.bbox.left ?? 0) +
            r() +
            (paintProps.transform.translate.x ?? 0)
          }
          y={
            (paintProps.bbox.top ?? 0) +
            r() +
            (paintProps.transform.translate.y ?? 0)
          }
          font-size={"24px"}
          text-anchor={"middle"}
          dominant-baseline={"central"}
        >
          {atomContent}
        </text>
      </>
    );
  };

  return <Layout id={props.id} layout={layout} paint={paint} />;
});

export default Atom;
