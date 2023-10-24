import type { Meta, StoryObj } from "storybook-solidjs";
import { HStack } from "../../hstack";
import { Bluefish } from "../../bluefish";
import Rect from "../../rect";

/**
 * Bluefish's `HStack` component places its children into one horizontal stack, through defining either the spacing between each item or total width (not yet working?) that the hstack should occupy.
 *
 * Options for alignment of the children are: `top`, `centerY`, and `bottom`.
 */
const meta: Meta<typeof HStack> = {
  title: "Components/HStack",
  component: HStack,
  tags: ["autodocs"],
  argTypes: {
    alignment: { control: "radio", options: ["top", "centerY", "bottom"] },
  },
};

export default meta;
type Story = StoryObj<typeof HStack>;

export const DefinedSpacing: Story = {
  args: {
    spacing: 20,
    alignment: "centerY",
  },
  render: (props) => {
    return (
      <Bluefish>
        <HStack {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </HStack>
      </Bluefish>
    );
  },
};

// export const TotalSpacing: Story = {
//   args: {
//     total: 80,
//     alignment: "centerY",
//   },
//   render: (props) => {
//     return (
//       <Bluefish width={600} height={100}>
//         <Row {...props}>
//           <Rect width={30} height={30} />
//           <Rect width={20} height={20} />
//           <Rect width={50} height={50} />
//         </Row>
//       </Bluefish>
//     );
//   },
// };
