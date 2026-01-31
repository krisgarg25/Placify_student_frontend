import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPE = 'application/pdf';

    const validateFile = (selectedFile) => {
        setError(null);
        setUploadSuccess(false);

        if (!selectedFile) return false;

        if (selectedFile.type !== ALLOWED_TYPE) {
            setError('Only PDF files are allowed.');
            return false;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('File size must be less than 5MB.');
            return false;
        }

        return true;
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (validateFile(droppedFile)) {
            setFile(droppedFile);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (validateFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        setError(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/api/resume/upload', formData);
            setUploadSuccess(true);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Upload failed', err);
            setError('Failed to upload resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Resume</h3>

            {!file && !uploadSuccess && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
            relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors cursor-pointer
            ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
            ${error ? 'border-red-400 bg-red-50' : ''}
          `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-10 h-10 mb-3 ${isDragOver ? 'text-indigo-500' : 'text-gray-400'}`} />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF only (MAX. 5MB)</p>
                    </div>
                </div>
            )}

            {file && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 truncate">
                        <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                        <div className="flex-1 truncate">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button
                        onClick={removeFile}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        disabled={isUploading}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-3 flex items-center text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {uploadSuccess && (
                <div className="mt-3 flex items-center text-sm text-green-600 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    Resume uploaded successfully!
                </div>
            )}

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`
            mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}
          `}
                >
                    {isUploading ? 'Uploading...' : 'Submit Resume'}
                </button>
            )}
        </div>
    );
}
