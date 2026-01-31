import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import JobList from '../components/JobList';
import { ExternalLink, X, Upload, FileText, Briefcase, TrendingUp, BarChart3, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        applicationsCount: 0,
        resumeScore: null,
        resumeUploaded: false
    });
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState(null);
    const uploadTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (uploadTimeoutRef.current) {
                clearTimeout(uploadTimeoutRef.current);
            }
        };
    }, []);

    const [activeTab, setActiveTab] = useState('new');
    const [allJobs, setAllJobs] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [jobResponse, appsRes, analysisRes, historyRes] = await Promise.all([
                    api.get('/api/jobs'),
                    api.getMyApplications(),
                    api.getMyAnalysis().catch(() => ({ data: { analysis: null } })),
                    api.getResumeHistory().catch(() => ({ data: { analyses: [] } }))
                ]);

                let fetchedJobs = [];
                if (jobResponse.data && jobResponse.data.jobs) {
                    fetchedJobs = jobResponse.data.jobs;
                } else if (Array.isArray(jobResponse.data)) {
                    fetchedJobs = jobResponse.data;
                }
                setAllJobs(fetchedJobs);


                const analysisData = analysisRes.data.analysis;
                const historyData = historyRes.data.analyses || [];

                setStats({
                    applicationsCount: appsRes.data.applications?.length || 0,
                    resumeScore: analysisData?.resume_score || null,
                    resumeUploaded: !!analysisData,
                    skills: analysisData?.skills || [],
                    history: historyData
                });

                setJobs(fetchedJobs);

            } catch (err) {
                console.error('Failed to load dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (activeTab === 'eligible') {
            if (!stats.skills || stats.skills.length === 0) {
                setJobs([]);
            } else {
                const skillsLower = stats.skills.map(s => s.toLowerCase());
                const scored = allJobs.map(job => {
                    let score = 0;
                    const title = (job.title || '').toLowerCase();
                    const desc = (job.description || '').toLowerCase();
                    skillsLower.forEach(skill => {
                        if (title.includes(skill)) score += 3;
                        else if (desc.includes(skill)) score += 1;
                    });
                    return { ...job, matchScore: score };
                });
                const filtered = scored
                    .filter(j => j.matchScore > 0)
                    .sort((a, b) => b.matchScore - a.matchScore);
                setJobs(filtered);
            }
        } else {
            setJobs(allJobs);
        }
    }, [activeTab, allJobs, stats.skills]);

    const handleFileUpload = async (e) => {
        const fileInput = e.target;
        const file = fileInput.files[0];
        if (!file) return;

        setUploading(true);
        setUploadSuccess(false);
        setError(null);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('resume', file);
            const uploadRes = await api.uploadResume(uploadFormData);
            const { resume_url } = uploadRes.data;

            const analyzeRes = await api.analyzeResume({ cloudinary_url: resume_url });
            const data = analyzeRes.data.analysis || analyzeRes.data;

            setStats(prev => ({
                ...prev,
                resumeScore: data.resume_score,
                resumeUploaded: true
            }));

            setUploadSuccess(true);


            if (fileInput) fileInput.value = '';


            if (uploadTimeoutRef.current) clearTimeout(uploadTimeoutRef.current);

            uploadTimeoutRef.current = setTimeout(() => {
                setUploadSuccess(false);
                uploadTimeoutRef.current = null;
            }, 3000);
        } catch (err) {
            console.error('Upload failed:', err);

            setError('Failed to upload/analyze resume. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleJobSelect = (job) => {

        navigate('/jobs');
    };

    const getHistoryData = () => {
        const history = stats.history || [];

        const validHistory = history.filter(item => item.resume_score && item.resume_score > 0 && item.analyzed_at);

        if (validHistory.length === 0) {
            if (stats.resumeScore) {
                return [{ label: 'Today', score: stats.resumeScore, isActive: true }];
            }
            return [];
        }

        const sorted = [...validHistory]
            .sort((a, b) => new Date(a.analyzed_at) - new Date(b.analyzed_at))
            .slice(-5);

        return sorted.map((item, index) => {
            const date = new Date(item.analyzed_at);
            const label = index === sorted.length - 1
                ? 'Latest'
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return {
                label,
                score: item.resume_score,
                isActive: index === sorted.length - 1
            };
        });
    };
    const historyData = getHistoryData();

    if (loading && !jobs.length) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden p-1">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-2">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-500 cursor-pointer" onClick={() => setError(null)} />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Applications Submitted</p>
                        <h3 className="text-3xl font-bold text-gray-900">{stats.applicationsCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Briefcase size={24} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Resume Score</p>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {stats.resumeScore !== null ? `${stats.resumeScore}/100` : 'N/A'}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        {stats.resumeScore && stats.resumeScore > 70 ? <TrendingUp size={24} /> : <FileText size={24} />}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-2xl shadow-lg text-white flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
                    <div className="relative z-10">
                        <p className="text-gray-300 font-medium mb-1">Update Resume</p>
                        <h3 className="text-lg font-bold mb-2">Get better matches</h3>
                        <label className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                            {uploading ? 'Analyzing...' : uploadSuccess ? 'Done!' : 'Upload PDF'}
                            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            {!uploading && !uploadSuccess && <Upload size={16} className="ml-2" />}
                        </label>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                        <FileText size={100} />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0 max-h-[calc(100vh-280px)]">
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className="text-xl font-bold text-gray-900">Recommended Jobs</h2>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{jobs.length} results</span>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <JobList
                            jobs={jobs}
                            onJobSelect={handleJobSelect}
                            onJobSave={() => { }}
                            searchPlaceholder="Search..."
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            isCompact={true}
                        />
                    </div>
                </div>

                <div className="hidden lg:flex flex-1 flex-col h-full min-h-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">Detailed Analysis</h2>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col max-h-full overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Improvement Over Time</h3>
                                <p className="text-sm text-gray-500">Your resume score tracking</p>
                            </div>
                        </div>

                        <div className="h-64 flex items-center justify-center pb-4 relative">
                            {stats.resumeScore === null ? (
                                <div className="text-center text-gray-400 flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                                        <BarChart3 size={28} className="text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-500">No data yet</p>
                                        <p className="text-sm">Upload a resume to track progress</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                hide
                                                domain={[0, 100]}
                                            />
                                            <Tooltip
                                                cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    padding: '8px 12px'
                                                }}
                                                formatter={(value) => [`${value}%`, 'Score']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#10B981"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorScore)"
                                                activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex-shrink-0">
                            {stats.resumeScore && stats.resumeScore < 70 ? (
                                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
                                    <TrendingUp className="text-orange-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-orange-900 text-sm">Room for Improvement</h4>
                                        <p className="text-sm text-orange-700 mt-1">
                                            Your score is {stats.resumeScore}. Try adding more keywords from job descriptions to boost your match rate.
                                        </p>
                                    </div>
                                </div>
                            ) : stats.resumeScore ? (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex gap-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-green-900 text-sm">Great Progress!</h4>
                                        <p className="text-sm text-green-700 mt-1">
                                            Keep applying to increase your chances!
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
