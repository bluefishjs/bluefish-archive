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

  const layout = (childIds: ChildNode[]) => {
    childIds = Array.from(childIds);

    // get the bbox of the children
    const bboxes = {
      left: childIds.map((childId) => childId.bbox.left),
      top: childIds.map((childId) => childId.bbox.top),
      width: childIds.map((childId) => childId.bbox.width),
      height: childIds.map((childId) => childId.bbox.height),
    };

    for (const childId of childIds) {
      if (!childId.owned.x) {
        childId.bbox.left = 0;
      }

      if (!childId.owned.y) {
        childId.bbox.top = 0;
      }
    }

    // find our bounding box
    const left = minOfMaybes(bboxes.left) ?? 0;
    const top = minOfMaybes(bboxes.top) ?? 0;
    const right = maxOfMaybes(
      bboxes.left.map((left, i) => maybeAdd(left, bboxes.width[i]))
    );
    const bottom = maxOfMaybes(
      bboxes.top.map((top, i) => maybeAdd(top, bboxes.height[i]))
    );
    const width = maybeSub(right, left);
    const height = maybeSub(bottom, top);

    return {
      bbox: {
        left: left ?? 0,
        top: top ?? 0,
        width: width ?? props.width,
        height: height ?? props.height,
      },
      transform: {
        translate: {
          x: 0,
          y: 0,
        },
      },
    };
  };

  const paint = (paintProps: {
    bbox: BBox;
    transform: Transform;
    children: JSX.Element;
  }) => {
    const width = () => paintProps.bbox.width! + props.padding! * 2;
    const height = () => paintProps.bbox.height! + props.padding! * 2;

    return (
      <svg
        width={width()}
        height={height()}
        viewBox={`${-props.padding!} ${-props.padding!} ${width()} ${height()}`}
      >
        {props.children}
      </svg>
    );
  };

  return (
    <>
      <ScenegraphContext.Provider value={scenegraphContext}>
        <Layout id={id} layout={layout} paint={paint}>
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
