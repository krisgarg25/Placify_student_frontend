import { useState, useEffect } from 'react';
import api from '../services/api';
import JobList from '../components/JobList';
import Tag from '../components/Tag';
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter, ChevronDown, Star, X, CheckCircle, Upload, ExternalLink } from 'lucide-react';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [resumeLink, setResumeLink] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);

    const [activeTab, setActiveTab] = useState('new');
    const [allJobs, setAllJobs] = useState([]);
    const [userSkills, setUserSkills] = useState([]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const [jobRes, analysisRes] = await Promise.all([
                    api.get('/api/jobs', { signal: controller.signal }),
                    api.getMyAnalysis().catch(() => ({ data: { analysis: null } }))
                ]);

                let fetchedJobs = [];
                if (jobRes.data && jobRes.data.jobs) {
                    fetchedJobs = jobRes.data.jobs;
                } else if (Array.isArray(jobRes.data)) {
                    fetchedJobs = jobRes.data;
                }
                setAllJobs(fetchedJobs);
                setJobs(fetchedJobs);

                if (analysisRes.data && analysisRes.data.analysis) {
                    setUserSkills(analysisRes.data.analysis.skills || []);
                }

                if (fetchedJobs.length > 0) {
                    setSelectedJob(fetchedJobs[0]);
                }
            } catch (err) {
                if (err.name !== 'CanceledError') {
                    console.error('Failed to load data:', err);
                    setError('Unable to load jobs');
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, []);

    // Filter Effect
    useEffect(() => {
        if (activeTab === 'eligible') {
            if (!userSkills.length) {
                setJobs([]);
            } else {
                const skillsLower = userSkills.map(s => s.toLowerCase());
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
                const filtered = scored.filter(j => j.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
                setJobs(filtered);
                if (filtered.length > 0) setSelectedJob(filtered[0]);
                else setSelectedJob(null);
            }
        } else {
            setJobs(allJobs);
            if (allJobs.length > 0 && !selectedJob) setSelectedJob(allJobs[0]);
        }
    }, [activeTab, allJobs, userSkills]);

    const handleJobSelect = (job) => setSelectedJob(job);
    const handleJobSave = (job) => console.log('Saving job:', job?._id);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!resumeLink || !selectedJob) return;

        setIsApplying(true);
        try {
            await api.post('/api/applications/apply', {
                job_id: selectedJob._id || selectedJob.id,
                resume_snapshot_url: resumeLink
            });
            setApplyStatus('success');
            setTimeout(() => {
                setShowApplyModal(false);
                setApplyStatus(null);
                setResumeLink('');
            }, 2000);
        } catch (err) {
            console.error('Apply failed:', err);
            setApplyStatus('error');
        } finally {
            setIsApplying(false);
        }
    };

    const getJobTags = (job) => {
        if (!job) return [];
        const tags = [];
        if (job.location) {
            const parts = job.location.split(',').map(p => p.trim());
            tags.push(...parts.slice(0, 2));
        }
        if (job.employment_type) tags.push(job.employment_type);
        if (job.is_remote || job.employment_type?.toLowerCase().includes('remote')) {
            tags.push('Remote');
        }
        return tags;
    };

    const getResponsibilities = (job) => {
        if (!job) return [];
        if (job.responsibilities && Array.isArray(job.responsibilities)) {
            return job.responsibilities;
        }
        if (job.description) {
            return job.description.split('\n').filter(line => line.trim()).slice(0, 5);
        }
        return [];
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex gap-4 overflow-hidden">
            <div className="w-full lg:w-96 flex-shrink-0 h-full">
                <JobList
                    jobs={jobs}
                    selectedJobId={selectedJob?._id || selectedJob?.id}
                    onJobSelect={handleJobSelect}
                    onJobSave={handleJobSave}
                    searchPlaceholder="Search jobs..."
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            <div className="hidden lg:flex flex-1 h-full">
                {loading ? (
                    <div className="flex-1 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-4"></div>
                            <p>Loading jobs...</p>
                        </div>
                    </div>
                ) : selectedJob ? (
                    <div className="flex-1 bg-white rounded-3xl shadow-sm p-8 overflow-y-auto relative">
                        <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                            <Star size={18} />
                        </button>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
                                <span className="text-white text-2xl font-bold">
                                    {selectedJob.company_name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedJob.title || '—'}</h2>
                            <p className="text-lg text-gray-600">{selectedJob.salary_range || '—'}</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {getJobTags(selectedJob).map((tag, index) => (
                                <Tag key={index} label={tag} variant={index === 0 ? 'default' : index === 1 ? 'green' : 'blue'} size="md" />
                            ))}
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">Job Description</h3>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {selectedJob.description || 'No description available.'}
                            </p>
                        </div>

                        {getResponsibilities(selectedJob).length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-3">Responsibilities</h3>
                                <ol className="space-y-2">
                                    {getResponsibilities(selectedJob).map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <div className="sticky bottom-0 pt-4 bg-white flex flex-col gap-3">
                            {selectedJob.apply_url && (
                                <a
                                    href={selectedJob.apply_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    Apply on Company Site <ExternalLink size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                        <p className="text-lg text-gray-400">Select a job to view details</p>
                    </div>
                )}
            </div>

            {showApplyModal && selectedJob && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
                        <button onClick={() => { setShowApplyModal(false); setApplyStatus(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Apply for {selectedJob.title || 'Position'}</h2>
                        <p className="text-sm text-gray-500 mb-6">{selectedJob.company_name || 'Company'}</p>

                        {applyStatus === 'success' ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Application Sent!</h3>
                            </div>
                        ) : (
                            <form onSubmit={handleApply}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resume Link</label>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="url" required value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} placeholder="https://drive.google.com/..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none" />
                                    </div>
                                </div>
                                {applyStatus === 'error' && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">Failed to submit.</div>}
                                <button type="submit" disabled={isApplying} className="w-full py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 disabled:opacity-50">
                                    {isApplying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
