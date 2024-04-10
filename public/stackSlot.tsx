import {
  Group,
  Rect,
  createName,
  withBluefish,
  Text,
  Ref,
  Distribute,
  Align,
} from "../src";
import { Pointer } from "../src/python-tutor/types";
import colors from "tailwindcss/colors";

export type StackSlotProps = {
  variable: string;
  value: string | Pointer;
};

export const StackSlot = withBluefish((props: StackSlotProps) => {
  const fontFamily = "verdana, arial, helvetica, sans-serif";

  const boxName = createName("box");
  const nameName = createName("name");
  const valueName = createName("value");

  return (
    <Group>
      <Rect
        name={boxName}
        y={0}
        height={40}
        width={40}
        fill={colors.blue[200]}
      />
      <Text
        name={nameName}
        font-size={"24px"}
        font-family={fontFamily}
        fill={colors.sky[700]}
      >
        {props.variable}
      </Text>
      <Align alignment="centerY">
        <Ref select={nameName} />
        <Ref select={boxName} />
      </Align>
      <Distribute direction="horizontal" spacing={5}>
        <Ref select={nameName} />
        <Ref select={boxName} />
      </Distribute>
      <Align alignment="bottomCenter">
        <Rect height={2} width={40} fill={colors.neutral[400]} />
        <Ref select={boxName} />
      </Align>
      <Align alignment="centerLeft">
        <Rect height={40} width={2} fill={colors.neutral[400]} />
        <Ref select={boxName} />
      </Align>

      {typeof props.value === "string" ? (
        <Align alignment="center">
          <Text
            y={-2}
            name={valueName}
            font-size="24px"
            font-family={fontFamily}
            fill={colors.sky[700]}
          >
            {props.value}
          </Text>
          <Ref select={boxName} />
        </Align>
      ) : (
        <Align alignment="center">
          <Text name={valueName} font-size="24px" font-family={fontFamily}>
            {""}
          </Text>
          <Ref select={boxName} />
        </Align>
      )}
    </Group>
  );
});
