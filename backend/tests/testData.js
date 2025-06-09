const mongoose = require('mongoose');

const testData = {
  // Base Users
  users: [
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
      name: "Sarah Johnson",
      email: "sarah.johnson@innotech.com",
      password: "$2b$10$encrypted_password_hash",
      role: "client",
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2024-12-15")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
      name: "Mark Chen",
      email: "mark.chen@markettech.com",
      password: "$2b$10$encrypted_password_hash",
      role: "client",
      createdAt: new Date("2023-03-10"),
      updatedAt: new Date("2024-12-10")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439013"),
      name: "Alex Rivera",
      email: "alex.rivera@designpro.com",
      password: "$2b$10$encrypted_password_hash",
      role: "client",
      createdAt: new Date("2022-11-20"),
      updatedAt: new Date("2024-12-01")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439021"),
      name: "Amina Benali",
      email: "amina.benali@gmail.com",
      password: "$2b$10$encrypted_password_hash",
      role: "freelancer",
      createdAt: new Date("2023-02-01"),
      updatedAt: new Date("2024-12-15")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439022"),
      name: "Youssef Alami",
      email: "youssef.alami@gmail.com",
      password: "$2b$10$encrypted_password_hash",
      role: "freelancer",
      createdAt: new Date("2023-01-20"),
      updatedAt: new Date("2024-12-10")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439023"),
      name: "Sofia Idrissi",
      email: "sofia.idrissi@gmail.com",
      password: "$2b$10$encrypted_password_hash",
      role: "freelancer",
      createdAt: new Date("2023-04-15"),
      updatedAt: new Date("2024-12-05")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439024"),
      name: "Hassan Ouali",
      email: "hassan.ouali@gmail.com",
      password: "$2b$10$encrypted_password_hash",
      role: "freelancer",
      createdAt: new Date("2022-12-01"),
      updatedAt: new Date("2024-12-12")
    }
  ],

  // Clients (based on your client.model.js)
  clients: [
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439041"),
      user: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
      name: "Sarah Johnson",
      email: "sarah.johnson.client@innotech.com",
      password: "$2b$10$encrypted_password_hash",
      rating: 4.8,
      description: "Tech entrepreneur running multiple startups. Looking for talented developers and designers to help build innovative products.",
      postedMissions: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439033"),
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439034")
      ],
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2024-12-15")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439042"),
      user: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"),
      name: "Mark Chen",
      email: "mark.chen.client@markettech.com",
      password: "$2b$10$encrypted_password_hash",
      rating: 4.6,
      description: "Marketing agency specializing in e-commerce solutions. We work with ambitious brands to scale their online presence.",
      postedMissions: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439031")
      ],
      createdAt: new Date("2023-03-10"),
      updatedAt: new Date("2024-12-10")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439043"),
      user: new mongoose.Types.ObjectId("507f1f77bcf86cd799439013"),
      name: "Alex Rivera",
      email: "alex.rivera.client@designpro.com",
      password: "$2b$10$encrypted_password_hash",
      rating: 4.9,
      description: "Architecture and design firm focusing on luxury residential and commercial projects worldwide.",
      postedMissions: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439032")
      ],
      createdAt: new Date("2022-11-20"),
      updatedAt: new Date("2024-12-01")
    }
  ],

  // Freelancers (based on your freelancer.model.js)
  freelancers: [
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439051"),
      name: "Amina Benali",
      email: "amina.benali@freelancer.com",
      password: "$2b$10$encrypted_password_hash",
      role: "freelancer",
      skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "TypeScript", "UI/UX Design", "Figma"],
      bio: "Passionate full-stack developer with 5+ years of experience. Specialized in React and Node.js applications. Strong focus on clean code and user experience.",
      title: "Full-Stack Developer & UI/UX Designer",
      rating: 4.9,
      earned: 18500,
      success: 96,
      history: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439033")
      ],
      appliedMissions: [
        {
          mission: new mongoose.Types.ObjectId("507f1f77bcf86cd799439031"),
          applicationDate: new Date("2024-12-11"),
          status: "pending"
        }
      ],
      savedMissions: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439031"),
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439032")
      ],
      createdAt: new Date("2023-02-01"),
      updatedAt: new Date("2024-12-15")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439052"),
      name: "Youssef Alami",
      email: "youssef.alami@freelancer.com",
      password: "$2b$10$encrypted_password_hash",
      role: "freelancer",
      skills: ["Blender", "3ds Max", "AutoCAD", "SketchUp", "Photoshop", "V-Ray", "Architectural Design"],
      bio: "Professional 3D artist specializing in architectural visualization. Expert in photorealistic rendering and interior design. 6+ years experience in luxury projects.",
      title: "3D Artist & Architectural Visualizer",
      rating: 4.8,
      earned: 15200,
      success: 94,
      history: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439032")
      ],
      appliedMissions: [
        {
          mission: new mongoose.Types.ObjectId("507f1f77bcf86cd799439032"),
          applicationDate: new Date("2024-11-26"),
          status: "accepted"
        }
      ],
      savedMissions: [],
      createdAt: new Date("2023-01-20"),
      updatedAt: new Date("2024-12-10")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439053"),
      name: "Sofia Idrissi",
      email: "sofia.idrissi@freelancer.com",
      password: "$2b$10$encrypted_password_hash",
      role: "freelancer",
      skills: ["Adobe Illustrator", "Adobe Photoshop", "Branding", "Logo Design", "Print Design", "Brand Strategy"],
      bio: "Creative brand designer with expertise in logo design. Specialist in brand identity and visual communication. Helping businesses create memorable brand experiences.",
      title: "Brand Designer & Logo Specialist",
      rating: 4.7,
      earned: 8750,
      success: 92,
      history: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439034")
      ],
      appliedMissions: [
        {
          mission: new mongoose.Types.ObjectId("507f1f77bcf86cd799439034"),
          applicationDate: new Date("2024-11-02"),
          status: "accepted"
        }
      ],
      savedMissions: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439031")
      ],
      createdAt: new Date("2023-04-15"),
      updatedAt: new Date("2024-12-05")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439054"),
      name: "Hassan Ouali",
      email: "hassan.ouali@freelancer.com",
      password: "$2b$10$encrypted_password_hash",
      role: "freelancer",
      skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Docker", "AWS", "Kubernetes", "Redis"],
      bio: "Experienced backend developer with strong DevOps skills. Specialized in building scalable APIs and microservices. Expert in cloud infrastructure and containerization.",
      title: "Senior Backend Developer & DevOps Engineer",
      rating: 4.9,
      earned: 22300,
      success: 98,
      history: [],
      appliedMissions: [],
      savedMissions: [
        new mongoose.Types.ObjectId("507f1f77bcf86cd799439033")
      ],
      createdAt: new Date("2022-12-01"),
      updatedAt: new Date("2024-12-12")
    }
  ],

  // Missions (based on your mission.model.js)
  missions: [
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439031"),
      title: "E-commerce Landing Page Redesign",
      description: "We need a complete redesign of our e-commerce landing page to improve conversion rates. The new design should be modern, mobile-responsive, and optimized for user experience.",
      budget: 1200,
      deadline: new Date("2024-12-24"),
      tags: ["Web Design", "UI/UX", "Figma", "HTML", "CSS", "Responsive Design"],
      type: "fixe",
      experience: "intermediaire",
      client: new mongoose.Types.ObjectId("507f1f77bcf86cd799439042"),
      status: "published",
      applications: [
        {
          freelancer: new mongoose.Types.ObjectId("507f1f77bcf86cd799439051"),
          proposedPrice: 1100,
          proposedDuration: new Date("2024-12-21"),
          message: "Bonjour, j'ai lu votre projet avec attention et je suis très intéressée par cette opportunité...",
          applicationDate: new Date("2024-12-11"),
          status: "pending"
        }
      ],
      createdAt: new Date("2024-12-10"),
      updatedAt: new Date("2024-12-15")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439032"),
      title: "3D Architectural Visualization for Luxury Resort",
      description: "We are developing a luxury eco-resort and need high-quality 3D visualizations for marketing purposes. This includes exterior views, interior spaces, and aerial perspectives.",
      budget: 3500,
      deadline: new Date("2024-12-20"),
      tags: ["3D Modeling", "Blender", "3ds Max", "V-Ray", "Architectural Design", "Photorealistic Rendering"],
      type: "fixe",
      experience: "expert",
      client: new mongoose.Types.ObjectId("507f1f77bcf86cd799439043"),
      status: "assigned",
      assignedTo: new mongoose.Types.ObjectId("507f1f77bcf86cd799439052"),
      applications: [
        {
          freelancer: new mongoose.Types.ObjectId("507f1f77bcf86cd799439052"),
          proposedPrice: 3200,
          proposedDuration: new Date("2024-12-13"),
          message: "Bonjour, en tant qu'architecte visualisateur 3D avec plus de 6 ans d'expérience...",
          applicationDate: new Date("2024-11-26"),
          status: "accepted"
        }
      ],
      createdAt: new Date("2024-11-25"),
      updatedAt: new Date("2024-12-15")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439033"),
      title: "Full-Stack Web Application for Project Management",
      description: "Looking for an experienced full-stack developer to build a comprehensive project management web application. The application should include user authentication, project tracking, team collaboration features.",
      budget: 9600,
      deadline: new Date("2024-12-15"),
      tags: ["React", "Node.js", "MongoDB", "Express", "Socket.io", "JWT Authentication"],
      type: "Taux horaire",
      experience: "expert",
      client: new mongoose.Types.ObjectId("507f1f77bcf86cd799439041"),
      status: "completed",
      assignedTo: new mongoose.Types.ObjectId("507f1f77bcf86cd799439051"),
      applications: [
        {
          freelancer: new mongoose.Types.ObjectId("507f1f77bcf86cd799439021"),
          proposedPrice: 80,
          proposedDuration: new Date("2024-11-27"),
          message: "Bonjour, je suis développeur full-stack avec une expertise approfondie en React et Node.js...",
          applicationDate: new Date("2024-10-16"),
          status: "accepted"
        }
      ],
      createdAt: new Date("2024-10-15"),
      updatedAt: new Date("2024-12-10")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439034"),
      title: "Brand Identity Package for Tech Startup",
      description: "We're a fintech startup looking for a complete brand identity package including logo design, color palette, typography, business cards, and brand guidelines.",
      budget: 2500,
      deadline: new Date("2024-11-25"),
      tags: ["Logo Design", "Brand Strategy", "Adobe Illustrator", "Brand Guidelines", "Print Design"],
      type: "fixe",
      experience: "intermediaire",
      client: new mongoose.Types.ObjectId("507f1f77bcf86cd799439041"),
      status: "completed",
      assignedTo: new mongoose.Types.ObjectId("507f1f77bcf86cd799439053"),
      applications: [
        {
          freelancer: new mongoose.Types.ObjectId("507f1f77bcf86cd799439053"),
          proposedPrice: 2200,
          proposedDuration: new Date("2024-11-17"),
          message: "Bonjour, j'ai une passion pour créer des identités de marque mémorables...",
          applicationDate: new Date("2024-11-02"),
          status: "accepted"
        }
      ],
      createdAt: new Date("2024-11-01"),
      updatedAt: new Date("2024-11-22")
    }
  ],

  // Interactions (for recommendation system)
  interactions: [
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439081"),
      freelancer_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439021"),
      mission_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439031"),
      interaction_type: "view",
      metadata: {
        source: "search_results",
        position: 2,
        timeSpent: 45
      },
      timestamp: new Date("2024-12-11T10:30:00Z")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439082"),
      freelancer_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439021"),
      mission_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439031"),
      interaction_type: "click",
      metadata: {
        element: "title_link",
        source: "search_results"
      },
      timestamp: new Date("2024-12-11T10:32:00Z")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439083"),
      freelancer_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439021"),
      mission_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439031"),
      interaction_type: "apply",
      metadata: {
        proposedPrice: 1100,
        applicationTime: 15
      },
      timestamp: new Date("2024-12-11T11:00:00Z")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439084"),
      freelancer_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439022"),
      mission_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439032"),
      interaction_type: "view",
      metadata: {
        source: "recommendations",
        position: 1,
        timeSpent: 120
      },
      timestamp: new Date("2024-11-26T09:15:00Z")
    },
    {
      _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439085"),
      freelancer_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439023"),
      mission_id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439031"),
      interaction_type: "save",
      metadata: {
        saveReason: "interesting_project",
        source: "browse"
      },
      timestamp: new Date("2024-12-12T14:20:00Z")
    }
  ]
};

module.exports = testData;