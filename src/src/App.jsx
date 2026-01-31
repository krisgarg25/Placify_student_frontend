import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ResumeProvider } from './contexts/ResumeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import JobDetails from './pages/JobDetails';
import MyApplications from './pages/MyApplications';
import ResumeAnalyzer from './pages/ResumeAnalyzer';

function App() {
    return (
        <AuthProvider>
            <ResumeProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        <Route element={<ProtectedRoute />}>
                            <Route element={<DashboardLayout />}>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/jobs" element={<Jobs />} />
                                <Route path="/jobs/:id" element={<JobDetails />} />
                                <Route path="/applications" element={<MyApplications />} />
                                <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Route>
                        </Route>
                    </Routes>
                </Router>
            </ResumeProvider>
        </AuthProvider>
    );
}

export default App;
