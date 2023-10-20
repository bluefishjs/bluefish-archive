import type { Meta, StoryObj } from "storybook-solidjs";
import { Row } from "../../row";
import { Bluefish } from "../../bluefish";
import Rect from "../../rect";

/**
 * Bluefish's `Row` component places its children into one row, through defining either the spacing between each item or total width (not yet working?) that the row should occupy.
 *
 * Options for alignment of the children are: `top`, `centerY`, and `bottom`.
 */
const meta: Meta<typeof Row> = {
  title: "Components/Row",
  component: Row,
  tags: ["autodocs"],
  argTypes: {
    alignment: { control: "radio", options: ["top", "centerY", "bottom"] },
  },
};

export default meta;
type Story = StoryObj<typeof Row>;

export const DefinedSpacing: Story = {
  args: {
    spacing: 20,
    alignment: "centerY",
  },
  render: (props) => {
    return (
      <Bluefish>
        <Row {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </Row>
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
