import { BBox, Id } from "./scenegraph";

/* A collection of common Bluefish Error types */

export type BluefishError = {
  type: string;
  source: Id;
  display: (resolveScopeName: (name: Id) => Id) => string;
};

export type DimUnownedError = {
  type: "DimUnownedError";
  name: Id;
  dim: keyof BBox;
} & BluefishError;

export const dimUnownedError = ({
  source,
  name,
  dim,
}: {
  source: Id;
  name: Id;
  dim: keyof BBox;
}): DimUnownedError => {
  return {
    type: "DimUnownedError",
    source,
    name,
    dim,
    display: (resolveScopeName) =>
      `${resolveScopeName(name)}'s ${dim} is undefined (DimUnownedError)`,
  };
};
