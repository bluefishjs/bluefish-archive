import {
  Accessor,
  Component,
  createContext,
  createSignal,
  createUniqueId,
  untrack,
  useContext,
} from "solid-js";
import { Id, ScenegraphTokenizer } from "./scenegraph";
import { ParentScopeIdContext, ScopeContext } from "./createName";
import { Dynamic } from "solid-js/web";
import { createToken, resolveTokens } from "@solid-primitives/jsx-tokenizer";

export type WithBluefishProps<T = object> = T & {
  name: Id;
};

export const IdContext = createContext<Accessor<Id | undefined>>(
  () => undefined
);

export function withBluefish<ComponentProps>(
  WrappedComponent: Component<WithBluefishProps<ComponentProps>>,
  options?: { displayName?: string }
) {
  return createToken(
    ScenegraphTokenizer,
    (props: Omit<ComponentProps, "name"> & { name?: Id }) => {
      // scenegraph id
      const contextId = useContext(IdContext);
      const parentScopeId = useContext(ParentScopeIdContext);
      const displayNamePrefix =
        options?.displayName !== undefined ? `${options?.displayName}(` : "";
      const displayNameSuffix = options?.displayName !== undefined ? ")" : "";
      const genId = `${displayNamePrefix}${createUniqueId()}${displayNameSuffix}`;
      const genScopeId = `${displayNamePrefix}${createUniqueId()}${displayNameSuffix}`;
      // const id = () => props.name ?? contextId() ?? genId;
      const id = () => contextId() ?? genId;
      const scopeId = () => props.name ?? genScopeId;

      // component scope id
      const [scope, setScope] = useContext(ScopeContext);
      const [layout, setLayout] = createSignal<(parentId: Id | null) => void>(
        () => {}
      );

      // TODO: might have to initialize the scope in the store if the scope id was auto-generated

      if (scope[scopeId()] === undefined) {
        setScope(scopeId(), {
          parent: parentScopeId(),
          layoutNode: undefined,
          children: {},
        });
      }
      setScope(scopeId(), "layoutNode", id());

      // return (
      //   <ParentScopeIdContext.Provider value={scopeId}>
      //     <IdContext.Provider value={id}>
      //       {/* {untrack(() => {
      //         const tokens = resolveTokens(ScenegraphTokenizer, () => (
      //           <Dynamic
      //             component={WrappedComponent}
      //             {...(props as WithBluefishProps<ComponentProps>)}
      //             name={id()}
      //           />
      //         ));

      //         return tokens();
      //       })} */}
      //       <WrappedComponent
      //         {...(props as WithBluefishProps<ComponentProps>)}
      //         name={id()}
      //       />
      //     </IdContext.Provider>
      //   </ParentScopeIdContext.Provider>
      // );

      const jsx = (
        <ParentScopeIdContext.Provider value={scopeId}>
          <IdContext.Provider value={id}>
            {untrack(() => {
              const tokens = resolveTokens(ScenegraphTokenizer, () => (
                <Dynamic
                  component={WrappedComponent}
                  {...(props as WithBluefishProps<ComponentProps>)}
                  name={id()}
                />
              ));

              setLayout(() => tokens()[0].data.layout);

              return tokens()[0].data.jsx;
            })}
          </IdContext.Provider>
        </ParentScopeIdContext.Provider>
      );

      return {
        jsx,
        layout: (parentId) => layout()(parentId),
      };
      // (
      //   <ParentScopeIdContext.Provider value={scopeId}>
      //     <IdContext.Provider value={id}>
      //       {/* {untrack(() => {
      //       const tokens = resolveTokens(ScenegraphTokenizer, () => (
      //         <Dynamic
      //           component={WrappedComponent}
      //           {...(props as WithBluefishProps<ComponentProps>)}
      //           name={id()}
      //         />
      //       ));

      //       return tokens();
      //     })} */}
      //       <WrappedComponent
      //         {...(props as WithBluefishProps<ComponentProps>)}
      //         name={id()}
      //       />
      //     </IdContext.Provider>
      //   </ParentScopeIdContext.Provider>
      // );
    }
  );
}

export default withBluefish;
