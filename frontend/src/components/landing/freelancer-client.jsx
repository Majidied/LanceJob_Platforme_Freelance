import Carousel from './carousel';
import SlideContent from './slideContent';
import { useState } from 'react';
import client from '../../assets/pexels-client.jpg';
import freelancer from '../../assets/pexels-car.jpg';

const Client = () => {
    const [isFreelance, setIsFreelance] = useState(true);
  
    // Freelancer content
    const freelanceSlides = [
      <SlideContent
        title="Turn your skills into success"
        description="Join a platform built for freelancers. Showcase your expertise, connect with clients, and build a thriving career — all in one place."
        bulletPoints={[
          "🔍   Explore high-quality freelance opportunities across various industries",
          "💼   Work with trusted clients and build long-term partnerships",
          "📈   Track your progress and grow your reputation"
        ]}
        btnText="Join Now"
      />,
      <SlideContent
        title="Work on your terms"
        description="Set your own hours, rates, and choose the projects that match your skills and interests."
        bulletPoints={[
          "🗓️   Flexible schedule that fits your lifestyle",
          "💰   Transparent payment system with no hidden fees",
          "🚀   Tools to help you stand out from the competition"
        ]}
        btnText="Start Now"
      />,
      <SlideContent
        title="Grow your freelance career"
        description="Build your portfolio, gain experience, and expand your professional network."
        bulletPoints={[
          "⭐   Build your reputation with client reviews",
          "🛠️   Access resources to enhance your skills",
          "🤝   Connect with a community of fellow freelancers"
        ]}
        btnText="Explore More"
      />
    ];
    
    // Client content
    const clientSlides = [
      <SlideContent
        title="Find Top Talent in Minutes"
        description="Post your project and connect instantly with skilled freelancers from around the world. From short-term tasks to long-term collaborations."
        bulletPoints={[
          "🧠   Access a wide pool of vetted professionals",
          "⏱️   Hire quickly and streamline project delivery",
          "💬   Chat, collaborate, and manage everything in one place"
        ]}
        btnText="Get Started Now"
      />,
      <SlideContent
        title="Quality Work, Guaranteed"
        description="Work with confidence knowing that our platform ensures quality results with every project."
        bulletPoints={[
          "✅   Vetted freelancers with proven track records",
          "🔒   Secure payment protection system",
          "👍   Satisfaction guarantee on all projects"
        ]}
        btnText="Post a Project"
      />,
      <SlideContent
        title="Scale Your Business Effortlessly"
        description="Build a flexible team that grows with your business needs, without the overhead."
        bulletPoints={[
          "📊   Access specialized skills as you need them",
          "💸   Control costs with flexible engagement models",
          "🔄   Streamline workflows with our management tools"
        ]}
        btnText="Learn More"
      />
    ];
  
    const freelanceBackgroundImage = freelancer; 
    const clientBackgroundImage = client; 
  
    const handleToggle = () => {
      setIsFreelance(prevState => !prevState);
    };
  
    return (
      <div id="about" className="max-w-6xl mx-auto h-125 relative">
        <div className="absolute top-4 right-4 flex items-center space-x-2 text-white z-20">
          <span className="text-lg">{isFreelance ? "Freelance" : "Client"}</span>
          <button
            className="w-14 h-6 bg-white rounded-full p-1 flex items-center cursor-pointer focus:outline-none"
            onClick={handleToggle}
            aria-label={`Switch to ${isFreelance ? 'Meet talents' : 'Freelance'} mode`}
            type="button"
          >
            <div
              className={`w-7 h-4 bg-gray-600 rounded-full transition-all duration-300 ${isFreelance ? 'mr-auto' : 'ml-auto'}`}
            ></div>
          </button>
        </div>
  
        <Carousel
          backgroundImage={isFreelance ? freelanceBackgroundImage : clientBackgroundImage}
          autoSlideInterval={5000}
          slides={isFreelance ? freelanceSlides : clientSlides}
          showIndicators={true}
          showArrows={true}
        />
      </div>
    );
}
export default Client;
