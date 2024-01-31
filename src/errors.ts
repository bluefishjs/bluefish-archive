import { BBox, Id } from "./scenegraph";

/* A collection of common Bluefish Error types */

export type BluefishError = {
  type: string;
  source: Id;
  toString: () => string;
};

export type UnownedError = {
  type: "UnownedError";
  name: Id;
  dim: keyof BBox;
} & BluefishError;

export const unownedError = ({
  source,
  name,
  dim,
}: {
  source: Id;
  name: Id;
  dim: keyof BBox;
}): UnownedError => {
  return {
    type: "UnownedError",
    source,
    name,
    dim,
    toString: () => `${source}: ${name}'s ${dim} is undefined (UnownedError)`,
  };
};
