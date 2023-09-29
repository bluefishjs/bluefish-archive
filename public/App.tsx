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
import Circle from "../src/circle";
import Background from "../src/background";
import Text from "../src/text";
import Arrow from "../src/arrow";
import { Plot } from "../src/plot/plot";
import { Dot } from "../src/plot/dot";
import { Blob } from "../src/blob";
import { PaperScope, Path, Point, Size } from "paper/dist/paper-core";

const arr = Array.from({ length: 1000 }, (_, i) => i + 1);

const App: Component = () => {
  const [x, setX] = createSignal(0);
  const wordArr = () => Array.from({ length: x() }, (_) => "Mercury");
  const words = () => wordArr().join(" ");

  const [horizontalAlignment, setHorizontalAlignment] = createSignal("centerX");

  const [verticalAlignment, setVerticalAlignment] = createSignal("centerY");

  const [alignment, setAlignment] = createSignal("center");

  const canvas = document.createElement("canvas");
  const paperScope = new PaperScope();
  paperScope.setup(canvas);
  const dims = {
    x: 50,
    y: 25,
    width: 200,
    height: 100,
  };
  let myPath = new Path.Rectangle(
    new Point(dims.x, dims.y),
    new Size(dims.width, dims.height)
  );
  // const myPath = new Path();
  // myPath.add(new Point(50, 75));
  // myPath.add(new Point(50, 25));
  // myPath.add(new Point(150, 25));
  // myPath.add(new Point(150, 75));
  myPath.insert(
    4,
    new Point(
      dims.x + dims.width / 2,
      dims.y + dims.height - (dims.height * 5) / 50
    )
  );

  const dims2 = {
    x: 50,
    y: 50,
    width: 100,
    height: 50,
  };
  let myPath2 = new Path.Rectangle(
    new Point(dims2.x, dims2.y),
    new Size(dims2.width, dims2.height)
  );
  myPath2.insert(
    2,
    new Point(dims2.x + dims2.width / 2, dims2.y + (dims2.height * 5) / 50)
  );
  myPath2.insert(
    5,
    new Point(
      dims2.x + dims2.width / 2,
      dims2.y + dims2.height - (dims2.height * 5) / 50
    )
  );

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
        <Bluefish width={500} height={500} padding={20} debug>
          <Background
            id="background"
            x={10}
            y={10}
            padding={20}
            background={() => (
              <Blob
                id="blob"
                path={myPath}
                stroke="black"
                stroke-width={3}
                fill="lightgreen"
              />
            )}
          >
            <Text id="x" font-size={"20px"} vertical-anchor="start">
              x
            </Text>
            <Background
              id="background2"
              background={() => (
                <Blob
                  id="blob2"
                  path={myPath2}
                  stroke="black"
                  stroke-width={3}
                  fill={"palegreen"}
                />
              )}
            >
              <Text vertical-anchor="start">Borel sets</Text>
            </Background>
            <Align id="align" alignment="centerY">
              <Ref refId="x" />
              <Ref refId="blob2" />
            </Align>
            <Distribute id="distribute" direction="horizontal" spacing={50}>
              <Ref id="ref-background2" refId="background2" />
              <Ref id="ref-x" refId="x" />
            </Distribute>
          </Background>
          <Text id="text" vertical-anchor="start" width={65}>
            {"f^{-1}(N) lives here!"}
          </Text>
          <Align alignment="centerX">
            <Ref refId="text" />
            <Ref refId="background" />
          </Align>
          <Distribute direction="vertical" spacing={20}>
            <Ref refId="background" />
            <Ref refId="text" />
          </Distribute>
          <Arrow flip>
            <Ref refId="text" />
            <Ref refId="x" />
          </Arrow>
        </Bluefish>
        {/* {wordArr().length}
        <Bluefish id="visx-text" width={1000} height={500}>
          <Text
            id="text"
            font-family="Alegreya Sans, sans-serif"
            font-weight={700}
            font-size="14"
            vertical-anchor="start"
            width={500}
          >
            {words()}
          </Text>
        </Bluefish> */}
        {/* <Txt
          font-family="Alegreya Sans, sans-serif"
          font-weight={700}
          font-size="14"
          vertical-anchor="start"
          width={500}
        >
          {words()}
        </Txt> */}
        <br />
        <Bluefish width={300} height={100}>
          <Group x={0} y={0}>
            <Circle
              id="circle1"
              r={15}
              fill={"#0E2954"}
              stroke-width={2}
              stroke={"#272829"}
            />
            <Circle
              id="circle2"
              r={15}
              fill={"#0E2954"}
              stroke-width={2}
              stroke={"#272829"}
            />
            <Align alignment="centerY">
              <Ref refId="circle1" />
              <Ref refId="circle2" />
            </Align>
            <Distribute direction="horizontal" spacing={50}>
              <Ref refId="circle1" />
              <Ref refId="circle2" />
            </Distribute>
            <Background id="background" padding={20}>
              <Ref refId="circle1" />
              <Ref refId="circle2" />
            </Background>
            {/* <Text id="text">Mercury</Text> */}
            <Rect id="text" width={20} height={10} fill="magenta" />
            <Distribute direction="vertical" spacing={20}>
              <Ref refId="background" />
              <Ref refId="text" />
            </Distribute>
            <Align alignment="centerX">
              <Ref refId="text" />
              <Ref refId="background" />
            </Align>
            <Arrow padEnd={10} stroke-width={2}>
              <Ref refId="text" />
              <Ref refId="circle2" />
            </Arrow>
          </Group>
        </Bluefish>
      </div>
    </>
  );
};

export default App;
