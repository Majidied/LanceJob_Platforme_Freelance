import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        position: 'absolute',
    }),
    center: {
        x: 0,
        opacity: 1,
        position: 'relative',
    },
    exit: (direction) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        position: 'absolute',
    }),
};

const Carousel = ({
    backgroundImage,
    autoSlideInterval = 5000,
    showIndicators = true,
    showArrows = true,
    className = "",
    slides = [],
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const slidesCount = slides.length;

    const goToPrevious = () => {
        setDirection(-1);
        setCurrentIndex(currentIndex === 0 ? slidesCount - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setDirection(1);
        setCurrentIndex(currentIndex === slidesCount - 1 ? 0 : currentIndex + 1);
    };

    const goToSlide = (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (!autoSlideInterval) return;
        const interval = setInterval(goToNext, autoSlideInterval);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [currentIndex, autoSlideInterval]);

    const bgImageUrl = backgroundImage || "/api/placeholder/1920/1080";

    return (
        <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
            <div className="absolute inset-0 z-0">
                <img src={bgImageUrl} alt="Background" className="w-full h-full object-cover blur-xs" />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 400, damping: 30, opacity: { duration: 0.2 } }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {slides[currentIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {showArrows && slidesCount > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-20"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-20"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {showIndicators && slidesCount > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-1 w-9 rounded-sm transition-colors ${
                                currentIndex === index ? 'bg-white' : 'bg-white/40'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Carousel;