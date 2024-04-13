import { Dynamic } from "solid-js/web";
import {
  Component,
  For,
  JSX,
  ParentProps,
  children,
  createReaction,
  createRenderEffect,
  createSignal,
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
  ScenegraphToken,
  resolveScenegraphTokens,
} from "./scenegraph";
import { IdContext } from "./withBluefish";
import { ScopeContext } from "./createName";
import { useError } from "./errorContext";
import { LayoutUIDContext } from "./bluefish";
import { createStore, produce } from "solid-js/store";

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

export const Layout = (props: LayoutProps) => {
  const parentId = useContext(ParentIDContext);
  const [_scope, setScope] = useContext(ScopeContext);
  const error = useError();
  const layoutUID = useContext(LayoutUIDContext);
  const [childLayouts, setChildLayouts] = createSignal<
    ((parentId: Id | null) => void)[]
  >([]);

  const [scenegraphInfo, setScenegraphInfo] = createStore({
    bbox: {},
    transform: { translate: {} },
    customData: {},
  });

  const { scenegraph, createNode, mergeBBoxAndTransform, createChildRepr } =
    UNSAFE_useScenegraph();

  // evaluate the child props before running the effect so that children's layout functions are
  // called before the parent's layout function
  // h/t Erik Demaine
  const jsx = (
    <ParentIDContext.Provider value={props.name}>
      <IdContext.Provider value={() => undefined}>
        {(() => {
          const childNodes = resolveScenegraphTokens(props.children);

          setChildLayouts(() => {
            return childNodes.map((child) => {
              return child.layout;
            });
          });

          return (
            <Dynamic component={props.paint} {...scenegraphInfo}>
              <For each={childNodes}>{(child) => child.jsx}</For>
            </Dynamic>
          );
        })()}
      </IdContext.Provider>
    </ParentIDContext.Provider>
  );

  onCleanup(() => {
    // filter out scopes that have this id as their layoutNode
    setScope(
      produce((scope) => {
        for (const key of Object.keys(scope) as Array<Id>) {
          if (scope[key].layoutNode === props.name) {
            delete scope[key];
          }
        }
      })
    );
  });

  createRenderEffect(
    on(
      () => layoutUID(),
      () => {
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

  const layout = (parentId: Id | null) => {
    createNode(props.name, parentId);

    for (const childLayout of childLayouts()) {
      childLayout(props.name);
    }

    const { bbox, transform, customData } = props.layout(
      (scenegraph[props.name]?.children ?? []).map((childId: Id) =>
        createChildRepr(props.name, childId)
      )
    );

    mergeBBoxAndTransform(props.name, props.name, bbox, transform);
    scenegraph[props.name].customData = customData;
  };

  return {
    jsx,
    layout,
  } satisfies ScenegraphToken as unknown as JSX.Element;
};

export default Layout;
