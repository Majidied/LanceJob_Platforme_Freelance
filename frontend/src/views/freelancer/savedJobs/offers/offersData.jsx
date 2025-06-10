
export const mockOffers = [
    {
      id: 1,
      title: "2D Floor Plan, 3d Interior and Exterior Design.",
      client: "Client Design Pro",
      skills: ["Web Design", "Visual Design", "Blender"],
      coverLetter: "Je suis très intéressé par votre projet de design 3D. J'ai une expérience approfondie avec Blender et la création de plans d'étage 2D et de rendus 3D pour divers projets architecturaux...",
      price: "500 MAD",
      timeline: "7 jours",
      submittedDate: "18 avril 2025",
      status: "En attente",
      clientResponse: null,
      attachments: ["portfolio_3d_designs.pdf"],
      description: "ll hope you are dog-lg well, lim looking to a Kjxury campsite that will be focused on providing a luxury stay in vnique buildings. I will need 3 different floor plans options for it. We will select me luxury stay in vnique buildings. I will 3..."
    },
    {
      id: 2,
      title: "Landing Page Design for E-commerce",
      client: "MarketTech Solutions",
      skills: ["Web Design", "UI/UX", "Figma"],
      coverLetter: "J'ai lu votre cahier des charges avec attention et je serais ravi de créer une landing page moderne et efficace pour votre boutique en ligne. J'ai une solide expérience dans la conception de pages d'atterrissage qui convertissent...",
      price: "350 MAD",
      timeline: "5 jours",
      submittedDate: "15 avril 2025",
      status: "Accepté",
      clientResponse: "Nous avons aimé votre proposition et souhaiterions commencer dès que possible.",
      attachments: ["portfolio_web_design.pdf", "landing_page_examples.pdf"],
      description: "Nous recherchons un designer pour créer une landing page attractive et convertissante pour notre nouvelle collection de produits. Expérience en e-commerce requise."
    },
    {
      id: 3,
      title: "Logo et Identité Visuelle pour Startup",
      client: "InnoTech Ventures",
      skills: ["Branding", "Logo Design", "Adobe Illustrator"],
      coverLetter: "En tant que designer graphique spécialisé dans l'identité visuelle, votre projet de création de logo pour une startup tech m'intéresse particulièrement. Je propose une approche complète incluant plusieurs concepts initiaux...",
      price: "650 MAD",
      timeline: "10 jours",
      submittedDate: "12 avril 2025",
      status: "Refusé",
      clientResponse: "Merci pour votre proposition, mais nous avons décidé de poursuivre avec un autre freelance dont le style correspond mieux à notre vision.",
      attachments: ["portfolio_logos.pdf"],
      description: "Startup technologique cherche designer pour créer un logo moderne et une identité visuelle complète. Nous voulons quelque chose d'innovant qui représente notre esprit de rupture dans le domaine de la fintech."
    }
  ];
  
  export const statusColors = {
    "En attente": "bg-yellow-100 text-yellow-800",
    "Accepté": "bg-green-100 text-green-800",
    "Refusé": "bg-red-100 text-red-800",
    "En cours": "bg-blue-100 text-blue-800"
  };