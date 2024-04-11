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
  ScenegraphTokenizer,
} from "./scenegraph";
import { IdContext } from "./withBluefish";
import { ScopeContext } from "./createName";
import { useError } from "./errorContext";
import { LayoutIsDirtyContext, LayoutUIDContext } from "./bluefish";
import { createStore, produce } from "solid-js/store";
import { createToken, resolveTokens } from "@solid-primitives/jsx-tokenizer";

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

export const Layout = createToken(ScenegraphTokenizer, (props: LayoutProps) => {
  const parentId = useContext(ParentIDContext);
  const [_scope, setScope] = useContext(ScopeContext);
  const error = useError();
  const [layoutIsDirty, setLayoutIsDirty] = useContext(LayoutIsDirtyContext);
  const layoutUID = useContext(LayoutUIDContext);
  const [childLayouts, setChildLayouts] = createSignal<
    ((parentId: Id | null) => void)[]
  >([]);

  const [scenegraphInfo, setScenegraphInfo] = createStore({
    bbox: {},
    transform: { translate: {} },
    customData: {},
  });

  const {
    scenegraph,
    createNode,
    deleteNode,
    setLayout,
    mergeBBoxAndTransform,
    createChildRepr,
  } = UNSAFE_useScenegraph();

  // createRenderEffect(() => {
  //   createNode(props.name, parentId);
  // });

  // onCleanup(() => {
  //   deleteNode(error, props.name, setScope);
  // });

  // evaluate the child props before running the effect so that children's layout functions are
  // called before the parent's layout function
  // h/t Erik Demaine
  const jsx = (
    <ParentIDContext.Provider value={props.name}>
      <IdContext.Provider value={() => undefined}>
        {(() => {
          const childTokens = resolveTokens(
            ScenegraphTokenizer,
            () => props.children
          );

          setChildLayouts(() => {
            return childTokens().map((child) => {
              return child.data.layout;
            });
          });

          return (
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
              <For each={childTokens()}>{(child) => child.data.jsx}</For>
            </Dynamic>
          );
        })()}
      </IdContext.Provider>
    </ParentIDContext.Provider>
  );

  // createRenderEffect(() => {
  //   // untrack(() => {
  //   //   console.log(
  //   //     "running layout render effect for",
  //   //     props.name,
  //   //     JSON.parse(JSON.stringify(scenegraph))
  //   //   );
  //   // });
  //   // run this later so that the children's layout functions are called before the parent's layout function
  //   setLayout(props.name, props.layout);
  //   // setLayoutIsDirty(true);
  // });

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
        // console.log(
        //   `setting layout for ${props.name} to`,
        //   JSON.parse(JSON.stringify(scenegraph[props.name]))
        // );
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
      // if ("layout" in child.data) {
      //   child.data.layout(props.name);
      // }
      childLayout(props.name);
    }

    // const { bbox, transform, customData } = layoutMemo2();
    const { bbox, transform, customData } = props.layout(
      (scenegraph[props.name]?.children ?? []).map((childId: Id) =>
        createChildRepr(props.name, childId)
      )
    );

    mergeBBoxAndTransform(props.name, props.name, bbox, transform);
    scenegraph[props.name].customData = customData;
  };

  // createRenderEffect(() => {
  //   scenegraph[props.name].layout = layout;
  // });

  return {
    jsx,
    layout,
  };
});

// export const Layout: Component<LayoutProps> = (props) => {
//   const parentId = useContext(ParentIDContext);
//   const [_scope, setScope] = useContext(ScopeContext);
//   const error = useError();
//   const [layoutIsDirty, setLayoutIsDirty] = useContext(LayoutIsDirtyContext);
//   const layoutUID = useContext(LayoutUIDContext);

//   const [scenegraphInfo, setScenegraphInfo] = createStore({
//     bbox: {},
//     transform: { translate: {} },
//     customData: {},
//   });

//   const { scenegraph, createNode, deleteNode, setLayout } =
//     UNSAFE_useScenegraph();

//   createRenderEffect(() => {
//     createNode(props.name, parentId);
//   });

//   onCleanup(() => {
//     deleteNode(error, props.name, setScope);
//   });

//   // evaluate the child props before running the effect so that children's layout functions are
//   // called before the parent's layout function
//   // h/t Erik Demaine
//   const jsx = (
//     <ParentIDContext.Provider value={props.name}>
//       <IdContext.Provider value={() => undefined}>
//         <Dynamic
//           component={props.paint}
//           {...scenegraphInfo}
//           // bbox={scenegraph[props.name]?.bbox ?? {}}
//           // transform={{
//           //   translate: {
//           //     x: scenegraph[props.name]?.transform?.translate?.x ?? 0,
//           //     y: scenegraph[props.name]?.transform?.translate?.y ?? 0,
//           //   },
//           // }}
//           // customData={scenegraph[props.name]?.customData}
//         >
//           {props.children}
//         </Dynamic>
//       </IdContext.Provider>
//     </ParentIDContext.Provider>
//   );

//   createRenderEffect(() => {
//     // untrack(() => {
//     //   console.log(
//     //     "running layout render effect for",
//     //     props.name,
//     //     JSON.parse(JSON.stringify(scenegraph))
//     //   );
//     // });
//     // run this later so that the children's layout functions are called before the parent's layout function
//     setLayout(props.name, props.layout);
//     // setLayoutIsDirty(true);
//   });

//   createRenderEffect(
//     on(
//       () => layoutUID(),
//       () => {
//         // console.log(
//         //   `setting layout for ${props.name} to`,
//         //   JSON.parse(JSON.stringify(scenegraph[props.name]))
//         // );
//         setScenegraphInfo({
//           bbox: scenegraph[props.name]?.bbox ?? {},
//           transform: {
//             translate: {
//               x: scenegraph[props.name]?.transform?.translate?.x ?? 0,
//               y: scenegraph[props.name]?.transform?.translate?.y ?? 0,
//             },
//           },
//           customData: scenegraph[props.name]?.customData,
//         });
//       }
//     )
//   );

//   return jsx;
// };

export default Layout;
