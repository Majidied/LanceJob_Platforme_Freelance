import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

/**
 * ProgressLine - A customizable progress line component for steppers
 * 
 * @param {Object} props
 * @param {number} props.activeStep - Current active step (0-based index)
 * @param {number} props.steps - Total number of steps
 * @param {string} props.activeColor - Color for the active portion of the line
 * @param {string} props.inactiveColor - Color for the inactive portion of the line
 * @param {string} props.height - Height of the progress line
 * @param {boolean} props.showStepIndicators - Whether to show step indicators
 * @param {string} props.indicatorSize - Size of step indicators
 * @param {string} props.indicatorActiveColor - Color for active step indicators
 * @param {string} props.indicatorInactiveColor - Color for inactive step indicators
 */
const ProgressLine = ({
  activeStep = 0,
  steps = 4,
  activeColor = "#3182ce",
  inactiveColor = "#E2E8F0",
  height = "4px",
  showStepIndicators = true,
  indicatorSize = "10px",
  indicatorActiveColor = "#3182ce",
}) => {
  // Calculate progress percentage
  const progressPercent = ((activeStep) / (steps - 1)) * 100;
  
  return (
    <Box position="relative" width="100%" mt={4} mb={4}>
      {/* Base line (inactive) */}
      <Box
        width="100%"
        height={height}
        bg={inactiveColor}
        borderRadius="full"
      />
      
      {/* Progress line (active) */}
      <Box
        position="absolute"
        top="0"
        left="0"
        height={height}
        width={`${progressPercent}%`}
        bg={activeColor}
        borderRadius="full"
        transition="width 0.3s ease-in-out"
      />
      
      {/* Step indicators */}
      {showStepIndicators && (
        <Flex 
          justifyContent="space-between" 
          mt={`calc(-${indicatorSize} / 2 + ${height} / 2)`}
        >
          {Array.from({ length: steps }).map((_, index) => (
            <Box 
              key={index} 
              position="relative"
              width={indicatorSize}
              height={indicatorSize}
              borderRadius="full"
              bg={index <= activeStep ? indicatorActiveColor : "white"}
              border="2px solid"
              borderColor={index <= activeStep ? indicatorActiveColor : inactiveColor}
              zIndex="1"
            />
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default ProgressLine;
