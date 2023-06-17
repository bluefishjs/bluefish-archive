import { createSignal, type Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import Bluefish from "./bluefish";
import Rect from "./rect";
import Align from "./align";
import Ref from "./ref";

const App: Component = () => {
  const [x, setX] = createSignal(0);
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
      <div>
        {/* <svg width={1000} height={1000}>
          <rect x={x()} y={0} width={10} height={10} fill="lightblue" />
        </svg> */}
        <Bluefish id="bluefish" width={1000} height={200}>
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
        </Bluefish>
        <Bluefish id={"ref-test"} width={1000} height={200}>
          <Align id="align1" alignment={"right"} x={0} y={0}>
            <Rect
              id="innerRect11"
              x={32}
              y={45}
              width={100}
              height={150}
              fill="steelblue"
            />
            <Rect id="innerRect21" width={50} height={50} fill="lightgreen" />
          </Align>
          {/* <Align id="align2" alignment="top"> */}
          {/* <Ref id="ref1" refId="innerRect11" />
            <Ref id="ref2" refId="innerRect21" /> */}
          {/* </Align> */}
          {/* <Align id="align3" alignment="center">
            <Ref id="ref3" refId="innerRect21" />
            <Rect id="innerRect31" width={20} height={30} fill="magenta" />
          </Align> */}
        </Bluefish>
      </div>
    </>
  );
};

export default App;
