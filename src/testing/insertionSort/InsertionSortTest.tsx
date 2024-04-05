import { InsertionSort } from "../example-gallery/insertion-sort";
import { sortProps } from "./insertionSortProps";

export const InsertionSortTest = () => {
  return <InsertionSort unsortedArray={sortProps} />;
};
