import React, { useState } from 'react';
import JobCard from './JobCard';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function JobList({
    jobs = [],
    selectedJobId = null,
    onJobSelect,
    onJobSave,
    searchPlaceholder = "Search jobs...",
    activeTab = 'new',
    onTabChange,
    isCompact = false
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [localActiveTab, setLocalActiveTab] = useState('new');

    const currentTab = onTabChange ? activeTab : localActiveTab;
    const handleTabChange = (id) => {
        if (onTabChange) {
            onTabChange(id);
        } else {
            setLocalActiveTab(id);
        }
    };

    const tabs = [
        { id: 'new', label: 'New' },
        { id: 'eligible', label: 'Eligible', icon: Sparkles }
    ];

    const filteredJobs = jobs.filter(job => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (job.title?.toLowerCase().includes(term)) || (job.company_name?.toLowerCase().includes(term)) || (job.location?.toLowerCase().includes(term));
    });

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-green-50 via-green-100 to-yellow-50 rounded-3xl overflow-hidden">
            <div className="p-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={searchPlaceholder} className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-gray-300 outline-none text-sm text-gray-700 placeholder-gray-400" />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <div className="flex gap-4 mt-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                                    pb-2 text-sm font-medium transition-colors relative flex items-center gap-1.5 whitespace-nowrap
                                    ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                {Icon && <Icon size={14} className={isActive ? 'text-amber-500' : ''} />}
                                {tab.label}
                                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 custom-scrollbar">
                {filteredJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">No jobs found</p>
                    </div>
                ) : (
                    filteredJobs.map(job => (
                        <JobCard
                            key={job._id || job.id}
                            job={job}
                            isSelected={selectedJobId === (job._id || job.id)}
                            onClick={() => onJobSelect && onJobSelect(job)}
                            onSave={onJobSave}
                            isCompact={isCompact}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
