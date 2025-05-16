import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChakraProvider,
  Box,
  Flex,
  Text,
  Button,
  Container,
  Heading,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody
} from '@chakra-ui/react';
import ProgressLine from '../components/Profile_setup/ProgressLine';
import SkillsContent from '../components/Profile_setup/SkillsContent';
import ExperienceAndRate from '../components/Profile_setup/ExperienceAndRate';
import BioAndLanguages from '../components/Profile_setup/BioAndLanguages';
import EducationExperienceSelector from '../components/Profile_setup/EducationExperienceSelector';
import AddEducationForm from '../components/Profile_setup/AddEducationForm';
import AddExperienceForm from '../components/Profile_setup/AddExperienceForm';
import { defaultProfileData } from '../models/ProfileData.model';
import { useProfileData } from '../hooks/useProfileData';

const ProfileSetup = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showExperienceFrom, setShowExperienceFrom] = useState(false);
  const [profileData, setProfileData] = useState(defaultProfileData);
  const { submitProfileData, isLoading } = useProfileData();

  const handleAddEducation = () => {
    setShowEducationForm(true);
    onOpen();
  };

  const handleAddExperience = () => {
    setShowExperienceFrom(true);
    onOpen();
  };

  const handleSaveEducation = (data) => {
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, data]
    }));
    setShowEducationForm(false);
    onClose();
  };

  const handleSaveExperience = (data) => {
    setProfileData(prev => ({
      ...prev,
      experience: [...prev.experience, data]
    }));
    setShowExperienceFrom(false);
    onClose();
  };

  const steps = [
    { title: 'Skills', description: 'Your expertise' },
    { title: 'Experience', description: 'Work history' },
    { title: 'Education', description: 'Academic background' },
    { title: 'Review', description: 'Final check' }
  ];

  const Steps = [
    { 
      title: 'Skills', 
      content: (
        <SkillsContent
          skills={profileData.skills}
          setSkills={(skills) => setProfileData(prev => ({ ...prev, skills }))}
          specialties={profileData.specialties}
          setSpecialties={(specialties) => setProfileData(prev => ({ ...prev, specialties }))}
        />
      )
    },
    { 
      title: 'Experience', 
      content: (
        <ExperienceAndRate
          experienceLevel={profileData.experienceLevel}
          onExperienceChange={(experienceLevel) => setProfileData(prev => ({ ...prev, experienceLevel }))}
          hourlyRate={profileData.hourlyRate}
          onHourlyRateChange={(hourlyRate) => setProfileData(prev => ({ ...prev, hourlyRate }))}
        />
      )
    },
    { 
      title: 'Education', 
      content: (
        <BioAndLanguages
          title={profileData.title}
          setTitle={(title) => setProfileData(prev => ({ ...prev, title }))}
          bio={profileData.bio}
          setBio={(bio) => setProfileData(prev => ({ ...prev, bio }))}
          languages={profileData.languages}
          setLanguages={(languages) => setProfileData(prev => ({ ...prev, languages }))}
        />
      )
    },
    { 
      title: 'Review', 
      content: (
        <EducationExperienceSelector
          onAddEducation={handleAddEducation}
          onAddExperience={handleAddExperience}
        />
      )
    }
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (activeStep < Steps.length - 1) {
      setDirection(1);
      setActiveStep((prev) => prev + 1);
    }
    if (activeStep === Steps.length - 1) {
      // Handle form submission
      submitProfileData(profileData);
      console.log('Final step reached, submitting profile data:', profileData);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setDirection(-1);
      setActiveStep((prev) => prev - 1);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      position: 'absolute'
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'relative'
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      position: 'absolute'
    })
  };

  return (
      <Container maxW="container.lg" p={4}>
        <Grid
          templateRows="10vh 70vh 10vh"
          templateColumns="1fr"
          gap={6}
          height="90vh"
        >
          {/* Header */}
          <GridItem>
            <Heading as="h1" size="xl" color="gray.600" textAlign="center" fontFamily={"Inter"}>
              Complete your profile
            </Heading>
          </GridItem>
          {/* Main Content */}
          <GridItem
            overflowY="auto"
            overflowX="hidden"
            position="relative"
            px={4}
            minHeight="100%"
          >
            <AnimatePresence initial={false} custom={direction} mode="sync">
              <motion.div
                key={activeStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  type: "spring",
                  stiffness: 1500,
                  damping: 110,
                  mass: 1,
                  duration: 5, // adjust as needed for smoothness
                }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                {Steps[activeStep].content}
              </motion.div>
            </AnimatePresence>
          </GridItem>
          {/* Progress Line and Navigation */}
          <GridItem>
            <Box width="100%">
              {/* Progress Line */}
              <ProgressLine
                activeStep={activeStep}
                steps={steps.length}
                activeColor="#55A5CF"
                inactiveColor="#E2E8F0"
                height="2px"
                showStepIndicators={false}
                indicatorSize="10px"
                indicatorActiveColor="#3182ce"
                indicatorInactiveColor="#E2E8F0"
              />
              {/* Navigation Buttons */}
              <Flex justifyContent="space-between" mt={4}>
                <Button
                  variant="transparent"
                  onClick={handleBack}
                  isDisabled={activeStep === 0}
                  colorScheme="teal"
                  textColor={"#37505D"}
                >
                  Back
                </Button>
                <Text color="gray.500">
                  {activeStep + 1}/{steps.length}
                </Text>
                <Button
                  variant={"transparent"}
                  onClick={handleNext}
                  colorScheme="teal"
                  textColor={"#37505D"}
                  isLoading={isLoading && activeStep === steps.length - 1}
                  borderColor={activeStep === steps.length - 1 ? "#90B3B4" : "transparent"}
                  _hover={activeStep === steps.length - 1 ? {
                    bg: "#90B3B4",
                    color: "white",
                  } : {}}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Flex>
            </Box>
          </GridItem>
        </Grid>
        {/* Education Form */}
        <Modal isOpen={isOpen && showEducationForm} onClose={onClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent bg="#eaf4f6" m={2}>
            <ModalBody>
              <AddEducationForm
                onSave={handleSaveEducation}
                onCancel={() => { setShowEducationForm(false); onClose(); }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
        {/* Experience Form */}
        <Modal isOpen={isOpen && showExperienceFrom} onClose={onClose} size="lg" isCentered>
          <ModalOverlay />
          <ModalContent bg="#eaf4f6" m={2}>
            <ModalBody>
              <AddExperienceForm
                onSave={handleSaveExperience}
                onCancel={() => { setShowExperienceFrom(false); onClose(); }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
  );
};

export default ProfileSetup;