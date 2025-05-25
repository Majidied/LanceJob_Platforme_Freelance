import { useToast } from '@chakra-ui/react';

export default function useNotification() {
  const toast = useToast();
  return ({
    status = 'info',
    title = '',
    description = '',
    duration = 4000,
    position = 'top-right',
  }) => {
    toast({
      status,
      title,
      description,
      duration,
      position,
      isClosable: true,
      variant: 'left-accent',
    });
  };
}
