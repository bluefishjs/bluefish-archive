import { Dynamic } from "solid-js/web";
import {
  BBox,
  BBoxContext,
  Id,
  ParentIDContext,
  Transform,
} from "./scenegraph";
import {
  Component,
  JSX,
  ParentProps,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
  untrack,
  useContext,
} from "solid-js";

export type LayoutProps = ParentProps<{
  id: Id;
  bbox?: Partial<BBox>;
  layout: (
    childIds: Id[],
    getBBox?: (id: string) => BBox
  ) => {
    bbox: Partial<BBox>;
    transform: Transform;
  };
  paint: (props: {
    bbox: BBox;
    transform: Transform;
    children: JSX.Element;
  }) => JSX.Element;
}>;

export const Layout: Component<LayoutProps> = (props) => {
  // const [isFirstRender, setIsFirstRender] = useState(true);

  const parentId = useContext(ParentIDContext);
  const [scenegraph, { getBBox, setBBox, createNode, getNode }] =
    useContext(BBoxContext)!;

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

  createEffect(
    // on(
    // childIds().map((childId: string) => () => scenegraph[childId]),
    // [
    //   () => scenegraph[props.id]?.children,
    //   // TODO: partial solution below, but not correct
    //   // () =>
    //   //   Array.from(scenegraph[props.id]?.children).map(
    //   //     (childId) =>
    //   //       getNode(scenegraph, childId as string).transformOwners.translate
    //   //         .x !== props.id
    //   //   ),
    //   () => props.id,
    //   () => props.layout,
    // ],
    (changedProps) => {
      console.log("layout effect", props.id, scenegraph[props.id]?.children);

      if (changedProps !== undefined) {
        console.log(
          changedProps.children === scenegraph[props.id]?.children,
          changedProps.id === props.id,
          changedProps.layout === props.layout,
          changedProps.leftOwner,
          changedProps.left
        );
      }
      // TODO: this is a hack b/c otherwise layout doesn't work on first render
      // if (isFirstRender) {
      //   setIsFirstRender(false);
      // }

      // force an update whenever an unowned property of a child changes
      // we'll accomplish this by filtering by owner and then reading the value if so
      // this will register that value as a dependency of this effect
      for (const child of scenegraph[props.id]?.children) {
        const node = scenegraph[child];
        if (node.type !== "node") continue;
        // if (untrack(() => node.bboxOwners).left !== props.id) {
        //   node.bbox.left;
        // }
        // if (untrack(() => node.bboxOwners).top !== props.id) {
        //   node.bbox.top;
        // }
        // if (untrack(() => node.bboxOwners).width !== props.id) {
        //   node.bbox.width;
        // }
        // if (untrack(() => node.bboxOwners).height !== props.id) {
        //   node.bbox.height;
        // }
        // if (untrack(() => node.transformOwners.translate).x !== props.id) {
        //   node.transform.translate.x;
        // }
        // if (untrack(() => node.transformOwners.translate).y !== props.id) {
        //   node.transform.translate.y;
        // }
      }

      const { bbox, transform } = props.layout(
        scenegraph[props.id]?.children /* , getBBox */
      );
      setBBox(props.id, bbox, props.id, transform);
      // console.log(JSON.parse(JSON.stringify(scenegraph)));

      // TODO: probably have to cleanup ownership here...
      return {
        children: scenegraph[props.id]?.children,
        id: props.id,
        layout: props.layout,
        // leftOwner: Array.from(scenegraph[props.id]?.children).map(
        //   (child) => scenegraph[child].bboxOwners.left
        // ),
        // left: Array.from(scenegraph[props.id]?.children).map(
        //   (child) => scenegraph[child].bbox.left
        // ),
      };
    }
    // )
  );

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

  return (
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
};

export default Layout;
