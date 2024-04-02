
import { Show, For } from "solid-js";
import Bluefish from "../bluefish";
import { createName } from "../createName";
import Distribute from "../distribute";
import Group from "../group";
import Rect from "../rect";
import Ref from "../ref";
import { StackH } from "../stackh";
import { StackV } from "../stackv";
import withBluefish from "../withBluefish";
import { SetHorizontalLayout } from "./setWidth";
import Text from "../text";
import Align from "../align";
import * as ohm from "ohm-js";

const myGrammar = ohm.grammar(String.raw`
  Arithmetic {
    Exp
      = AddExp
  
    AddExp
      = AddExp "+" MulExp  -- plus
      | AddExp "-" MulExp  -- minus
      | MulExp
  
    MulExp
      = MulExp "*" PriExp  -- times
      | MulExp "/" PriExp  -- divide
      | PriExp
  
    PriExp
      = "(" Exp ")"  -- paren
      | number
  
    number  (a number)
      = digit+
  }
  `);

const BIG_FONT_STYLE = {
  "font-family": "monospace",
  "font-weight": 500,
  "font-size": 25,
};
const BIG_FONT_CHAR_WIDTH = 60;
const BIG_FONT_SYMBOL_WIDTH = 30;

const LABEL_HEIGHT = 25;
const LABEL_COLOR = "#eee";

const LABEL_COLOR_MAP = {
  Exp: "#b148d2",
  AddExp: "#FFBD27",
  MulExp: "#5cc593",
  PriExp: "#FF6302",
  number: "#00B4D8",
  end: "#EE092D",
};

const LABEL_UNDERLINE_COLOR = "LightGray";
const LABEL_UNDERLINE_HEIGHT = 2;
const LABEL_FONT_STYLE = {
  "font-family": "monospace",
  "font-weight": 300,
  "font-size": 14,
};
const SUB_LABEL_FONT_STYLE = {
  ...LABEL_FONT_STYLE,
  fill: "#777",
  "font-style": "italic",
};

const SPECIAL_LABEL_FONT_STYLE = {
  "font-family": "monospace",
  "font-weight": 300,
  "font-size": 14,
  fill: "green",
};

const Label = withBluefish((props) => {
  const g = createName("g");
  const rect = createName("rect");
  const underline = createName("underline");
  return (
    <Group>
      <Group name={g}>
        <Ref select={props.from} />
        <Show when={props.to}>
          <Ref select={props.to} />
        </Show>
      </Group>

      <Rect
        height={LABEL_HEIGHT}
        name={rect}
        fill={LABEL_COLOR_MAP[props.textOnLabel]}
        opacity={0.5}
      ></Rect>

      <Distribute direction="vertical" spacing={4}>
        <Ref select={props.below} />
        <Ref select={rect} />
      </Distribute>
      <SetHorizontalLayout>
        <Ref select={g} />
        <Ref select={rect} />
      </SetHorizontalLayout>
      <Align alignment="center">
        <Ref select={rect} />
        {props.children}
      </Align>

      <Show when={props.underlined}>
        <Rect
          height={LABEL_UNDERLINE_HEIGHT}
          name={underline}
          fill={LABEL_UNDERLINE_COLOR}
        ></Rect>
        <SetHorizontalLayout>
          <Ref select={g} />
          <Ref select={underline} />
        </SetHorizontalLayout>
        <StackV spacing={-LABEL_UNDERLINE_HEIGHT}>
          <Ref select={rect} />
          <Ref select={underline} />
        </StackV>
      </Show>
    </Group>
  );
});

const LabelText = withBluefish((props) => {
  return (
    <StackH>
      <Text {...LABEL_FONT_STYLE} y={-2}>
        {props.text}
      </Text>
      <Show when={props.note}>
        <Text {...SUB_LABEL_FONT_STYLE} y={-2}>
          {`- ${props.note}`}
        </Text>
      </Show>
    </StackH>
  );
});

