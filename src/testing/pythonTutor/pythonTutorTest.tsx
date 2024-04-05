import Bluefish from "../../bluefish";
import { PythonTutor } from "../../python-tutor/python-tutor";
import { pythonProps } from "./pythonTutorProps";

export const pythonTutorTest = () => {
  return (
    <Bluefish>
      <PythonTutor {...pythonProps} />
    </Bluefish>
  );
};
