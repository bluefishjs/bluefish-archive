import { debugOwnerComputations, debugProps } from "@solid-devtools/logger";
import { Dynamic } from "solid-js/web";
import {
  Component,
  For,
  JSX,
  ParentProps,
  batch,
  children,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  mergeProps,
  on,
  onCleanup,
  onMount,
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
import { ScopeContext } from "./createName";

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
  // debugProps(props);
  // debugOwnerComputations();
  // const [isFirstRender, setIsFirstRender] = useState(true);

  const parentId = useContext(ParentIDContext);
  const [scope, setScope] = useContext(ScopeContext);

  const {
    scenegraph,
    createNode,
    deleteNode,
    mergeBBoxAndTransform,
    setCustomData,
    setLayout,
    createChildRepr,
  } = UNSAFE_useScenegraph();

  createRenderEffect(() => {
    createNode(props.name, parentId);
  });

  onCleanup(() => {
    console.log("cleanup", props.name);
    deleteNode(props.name, setScope);
  });

  // const c = () => children(() => props.children).toArray();

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
          {/* <For each={c()}>{(child) => child!.element}</For> */}
          {/* {c()} */}
          {props.children}
        </Dynamic>
      </IdContext.Provider>
    </ParentIDContext.Provider>
  );

  createRenderEffect(() => {
    // run this later so that the children's layout functions are called before the parent's layout function
    setLayout(props.name, props.layout);
  });

  return jsx;
  // TODO: convert to this form
  // return {
  //   id: () => props.name,
  //   element: jsx,
  // };
};

export default Layout;
