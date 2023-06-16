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
  useContext,
} from "solid-js";

export type LayoutProps = ParentProps<{
  id: Id;
  bbox?: Partial<BBox>;
  layout: (childIds: Id[]) => {
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
  const [scenegraph, { setBBox, createNode }] = useContext(BBoxContext)!;

  createNode(props.id, parentId);

  // const childIds = createMemo(
  //   () =>
  //     React.Children.map(
  //       children,
  //       (child) => (child as React.ReactElement<any>).props.id
  //     ) ?? [],
  //   [children]
  // );

  const childIds = () => Array.from(scenegraph[props.id]?.children);

  createEffect(
    // on(
    // () => childIds().map((childId: string) => scenegraph[childId]),
    () => {
      console.log("layout effect", props.id, childIds());
      // TODO: this is a hack b/c otherwise layout doesn't work on first render
      // if (isFirstRender) {
      //   setIsFirstRender(false);
      // }

      const { bbox, transform } = props.layout(childIds());
      setBBox(props.id, bbox, props.id, transform);
      console.log(JSON.parse(JSON.stringify(scenegraph)));

      // TODO: probably have to cleanup ownership here...
    }
    // )
  );

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
