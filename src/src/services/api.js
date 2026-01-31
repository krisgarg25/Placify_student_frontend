import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/';

const resumeBaseURL = import.meta.env.VITE_RESUME_ANALYZER_URL || baseURL;

const api = axios.create({
    baseURL: baseURL,
});

const resumeApi = axios.create({
    baseURL: resumeBaseURL,
});

let navigate = null;
let logout = null;

export const setNavigate = (fn) => { navigate = fn; };
export const setLogout = (fn) => { logout = fn; };

const setupInterceptors = (axiosInstance) => {
    axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    axiosInstance.interceptors.response.use((response) => {
        return response;
    }, (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (logout) logout();
            else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }

            if (navigate) {
                if (window.location.pathname !== '/login') {
                    navigate('/login');
                }
            } else {
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    });
};

setupInterceptors(api);
setupInterceptors(resumeApi);

api.getJobById = (id) => api.get(`/api/jobs/${id}`);
api.getEligibleJobs = () => api.get('/api/jobs/eligible');


api.submitApplication = (data) => api.post('/api/applications/apply', data);
api.getMyApplications = () => api.get('/api/applications/my-applications');
api.getApplicationById = (id) => api.get(`/api/applications/${id}`);
api.withdrawApplication = (id) => api.delete(`/api/applications/${id}`);

api.getMyAnalysis = () => resumeApi.get('/api/resume/my-analysis');
api.getResumeHistory = () => resumeApi.get('/api/resume/my-analyses');
api.analyzeResume = (data) => resumeApi.post('/api/resume/analyze', data);

api.uploadResume = (data) => api.post('/api/auth/upload-resume', data, { headers: { 'Content-Type': 'multipart/form-data' } });

api.updateProfile = (data) => api.put('/api/auth/update', data);

export default api;
