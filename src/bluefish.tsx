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
  Scenegraph,
} from "./scenegraph";
import {
  JSX,
  ParentProps,
  Show,
  createEffect,
  createUniqueId,
  mergeProps,
} from "solid-js";
import { ParentScopeIdContext, Scope, ScopeContext } from "./createName";
import { createStore } from "solid-js/store";
import { ErrorContext, createErrorContext } from "./errorContext";
import { BluefishError } from "./errors";
import { getAncestorChain } from "./util/lca";
import toast, { Toaster } from "solid-toast";

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

const createResolveScopeName = (scope: Scope) => (id: Id) => {
  for (const [name, value] of Object.entries(scope)) {
    if (value.layoutNode === id) {
      return name;
    }
  }

  return id;
};

const createOnError =
  (scenegraph: Scenegraph, scope: Scope) => (error: BluefishError) => {
    const resolveScopeName = createResolveScopeName(scope);
    const errorMessage = `Error in ${resolveScopeName(error.source)}:
    ${error.display(resolveScopeName)} (${error.type})

Error path from root:
  ${getAncestorChain(scenegraph, error.source)
    .concat([error.source])
    .map((id) => resolveScopeName(id))
    .join(" >>\n  ")}`;

    console.error(errorMessage);
    // toast.error(errorMessage);
  };

export function Bluefish(props: BluefishProps) {
  props = mergeProps(
    {
      padding: 10,
      positioning: "relative" as const,
    },
    props
  );

  const scenegraphContext = createScenegraph();
  const { scenegraph, createNode } = scenegraphContext;
  const [scope, setScope] = createStore<Scope>({});
  const errorContext = createErrorContext(createOnError(scenegraph, scope));

  const autoGenId = `Bluefish(${createUniqueId()})`;
  const autoGenScopeId = `Bluefish(${createUniqueId()})`;
  const id = autoGenId;
  const scopeId = props.id ?? autoGenScopeId;

  const layout = (childNodes: ChildNode[]) => {
    for (const childNode of childNodes) {
      if (!childNode.owned.left) {
        childNode.bbox.left = 0;
      }

      if (!childNode.owned.top) {
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
          x: 0,
          y: 0,
        },
      },
      bbox: { left, top, width, height },
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
          (props.positioning === "absolute" ? 0 : paintProps.bbox.left ?? 0)
        } ${
          -props.padding! +
          (props.positioning === "absolute" ? 0 : paintProps.bbox.top ?? 0)
        } ${width()} ${height()}`}
      >
        {paintProps.children}
      </svg>
    );
  };

  return (
    <>
      <ErrorContext.Provider value={errorContext}>
        <ScenegraphContext.Provider value={scenegraphContext}>
          <ScopeContext.Provider value={[scope, setScope]}>
            <Layout name={id} layout={layout} paint={paint}>
              <ParentScopeIdContext.Provider value={() => scopeId}>
                <ParentIDContext.Provider value={id}>
                  {props.children}
                </ParentIDContext.Provider>
              </ParentScopeIdContext.Provider>
            </Layout>
          </ScopeContext.Provider>
        </ScenegraphContext.Provider>
      </ErrorContext.Provider>
      <Toaster
        position="top-left"
        containerStyle={{
          position: "relative",
          width: "500px",
        }}
      />
      <Show when={props.debug === true}>
        <br />
        <div style={{ float: "left", "margin-right": "40px" }}>
          <h1>Scenegraph</h1>
          <pre>{Object.keys(scenegraph).length}</pre>
          {/* <pre>{JSON.stringify(scenegraph, null, 2)}</pre> */}
        </div>
        {/* <div style={{ float: "left" }}>
          <h1>Scope</h1>
          <pre>{JSON.stringify(scope, null, 2)}</pre>
        </div> */}
      </Show>
    </>
  );
}

export default Bluefish;
