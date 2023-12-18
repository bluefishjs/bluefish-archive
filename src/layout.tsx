import { Dynamic } from "solid-js/web";
import {
  Component,
  JSX,
  ParentProps,
  batch,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  mergeProps,
  on,
  onCleanup,
  untrack,
  useContext,
} from "solid-js";
import {
  BBox,
  Transform,
  UNSAFE_useScenegraph,
  ParentIDContext,
  LayoutFn,
  Id,
} from "./scenegraph";
import { IdContext } from "./withBluefish";

export type LayoutProps = ParentProps<{
  name: Id;
  bbox?: BBox;
  layout: LayoutFn;
  paint: (props: {
    bbox: BBox;
    transform: Transform;
    children: JSX.Element;
    customData?: any;
  }) => JSX.Element;
}>;

export const Layout: Component<LayoutProps> = (props) => {
  // const [isFirstRender, setIsFirstRender] = useState(true);

  const parentId = useContext(ParentIDContext);
  const {
    scenegraph,
    createNode,
    mergeBBoxAndTransform,
    setCustomData,
    createChildRepr,
  } = UNSAFE_useScenegraph();

  createRenderEffect(() => {
    createNode(props.name, parentId);
  });

  // evaluate the child props before running the effect so that children's layout functions are
  // called before the parent's layout function
  // h/t Erik Demaine
  const jsx = (
    <ParentIDContext.Provider value={props.name}>
      <IdContext.Provider value={() => undefined}>
        <Dynamic
          component={props.paint}
          bbox={scenegraph[props.name]?.bbox ?? {}}
          transform={{
            translate: {
              x: scenegraph[props.name]?.transform?.translate?.x ?? 0,
              y: scenegraph[props.name]?.transform?.translate?.y ?? 0,
            },
          }}
          customData={scenegraph[props.name]?.customData}
        >
          {props.children}
        </Dynamic>
      </IdContext.Provider>
    </ParentIDContext.Provider>
  );

  createEffect(() => {
    // const id = props.id;
    // console.log("layout", props.id);
    // for (const childId of scenegraph[props.id]?.children) {
    //   // runLayout
    //   const node = untrack(() => getNode(scenegraph, childId));
    //   untrack(() => node.runLayout());
    // }
    // debugger;
    const { bbox, transform, customData } = props.layout(
      Array.from(scenegraph[props.name]?.children ?? []).map((childId: Id) =>
        createChildRepr(props.name, childId)
      )
    );
    // setBBox(props.id, bbox, props.id, transform);
    mergeBBoxAndTransform(props.name, props.name, bbox, transform);
    setCustomData(props.name, customData);
    // console.log(
    //   "layout",
    //   props.id,
    //   JSON.parse(JSON.stringify({ bbox, transform })),
    //   JSON.parse(JSON.stringify(untrack(() => getBBox(props.id)))),
    //   "DONE"
    // );
    // untrack(() => console.log(JSON.parse(JSON.stringify(scenegraph))));
  });

  return jsx;
};

export default Layout;
