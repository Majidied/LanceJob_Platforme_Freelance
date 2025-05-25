import { Button, Box, Flex } from '@chakra-ui/react';
import BounceLoader from 'react-spinners/BounceLoader';

/**
 * Custom round button component.
 * Props:
 *   - title: string (button text)
 *   - isDisabled: boolean
 *   - isLoading: boolean
 *   - onClick: function
 *   - type: string ('button' | 'submit' | 'reset')
 *   - ...rest: other Chakra Button props
 */
export default function RoundButton({
    title,
    isDisabled = false,
    isLoading = false,
    onClick,
    type = 'button',
    size = 'md',
    width = '200px',
    ...rest
}) {
    // Size mappings for different button sizes
    const sizeMap = {
        sm: {
            height: '36px',
            fontSize: 'sm',
            px: 6,
            spinnerSize: 'sm',
        },
        md: {
            height: '44px',
            fontSize: 'md',
            px: 8,
            spinnerSize: 'md',
        },
        lg: {
            height: '52px',
            fontSize: 'lg',
            px: 10,
            spinnerSize: 'md',
        }
    };

    const currentSize = sizeMap[size] || sizeMap.md;

    return (
        <Box position="relative" width={width} mx="auto">
        <Button
            bg="#33647E"
            color="white"
            borderRadius="full"
            fontWeight="500"
            width="100%"
            height={currentSize.height}
            fontSize={currentSize.fontSize}
            px={currentSize.px}
            transition="all 0.2s ease"
            _hover={{ bg: "#2A5269", transform: "translateY(-1px)", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
            _active={{ bg: "#24495A", transform: "translateY(0)" }}
            _disabled={{ 
                bg: "#A4B2B3", 
                cursor: "not-allowed",
                _hover: { transform: "none", boxShadow: "none" }
            }}
            isDisabled={isDisabled || isLoading}
            onClick={onClick}
            type={type}
            {...rest}
        >
            <Flex align="center" justify="center" width="100%">
                {!isLoading && title}
                {isLoading && (
                    <BounceLoader
                    color="#ffffff"
                    loading={isLoading}
                    size={10}
                />
                )}
            </Flex>
        </Button>
    </Box>
    );
}