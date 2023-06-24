// import "solid-devtools";

import { createSignal, type Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import BluefishV2 from "./bluefishv2";
import RectV2 from "./rectv2";
import AlignV2, { Alignment2D } from "./alignv2";
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
        <BluefishV2 id="bluefish3" width={500} height={200}>
          <RectV2
            id="rect1"
            x={x()}
            y={0}
            width={100}
            height={150}
            fill="steelblue"
          />
          <RectV2 id="rect2" width={50} height={50} fill="lightgreen" />
          {/* NOTE: this update to x is ignored b/c the ref resolution already sets the position of AlignV2 */}
          <AlignV2
            id="align"
            /* x={0} */ alignment={alignment() as Alignment2D}
          >
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
          <AlignV2 id="align" alignment={alignment() as Alignment2D}>
            <RefV2 id="ref1" refId="rect1" />
            <RefV2 id="ref2" refId="rect2" />
          </AlignV2>
          <AlignV2 id="align2" alignment={alignment() as Alignment2D}>
            <RefV2 id="ref3" refId="rect2" />
            <RectV2 id="rect3" width={20} height={30} fill="magenta" />
          </AlignV2>
        </BluefishV2>
      </div>
    </>
  );
};

export default App;
