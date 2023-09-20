import { createEffect } from "solid-js";
import { TextProps } from "./types";
import useText from "./useText";

function computeBoundingBox(props: TextProps): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const { wordsByLines, startDy, transform } = useText(props);

  // Compute width. This depends on the props.width, actual text width, and the scaleToFit prop.
  let width = () => {
    let width = props.width || 0;
    if (wordsByLines().length > 0) {
      const maxWidthLine = Math.max(
        ...wordsByLines().map((line) => line.width || 0)
      );
      if (props.scaleToFit) {
        width = Math.min(maxWidthLine, props.width || maxWidthLine);
      } else {
        width = maxWidthLine;
      }
    }

    // Adjust x and y for any transformations.
    // Note: This implementation only considers scaling transformations.
    // If other transformations are added (like skewing), this needs to be updated.
    if (transform()) {
      const scaleMatch = () =>
        /matrix\(([^,]+),[^,]+,[^,]+,[^,]+,[^,]+,[^,]+\)/.exec(transform());
      if (scaleMatch()) {
        const scale = () => parseFloat(scaleMatch()![1]);
        width *= scale();
        // If height needs to be scaled similarly, add height *= scale;
      }
    }

    return width;
  };

  // height is the sum of each line's height, plus the space between each line.
  const height = () =>
    wordsByLines().reduce(
      (height, line, index) => height + (line.height || 0),
      0
    );

  let x = () => (props.dx !== undefined ? parseFloat(`${props.dx}`) : 0);
  let y = () => {
    let y = props.dy !== undefined ? parseFloat(`${props.dy}`) : 0;
    // Adjust x and y based on vertical-anchor prop.
    switch (props["vertical-anchor"]) {
      case "start":
        y += parseFloat(startDy());
        break;
      case "middle":
        y += height() / 2;
        break;
      case "end":
        y -= height();
        break;
      default:
        break;
    }
    return y;
  };

  return {
    get x() {
      return x();
    },
    get y() {
      return y();
    },
    get width() {
      return width();
    },
    get height() {
      return height();
    },
  };
}

export default computeBoundingBox;
