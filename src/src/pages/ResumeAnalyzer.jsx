import React, { useState, useEffect } from 'react';
import { useResume } from '../contexts/ResumeContext';
import api from '../services/api';
import { Clock, ArrowUp, ArrowDown, FileText, Sparkles, Target, Zap, TrendingUp, CheckCircle2, AlertCircle, History, Upload } from 'lucide-react';

const ResumeAnalyzer = () => {
    const { isAnalyzing, resumeResult: contextResult, error: contextError, analyzeResume, uploadedFile } = useResume();

    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [localError, setLocalError] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const displayResult = contextResult || selectedHistoryItem;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.getResumeHistory();
                const data = res.data.analyses || res.data || [];
                const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.analyzed_at) - new Date(a.analyzed_at)) : [];
                setHistory(sorted);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [contextResult]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            setLocalError('File size exceeds 5MB limit. Please upload a smaller file.');
            return;
        }

        setLocalError(null);
        setFile(selectedFile);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (!droppedFile) return;

        if (droppedFile.size > MAX_FILE_SIZE) {
            setLocalError('File size exceeds 5MB limit. Please upload a smaller file.');
            return;
        }

        setLocalError(null);
        setFile(droppedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setLocalError('Please upload a resume.');
            return;
        }
        setSelectedHistoryItem(null);
        await analyzeResume({ file, jobDesc });
    };

    const handleHistoryClick = (item) => {
        setSelectedHistoryItem(item);
    };

    const displayError = contextError || localError;

    const getComparison = () => {
        if (!displayResult || history.length < 1) return null;
        let currentScore = displayResult.resume_score || displayResult.primary_match;
        let previousItem = null;

        if (selectedHistoryItem) {
            const index = history.findIndex(h => h._id === selectedHistoryItem._id);
            if (index !== -1 && index + 1 < history.length) {
                previousItem = history[index + 1];
            }
        } else {
            previousItem = history.find(h => h._id !== displayResult._id);
        }

        if (!previousItem) return null;
        const prevScore = previousItem.resume_score || previousItem.primary_match;
        const diff = currentScore - prevScore;
        return { diff, prevScore, improved: diff > 0 };
    };

    const comparison = getComparison();
    const currentScore = displayResult?.resume_score || displayResult?.primary_match || 0;

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-amber-500 to-orange-500';
        return 'from-rose-500 to-pink-500';
    };

    return (
        <div className="flex h-full overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 overflow-y-auto hidden lg:flex flex-col">
                <div className="p-5 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/20">
                            <History size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Analysis History</h2>
                            <p className="text-xs text-gray-500">{history.length} scans</p>
                        </div>
                    </div>
                </div>
                <div className="p-3 flex-1 space-y-2">
                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-3xl flex items-center justify-center">
                                <FileText size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">No analyses yet</p>
                            <p className="text-gray-400 text-xs mt-1">Upload your first resume</p>
                        </div>
                    ) : (
                        history.map((item, index) => {
                            const score = item.resume_score || 0;
                            const isSelected = (selectedHistoryItem?._id === item._id) || (!selectedHistoryItem && contextResult?._id === item._id);
                            return (
                                <div
                                    key={item._id}
                                    onClick={() => handleHistoryClick(item)}
                                    className={`
                                        group p-4 rounded-3xl cursor-pointer transition-all duration-300 border
                                        ${isSelected
                                            ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 shadow-lg shadow-violet-500/10'
                                            : 'bg-white border-transparent hover:border-gray-200 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                                            {new Date(item.analyzed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className={`
                                            text-xs font-bold px-2.5 py-1 rounded-xl
                                            ${score >= 80 ? 'bg-emerald-100 text-emerald-700' : score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}
                                        `}>
                                            {score}%
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.job_role || "Resume Analysis"}</p>
                                    {index === 0 && (
                                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wider font-bold text-violet-600">
                                            <Sparkles size={10} /> Latest
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-12">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full mb-6">
                            <Sparkles size={14} className="text-violet-600" />
                            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">AI-Powered Analysis</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                            Resume <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Analyzer</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            Get instant AI feedback on your resume and track your improvement over time.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
                        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"></div>
                        <form onSubmit={handleSubmit} className="p-6 lg:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Resume PDF</label>
                                    <label className={`
                                        relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300
                                        ${dragActive ? 'border-violet-400 bg-violet-50 scale-[1.02]' : ''}
                                        ${file || uploadedFile ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'}
                                    `}>
                                        {file || uploadedFile ? (
                                            <div className="text-center">
                                                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                    <CheckCircle2 size={24} className="text-white" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">{file?.name || uploadedFile?.name || "Uploaded"}</p>
                                                <p className="text-xs text-gray-500 mt-1">Click to replace</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center group-hover:from-violet-100 group-hover:to-purple-100 transition-colors">
                                                    <Upload size={24} className="text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-600"><span className="font-semibold text-violet-600">Click to upload</span> or drag & drop</p>
                                                <p className="text-xs text-gray-400 mt-1">PDF only, max 5MB</p>
                                            </div>
                                        )}
                                        <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Job Description <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <textarea
                                        rows="7"
                                        value={jobDesc}
                                        onChange={(e) => setJobDesc(e.target.value)}
                                        className="w-full h-48 bg-gray-50/50 border border-gray-200 rounded-3xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none text-sm text-gray-700 placeholder-gray-400"
                                        placeholder="Paste the target job description here for a more accurate match analysis..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isAnalyzing || (!file && !uploadedFile)}
                                className={`
                                    w-full py-4 rounded-3xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center gap-3
                                    ${isAnalyzing || (!file && !uploadedFile)
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={20} />
                                        Analyze Resume
                                    </>
                                )}
                            </button>

                            {displayError && (
                                <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-3xl flex items-center gap-3 text-rose-700">
                                    <AlertCircle size={18} />
                                    <span className="text-sm font-medium">{displayError}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {displayResult && (
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-fade-in">
                            <div className="p-6 lg:p-8 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-black text-gray-900">Analysis Results</h2>
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                                Complete
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            {selectedHistoryItem
                                                ? `Analyzed on ${new Date(selectedHistoryItem.analyzed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                                                : 'Your latest resume analysis'
                                            }
                                        </p>
                                    </div>

                                    {comparison && (
                                        <div className={`
                                            flex items-center gap-4 px-6 py-4 rounded-3xl border-2
                                            ${comparison.improved
                                                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                                                : 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200'
                                            }
                                        `}>
                                            <div className={`
                                                w-12 h-12 rounded-2xl flex items-center justify-center
                                                ${comparison.improved ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-rose-500 shadow-lg shadow-rose-500/30'}
                                            `}>
                                                {comparison.improved ? <TrendingUp size={22} className="text-white" /> : <ArrowDown size={22} className="text-white" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">vs Previous</p>
                                                <p className={`text-2xl font-black ${comparison.improved ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {comparison.improved ? '+' : ''}{comparison.diff.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 lg:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-center">
                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                                        <div className="relative">
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <Target size={18} className="text-violet-400" />
                                                <span className="text-sm font-bold text-violet-400 uppercase tracking-wider">Match Score</span>
                                            </div>
                                            <div className={`text-7xl font-black mb-2 bg-gradient-to-r ${getScoreGradient(currentScore)} bg-clip-text text-transparent`}>
                                                {currentScore}%
                                            </div>
                                            <p className="text-slate-400 text-sm">Overall resume quality</p>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 text-center border border-gray-100">
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <Sparkles size={18} className="text-purple-500" />
                                            <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">Similarity</span>
                                        </div>
                                        <div className="text-6xl font-black text-gray-900 mb-2">
                                            {displayResult.similarity_score || displayResult.document_similarity || 0}%
                                        </div>
                                        <p className="text-gray-500 text-sm">Job description match</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 rounded-3xl p-6 mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Candidate Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: 'Name', value: displayResult.name },
                                            { label: 'Email', value: displayResult.email },
                                            { label: 'Phone', value: displayResult.mobile_number },
                                            { label: 'Word Count', value: displayResult.words ? `${displayResult.words} words` : null },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-gray-100">
                                                <span className="text-sm text-gray-500">{label}</span>
                                                <span className="text-sm font-semibold text-gray-900">{value || 'Not detected'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {displayResult.skills && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Extracted Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(() => {
                                                let skillsArray = [];
                                                if (Array.isArray(displayResult.skills)) {
                                                    skillsArray = displayResult.skills;
                                                } else if (typeof displayResult.skills === 'string') {
                                                    skillsArray = displayResult.skills.split(',');
                                                } else if (typeof displayResult.skills === 'object') {
                                                    skillsArray = Object.values(displayResult.skills);
                                                }
                                                return skillsArray.map((skill, idx) => (
                                                    <span key={idx} className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-sm font-medium rounded-2xl border border-violet-200/50">
                                                        {String(skill).trim()}
                                                    </span>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ResumeAnalyzer;
