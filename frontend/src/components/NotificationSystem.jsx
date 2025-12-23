import { useState, useEffect, createContext, useContext } from 'react';
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const notify = (message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
                {notifications.map((n, i) => (
                    <div
                        key={n.id}
                        className={`pointer-events-auto px-6 py-4 rounded-[1.5rem] shadow-2xl border flex items-center gap-4 animate-slideInRight stagger-${(i % 4) + 1}
                            ${n.type === 'critical' ? 'bg-red-900 text-white border-red-800' :
                                n.type === 'success' ? 'bg-emerald-900 text-white border-emerald-800' :
                                    'bg-slate-900 text-white border-slate-800'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${n.type === 'critical' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                        <p className="text-[11px] font-black uppercase tracking-widest">{n.message}</p>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
