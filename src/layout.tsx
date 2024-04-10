import { Dynamic } from "solid-js/web";
import {
  Component,
  JSX,
  ParentProps,
  children,
  createReaction,
  createRenderEffect,
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
import { ScopeContext } from "./createName";
import { useError } from "./errorContext";
import { LayoutIsDirtyContext, LayoutUIDContext } from "./bluefish";
import { createStore } from "solid-js/store";

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
  const parentId = useContext(ParentIDContext);
  const [_scope, setScope] = useContext(ScopeContext);
  const error = useError();
  const [layoutIsDirty, setLayoutIsDirty] = useContext(LayoutIsDirtyContext);
  const layoutUID = useContext(LayoutUIDContext);

  const [scenegraphInfo, setScenegraphInfo] = createStore({
    bbox: {},
    transform: { translate: {} },
    customData: {},
  });

  const { scenegraph, createNode, deleteNode, setLayout } =
    UNSAFE_useScenegraph();

  createRenderEffect(() => {
    createNode(props.name, parentId);
  });

  onCleanup(() => {
    deleteNode(error, props.name, setScope);
  });

  // evaluate the child props before running the effect so that children's layout functions are
  // called before the parent's layout function
  // h/t Erik Demaine
  const jsx = (
    <ParentIDContext.Provider value={props.name}>
      <IdContext.Provider value={() => undefined}>
        <Dynamic
          component={props.paint}
          {...scenegraphInfo}
          // bbox={scenegraph[props.name]?.bbox ?? {}}
          // transform={{
          //   translate: {
          //     x: scenegraph[props.name]?.transform?.translate?.x ?? 0,
          //     y: scenegraph[props.name]?.transform?.translate?.y ?? 0,
          //   },
          // }}
          // customData={scenegraph[props.name]?.customData}
        >
          {props.children}
        </Dynamic>
      </IdContext.Provider>
    </ParentIDContext.Provider>
  );

  createRenderEffect(() => {
    // untrack(() => {
    //   console.log(
    //     "running layout render effect for",
    //     props.name,
    //     JSON.parse(JSON.stringify(scenegraph))
    //   );
    // });
    // run this later so that the children's layout functions are called before the parent's layout function
    setLayout(props.name, props.layout);
    // setLayoutIsDirty(true);
  });

  createRenderEffect(
    on(
      () => layoutUID(),
      () => {
        // console.log("updating local scenegraph info for", props.name);
        setScenegraphInfo({
          bbox: scenegraph[props.name]?.bbox ?? {},
          transform: {
            translate: {
              x: scenegraph[props.name]?.transform?.translate?.x ?? 0,
              y: scenegraph[props.name]?.transform?.translate?.y ?? 0,
            },
          },
          customData: scenegraph[props.name]?.customData,
        });
      }
    )
  );

  return jsx;
};

export default Layout;
