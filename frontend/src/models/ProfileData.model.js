import { z } from "zod";

export const ProfileDataSchema = z.object({
  skills: z.array(z.string()),
  specialties: z.array(z.string()),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]),
  hourlyRate: z.union([z.string(), z.number()]),
  title: z.string(),
  bio: z.string(),
  languages: z.array(
    z.object({
      language: z.string(),
      level: z.enum(["Beginner", "Intermediate", "Advanced"]),
    })
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      from: z.string(),
      to: z.string(),
      description: z.string(),
    })
  ),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      city: z.string(),
      country: z.string(),
      from: z.string(),
      to: z.string(),
      description: z.string(),
    })
  ),
});

// Default data
export const defaultProfileData = {
    skills: [],
    specialties: [],
    experienceLevel: "beginner",
    hourlyRate: "",
    title: "",
    bio: "",
    languages: [],
    education: [],
    experience: [],
};