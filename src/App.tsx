// import "solid-devtools";

import { createSignal, type Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import Bluefish from "./bluefish";
import Rect from "./rect";
import Align, {
  AlignmentVertical,
  AlignmentHorizontal,
  Alignment2D,
} from "./align";
import Ref from "./ref";
import BluefishV2 from "./bluefishv2";
import RectV2 from "./rectv2";
import AlignV2 from "./alignv2";
import AlignV2Simple from "./alignv2simple";
import RefV2 from "./refv2";

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
        <BluefishV2 id="bluefish" width={1000} height={200}>
          <RectV2
            id="rect"
            x={x()}
            y={45}
            width={100}
            height={150}
            fill="steelblue"
          />
        </BluefishV2>
        <BluefishV2 id="bluefish2" width={500} height={500}>
          <AlignV2
            id="align"
            alignment={alignment() as Alignment2D}
            x={x()}
            y={0}
          >
            <RectV2 id="rect1" width={100} height={150} fill="steelblue" />
            <RectV2 id="rect2" width={50} height={50} fill="lightgreen" />
          </AlignV2>
        </BluefishV2>
        <BluefishV2 id="bluefish3" width={500} height={500}>
          <RectV2
            id="rect1"
            x={x()}
            y={0}
            width={100}
            height={150}
            fill="steelblue"
          />
          <RectV2 id="rect2" width={50} height={50} fill="lightgreen" />
          {/* TODO: I should get an error when trying to set x or y values on this... */}
          <AlignV2 id="align" alignment={alignment() as Alignment2D}>
            <RefV2 id="ref1" refId="rect1" />
            <RefV2 id="ref2" refId="rect2" />
          </AlignV2>
        </BluefishV2>
        <BluefishV2 id="bluefish4" width={500} height={500}>
          <RectV2
            id="rect1"
            x={x()}
            y={0}
            width={100}
            height={150}
            fill="steelblue"
          />
          <RectV2 id="rect2" width={50} height={50} fill="lightgreen" />
          {/* TODO: I should get an error when trying to set x or y values on this... */}
          <AlignV2 id="align" alignment={alignment() as Alignment2D}>
            <RefV2 id="ref1" refId="rect1" />
            <RefV2 id="ref2" refId="rect2" />
          </AlignV2>
          <AlignV2 id="align2" alignment={alignment() as Alignment2D}>
            <RefV2 id="ref3" refId="rect2" />
            <RectV2 id="rect3" width={20} height={30} fill="magenta" />
          </AlignV2>
        </BluefishV2>
        {/* <Bluefish id="bluefish" width={1000} height={200}>
          <Rect
            id="rect"
            x={32}
            y={45}
            width={100}
            height={150}
            fill="steelblue"
          />
        </Bluefish>
        <Bluefish id="bluefish2" width={500} height={500}>
          <Align id="align" alignment="center" x={x()} y={0}>
            <Rect id="rect1" width={100} height={150} fill="steelblue" />
            <Rect id="rect2" width={50} height={50} fill="lightgreen" />
          </Align>
        </Bluefish> */}
        {/* <Bluefish id={"ref-test"} width={1000} height={200}>
          <Rect
            id="innerRect11"
            x={32}
            y={45}
            width={100}
            height={150}
            fill="steelblue"
          />
          <Rect
            id="innerRect21"
            x={20}
            width={50}
            height={50}
            fill="lightgreen"
          />
          <Align
            id="align1"
            alignment={horizontalAlignment() as AlignmentHorizontal}
            x={0}
            y={0}
          >
            <Ref id="ref11" refId="innerRect11" />
            <Ref id="ref21" refId="innerRect21" />
          </Align>
          <Align
            id="align2"
            alignment={verticalAlignment() as AlignmentVertical}
          >
            <Ref id="ref1" refId="innerRect11" />
            <Ref id="ref2" refId="innerRect21" />
          </Align>
        </Bluefish> */}
        {/* <Bluefish id={"ref-test"} width={1000} height={200}>
          <Rect
            id="innerRect11"
            x={32}
            y={45}
            width={100}
            height={150}
            fill="steelblue"
          />
          <Rect
            id="innerRect21"
            x={20}
            width={50}
            height={50}
            fill="lightgreen"
          /> */}
        {/* <Align
            id="align1"
            alignment={horizontalAlignment() as AlignmentHorizontal}
            x={0}
            y={0}
          >
            <Ref id="ref11" refId="innerRect11" />
            <Ref id="ref21" refId="innerRect21" />
          </Align>
          <Align
            id="align2"
            alignment={verticalAlignment() as AlignmentVertical}
          >
            <Ref id="ref1" refId="innerRect11" />
            <Ref id="ref2" refId="innerRect21" />
          </Align> */}
        {/* <Align x={0} y={0} id="align1" alignment="center">
            <Ref id="ref11" refId="innerRect11" />
            <Ref id="ref21" refId="innerRect21" />
          </Align> */}
        {/* TODO: uncommenting this causes another infinite loop. this time the translate seems to accumulate forever... */}
        {/* TODO: now it seems like the scenegraph doesn't change but it updates anyway. in any case, innerRect31's bbox is not getting set fully. only one axis shows up. */}
        {/* <Align id="align3" alignment="topRight">
            <Ref id="ref3" refId="innerRect21" />
            <Rect id="innerRect31" width={20} height={30} fill="magenta" />
          </Align> */}
        {/* </Bluefish> */}
      </div>
    </>
  );
};

export default App;
