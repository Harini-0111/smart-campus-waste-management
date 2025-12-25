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
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${transitionStage === 'fadeIn'
                ? 'opacity-100 translate-y-0 scale-100 blur-0'
                : 'opacity-0 translate-y-8 scale-[0.98] blur-xl'
                }`}
        >
            {displayChildren}
        </div>
    );
};

export default PageTransition;
