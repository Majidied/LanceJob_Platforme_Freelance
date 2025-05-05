import React, { useState } from 'react';
import {
    Box,
    Text,
    Input,
    Textarea,
    Flex,
    Select,
    Button,
    RadioGroup,
    Radio,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    Container,
    Grid,
    GridItem,
    Stack
} from '@chakra-ui/react';

const LANGUAGE_LEVELS = [
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" }
];

const LANGUAGES = [
    "English", "French", "German", "Spanish", "Italian", "Chinese", "Japanese", "Arabic", "Russian", "Hindi"
];

const BioAndLanguages = ({ title, setTitle, bio, setBio, languages, setLanguages }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('Beginner');

    const borderColor = "#95B2C1";
    const buttonBg = "#95B2C1";
    const buttonHoverBg = "#7fa2b0";
    const headingColor = "#7fa2b0";

    const handleAddLanguage = () => {
        if (
            selectedLanguage &&
            selectedLevel &&
            !languages.some(l => l.language === selectedLanguage)
        ) {
            setLanguages([...languages, { language: selectedLanguage, level: selectedLevel }]);
            setSelectedLanguage('');
            setSelectedLevel('Beginner');
        }
    };

    const handleRemoveLanguage = (language) => {
        setLanguages(languages.filter(l => l.language !== language));
    };

    return (
        <Container maxW="container.xl" p={2} >
            <Box width="100%" mb={8}>
                <Text fontSize="lg" fontWeight="Bold" mb={4} fontFamily={"Inria Serif"}>
                    Craft a clear professional title and a brief bio showcasing your expertise, approach, and unique value.
                </Text>
                
                {/* Title and Bio Section */}
                <Grid 
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                    gap={6} 
                    mb={8}
                >
                    <GridItem>
                        <Text fontWeight="semibold" color="gray.500" mb={2} fontSize="sm">
                            * Your title: the first impression of your expertise.
                        </Text>
                        <Input
                            placeholder="Add Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            borderColor={borderColor}
                            borderRadius="md"
                            size="lg"
                            height="50px"
                        />
                    </GridItem>
                    <GridItem>
                        <Textarea
                            placeholder="Add Bio"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            borderColor={borderColor}
                            borderRadius="md"
                            size="lg"
                            minH={{ base: "100px", md: "120px" }}
                            _placeholder={{ color: "gray.400" }}
                            resize="vertical"
                        />
                    </GridItem>
                </Grid>
                
                {/* Language Selection Section */}
                <Box mb={6}>
                    <Text fontSize="lg" fontWeight="medium" mb={4}>
                        What languages do you speak?
                    </Text>
                    
                    <Grid 
                        templateColumns={{ base: "1fr", sm: "1fr", md: "1fr 2fr auto" }}
                        gap={{ base: 4, md: 6 }}
                        alignItems="center"
                    >
                        <GridItem>
                            <Select
                                placeholder="Select language"
                                value={selectedLanguage}
                                onChange={e => setSelectedLanguage(e.target.value)}
                                borderColor={borderColor}
                                size="md"
                                borderRadius="md"
                                height="45px"
                            >
                                {LANGUAGES.filter(lang => !languages.some(l => l.language === lang))
                                    .map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))
                                }
                            </Select>
                        </GridItem>
                        
                        <GridItem>
                            <RadioGroup
                                value={selectedLevel}
                                onChange={setSelectedLevel}
                                size="md"
                            >
                                <Stack 
                                    direction="row"
                                    spacing={{ base: 1, sm: 4 }} 
                                    justify={{ base: "flex-start", md: "space-between" }}
                                    align="center"
                                >
                                    {LANGUAGE_LEVELS.map(level => (
                                        <Radio
                                            key={level.value}
                                            value={level.value}
                                            colorScheme="teal"
                                            size={{ base: "sm", md: "md" }}
                                        >
                                            {level.label}
                                        </Radio>
                                    ))}
                                </Stack>
                            </RadioGroup>
                        </GridItem>
                        
                        <GridItem>
                            <Button
                                onClick={handleAddLanguage}
                                bg={buttonBg}
                                color="white"
                                borderRadius="md"
                                height="45px"
                                px={6}
                                width="100%"
                                _hover={{ bg: buttonHoverBg }}
                                isDisabled={!selectedLanguage}
                            >
                                Add
                            </Button>
                        </GridItem>
                    </Grid>
                </Box>
                
                {/* Language Table */}
                <Box 
                    borderWidth={languages.length > 0 ? "1px" : "0"}
                    borderColor={borderColor}
                    borderRadius="md"
                    overflow="auto"
                    maxHeight="300px"
                >
                    {languages.length > 0 && (
                        <Table variant="simple" width="100%" overflowX="auto">
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th color={headingColor} width="50%">Language</Th>
                                    <Th color={headingColor} width="40%">Level</Th>
                                    <Th width="10%"></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {languages.map(({ language, level }) => (
                                    <Tr key={language}>
                                        <Td>{language}</Td>
                                        <Td>{level}</Td>
                                        <Td textAlign="center">
                                            <IconButton
                                                icon={<img src="/delete.svg" alt="Delete" width="16" height="16" />}
                                                size="sm"
                                                variant="ghost"
                                                color="gray.500"
                                                aria-label="Remove language"
                                                onClick={() => handleRemoveLanguage(language)}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default BioAndLanguages;