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
            }, 250); // Matches transition duration
            return () => clearTimeout(timer);
        }
    }, [children, activeKey]);

    return (
        <div
            className={`transition-all duration-300 transform-gpu ${transitionStage === 'fadeIn'
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
        >
            {displayChildren}
        </div>
    );
};

export default PageTransition;
