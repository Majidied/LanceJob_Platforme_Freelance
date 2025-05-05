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
  Select,
} from '@chakra-ui/react';

const COUNTRIES = [
  "Morocco", "United States", "France", "Germany", "United Kingdom", "Canada", "India", "China", "Japan", "Brazil", "Other"
];

const AddExperienceForm = ({ onSave, onCancel, initialData = {} }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [company, setCompany] = useState(initialData.company || '');
  const [city, setCity] = useState(initialData.city || '');
  const [country, setCountry] = useState(initialData.country || '');
  const [from, setFrom] = useState(initialData.from || '');
  const [to, setTo] = useState(initialData.to || '');
  const [description, setDescription] = useState(initialData.description || '');

  const borderColor = useColorModeValue("#95B2C1", "gray.400");
  const bgColor = useColorModeValue("#eaf4f6", "gray.700");
  const labelColor = useColorModeValue("#4A7A80", "gray.200");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave && onSave({ title, company, city, country, from, to, description });
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
        Add Work Experience
      </Text>
      <Divider borderColor={borderColor} mb={6} />
      <form onSubmit={handleSubmit}>
        <Box mb={4}>
          <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
            Title *
          </Text>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            borderRadius="lg"
            borderColor={borderColor}
            bg="whiteAlpha.700"
            size="lg"
            required
          />
        </Box>
        <Box mb={4}>
          <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
            Company *
          </Text>
          <Input
            value={company}
            onChange={e => setCompany(e.target.value)}
            borderRadius="lg"
            borderColor={borderColor}
            bg="whiteAlpha.700"
            size="lg"
            required
          />
        </Box>
        <Box mb={4}>
          <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
            Location
          </Text>
          <Flex gap={4}>
            <Input
              placeholder="Ex: Khouribga"
              value={city}
              onChange={e => setCity(e.target.value)}
              borderRadius="lg"
              borderColor={borderColor}
              bg="whiteAlpha.700"
              size="lg"
              flex="1"
            />
            <Select
              placeholder="Country"
              value={country}
              onChange={e => setCountry(e.target.value)}
              borderRadius="lg"
              borderColor={borderColor}
              bg="whiteAlpha.700"
              size="lg"
              flex="1"
            >
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Flex>
        </Box>
        <Box mb={4}>
          <Flex gap={4}>
            <Box flex="1">
              <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
                Start Date *
              </Text>
              <Input
                placeholder="From"
                value={from}
                onChange={e => setFrom(e.target.value)}
                borderRadius="lg"
                borderColor={borderColor}
                bg="whiteAlpha.700"
                size="lg"
                required
              />
            </Box>
            <Box flex="1">
              <Text color={labelColor} fontWeight="normal" mb={1} fontSize="lg">
                End Date *
              </Text>
              <Input
                placeholder="To"
                value={to}
                onChange={e => setTo(e.target.value)}
                borderRadius="lg"
                borderColor={borderColor}
                bg="whiteAlpha.700"
                size="lg"
                required
              />
            </Box>
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

export default AddExperienceForm;