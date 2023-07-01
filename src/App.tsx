// import "solid-devtools";

import { createSignal, type Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import Bluefish from "./bluefish";
import Rect from "./rect";
import Align, { Alignment2D } from "./align";
import Distribute from "./distribute";
import Ref from "./ref";
import Group from "./group";
import { AlignmentVertical, AlignmentHorizontal } from "./align";
import { StackSlot } from "./python-tutor/stack-slot";
import GlobalFrame from "./python-tutor/global-frame";

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
        <Bluefish id="bluefish-globalframetest" width={1000} height={200}>
          <GlobalFrame id={`globalFrame`} variables={[0, 1, 2]} />
        </Bluefish>
        <Bluefish id="bluefish-variable" width={1000} height={200}>
          <Distribute id={`distribute`} direction="vertical" spacing={20}>
            <StackSlot />
            <StackSlot />
            <StackSlot />
          </Distribute>
          {/* <Group id={`group`}>
            <Rect id={`box`} y={0} height={40} width={40} fill={"#e2ebf6"} />
            <Rect id={`name`} x={0} width={10} height={10} fill="magenta" />
            <Align id={`alignRow`} alignment="centerY">
              <Ref id={`alignrowRef1`} refId={`name`} />
              <Ref id={`alignrowRef2`} refId={`box`} />
            </Align>
            <Distribute id={`distribute`} direction="horizontal" spacing={5}>
              <Ref id={`rowRef1`} refId={`name`} />
              <Ref id={`rowRef2`} refId={`box`} />
            </Distribute>
            <Align id={`align1`} alignment="bottomCenter">
              <Rect
                id={`boxBorderBottom`}
                height={2}
                width={40}
                fill={"#a6b3b6"}
              />
              <Ref id={`ref2`} refId={`box`} />
            </Align>
            <Align id={`align2`} alignment="centerLeft">
              <Rect
                id={`boxBorderLeft`}
                height={40}
                width={2}
                fill={"#a6b3b6"}
              />
              <Ref id={`ref4`} refId={`box`} />
            </Align>
            <Align id={`align3`} alignment="center">
              <Rect id={`valueName`} width={10} height={10} fill="green" />
              <Ref id={`ref6`} refId={`box`} />
            </Align>
          </Group> */}
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
      </div>
    </>
  );
};

export default App;
