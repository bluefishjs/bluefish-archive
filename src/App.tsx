import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import Bluefish from "./bluefish";
import Rect from "./rect";

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
    </div>
  );
};

export default App;
