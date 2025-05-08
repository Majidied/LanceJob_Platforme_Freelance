import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  Grid,
  GridItem,
  Container,
} from '@chakra-ui/react';

const EducationExperienceSelector = ({ onAddEducation, onAddExperience }) => {
  const borderColor = useColorModeValue("#95B2C1", "gray.600");
  const textColor = useColorModeValue("#4A7A80", "gray.200");

  return (
    <Box 
      width="100%" 
      height="100%" 
      display="flex" 
      flexDirection="column"
      px={{ base: 4, md: 6 }} 
      py={{ base: 6, md: 8 }}
    >
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="Bold"
        color={textColor}
        textAlign="center"
        mb={{ base: 6, md: 10 }}
        maxW="800px"
        mx="auto"
        fontFamily={"Inria Serif"}
      >
        Summarize your educational background, including degrees, certifications, and
        relevant training. Also outline your professional work history, highlighting experience
        relevant to your freelance services.
      </Text>
      
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
        gap={{ base: 6, md: 8, lg: 12 }}
        flex="1"
        width="100%"
        height="100%"
        alignItems="stretch"
      >
        <GridItem>
          <Button
            onClick={onAddEducation}
            variant="ghost"
            border={`1.5px solid ${borderColor}`}
            borderRadius="20px"
            width="100%"
            height="80%"
            minH={{ base: "180px", md: "240px" }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            boxShadow="none"
            _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
            py={8}
          >
            <Box as="img" src="/EducationIcon.svg" alt="Education Icon" boxSize={{ base: 20, md: 32 }} mb={4} />
          </Button>
        </GridItem>
        
        <GridItem>
          <Button
            onClick={onAddExperience}
            variant="ghost"
            border={`1.5px solid ${borderColor}`}
            borderRadius="20px"
            width="100%"
            height="80%"
            minH={{ base: "180px", md: "240px" }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            boxShadow="none"
            _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
            py={8}
          >
            <Box as="img" src="/ExperienceIcon.svg" alt="Experience Icon" boxSize={{ base: 20, md: 32 }} mb={4} />
          </Button>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default EducationExperienceSelector;