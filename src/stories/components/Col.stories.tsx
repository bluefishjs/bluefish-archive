import type { Meta, StoryObj } from "storybook-solidjs";
import { Col } from "../../col";
import { Bluefish } from "../../bluefish";
import Rect from "../../rect";

/**
 * Bluefish's `Col` component places its children into one column, through defining either the spacing between each item or total height that the column should occupy.
 *
 * Options for alignment of the children are: `left`, `centerX`, and `right`.
 */
const meta: Meta<typeof Col> = {
  title: "Components/Col",
  component: Col,
  tags: ["autodocs"],
  argTypes: {
    alignment: { control: "radio", options: ["left", "centerX", "right"] },
  },
};

export default meta;
type Story = StoryObj<typeof Col>;

export const DefinedSpacing: Story = {
  args: {
    spacing: 20,
    alignment: "centerX",
  },
  render: (props) => {
    return (
      <Bluefish>
        <Col {...props}>
          <Rect width={30} height={30} />
          <Rect width={20} height={20} />
          <Rect width={50} height={50} />
        </Col>
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
