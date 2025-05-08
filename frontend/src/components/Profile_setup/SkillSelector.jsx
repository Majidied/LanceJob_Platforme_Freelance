import React, { useState, useRef, useEffect } from 'react';
import {
    Box, FormControl, FormLabel, Flex, Tag, TagLabel, TagCloseButton,
    Input, Badge, Text
} from '@chakra-ui/react';

const ALL_SKILLS = [
    "JavaScript", "React", "Node.js", "Python", "Django", "TypeScript", "HTML", "CSS", "Sass", "Redux",
    "Vue.js", "Angular", "Next.js", "Express", "MongoDB", "PostgreSQL", "MySQL", "GraphQL", "REST API",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "CI/CD", "Jest", "Testing Library", "Cypress",
    "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel", "Go", "Rust", "C++", "Swift", "Kotlin",
    "Flutter", "React Native", "Figma", "UI/UX", "Agile", "Scrum", "JIRA", "Webpack", "Babel", "ESLint"
];

function SkillSelector({ skills, setSkills }) {
    const [search, setSearch] = useState('');
    const [inputPosition, setInputPosition] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const filteredSkills = ALL_SKILLS.filter(skill =>
        skill.toLowerCase().includes(search.toLowerCase()) &&
        !skills.includes(skill)
    ).slice(0, 15);

    useEffect(() => {
        if (inputRef.current && containerRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            setInputPosition({
                top: inputRect.bottom - containerRect.top,
                left: containerRect.left,
                width: containerRect.width
            });
        }
    }, [search, skills]);

    const handleSkillAdd = (skill) => {
        if (!skills.includes(skill)) {
            setSkills([...skills, skill]);
        }
        setSearch('');
        inputRef.current?.focus();
    };

    const handleSkillRemove = (skill) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && filteredSkills.length > 0) {
            handleSkillAdd(filteredSkills[0]);
            e.preventDefault();
        } else if (e.key === 'Backspace' && search === '' && skills.length > 0) {
            handleSkillRemove(skills[skills.length - 1]);
        } else if (e.key === 'Escape') {
            setSearch('');
        }
    };

    return (
        <Box flex="1" p={4}>
            <FormControl>
                <FormLabel fontWeight="medium">Your skills</FormLabel>
                <Box
                    ref={containerRef}
                    border="1px"
                    borderColor="#95B2C1"
                    borderRadius="xl"
                    p={2}
                    mb={4}
                    minHeight="45px"
                    display="flex"
                    flexWrap="wrap"
                    alignItems="center"
                    gap={2}
                    bg="white"
                    _dark={{ bg: "gray.700" }}
                    position="relative"
                >
                    {skills.map(skill => (
                        <Tag
                            key={skill}
                            size="md"
                            borderRadius="full"
                            variant="solid"
                            bg="gray.100"
                            color="gray.800"
                        >
                            <TagLabel>{skill}</TagLabel>
                            <TagCloseButton onClick={() => handleSkillRemove(skill)} />
                        </Tag>
                    ))}
                    <Input
                        ref={inputRef}
                        variant="unstyled"
                        placeholder={skills.length === 0 ? "Type to add skills..." : ""}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        width="auto"
                        minW="120px"
                        flex="1"
                        _focus={{ outline: "none" }}
                    />

                    {search && filteredSkills.length > 0 && (
                        <Box
                            position="absolute"
                            top={`${inputPosition.top}px`}
                            left={0}
                            width="100%"
                            zIndex={80}
                            border="1px"
                            borderColor="gray.200"
                            borderRadius="md"
                            bg="white"
                            _dark={{ bg: "gray.700" }}
                            boxShadow="md"
                            maxHeight="200px"
                            overflowY="auto"
                            sx={{
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: 'transparent',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'gray.300',
                                    borderRadius: '3px',
                                },
                            }}
                        >
                            {filteredSkills.map(skill => (
                                <Box
                                    key={skill}
                                    px={3}
                                    py={2}
                                    cursor="pointer"
                                    _hover={{ bg: "gray.100" }}
                                    _dark={{ _hover: { bg: "gray.600" } }}
                                    onClick={() => handleSkillAdd(skill)}
                                >
                                    {skill}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>

                <Text fontSize="sm" color="gray.500" mb={2}>Suggested skills</Text>
                <Flex flexWrap="wrap" gap={2}>
                    {ALL_SKILLS.slice(0, 10)
                        .filter(skill => !skills.includes(skill))
                        .map(skill => (
                            <Badge
                                key={skill}
                                px={3}
                                py={1}
                                borderRadius="full"
                                bg="gray.100"
                                color="gray.600"
                                cursor="pointer"
                                _hover={{ bg: "gray.200" }}
                                onClick={() => handleSkillAdd(skill)}
                            >
                                + {skill}
                            </Badge>
                        ))}
                </Flex>
            </FormControl>
        </Box>
    );
}

export default SkillSelector;
