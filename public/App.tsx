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
import { Image } from "../examples/topology/image";
import { StackV } from "../src/stackv";

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
  const myPath = new Path.Rectangle(
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
  const myPath2 = new Path.Rectangle(
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
      <Bluefish id="root" debug>
        <Group name="group" y={10}>
          <Rect width={200} height={20} name="top-rect" fill="blue" x={0} />
          <Distribute name="distribute" direction="vertical" spacing={20}>
            <Rect width={100} height={20} name="rect-1" />
            <Rect width={50} height={20} name="rect-2" />
          </Distribute>
          <Align name="align" alignment="right">
            <Ref name="ref-rect-1" select="rect-1" />
            <Ref name="ref-top-rect" select="top-rect" />
          </Align>
        </Group>
      </Bluefish>
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
        <Bluefish width={500} height={500}>
          <StackV x={0} y={0} alignment="right" spacing={10}>
            <Text font-size="18pt">Pizza dough</Text>
            <StackV alignment="right" spacing={20}>
              <StackV alignment="right" spacing={0}>
                <Text name="flour">2 cup flour</Text>
                <Text name="salt">2 t. salt</Text>
              </StackV>
              <StackV name="right" spacing={0}>
                <Text name="water">1 cup water</Text>
                <Text name="olive oil">2 T olive oil</Text>
                <Text name="yeast">2 t. yeast</Text>
                <Text name="honey">2 t. honey</Text>
              </StackV>
            </StackV>
          </StackV>
        </Bluefish>
        <br />
        {/* <Bluefish width={500} height={500}>
          <Group x={0} y={0}>
            <Rect
              id="rect1"
              // x={50}
              // y={100}
              width={100}
              height={100}
              fill="red"
            />
            <Rect id="rect2" width={100} height={100} fill="blue" />
            <Row>

            </Row>
            <Align id={"align"} x={50} alignment={alignment()}>
              <Ref id="refr1" refId="rect1" />
              <Ref id="refr2" refId="rect2" />
            </Align>
            <Distribute id={"distribute"} direction="vertical" spacing={50}>
              <Ref id="refalign" refId="align" />
              <Ref id="ref-rect2" refId="rect2" />
            </Distribute>
          </Group>
        </Bluefish> */}
        {/* <Row>
  <Space name="X" label="X">
    <Neighborhood name="U" label="U">
      <Point name="x" label="x">
    </Neighborhood>
  </Space>
  <Space name="Y" label="Y">
    <Neighborhood name="V" label="V">
      <Neighborhood name="f(U)" label="f(U)">
        <Point name="f(x)" label="f(x)">
      </Neighborhood>
    </Neighborhood>
  </Space>
</Row>
<Arrow name="f" label="f">
  <Ref refId="U" />
  <Ref refId="f(U)" />
</Arrow> */}
        <Bluefish width={1000} height={500}>
          <Group x={0} y={0}>
            <Space name="X">
              <Neighborhood name="U">
                <Text name="x" vertical-anchor="start">
                  x
                </Text>
              </Neighborhood>
            </Space>
            <Space name="Y">
              <Neighborhood name="V">
                <Image name="f(U)">
                  <Text name="f(x)" vertical-anchor="start">
                    f(x)
                  </Text>
                </Image>
              </Neighborhood>
            </Space>
            <Align alignment="centerY">
              <Ref select="X" />
              <Ref select="Y" />
            </Align>
            <Distribute direction="horizontal" spacing={50}>
              <Ref select="X" />
              <Ref select="Y" />
            </Distribute>
            <Arrow padEnd={25}>
              <Ref select="U" />
              <Ref select="f(U)" />
            </Arrow>
          </Group>
        </Bluefish>
        <br />
        <Bluefish width={300} height={100}>
          <Group x={0} y={0}>
            <Circle
              name="circle1"
              r={15}
              fill={"#0E2954"}
              stroke-width={2}
              stroke={"#272829"}
            />
            <Circle
              name="circle2"
              r={15}
              fill={"#0E2954"}
              stroke-width={2}
              stroke={"#272829"}
            />
            <Align alignment="centerY">
              <Ref select="circle1" />
              <Ref select="circle2" />
            </Align>
            <Distribute direction="horizontal" spacing={50}>
              <Ref select="circle1" />
              <Ref select="circle2" />
            </Distribute>
            <Background name="background" padding={20}>
              <Ref select="circle1" />
              <Ref select="circle2" />
            </Background>
            {/* <Text id="text">Mercury</Text> */}
            <Rect name="text" width={20} height={10} fill="magenta" />
            <Distribute direction="vertical" spacing={20}>
              <Ref select="background" />
              <Ref select="text" />
            </Distribute>
            <Align alignment="centerX">
              <Ref select="text" />
              <Ref select="background" />
            </Align>
            <Arrow padEnd={10} stroke-width={2}>
              <Ref select="text" />
              <Ref select="circle2" />
            </Arrow>
          </Group>
        </Bluefish>
      </div>
    </>
  );
};

export default App;
