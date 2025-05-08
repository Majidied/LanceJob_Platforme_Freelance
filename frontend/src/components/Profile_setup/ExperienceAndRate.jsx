import React, { useState, useEffect } from 'react';
import {
    Box,
    Text,
    Flex,
    Input,
    Button,
    useColorModeValue
} from '@chakra-ui/react';

const EXPERIENCE_LEVELS = [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Expert", value: "expert" }
];

function formatCurrency(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

const SERVICE_FEE_RATE = 0.10; // 10% fee

const ExperienceAndRate = ({
    experienceLevel,
    onExperienceChange,
    hourlyRate,
    onHourlyRateChange
}) => {
    const [localExperience, setLocalExperience] = useState(experienceLevel || "beginner");
    const [localRate, setLocalRate] = useState(hourlyRate || "");

    useEffect(() => {
        // Update local state when props change
        setLocalExperience(experienceLevel || "beginner");
        setLocalRate(hourlyRate || "");
    }, [experienceLevel, hourlyRate]);

    const borderColor = useColorModeValue("#3B7A99", "gray.600");
    const selectedBg = useColorModeValue("#3B7A99", "gray.700");
    const selectedColor = useColorModeValue("white", "gray.100");
    const unselectedColor = useColorModeValue("#3B7A99", "gray.400");

    // Calculate service fee and net
    const rate = parseFloat(localRate) || 0;
    const serviceFee = rate * SERVICE_FEE_RATE;
    const net = rate - serviceFee;

    const handleExperienceClick = (value) => {
        setLocalExperience(value);
        onExperienceChange && onExperienceChange(value);
    };

    const handleRateChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        setLocalRate(val);
        onHourlyRateChange && onHourlyRateChange(val);
    };

    return (
        <Box width="100%">
            <Text fontSize="xl" fontWeight="bold" mb={8} fontFamily={"Inria Serif"}>
                Do you have freelance experience? If yes, how long and in what capacity? First-time freelancers are welcome to apply.
            </Text>
            <Flex
                mt={4}
                mb={8}
                borderRadius="md"
                overflow="hidden"
                border="1.5px solid"
                borderColor={borderColor}
                width="100%"
                marginBottom={{ base:8, md:32}}
            >
                {EXPERIENCE_LEVELS.map((level, idx) => (
                    <Button
                        key={level.value}
                        onClick={() => handleExperienceClick(level.value)}
                        borderRadius={idx === 0 ? "md 0 0 md" : idx === EXPERIENCE_LEVELS.length - 1 ? "0 md md 0" : "0"}
                        bg={localExperience === level.value ? selectedBg : "transparent"}
                        color={localExperience === level.value ? selectedColor : unselectedColor}
                        fontWeight="bold"
                        px={8}
                        py={6}
                        borderRight={idx < EXPERIENCE_LEVELS.length - 1 ? "1.5px solid" : "none"}
                        borderColor={borderColor}
                        fontSize={{base: "sm", md: "2xl"}}
                        _hover={{ bg: localExperience === level.value ? selectedBg : "gray.100" }}
                        _active={{ bg: selectedBg }}
                        transition="background 0.2s"
                        flex="1"
                        width="100%"
                    >
                        {level.label}
                    </Button>
                ))}
            </Flex>

            <Text fontSize="xl" fontWeight="bold" mb={8} fontFamily={"Inria Serif"}>
                What is your preferred compensation—hourly, daily, or project-based? Please specify your currency.
            </Text>

            <Flex mt={6} gap={8} alignItems="flex-end" flexWrap="wrap" width="100%">
                <Box flex="1" minW="180px">
                    <Text fontWeight="semibold" color="gray.400" mb={1}>Hourly rate</Text>
                    <Box position="relative" mb={2} flex={1} display={"flex"} alignItems="center">
                    <Input
                        value={localRate}
                        onChange={handleRateChange}
                        placeholder="$0.00"
                        size="lg"
                        borderRadius="md"
                        borderColor={borderColor}
                        width="100%"
                        fontWeight="bold"
                        fontSize="xl"
                        textAlign="center"
                        _focus={{ borderColor: "#3B7A99" }}
                        inputMode="decimal"
                        type="text"
                    />
                    <Text color="gray.400" fontWeight="semibold" fontSize="md" ml={2}>/hr</Text>
                    </Box>
                </Box>
                <Box flex="1" minW="180px">
                    <Text fontWeight="semibold" color="gray.400" mb={1}>Service fee</Text>
                    <Box position="relative" mb={2} flex={1} display={"flex"} alignItems="center">
                    <Input
                        value={formatCurrency(serviceFee)}
                        isReadOnly
                        size="lg"
                        borderRadius="md"
                        borderColor={borderColor}
                        width="100%"
                        fontWeight="bold"
                        fontSize="xl"
                        textAlign="center"
                        bg={useColorModeValue("gray.50", "gray.800")}
                    />
                    <Text color="gray.400" fontWeight="semibold" fontSize="md" ml={2}>/hr</Text>
                    </Box>
                </Box>
                <Box flex="1" minW="180px">
                    <Text fontWeight="semibold" color="gray.400" mb={1}>You'll get</Text>
                    <Box position="relative" mb={2} flex={1} display={"flex"} alignItems="center">
                    <Input
                        value={formatCurrency(net)}
                        isReadOnly
                        size="lg"
                        borderRadius="md"
                        borderColor={borderColor}
                        width="100%"
                        fontWeight="bold"
                        fontSize="xl"
                        textAlign="center"
                        bg={useColorModeValue("gray.50", "gray.800")}
                    />
                    <Text color="gray.400" fontWeight="semibold" fontSize="md" ml={2}>/hr</Text>
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
};

export default ExperienceAndRate;