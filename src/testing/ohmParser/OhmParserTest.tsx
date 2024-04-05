import Bluefish from "../../bluefish";
import { OhmParser } from "../../example-gallery/ohm-parser";
import { expression } from "./ohm_expression";

export const OhmParserTest = () => {
  return (
      <OhmParser expression={expression} />
  );
};
