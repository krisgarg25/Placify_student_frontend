import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DashboardLayout() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        progress: 0,
        breakdown: []
    });

    useEffect(() => {
        const fetchResumeStats = async () => {
            try {
                const response = await api.getMyAnalysis();
                const analysis = response.data.analysis;

                if (analysis) {
                    const resumeScore = analysis.resume_score || 0;
                    const skills = analysis.skills || [];
                    const recommendedSkills = analysis.recommended_skills || [];

                    const skillsCoverage = Math.min(skills.length * 5, 40);
                    const scoreContribution = Math.min(Math.round(resumeScore * 0.3), 30);
                    const improvementPotential = Math.min(recommendedSkills.length * 3, 30);

                    setStats({
                        progress: resumeScore,
                        breakdown: [
                            { value: skillsCoverage, color: '#E8A5A5', label: 'Skills' },
                            { value: scoreContribution, color: '#8FD38F', label: 'Score' },
                            { value: improvementPotential, color: '#D9CC9A', label: 'Potential' }
                        ]
                    });
                }
            } catch (error) {
                console.log('No resume analysis available yet');
                setStats({
                    progress: 0,
                    breakdown: [
                        { value: 0, color: '#E8A5A5', label: 'Skills' },
                        { value: 0, color: '#8FD38F', label: 'Score' },
                        { value: 0, color: '#D9CC9A', label: 'Potential' }
                    ]
                });
            }
        };

        if (currentUser) {
            fetchResumeStats();
        }
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-yellow-50 flex">
            <div className="hidden lg:flex flex-shrink-0 h-screen sticky top-0">
                <Sidebar
                    user={currentUser}
                    stats={stats}
                    unreadMessages={4}
                    unreadNotifications={0}
                    onLogout={handleLogout}
                />
            </div>

            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-dashboard-dark text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                        {currentUser?.photoURL ? (
                            <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <span className="font-medium">
                        Hi, {currentUser?.displayName?.split(' ')[0] || currentUser?.name?.split(' ')[0] || 'User'}!
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    Logout
                </button>
            </div>

            <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-hidden">
                <div className="h-full p-4 lg:p-6 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
