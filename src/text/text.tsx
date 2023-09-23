import { For, Ref, mergeProps, splitProps } from "solid-js";
import { TextProps } from "./types";
import useText from "./useText";
import { BBox, Transform } from "../scenegraph";
import Layout from "../layout";
import computeBoundingBox from "./textBBox";

const SVG_STYLE = { overflow: "visible" };

export default function Text(props: TextProps) {
  props = mergeProps(
    {
      // dx: 0,
      // dy: 0,
      "text-anchor": "start",
      "vertical-anchor": "end",
      "line-height": "1em",
      "cap-height": "0.71em", // Magic number from d3
      "font-family": "Alegreya Sans, sans-serif",
      "font-weight": 700,
      "font-size": "14",
      x: 0,
      y: 0,
    } as const,
    props
  );

  const [_, textProps] = splitProps(props, [
    "id",
    "dx",
    "dy",
    "innerRef",
    "innerTextRef",
    "vertical-anchor",
    "angle",
    "line-height",
    "scaleToFit",
    "cap-height",
    "width",
  ]);

  const { wordsByLines, startDy, transform } = useText(props);

  const layout = () => {
    const bbox = computeBoundingBox(
      mergeProps(props, {
        get wordsByLines() {
          return wordsByLines();
        },
        get startDy() {
          return startDy();
        },
        get transform() {
          return transform();
        },
      })
    );

    return {
      bbox: {
        left: bbox.x,
        top: bbox.y,
        width: bbox.width,
        height: bbox.height,
      },
      transform: {
        translate: {
          x: props.dx !== undefined ? parseFloat(`${props.dx}`) : undefined,
          y: props.dy !== undefined ? parseFloat(`${props.dy}`) : undefined,
        },
      },
    };
  };

  const paint = (paintProps: { bbox: BBox; transform: Transform }) => {
    return (
      <g
        ref={props.innerRef}
        transform={`translate(${paintProps.transform.translate.x}, ${paintProps.transform.translate.y})`}
        style={SVG_STYLE}
      >
        {wordsByLines().length > 0 ? (
          <text ref={props.innerTextRef} transform={transform()} {...textProps}>
            <For each={wordsByLines()}>
              {(line, index) => (
                <tspan
                  x={props.x}
                  dy={index() === 0 ? startDy() : props["line-height"]}
                  cap-height={props["cap-height"]}
                >
                  {line.words.join(" ")}
                </tspan>
              )}
            </For>
          </text>
        ) : null}
      </g>
    );
  };

  return <Layout id={props.id} layout={layout} paint={paint} />;
}
