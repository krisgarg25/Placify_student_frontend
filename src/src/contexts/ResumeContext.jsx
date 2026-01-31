import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const ResumeContext = createContext();

export const useResume = () => useContext(ResumeContext);

export const ResumeProvider = ({ children }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [resumeResult, setResumeResult] = useState(null);
    const [error, setError] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null); // Optional: if you want to keep the file name visible

    const analyzeResume = async ({ file, jobDesc }) => {
        setIsAnalyzing(true);
        setError(null);
        setResumeResult(null);
        setUploadedFile(file);

        try {

            const uploadFormData = new FormData();
            uploadFormData.append('resume', file);


            const uploadResponse = await api.post('/api/auth/upload-resume', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { resume_url } = uploadResponse.data;
            if (!resume_url) throw new Error("Failed to get resume URL");


            const analyzeResponse = await api.post('/api/resume/analyze', {
                cloudinary_url: resume_url
            });

            const data = analyzeResponse.data.analysis || analyzeResponse.data;


            const formattedResult = {
                primary_match: data.resume_score || 0,
                document_similarity: data.predicted_level === "Experienced" ? 85 : data.predicted_level === "Intermediate" ? 65 : 40,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                no_of_pages: data.no_of_pages,
                words: 'N/A',
                skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills
            };

            setResumeResult(formattedResult);
        } catch (err) {
            console.error("Resume analysis failed", err);
            setError(err.response?.data?.message || err.message || 'An error occurred during analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearAnalysis = () => {
        setResumeResult(null);
        setError(null);
        setUploadedFile(null);
    };

    return (
        <ResumeContext.Provider value={{
            isAnalyzing,
            resumeResult,
            error,
            uploadedFile,
            analyzeResume,
            clearAnalysis
        }}>
            {children}
        </ResumeContext.Provider>
    );
};
