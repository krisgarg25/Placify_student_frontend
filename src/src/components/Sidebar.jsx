import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProgressRing from './ProgressRing';
import { LayoutDashboard, FileText, Briefcase, Bell, LogOut, ClipboardList, User } from 'lucide-react';

export default function Sidebar({ user: propUser, stats = { progress: 65 }, unreadMessages = 4, onLogout: propOnLogout }) {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    const user = propUser || currentUser || {};
    const handleLogout = propOnLogout || logout;
    const displayName = user.displayName || user.name || user.email?.split('@')[0] || 'User';
    const firstName = displayName.split(' ')[0];

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/resume-analyzer', label: 'Resume Analyzer', icon: FileText },
        { path: '/jobs', label: 'Jobs', icon: Briefcase },
        { path: '/applications', label: 'My Applications', icon: ClipboardList },
        { path: '/profile', label: 'Profile', icon: User }
    ];

    const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

    const breakdown = stats?.breakdown?.length > 0 ? stats.breakdown : [
        { value: 0, color: '#E8A5A5' },
        { value: 0, color: '#A8D4A8' },
        { value: 0, color: '#D4C8A8' }
    ];

    return (
        <aside className="w-64 bg-[#2B2B2B] rounded-r-[2rem] flex flex-col min-h-screen text-white">
            <div className="p-6 pt-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-4 ring-gray-700">
                    {user.avatarUrl || user.photoURL ? (
                        <img src={user.avatarUrl || user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{firstName.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                </div>
                <h2 className="text-lg font-semibold text-white">Hi, {firstName}!</h2>
                <p className="text-sm text-gray-400 mt-1">Your job is waiting for you!</p>
            </div>

            <nav className="flex-shrink-0 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                        <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}`}>
                            <Icon size={20} />
                            <span className="font-medium text-sm">{item.label}</span>
                            {item.badge && <span className="ml-auto bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
                <ProgressRing progress={stats?.progress ?? 65} size={150} strokeWidth={14} segments={breakdown} />
            </div>

            <div className="p-4 mt-auto">
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-xl transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
}
