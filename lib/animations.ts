export const dialogSlideUp = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            duration: 0.5,
            bounce: 0.3
        }
    },
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.95,
        transition: { duration: 0.2 }
    }
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

export const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 50 : -50,
        opacity: 0
    })
}; 