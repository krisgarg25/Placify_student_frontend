import React from 'react';
import Tag from './Tag';
import { Bookmark, ChevronRight } from 'lucide-react';

export default function JobCard({ job, isSelected = false, onClick, onSave, isCompact = false }) {
    if (!job) return null;

    const { title = '', company_name = '', location = '', salary_range = '', tags: propTags = [], logoUrl = '', employment_type = '' } = job;
    const tags = propTags.length > 0 ? propTags : [
        location?.split(',')[0]?.trim(),
        employment_type,
        employment_type?.toLowerCase().includes('remote') || location?.toLowerCase().includes('remote') ? 'Remote' : null
    ].filter(Boolean);

    const getLogoColor = (name) => {
        const colors = ['#5B9BD5', '#ED7D31', '#70AD47', '#FFC000', '#7030A0', '#C00000'];
        if (!name) return colors[0];
        return colors[name.charCodeAt(0) % colors.length];
    };

    return (
        <div
            onClick={onClick}
            className={`relative rounded-2xl cursor-pointer transition-all duration-200 
            ${isCompact ? 'p-3' : 'p-4'}
            ${isSelected ? 'bg-yellow-50 border-2 border-yellow-200 shadow-md' : 'bg-white hover:shadow-lg border border-gray-100'}`}
        >
            <div className="flex items-start gap-3">
                <div className={`${isCompact ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} flex items-center justify-center flex-shrink-0 overflow-hidden`} style={{ backgroundColor: logoUrl ? 'transparent' : getLogoColor(company_name) }}>
                    {logoUrl ? (
                        <img src={logoUrl} alt={company_name || 'Company'} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white font-bold text-sm">{company_name ? company_name.charAt(0).toUpperCase() : '?'}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-gray-900 leading-tight truncate ${isCompact ? 'text-sm' : 'text-sm'}`}>{title || '—'}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-gray-500 truncate">
                            {company_name || '—'}
                        </p>
                        {!isCompact && (
                            <>
                                {location && <span className="text-gray-300">•</span>}
                                {location && <p className="text-xs text-gray-500 truncate">{location}</p>}
                                {employment_type && <span className="text-gray-300">•</span>}
                                {employment_type && <p className="text-xs text-gray-500 truncate">{employment_type}</p>}
                            </>
                        )}
                    </div>

                    {!isCompact && <p className="font-semibold text-gray-900 text-sm mt-2">{salary_range || '—'}</p>}

                    {tags && tags.length > 0 && !isCompact && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {tags.slice(0, 3).map((tag, index) => (
                                <Tag key={index} label={tag} variant={index === 0 ? 'default' : index === 1 ? 'green' : 'blue'} size="sm" />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {!isCompact && (
                        <button onClick={(e) => { e.stopPropagation(); onSave && onSave(job); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
                            <Bookmark size={16} />
                        </button>
                    )}
                    <button className={`rounded-full bg-gray-900 hover:bg-gray-700 flex items-center justify-center text-white ${isCompact ? 'w-6 h-6' : 'w-8 h-8'}`}>
                        <ChevronRight size={isCompact ? 12 : 16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
