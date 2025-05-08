import React from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import SpecialtySelector from "./SpecialtySelector";
import SkillSelector from "./SkillSelector";

// Skills and expertise step content
const SkillsContent = ({specialties, skills, setSkills, setSpecialties }) => (
    <Box width="100%">
        <Text fontSize="2xl" fontWeight="bold" mb={8} fontFamily={"Inria Serif"}>
            What are your top skills, tools, or areas of expertise that clients should know about?
        </Text>

        <Flex direction={{ base: "column", md: "row" }} gap={8}>
            <Box flex="1">
                <SpecialtySelector specialties={specialties} setSpecialties={setSpecialties} />
            </Box>
            <Box flex="1">
                <SkillSelector skills={skills} setSkills={setSkills} />
            </Box>
        </Flex>
    </Box>
);

export default SkillsContent;