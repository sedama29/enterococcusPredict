import React from 'react';
import { VictoryContainer } from 'victory-native';
import Svg, { Rect } from 'react-native-svg';
export const chartPadding = { top: 10, bottom: 50, left: 50, right: 50 };

const CustomBackground = ({ children, ...props }) => {
  const yScale = props.scale.y;

  const plotAreaTop = yScale(150); // Adjust this according to your maximum y value
  const plotAreaBottom = yScale(0);

  const plotAreaTop_2 = yScale(300);
  const yYellow = yScale(104);
  const yGreen = yScale(35);
  const yRed = yScale(104); // Start red color from 104

  const heightLightYellow = yGreen - yYellow;
  const heightLightGreen = plotAreaBottom - yGreen;
  const heightLightCoral = plotAreaTop_2 - yRed; // Adjusted height calculation to extend red for all values > 104

  return (
    <VictoryContainer {...props}>
      <Svg style={{ position: 'absolute', top: 0, left: 0 }}>
        <Rect x={chartPadding.left} y={yYellow} width={props.width - chartPadding.left - chartPadding.right} height={heightLightYellow} fill="#FFFFE5" />
        <Rect x={chartPadding.left} y={yGreen} width={props.width - chartPadding.left - chartPadding.right} height={heightLightGreen} fill="#E5FFE5" />
        <Rect x={chartPadding.left} y={yRed} width={props.width - chartPadding.left - chartPadding.right} height={heightLightCoral} fill="#FFE5E5" />
      </Svg>
      {children}
    </VictoryContainer>
  );
};

export default CustomBackground;
