import React, { useState } from 'react';
import {
  Box,
  Text,
  Input,
  Textarea,
  Flex,
  Button,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';

const AddEducationForm = ({ onSave, onCancel, initialData = {} }) => {
  const [school, setSchool] = useState(initialData.school || '');
  const [degree, setDegree] = useState(initialData.degree || '');
  const [field, setField] = useState(initialData.field || '');
  const [from, setFrom] = useState(initialData.from || '');
  const [to, setTo] = useState(initialData.to || '');
  const [description, setDescription] = useState(initialData.description || '');

  const borderColor = useColorModeValue("#95B2C1", "gray.400");
  const bgColor = useColorModeValue("#eaf4f6", "gray.700");
  const labelColor = useColorModeValue("#4A7A80", "gray.200");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave && onSave({ school, degree, field, from, to, description });
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      p={2}
      width="100%"
      maxW="600px"
      mx="auto"
    >
      <Text
        fontSize="3xl"
        fontWeight="normal"
        color="#4A7A80"
        textAlign="center"
        mb={2}
        fontFamily="Inria Serif"
      >
        Add Education
      </Text>
      <Divider borderColor={borderColor} mb={6} />
      <form onSubmit={handleSubmit}>
        <Box mb={4}>
          <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
            School *
          </Text>
          <Input
            value={school}
            onChange={e => setSchool(e.target.value)}
            borderRadius="lg"
            borderColor={borderColor}
            bg="whiteAlpha.700"
            size="lg"
            required
          />
        </Box>
        <Box mb={4}>
          <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
            Degree
          </Text>
          <Input
            value={degree}
            onChange={e => setDegree(e.target.value)}
            borderRadius="lg"
            borderColor={borderColor}
            bg="whiteAlpha.700"
            size="lg"
          />
        </Box>
        <Box mb={4}>
          <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
            Field of Study
          </Text>
          <Input
            value={field}
            onChange={e => setField(e.target.value)}
            borderRadius="lg"
            borderColor={borderColor}
            bg="whiteAlpha.700"
            size="lg"
          />
        </Box>
        <Box mb={4}>
          <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
            Date Attended
          </Text>
          <Flex gap={4}>
            <Input
              placeholder="From"
              value={from}
              onChange={e => setFrom(e.target.value)}
              borderRadius="lg"
              borderColor={borderColor}
              bg="whiteAlpha.700"
              size="lg"
              flex="1"
            />
            <Input
              placeholder="To"
              value={to}
              onChange={e => setTo(e.target.value)}
              borderRadius="lg"
              borderColor={borderColor}
              bg="whiteAlpha.700"
              size="lg"
              flex="1"
            />
          </Flex>
        </Box>
        <Box mb={6}>
          <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
            Description
          </Text>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            borderRadius="lg"
            borderColor={borderColor}
            bg="whiteAlpha.700"
            size="lg"
            minH="80px"
          />
        </Box>
        <Flex justify="flex-end" gap={4}>
          <Button onClick={onCancel} variant="ghost" color={labelColor}>
            Cancel
          </Button>
          <Button type="submit" bg="#95B2C1" color="white" borderRadius="md" _hover={{ bg: "#7fa2b0" }}>
            Save
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

export default AddEducationForm;