const SpecialLabel = withBluefish((props) => {
  const text = createName("text");
  return (
    <Group>
      <Align alignment="centerX">
        <Ref select={props.from} />
        <Text name={text} {...SPECIAL_LABEL_FONT_STYLE}>
          {`"${props.text}"`}
        </Text>
      </Align>
      <Distribute direction="vertical" spacing={4}>
        <Ref select={props.below} />
        <Ref select={text} />
      </Distribute>
    </Group>
  );
});

const Char = withBluefish((props) => {
  return (
    <Align alignment="center">
      <Rect width={props.width}></Rect>
      <Text {...BIG_FONT_STYLE}>{props.children}</Text>
    </Align>
  );
});

const RenderText = withBluefish((props) => {
  const charsStackName = createName("charsStack");
  const lineName = createName("charlineNamesStack");
  return (
    <Group>
      <StackV alignment="left">
        <StackH spacing={4} name={charsStackName}>
          <For each={props.charAndNames}>
            {([char, name]) => (
              <Char name={name} width={BIG_FONT_CHAR_WIDTH}>
                {char}
              </Char>
            )}
          </For>
          <Char name={props.endName} width={BIG_FONT_SYMBOL_WIDTH}></Char>
        </StackH>
        <Rect name={lineName} height={1} fill="gray"></Rect>
      </StackV>
      <SetHorizontalLayout>
        <Ref select={charsStackName} />
        <Ref select={lineName} />
      </SetHorizontalLayout>
    </Group>
  );
});
const RenderNode = withBluefish((props) => {
  const {
    charNames,
    offset,
    matchLength,
    text,
    parentName,
    ruleName,
    underlined,
  } = props;
  const myName = createName("myName");

  console.log(ruleName, text);
  return ruleName ? (
    <Label
      name={myName}
      from={charNames[offset]}
      to={charNames[offset + matchLength - 1]}
      below={parentName}
      underlined={underlined}
      textOnLabel={ruleName.split("_")[0]}
      note={ruleName.split("_")[1]}
    >
      <LabelText text={ruleName.split("_")[0]} note={ruleName.split("_")[1]} />
    </Label>
  ) : (
    <SpecialLabel
      below={parentName}
      from={charNames[offset]}
      to={charNames[offset + matchLength - 1]}
      text={text.substring(offset, offset + matchLength)}
    />
  );
});

const RenderTrace = withBluefish((props) => {
  const { trace, offset, text, charNames, parentName } = props;

  const traceName = createName("traceName");

  if ("children" in trace) {
    const children = trace.children.filter(
      (childTrace) => childTrace.ctorName !== "_iter"
    );
    return (
      <Group>
        <RenderNode
          name={traceName}
          text={text}
          charNames={charNames}
          parentName={parentName}
          offset={offset}
          matchLength={trace.matchLength}
          ruleName={trace.ruleName}
          underlined={children.length === 0}
        />
        <For each={children}>
          {(childTrace, i) => (
            <RenderTrace
              trace={childTrace}
              offset={offset + trace.childOffsets[i()]}
              text={text}
              charNames={charNames}
              parentName={traceName}
            />
          )}
        </For>
      </Group>
    );
  } else {
    return (
      <RenderNode
        text={text}
        charNames={charNames}
        parentName={parentName}
        offset={offset}
        matchLength={trace.matchLength}
        ruleName={trace.ruleName}
      />
    );
  }
});

// TODO: synced text box
// TODO: check if parse succeeds
// TODO:
//  - format RenderText chars differently if they are a symbol or char
//  - OR (prob better): set with of chars based on the tree node's contents width

