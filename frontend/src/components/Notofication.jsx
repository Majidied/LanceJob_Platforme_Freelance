import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Box, Button, useDisclosure } from '@chakra-ui/react';

/**
 * Floatable notification component using Chakra UI.
 * Props:
 *   status: 'success' | 'error' | 'info' | 'warning'
 *   title: string
 *   description: string
 *   position: CSS position (default: 'fixed')
 *   top, right, left, bottom: CSS values for placement
 */
export default function FloatNotification({
  status = 'success',
  title = 'Success!',
  description = 'Your action was successful.',
  position = 'fixed',
  top = '2rem',
  right = '2rem',
  ...rest
}) {
  const { isOpen, onClose, onOpen } = useDisclosure({ defaultIsOpen: true });

  return (
    <>
      {isOpen && (
        <Alert
          status={status}
          variant="left-accent"
          boxShadow="lg"
          borderRadius="md"
          position={position}
          top={top}
          right={right}
          zIndex={1400}
          minW="320px"
          {...rest}
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription display="block">{description}</AlertDescription>
          </Box>
          <CloseButton
            alignSelf="flex-start"
            position="relative"
            right={-1}
            top={-1}
            onClick={onClose}
          />
        </Alert>
      )}
      {!isOpen && (
        <Button
          position={position}
          top={top}
          right={right}
          zIndex={1400}
          colorScheme={status}
          onClick={onOpen}
        >
          Show Notification
        </Button>
      )}
    </>
  );
}