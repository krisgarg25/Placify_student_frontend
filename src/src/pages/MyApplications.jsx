import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, Building2, MapPin, Calendar, Clock, XCircle, ExternalLink } from 'lucide-react';

export default function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.getMyApplications();
                setApplications(response.data.applications || []);
            } catch (err) {
                console.error('Failed to fetch applications:', err);
                setError('Failed to load your applications.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleWithdraw = async (appId) => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) return;

        try {
            await api.withdrawApplication(appId);
            setApplications(apps => apps.map(app =>
                app._id === appId ? { ...app, status: 'Withdrawn' } : app
            ));
        } catch (err) {
            console.error('Failed to withdraw:', err);
            alert('Failed to withdraw application.');
        }
    };

    const getStatusColor = (status) => {
        const s = String(status || '').toLowerCase();
        switch (s) {
            case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shortlisted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
            case 'offer': return 'bg-green-100 text-green-800 border-green-200';
            case 'interview': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                    <p className="text-gray-500">Track and manage your job applications</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            {applications.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl shadow-sm border border-border-light">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">Start exploring jobs and apply to opportunities!</p>
                    <Link to="/jobs" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map((app) => (
                        <div key={app._id} className="bg-card p-6 rounded-xl shadow-sm border border-border-light transition-all hover:shadow-md">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                {app.job_id?.title || 'Job Unavailable'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <Building2 className="w-4 h-4 mr-1.5 text-gray-400" />
                                                    {app.job_id?.company_name || 'Unknown Company'}
                                                </span>
                                                <span className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                                                    {app.job_id?.location || 'Location N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-2 border-t border-gray-50">
                                        <span className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                            Applied on {new Date(app.applied_at).toLocaleDateString()}
                                        </span>
                                        {app.resume_snapshot_url && (
                                            <a
                                                href={app.resume_snapshot_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-1.5" />
                                                View Resume
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {app.status?.toLowerCase() !== 'withdrawn' && app.status?.toLowerCase() !== 'rejected' && (
                                    <div className="flex items-start">
                                        <button
                                            onClick={() => handleWithdraw(app._id)}
                                            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center"
                                        >
                                            <XCircle className="w-4 h-4 mr-1.5" />
                                            Withdraw
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
