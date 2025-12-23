import { useState, useEffect } from 'react';

const PageTransition = ({ children, activeKey }) => {
    const [displayChildren, setDisplayChildren] = useState(children);
    const [transitionStage, setTransitionStage] = useState('fadeIn');

    useEffect(() => {
        if (children !== displayChildren) {
            setTransitionStage('fadeOut');
            const timer = setTimeout(() => {
                setDisplayChildren(children);
                setTransitionStage('fadeIn');
            }, 300); // Snappy transition
            return () => clearTimeout(timer);
        }
    }, [children, activeKey]);

    return (
        <div
            className={`transition-all duration-500 transform-gpu ${transitionStage === 'fadeIn'
                ? 'animate-slideUp opacity-100'
                : 'opacity-0 -translate-y-4 blur-sm'
                }`}
        >
            {displayChildren}
        </div>
    );
};

export default PageTransition;
