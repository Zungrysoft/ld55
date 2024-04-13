import React, { useEffect } from 'react';

function TabMonitor({ onChangeVisibility }) {
    useEffect(() => {
        const handleVisibilityChange = () => {
            onChangeVisibility(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div/>
    );
}

export default TabMonitor;
