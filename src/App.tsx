import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import Bluefish from "./bluefish";
import Rect from "./rect";
import Align from "./align";

const App: Component = () => {
  return (
    <div>
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
        <Align id="align" alignment="center" x={0} y={0}>
          <Rect id="rect1" width={100} height={150} fill="steelblue" />
          <Rect id="rect2" width={50} height={50} fill="lightgreen" />
        </Align>
      </Bluefish>
    </div>
  );
};

export default App;
