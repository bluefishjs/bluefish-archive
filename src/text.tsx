import _ from "lodash";
import { measureText } from "./measure-text";
import { JSX } from "solid-js/jsx-runtime";
import Layout from "./layout";
import { BBox, Id, Transform } from "./scenegraph";
import { mergeProps, splitProps } from "solid-js";

// TODO: allow text within the text element instead of on contents arg

export type TextProps = JSX.TextSVGAttributes<SVGTextElement> & {
  id: Id;
  contents: string;
} & Partial<{
    x: number;
    y: number;
  }>;

export function Text(props: TextProps) {
  const [_, rest] = splitProps(props, ["contents", "id"]);

  const mergedFont = mergeProps(
    {
      "font-style": "normal",
      "font-family": "sans-serif",
      "font-size": "12px",
      "font-weight": "normal",
    },
    props
  );

  const measurements = () =>
    measureText(
      props.contents,
      `${mergedFont["font-style"] ?? ""} ${mergedFont["font-weight"] ?? ""} ${
        mergedFont["font-size"] ?? ""
      } ${mergedFont["font-family"] ?? ""}`
    );

  const layout = (childIds: Id[]) => {
    childIds = Array.from(childIds);

    return {
      bbox: {
        left: measurements().left,
        // left: 0,
        // right: measurements.right,
        width: measurements().right - measurements().left,
        top: measurements().fontTop,
        // top: 0,
        height: measurements().fontHeight,
        // bottom: measurements.fontDescent,
      },
      transform: {
        translate: {
          // x: props.x,
          // y: props.y,
        },
      },
    };
  };

  const paint = (paintProps: { bbox: BBox; transform: Transform }) => {
    return (
      <text
        {...rest}
        // TODO: I'm not sure why this is necessary to get the text be positioned correctly...
        alignment-baseline="hanging"
        x={
          (paintProps.bbox.left ?? 0) +
          (paintProps.transform.translate.x ?? 0) /* +
            measurements().left */
        }
        y={
          (paintProps.bbox.top ?? 0) +
          (paintProps.transform.translate.y ?? 0) /* +
            measurements().fontTop */
        }
      >
        {props.contents}
      </text>
    );
  };

  return <Layout id={props.id} layout={layout} paint={paint} />;
}

export default Text;
