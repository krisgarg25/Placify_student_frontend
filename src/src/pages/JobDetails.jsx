import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, X, CheckCircle, Share2 } from 'lucide-react';
import api from '../services/api';
import Tag from '../components/Tag';


export default function JobDetails() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [resumeLink, setResumeLink] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError('Job ID is missing.');
            return;
        }

        const fetchJobDetails = async () => {
            try {
                const response = await api.getJobById(id);
                setJob(response.data.job);
            } catch (err) {
                console.error('Failed to fetch job details:', err);
                setError('Job not found or unavailable.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [id]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!resumeLink || !job) return;

        setIsApplying(true);
        try {
            await api.submitApplication({
                job_id: id,
                resume_snapshot_url: resumeLink
            });
            setApplyStatus('success');
            setTimeout(() => {
                setShowApplyModal(false);
                setApplyStatus(null);
                setResumeLink('');
            }, 2000);
        } catch (err) {
            console.error('Apply error:', err);
            setApplyStatus('error');
        } finally {
            setIsApplying(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: job?.title,
            text: `Check out this job at ${job?.company_name}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Job link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        }
    };

    const getJobTags = (job) => {
        if (!job) return [];
        const tags = [];
        if (job.location) {
            const parts = job.location.split(',').map(p => p.trim());
            tags.push(...parts.slice(0, 2));
        }
        if (job.employment_type) {
            tags.push(job.employment_type);
        }
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
            const lines = job.description.split('\n').filter(line => line.trim());
            return lines.slice(0, 5);
        }
        return [];
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mb-4"></div>
                <p className="text-gray-500">Loading job details...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">!</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
                <p className="text-gray-500 mb-6">{error || "The job you're looking for doesn't exist."}</p>
                <Link
                    to="/jobs"
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors inline-flex items-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Link
                to="/jobs"
                className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to All Jobs
            </Link>

            <div className="bg-white rounded-3xl shadow-sm p-8 relative">
                <div className="absolute top-6 right-6 flex gap-2">
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                        aria-label="Share job"
                    >
                        <Share2 size={18} />
                    </button>
                    <button
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                        aria-label="Bookmark job"
                    >
                        <Star size={18} />
                    </button>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
                        {job.logoUrl ? (
                            <img src={job.logoUrl} alt={job.company_name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <span className="text-white text-3xl font-bold">
                                {job.company_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        )}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-2xl">🔥</span>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {job.title || '—'}
                    </h1>
                    <p className="text-xl text-gray-600">
                        {job.salary_range || '—'}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {getJobTags(job).map((tag, index) => (
                        <Tag
                            key={index}
                            label={tag}
                            variant={index === 0 ? 'default' : index === 1 ? 'green' : index === 2 ? 'blue' : 'yellow'}
                            size="md"
                        />
                    ))}
                </div>

                <div className="mb-8">
                    <h2 className="font-bold text-gray-900 text-lg mb-4">Job Description</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {job.description || 'No description available.'}
                    </p>
                </div>

                {getResponsibilities(job).length > 0 && (
                    <div className="mb-8">
                        <h2 className="font-bold text-gray-900 text-lg mb-4">Responsibilities</h2>
                        <ol className="space-y-3">
                            {getResponsibilities(job).map((item, index) => (
                                <li key={index} className="flex items-start gap-3 text-gray-600">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </span>
                                    <span className="leading-relaxed pt-0.5">{item}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {job.eligibility_criteria && (
                    <div className="mb-8">
                        <h2 className="font-bold text-gray-900 text-lg mb-4">Eligibility</h2>
                        <ul className="space-y-2 text-gray-600">
                            {job.eligibility_criteria?.min_cgpa > 0 && (
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Minimum CGPA: <span className="font-semibold">{job.eligibility_criteria.min_cgpa}</span>
                                </li>
                            )}
                            {job.eligibility_criteria?.allowed_branches?.length > 0 && (
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Branches: <span className="font-semibold">{job.eligibility_criteria.allowed_branches.join(', ')}</span>
                                </li>
                            )}
                            {job.eligibility_criteria?.batch_years?.length > 0 && (
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Batches: <span className="font-semibold">{job.eligibility_criteria.batch_years.join(', ')}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                <button
                    onClick={() => setShowApplyModal(true)}
                    className="w-full py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-lg text-lg"
                >
                    Send Resume
                </button>
            </div>

            {showApplyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
                        <button
                            onClick={() => {
                                setShowApplyModal(false);
                                setApplyStatus(null);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Apply for {job.title || 'Position'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {job.company_name || 'Company'}
                        </p>

                        {applyStatus === 'success' ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Application Sent!</h3>
                                <p className="text-gray-500 mt-2">Good luck with your application.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleApply}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Resume Link
                                    </label>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="url"
                                            required
                                            value={resumeLink}
                                            onChange={(e) => setResumeLink(e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {applyStatus === 'error' && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                        Failed to submit application. You may have already applied.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isApplying}
                                    className="w-full py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
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