export const OhmParser = () => {
  const text = "3+(4*5)";
  const charAndNames = text.split("").map((char) => [char, createName(char)]);
  const charNames = charAndNames.map(([c, n]) => n);
  const endName = createName("end");

  const traces = myGrammar.trace(text).bindings;
  console.log(1, traces);
  return (
    <Bluefish x={0} y={0}>
      <RenderText name="top" charAndNames={charAndNames} endName={endName} />
      <RenderTrace
        trace={traces[0]}
        offset={0}
        text={text}
        charNames={charNames}
        parentName="top"
      />
      <Label from={endName} below="top" textOnLabel="end">
        <LabelText text="end" />
      </Label>
      {/* <RenderNode
          text={text}
          charNames={charAndNames.map(([c, n]) => n)}
          parentName="top"
          offset={0}
          matchLength={3}
          ruleName="hello"
        />
        <RenderNode
          text={text}
          charNames={charAndNames.map(([c, n]) => n)}
          parentName="top"
          offset={4}
          matchLength={1}
        /> */}
      {/* <StackV name="stack" alignment="left">
          <StackH name="chars" spacing={4}>
            <Char name="0" width={BIG_FONT_CHAR_WIDTH}>
              3
            </Char>
            <Char name="1" width={BIG_FONT_SYMBOL_WIDTH}>
              +
            </Char>
            <Char name="2" width={BIG_FONT_SYMBOL_WIDTH}>
              (
            </Char>
            <Char name="3" width={BIG_FONT_CHAR_WIDTH}>
              4
            </Char>
            <Char name="4" width={BIG_FONT_SYMBOL_WIDTH}>
              *
            </Char>
            <Char name="5" width={BIG_FONT_CHAR_WIDTH}>
              5
            </Char>
            <Char name="6" width={BIG_FONT_SYMBOL_WIDTH}>
              )
            </Char>
            <Char name="7" width={BIG_FONT_SYMBOL_WIDTH}></Char>
          </StackH>
          <Rect name="line" height={1} fill="gray"></Rect>
        </StackV>
        <SetHorizontalLayout>
          <Ref select="chars" />
          <Ref select="line" />
        </SetHorizontalLayout>
  
        <Label name="t1" from="0" to="6" below="stack">
          <LabelText text="Exp" />
        </Label>
        <Label name="t2" from="7" below="stack">
          <LabelText text="end" />
        </Label>
  
        <Label name="t11" from="0" to="6" below="t1">
          <LabelText text="AddExp" />
        </Label>
  
        <Label name="t111" from="0" to="6" below="t11">
          <LabelText text="AddExp" note="plus" />
        </Label>
  
        <Label name="t1111" from="0" below="t111">
          <LabelText text="AddExp" />
        </Label>
        <SpecialLabel below="t111" from="1" text="+" />
        <Label name="t1113" from="2" to="6" below="t111">
          <LabelText text="MulExp" />
        </Label>
  
        <Label name="t11111" from="0" below="t1111">
          <LabelText text="MulExp" />
        </Label>
        <Label name="t11112" from="2" to="6" below="t1111">
          <LabelText text="PriExp" />
        </Label>
  
        <Label name="t111111" from="0" below="t11111" underlined>
          <LabelText text="number" />
        </Label>
        <Label name="t111112" from="2" to="6" below="t11111">
          <LabelText text="PriExp" note="paren" />
        </Label>
  
        <SpecialLabel below="t111111" from="2" text="(" />
        <Label name="t1111112" from="3" to="5" below="t111111">
          <LabelText text="Exp" />
        </Label>
        <SpecialLabel below="t111111" from="6" text=")" />
  
        <Label name="t11111111" from="3" to="5" below="t1111112">
          <LabelText text="AddExp" />
        </Label>
  
        <Label name="t111111111" from="3" to="5" below="t11111111">
          <LabelText text="MulExp" />
        </Label>
  
        <Label name="t1111111111" from="3" to="5" below="t111111111">
          <LabelText text="MulExp" note="times" />
        </Label>
  
        <Label name="t11111111111" from="3" below="t1111111111">
          <LabelText text="MulExp" />
        </Label>
        <SpecialLabel below="t1111111111" from="4" text="*" />
        <Label name="t11111111113" from="5" below="t1111111111">
          <LabelText text="PriExp" />
        </Label>
  
        <Label name="t11111111111" from="5" below="t1111111111">
          <LabelText text="PriExp" />
        </Label>
  
        <Label name="t111111111111" from="3" below="t11111111113">
          <LabelText text="PriExp" />
        </Label>
        <Label name="t111111111112" from="5" below="t11111111113" underlined>
          <LabelText text="number" />
        </Label>
        <Label name="t1111111111111" from="3" below="t111111111111" underlined>
          <LabelText text="number" />
        </Label> */}
    </Bluefish>
  );
};
