// import "solid-devtools";

import { createSignal, type Component, For } from "solid-js";

import Bluefish from "../src/bluefish";
import Rect from "../src/rect";
import Align, { Alignment2D } from "../src/align";
import Distribute from "../src/distribute";
import Ref from "../src/ref";
import Group from "../src/group";
import { AlignmentVertical, AlignmentHorizontal } from "../src/align";
import { StackSlot } from "../examples/python-tutor/stack-slot";
import GlobalFrame from "../examples/python-tutor/global-frame";
import HeapObject from "../examples/python-tutor/heap-object";
import ElmTuple from "../examples/python-tutor/elm-tuple";
import PythonTutor from "../examples/python-tutor/python-tutor";
import { pointer, stackSlot, tuple } from "../examples/python-tutor/types";

const arr = Array.from({ length: 1000 }, (_, i) => i + 1);

const App: Component = () => {
  const [x, setX] = createSignal(0);

  const [horizontalAlignment, setHorizontalAlignment] = createSignal("centerX");

  const [verticalAlignment, setVerticalAlignment] = createSignal("centerY");

  const [alignment, setAlignment] = createSignal("center");

  return (
    <>
      <input
        type="range"
        min={0}
        max={1000}
        value={x()}
        onInput={(e) => setX(+e.currentTarget.value)}
      />
      {x()}
      {/* dropdown for alignment */}
      <select
        value={alignment()}
        onChange={(e) => setAlignment(e.currentTarget.value)}
      >
        <option value="topLeft">topLeft</option>
        <option value="topCenter">topCenter</option>
        <option value="topRight">topRight</option>
        <option value="centerLeft">centerLeft</option>
        <option value="center">center</option>
        <option value="centerRight">centerRight</option>
        <option value="bottomLeft">bottomLeft</option>
        <option value="bottomCenter">bottomCenter</option>
        <option value="bottomRight">bottomRight</option>
      </select>
      <select
        value={verticalAlignment()}
        onChange={(e) => setVerticalAlignment(e.currentTarget.value)}
      >
        <option value="top">top</option>
        <option value="centerY">centerY</option>
        <option value="bottom">bottom</option>
      </select>
      <select
        value={horizontalAlignment()}
        onChange={(e) => setHorizontalAlignment(e.currentTarget.value)}
      >
        <option value="left">left</option>
        <option value="centerX">centerX</option>
        <option value="right">right</option>
      </select>
      <div>
        <br />
        <Bluefish id="bluefish-waterfall" width={1000} height={500}>
          <For each={arr}>
            {(item) => (
              <Rect
                id={`rect-${item}`}
                width={20}
                height={item * 20}
                fill="steelblue"
              />
            )}
          </For>
          {/* <Align alignment={"bottom"}>
            <For each={[1, 2, 3, 4, 5]}>
              {(item) => <Ref refId={`rect-${item}`} />}
            </For>
          </Align> */}
          <Distribute direction="vertical" spacing={0}>
            <For each={arr}>{(item) => <Ref refId={`rect-${item}`} />}</For>
          </Distribute>
          <Distribute direction="horizontal" spacing={x()}>
            <For each={arr}>{(item) => <Ref refId={`rect-${item}`} />}</For>
          </Distribute>
        </Bluefish>
        <Bluefish id="bluefish-pythontutor-test" width={1000} height={500}>
          <PythonTutor
            stack={[
              stackSlot("a", pointer(0)),
              stackSlot("b", pointer(1)),
              stackSlot("x", 5),
            ]}
            heap={[
              tuple([1, pointer(1), pointer(2)]),
              tuple([1, 4]),
              tuple([3, 10]),
            ]}
            heapArrangement={[
              [0, null, null],
              [null, 1, 2],
            ]}
          />
        </Bluefish>
        <Bluefish id="bluefish-heapobjecttest" width={1000} height={200}>
          <HeapObject
            objectType="tuple"
            objectValues={[
              { type: "string", value: "1" },
              { type: "string", value: "2" },
            ]}
          />
        </Bluefish>
        <Bluefish id="bluefish-elmtupletest" width={1000} height={200}>
          <ElmTuple
            tupleIndex="0"
            tupleData={{ type: "string", value: "1" }}
            objectId="fooooo"
          />
        </Bluefish>
        <Bluefish id="bluefish-globalframetest" width={1000} height={200}>
          <GlobalFrame
            id={`globalFrame`}
            variables={[
              {
                variable: "x",
                value: "1",
              },
              {
                variable: "y",
                value: "2",
              },
              {
                variable: "z",
                value: "3",
              },
            ]}
          />
        </Bluefish>
        <Bluefish id="bluefish5" width={500} height={500}>
          <Rect
            id="rect1"
            x={x()}
            y={0}
            width={100}
            height={150}
            fill="steelblue"
          />
          <Rect id="rect2" width={50} height={50} fill="lightgreen" />
          <Align
            id="align"
            alignment={verticalAlignment() as AlignmentVertical}
          >
            <Ref id="ref1" refId="rect1" />
            <Ref id="ref2" refId="rect2" />
          </Align>
          <Align
            id="align.5"
            alignment={horizontalAlignment() as AlignmentHorizontal}
          >
            <Ref id="ref1" refId="rect1" />
            <Ref id="ref2" refId="rect2" />
          </Align>
          <Align id="align2" alignment={alignment() as Alignment2D}>
            <Ref id="ref3" refId="rect2" />
            <Rect id="rect3" width={20} height={30} fill="magenta" />
          </Align>
        </Bluefish>
        <Bluefish id="bluefish" width={1000} height={200}>
          <Rect
            id="rect"
            x={x()}
            y={45}
            width={100}
            height={150}
            fill="steelblue"
          />
        </Bluefish>
        <Bluefish id="bluefish2" width={500} height={500}>
          <Align
            id="align"
            alignment={alignment() as Alignment2D}
            x={x()}
            y={0}
          >
            <Rect id="rect1" width={100} height={150} fill="steelblue" />
            <Rect id="rect2" width={50} height={50} fill="lightgreen" />
          </Align>
        </Bluefish>
        <Bluefish id="bluefish3" width={500} height={200}>
          <Rect
            id="rect1"
            x={x()}
            y={0}
            width={100}
            height={150}
            fill="steelblue"
          />
          <Rect id="rect2" width={50} height={50} fill="lightgreen" />
          {/* NOTE: this update to x is ignored b/c the ref resolution already sets the position of Align */}
          <Align id="align" x={0} alignment={alignment() as Alignment2D}>
            <Ref id="ref1" refId="rect1" />
            <Ref id="ref2" refId="rect2" />
          </Align>
        </Bluefish>
        <Bluefish id="bluefish4" width={500} height={500}>
          <Rect
            id="rect1"
            x={x()}
            y={0}
            width={100}
            height={150}
            fill="steelblue"
          />
          <Rect id="rect2" width={50} height={50} fill="lightgreen" />
          <Align id="align" alignment={alignment() as Alignment2D}>
            <Ref id="ref1" refId="rect1" />
            <Ref id="ref2" refId="rect2" />
          </Align>
          <Align id="align2" alignment={alignment() as Alignment2D}>
            <Ref id="ref3" refId="rect2" />
            <Rect id="rect3" width={20} height={30} fill="magenta" />
          </Align>
        </Bluefish>
        <Bluefish id="bluefish4.5" width={500} height={500}>
          <Align
            id="align"
            x={x()}
            y={0}
            alignment={alignment() as Alignment2D}
          >
            <Rect id="rect1" width={100} height={150} fill="steelblue" />
            <Rect id="rect2" width={50} height={50} fill="lightgreen" />
          </Align>
          <Align id="align2" alignment={alignment() as Alignment2D}>
            <Ref id="ref3" refId="rect2" />
            <Rect id="rect3" width={20} height={30} fill="magenta" />
          </Align>
        </Bluefish>
      </div>
    </>
  );
};

export default App;
