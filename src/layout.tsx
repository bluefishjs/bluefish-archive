import { Dynamic } from "solid-js/web";
import {
  Component,
  JSX,
  ParentProps,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  mergeProps,
  on,
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

export type LayoutProps = ParentProps<{
  id: Id;
  bbox?: Partial<BBox>;
  layout: LayoutFn;
  paint: (props: {
    bbox: BBox;
    transform: Transform;
    children: JSX.Element;
  }) => JSX.Element;
}>;

export const Layout: Component<LayoutProps> = (props) => {
  // const [isFirstRender, setIsFirstRender] = useState(true);

  const parentId = useContext(ParentIDContext);
  const { scenegraph, getBBox, setBBox, createNode, mergeBBoxAndTransform } =
    UNSAFE_useScenegraph();

  createNode(props.id, parentId);

  // const childIds = createMemo(
  //   () =>
  //     React.Children.map(
  //       children,
  //       (child) => (child as React.ReactElement<any>).props.id
  //     ) ?? [],
  //   [children]
  // );

  // const childIds = () => Array.from(scenegraph[props.id]?.children);

  // TODO: should only change when an unowned child property changes. the code works properly for
  // alignment, though it blows up the stack b/c too many re-renders.

  // createMemo(() => {
  //   const id = props.id;
  //   console.log("layout", props.id);
  //   debugger;
  //   const { bbox, transform } = props.layout(
  //     scenegraph[props.id]?.children /* , getBBox */
  //   );
  //   setBBox(props.id, bbox, props.id, transform);
  //   untrack(() => console.log(JSON.parse(JSON.stringify(scenegraph))));
  // });

  // evaluate the child props before running the effect so that children's layout functions are
  // called before the parent's layout function
  // h/t Erik Demaine
  const jsx = (
    <ParentIDContext.Provider value={props.id}>
      <Dynamic
        component={props.paint}
        // TODO: this is a hack to get reactivity to work
        bbox={mergeProps({}, () => ({
          left: scenegraph[props.id]?.bbox?.left ?? 0,
          top: scenegraph[props.id]?.bbox?.top ?? 0,
          width: scenegraph[props.id]?.bbox?.width ?? 0,
          height: scenegraph[props.id]?.bbox?.height ?? 0,
        }))}
        transform={mergeProps({}, () => ({
          translate: {
            x: scenegraph[props.id]?.transform?.translate?.x ?? 0,
            y: scenegraph[props.id]?.transform?.translate?.y ?? 0,
          },
        }))}
      >
        {props.children}
      </Dynamic>
    </ParentIDContext.Provider>
  );

  createEffect(() => {
    const id = props.id;
    console.log("layout", props.id);
    // for (const childId of scenegraph[props.id]?.children) {
    //   // runLayout
    //   const node = untrack(() => getNode(scenegraph, childId));
    //   untrack(() => node.runLayout());
    // }
    // debugger;
    const { bbox, transform } = props.layout(
      scenegraph[props.id]?.children /* , getBBox */
    );
    // setBBox(props.id, bbox, props.id, transform);
    mergeBBoxAndTransform(props.id, props.id, bbox, transform);
    untrack(() => console.log(JSON.parse(JSON.stringify(scenegraph))));
  });

  // createEffect(() => {
  //   console.log(
  //     props.id,
  //     "children",
  //     childIds().map((childId: string) =>
  //       JSON.parse(JSON.stringify(scenegraph[childId]))
  //     )
  //   );
  // });

  // const currentBbox = () =>
  //   // NOTE: this is safe b/c Layout only creates normal nodes, not refs
  //   scenegraph[props.id]?.bbox ?? {
  //     left: 0,
  //     top: 0,
  //     width: 0,
  //     height: 0,
  //   };

  // const currentTransform = () => {
  //   return scenegraph[props.id]?.transform ?? { translate: { x: 0, y: 0 } };
  // };

  return jsx;
  // <ParentIDContext.Provider value={props.id}>
  //   <Dynamic
  //     component={props.paint}
  //     // TODO: this is a hack to get reactivity to work
  //     bbox={mergeProps({}, () => ({
  //       left: scenegraph[props.id]?.bbox?.left ?? 0,
  //       top: scenegraph[props.id]?.bbox?.top ?? 0,
  //       width: scenegraph[props.id]?.bbox?.width ?? 0,
  //       height: scenegraph[props.id]?.bbox?.height ?? 0,
  //     }))}
  //     transform={mergeProps({}, () => ({
  //       translate: {
  //         x: scenegraph[props.id]?.transform?.translate?.x ?? 0,
  //         y: scenegraph[props.id]?.transform?.translate?.y ?? 0,
  //       },
  //     }))}
  //   >
  //     {props.children}
  //   </Dynamic>
  // </ParentIDContext.Provider>
};

export default Layout;
