// import "solid-devtools";

import { createSignal, type Component, For } from "solid-js";

import Bluefish from "../src/bluefish";
import Rect from "../src/rect";
import Align, { Alignment2D } from "../src/align";
import Distribute from "../src/distribute";
import Ref from "../src/ref";
import Group from "../src/group";
import { AlignmentVertical, AlignmentHorizontal } from "../src/align";
import Circle from "../src/circle";
import Background from "../src/background";
import Text from "../src/text";
import Arrow from "../src/arrow";
import { Plot } from "../src/plot/plot";
import { Dot } from "../src/plot/dot";
import { Blob } from "../src/blob";
import { PaperScope, Path, Point, Size } from "paper/dist/paper-core";
import { Space } from "../examples/topology/space";
import { Neighborhood } from "../examples/topology/neighborhood";
import { Image } from "../src/image";
import { StackV } from "../src/stackv";
import { StackH } from "../src";

const markOps = [
  {
    action: "addMark",
    opId: "18@A",
    start: { opId: "5@B" },
    end: { opId: "7@A" },
    markType: "bold",
  },
  {
    action: "addMark",
    opId: "10@B",
    start: { opId: "1@A" },
    end: { opId: "6@B" },
    markType: "italic",
  },
];

const characters = [
  { value: "T", opId: "1@A", deleted: false, marks: ["italic"] },
  { value: "h", opId: "2@A", deleted: true, marks: ["italic"] },
  { value: "e", opId: "5@B", deleted: false, marks: ["bold", "italic"] },
  { value: " ", opId: "6@B", deleted: false, marks: ["bold", "italic"] },
  { value: "f", opId: "7@A", deleted: false, marks: ["bold"] },
  { value: "o", opId: "8@A", deleted: true, marks: [] },
  { value: "x", opId: "9@A", deleted: false, marks: [] },
];

const App: Component = () => {
  const [spacing, setSpacing] = createSignal(20);

  return (
    <>
      <Bluefish>
        <StackH spacing={spacing()} name="characters">
          <For each={characters}>
            {(character) => (
              <Align name={character.opId} alignment="center">
                <Rect
                  height={50}
                  width={40}
                  fill={character.deleted ? "gray" : "#e2ebf6"}
                  rx={5}
                />
                <Text
                  font-size="24"
                  font-weight={
                    character.marks.includes("bold") ? "bold" : "normal"
                  }
                  font-style={
                    character.marks.includes("italic") ? "italic" : "normal"
                  }
                  fill={character.deleted ? "white" : "black"}
                >
                  {character.value === " " ? "␣" : character.value}
                </Text>
              </Align>
            )}
          </For>
        </StackH>
        <Distribute direction="vertical" spacing={20}>
          <Ref select="characters" />
          <Distribute direction="vertical" spacing={20}>
            <For each={markOps}>
              {(markOp) => (
                <Background
                  name={markOp.opId}
                  background={() => <Rect fill="#FFCCCB" rx={5} />}
                >
                  <StackH>
                    <Background
                      padding={15}
                      background={() => <Rect fill="#8b0000" rx={5} />}
                    >
                      <Text fill="white">{markOp.opId}</Text>
                    </Background>
                    <Text>
                      {markOp.action}: {markOp.markType}
                    </Text>
                    {/* TODO: this wouldn't work with the bounding boxes... */}
                    {/* <Align alignment="left">
                      <Spacer />
                      <Ref select={markOp.end.opId} />
                    </Align> */}
                  </StackH>
                </Background>
              )}
            </For>
          </Distribute>
        </Distribute>
        <For each={markOps}>
          {(markOp) => (
            <Align alignment="left">
              <Ref select={markOp.opId} />
              <Ref select={markOp.start.opId} />
            </Align>
          )}
        </For>
      </Bluefish>
      <br />
      <input
        type="range"
        min="0"
        max="100"
        value={spacing()}
        onInput={(e) => setSpacing(e.target.valueAsNumber)}
      />
    </>
  );
};

export default App;
