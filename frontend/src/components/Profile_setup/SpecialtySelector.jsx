import React, { useMemo } from 'react';
import {
    Box,
    Text,
    Input,
    Flex,
    Checkbox,
    Divider,
    useColorModeValue
} from '@chakra-ui/react';

const ALL_SPECIALTIES = [
    'IT',
    'System Administration',
    'Database Management',
    'DevOps Architecture',
    'Frontend Development',
    'Backend Development',
    'Cloud Engineering',
    'Cybersecurity',
    'AI & Machine Learning',
    'Mobile Development',
    'UI/UX Design',
    'QA Testing',
    'Network Engineering',
    'Project Management',
    'Business Analysis',
    // ...add as many as needed
];

const SpecialtySelector = ({specialties, setSpecialties }) => {
    const [search, setSearch] = React.useState('');
    const [selectedSpecialties, setSelectedSpecialties] = React.useState([...specialties]);

    const filteredSpecialties = useMemo(() => {
        let baseList;
        if (search.trim() === '') {
            baseList = ALL_SPECIALTIES.filter(s =>
                ['IT', 'System Administration', 'Database Management'].includes(s)
            );
        } else {
            baseList = ALL_SPECIALTIES.filter(s =>
                s.toLowerCase().includes(search.toLowerCase())
            );
        }
        return [
            ...ALL_SPECIALTIES.filter(s => selectedSpecialties.includes(s)),
            ...baseList.filter(s => !selectedSpecialties.includes(s))
        ];
    }, [search, selectedSpecialties]);

    const handleToggle = (specialty) => {
        setSelectedSpecialties(prev => {
            const updatedSpecialties = prev.includes(specialty)
                ? prev.filter(item => item !== specialty)
                : [...prev, specialty];
            setSpecialties(updatedSpecialties);
            return updatedSpecialties;
        });
    };

    const borderColor = useColorModeValue('#95B2C1', 'gray.600');
    const inputBorderColor = useColorModeValue('gray.300', 'gray.500');
    const bgColor = useColorModeValue('white', 'gray.700');

    return (
        <Box 
            borderWidth="1.5px" 
            borderRadius="xl"
            borderColor={borderColor}
            p={6}
            width="100%"
            maxWidth="560px"
            bg={bgColor}
            maxHeight="500px"
            overflow="hidden"
            display="flex"
            flexDirection="column"
        >
            <Text fontSize="md" fontWeight="medium" mb={4}>
                Your specialty
            </Text>
            
            <Input 
                placeholder="Search" 
                variant="flushed" 
                borderColor={inputBorderColor}
                mb={6}
                px={0}
                value={search}
                onChange={e => setSearch(e.target.value)}
                _focus={{
                    borderColor: 'blue.500',
                }}
            />
            
            <Box
                flex="1"
                overflowY="auto"
                mb={6}
                pr={2}
            >
                <Flex wrap="wrap" gap={6}>
                    {filteredSpecialties.length === 0 ? (
                        <Text color="gray.500">No specialties found.</Text>
                    ) : (
                        filteredSpecialties.map(specialty => (
                            <Checkbox
                                key={specialty}
                                isChecked={selectedSpecialties.includes(specialty)}
                                onChange={() => handleToggle(specialty)}
                                colorScheme="teal"
                                isDisabled={selectedSpecialties.length >= 15 && !selectedSpecialties.includes(specialty)}
                                size="lg"
                                iconSize="0.8rem"
                                borderColor="gray.500"
                                _checked={{
                                    borderColor: '#37505D',
                               }}
                            >
                                <Text fontSize="md" fontFamily="Abhaya Libre">{specialty}</Text>
                            </Checkbox>
                        ))
                    )}
                </Flex>
            </Box>

            <Divider borderColor={inputBorderColor} mb={6} />

            <Box>
                <Text fontWeight="medium" mb={2}>Selected specialties:</Text>
                <Flex wrap="wrap" gap={2}>
                    {selectedSpecialties.length === 0 ? (
                        <Text color="gray.500">None selected.</Text>
                    ) : (
                        selectedSpecialties.map(specialty => (
                            <Box
                                key={specialty}
                                px={2}
                                py={1}
                                bg="#6b888c"
                                color="white"
                                borderRadius="md"
                                fontSize="sm"
                            >
                                {specialty}
                            </Box>
                        ))
                    )}
                </Flex>
            </Box>
        </Box>
    );
};

export default SpecialtySelector;
