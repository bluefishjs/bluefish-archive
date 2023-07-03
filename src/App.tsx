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
