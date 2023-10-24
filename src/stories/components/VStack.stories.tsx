import type { Meta, StoryObj } from "storybook-solidjs";
import { VStack } from "../../vstack";
import { Bluefish } from "../../bluefish";
import Rect from "../../rect";

/**
 * Bluefish's `VStack` component places its children into one vertical stack, through defining either the spacing between each item or total height that the vstack should occupy.
 *
 * Options for alignment of the children are: `left`, `centerX`, and `right`.
 */
const meta: Meta<typeof VStack> = {
  title: "Components/VStack",
  component: VStack,
  tags: ["autodocs"],
  argTypes: {
    alignment: { control: "radio", options: ["left", "centerX", "right"] },
  },
};

export default meta;
type Story = StoryObj<typeof VStack>;

export const DefinedSpacing: Story = {
  args: {
    spacing: 20,
    alignment: "centerX",
  },
  render: (props) => {
    return (
      <Bluefish>
        <VStack {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </VStack>
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
