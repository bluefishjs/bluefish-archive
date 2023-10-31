import Layout from "./layout";
import { maxOfMaybes, maybeAdd, maybeSub, minOfMaybes } from "./util/maybe";
import {
  ScenegraphContext,
  ScenegraphNode,
  Transform,
  createScenegraph,
  ParentIDContext,
  Id,
  BBox,
  ChildNode,
} from "./scenegraph";
import { JSX, ParentProps, Show, createUniqueId, mergeProps } from "solid-js";

export type BluefishProps = ParentProps<{
  width?: number;
  height?: number;
  padding?: number;
  id?: string;
  debug?: boolean;
  positioning?: "absolute" | "relative";
}>;

declare global {
  interface Window {
    bluefish?: { [key: string]: { [key: string]: ScenegraphNode } };
  }
}

export function Bluefish(props: BluefishProps) {
  props = mergeProps(
    {
      padding: 10,
      positioning: "relative" as const,
    },
    props
  );

  // const bboxStore = useMemo(() => observable.map(), []);
  // const bboxStore = useMemo(() => createScenegraph(), []);
  // const bboxStore = createScenegraph();
  const scenegraphContext = createScenegraph();
  const { scenegraph, createNode } = scenegraphContext;

  // const autoGenId = useId();
  const autoGenId = createUniqueId();
  const id = props.id ?? autoGenId;
  // const wroteToWindow = useRef(false);

  // useEffect(() => {
  //   if (window.bluefish === undefined) {
  //     window.bluefish = {};
  //   }

  //   if (window.bluefish[id] !== undefined) {
  //     console.error(`Duplicate id ${id}. Not writing to window.bluefish`);
  //   } else {
  //     window.bluefish[id] = scenegraph;
  //     wroteToWindow.current = true;
  //   }

  //   return () => {
  //     if (window.bluefish !== undefined && wroteToWindow.current) {
  //       delete window.bluefish[id];
  //       wroteToWindow.current = false;
  //     }
  //   };
  // });

  if (scenegraph[id] === undefined) {
    createNode(id, null);
  }
  const layout = (childNodes: ChildNode[]) => {
    for (const childNode of childNodes) {
      if (!childNode.owned.x) {
        childNode.bbox.left = 0;
      }

      if (!childNode.owned.y) {
        childNode.bbox.top = 0;
      }
    }

    const bboxes = {
      left: childNodes.map((childNode) => childNode.bbox.left),
      top: childNodes.map((childNode) => childNode.bbox.top),
      width: childNodes.map((childNode) => childNode.bbox.width),
      height: childNodes.map((childNode) => childNode.bbox.height),
    };

    const left = minOfMaybes(bboxes.left) ?? 0;

    const right = maxOfMaybes(
      bboxes.left.map((left, i) => maybeAdd(left, bboxes.width[i]))
    );

    const top = minOfMaybes(bboxes.top) ?? 0;

    const bottom = maxOfMaybes(
      bboxes.top.map((top, i) => maybeAdd(top, bboxes.height[i]))
    );

    const width = maybeSub(right, left);
    const height = maybeSub(bottom, top);

    return {
      transform: {
        translate: {
          x: left,
          y: top,
        },
      },
      bbox: { left, top, right, bottom, width, height },
    };
  };

  const paint = (paintProps: {
    bbox: BBox;
    transform: Transform;
    children: JSX.Element;
  }) => {
    const width = () =>
      props.width ?? paintProps.bbox.width! + props.padding! * 2;
    const height = () =>
      props.height ?? paintProps.bbox.height! + props.padding! * 2;

    return (
      <svg
        width={width()}
        height={height()}
        viewBox={`${
          -props.padding! +
          (props.positioning === "absolute"
            ? 0
            : paintProps.transform.translate.x ?? 0)
        } ${
          -props.padding! +
          (props.positioning === "absolute"
            ? 0
            : paintProps.transform.translate.y ?? 0)
        } ${width()} ${height()}`}
      >
        {props.children}
      </svg>
    );
  };

  return (
    <>
      <ScenegraphContext.Provider value={scenegraphContext}>
        <Layout name={id} layout={layout} paint={paint}>
          <ParentIDContext.Provider value={id}>
            {props.children}
          </ParentIDContext.Provider>
        </Layout>
      </ScenegraphContext.Provider>
      <Show when={props.debug === true}>
        <pre>{JSON.stringify(scenegraph, null, 2)}</pre>
      </Show>
    </>
  );
}

export default Bluefish;
