import _ from "lodash";
import Layout from "./layout";
import { BBox, Id, Transform, useScenegraph } from "./scenegraph";
import { JSX } from "solid-js/jsx-runtime";
import { ParentProps } from "solid-js";
import { maybeMax } from "./maybeUtil";

// export type DistributeProps = SpaceVerticalProps | SpaceHorizontalProps;
export type DistributeProps = ParentProps<{
  id: Id;
  direction: "vertical" | "horizontal";
  total?: number;
  spacing?: number;
}>;

export const Distribute = (props: DistributeProps) => {
  const { getBBox, setBBox, ownedByOther } = useScenegraph();

  const layout = (childIds: Id[]) => {
    // debugger;
    childIds = Array.from(childIds);

    if (props.direction === "vertical") {
      let height: number;
      let spacing: number;

      if (props.spacing !== undefined && props.total !== undefined) {
        spacing = props.spacing;
        height = props.total;
        // assign additional space to items that don't have an extent
        // filter to only items whose heights are owned by other
        let unassignedHeight = height;
        for (const childId of childIds) {
          if (!ownedByOther(props.id, childId, "height")) {
            continue;
          }

          unassignedHeight -= getBBox(childId).height!;
        }

        const unassignedChildren = childIds.filter(
          (childId) => !ownedByOther(props.id, childId, "height")
        );

        const unassignedSpacing = unassignedHeight / unassignedChildren.length;

        for (const childId of unassignedChildren) {
          setBBox(props.id, childId, { height: unassignedSpacing });
        }
      } else if (props.spacing !== undefined) {
        spacing = props.spacing;
        // we expect all heights to be owned by other
        for (const childId of childIds) {
          if (!ownedByOther(props.id, childId, "height")) {
            // TODO: make this error message better
            throw new Error("invalid options");
          }
        }

        height =
          _.sumBy(childIds, (childId) => getBBox(childId).height!) +
          spacing * (childIds.length - 1);
      } else if (props.total !== undefined) {
        height = props.total;
        // we expect all heights to be owned by other
        for (const childId of childIds) {
          if (!ownedByOther(props.id, childId, "height")) {
            // TODO: make this error message better
            throw new Error("invalid options");
          }
        }

        const occupiedHeight = _.sumBy(
          childIds,
          (childId) => getBBox(childId).height!
        );

        spacing = (props.total - occupiedHeight) / (childIds.length - 1);
      } else {
        // TODO: make this error message better
        throw new Error("invalid options");
      }

      const fixedElement = childIds.findIndex((childId) =>
        ownedByOther(props.id, childId, "y")
      );

      // use spacing and height to evenly distribute elements while ensuring that the fixed element
      // is fixed
      const startingY =
        fixedElement === -1
          ? 0
          : getBBox(childIds[fixedElement]).top! -
            spacing * fixedElement -
            _.sumBy(
              childIds.slice(0, fixedElement),
              (childId) => getBBox(childId).height!
            );

      // subtract off spacing and the sizes of the first fixedElement elements
      let y = startingY;
      for (const childId of childIds) {
        if (!ownedByOther(props.id, childId, "y")) {
          setBBox(props.id, childId, { top: y });
        }
        y += getBBox(childId).height! + spacing;
      }

      // TODO: is the width computation correct? should it take position into account?
      return {
        bbox: {
          top: startingY,
          width: maybeMax(childIds.map((childId) => getBBox(childId).width)),
          height,
        },
        transform: {
          translate: {},
        },
      };
    } else if (props.direction === "horizontal") {
      let width: number;
      let spacing: number;

      if (props.spacing !== undefined && props.total !== undefined) {
        spacing = props.spacing;
        width = props.total;
        // assign additional space to items that don't have an extent
        // filter to only items whose widths are owned by other
        let unassignedWidth = width;
        for (const childId of childIds) {
          if (!ownedByOther(props.id, childId, "width")) {
            continue;
          }

          unassignedWidth -= getBBox(childId).width!;
        }

        const unassignedChildren = childIds.filter(
          (childId) => !ownedByOther(props.id, childId, "width")
        );

        const unassignedSpacing = unassignedWidth / unassignedChildren.length;

        for (const childId of unassignedChildren) {
          setBBox(props.id, childId, { width: unassignedSpacing });
        }
      } else if (props.spacing !== undefined) {
        spacing = props.spacing;
        // we expect all widths to be owned by other
        for (const childId of childIds) {
          if (!ownedByOther(props.id, childId, "width")) {
            // TODO: make this error message better
            throw new Error("invalid options");
          }
        }

        width =
          _.sumBy(childIds, (childId) => getBBox(childId).width!) +
          spacing * (childIds.length - 1);
      } else if (props.total !== undefined) {
        width = props.total;
        // we expect all widths to be owned by other
        for (const childId of childIds) {
          if (!ownedByOther(props.id, childId, "width")) {
            // TODO: make this error message better
            throw new Error("invalid options");
          }
        }

        const occupiedWidth = _.sumBy(
          childIds,
          (childId) => getBBox(childId).width!
        );

        spacing = (props.total - occupiedWidth) / (childIds.length - 1);
      } else {
        throw new Error("Invalid options for space");
      }

      const fixedElement = childIds.findIndex((childId) =>
        ownedByOther(props.id, childId, "x")
      );

      // use spacing and width to evenly distribute elements while ensuring that the fixed element
      // is fixed
      const startingX =
        fixedElement === -1
          ? 0
          : getBBox(childIds[fixedElement]).left! -
            spacing * fixedElement -
            _.sumBy(
              childIds.slice(0, fixedElement),
              (childId) => getBBox(childId).width!
            );

      // subtract off spacing and the sizes of the first fixedElement elements
      let x = startingX;
      for (const childId of childIds) {
        if (!ownedByOther(props.id, childId, "x")) {
          setBBox(props.id, childId, { left: x });
        }
        x += getBBox(childId).width! + spacing;
      }

      // TODO: is the height computation correct? should it take position into account?
      return {
        bbox: {
          left: startingX,
          height: maybeMax(childIds.map((childId) => getBBox(childId).height)),
          width,
        },
        transform: {
          translate: {},
        },
      };
    } else {
      throw new Error("Invalid direction");
    }
  };

  const paint = (paintProps: {
    bbox: BBox;
    transform: Transform;
    children: JSX.Element;
  }) => {
    return (
      <g
        transform={`translate(${paintProps.transform.translate.x ?? 0}, ${
          paintProps.transform.translate.y ?? 0
        })`}
      >
        {paintProps.children}
      </g>
    );
  };

  return (
    <Layout id={props.id} layout={layout} paint={paint}>
      {props.children}
    </Layout>
  );
};
Distribute.displayName = "Distribute";

export default Distribute;
