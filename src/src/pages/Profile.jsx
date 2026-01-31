import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Book, GraduationCap, Award, Hash, Pencil, Check, X } from 'lucide-react';
import api from '../services/api';

const EditableField = ({ label, icon: Icon, fieldKey, value, type = 'text', editingField, tempValue, setTempValue, startEditing, handleSave, cancelEditing, loading }) => {
    const isEditing = editingField === fieldKey;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 flex items-center justify-between">
                <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                </div>
                {!isEditing && (
                    <button
                        onClick={() => startEditing(fieldKey, value)}
                        className="p-1 text-gray-400 hover:text-primary-end transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
            </label>

            {isEditing ? (
                <div className="flex items-center space-x-2">
                    <input
                        type={type}
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-start focus:border-primary-start outline-none transition-all"
                        autoFocus
                    />
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={cancelEditing}
                        disabled={loading}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                    {value || 'Not provided'}
                </p>
            )}
        </div>
    );
};

export default function Profile() {
    const { currentUser, setCurrentUser } = useAuth();
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [loading, setLoading] = useState(false);

    if (!currentUser) {
        return <div className="p-4 text-center">Loading profile...</div>;
    }

    const startEditing = (field, currentValue) => {
        setEditingField(field);
        setTempValue(currentValue);
    };

    const cancelEditing = () => {
        setEditingField(null);
        setTempValue('');
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const updateData = {};

            if (editingField === 'cgpa') {
                updateData.cgpa = parseFloat(tempValue);
                if (isNaN(updateData.cgpa) || updateData.cgpa < 0 || updateData.cgpa > 10) {
                    alert("Please enter a valid CGPA (0-10)");
                    setLoading(false);
                    return;
                }
            } else if (editingField === 'email') {
                updateData.email = tempValue;
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempValue)) {
                    alert("Please enter a valid email address");
                    setLoading(false);
                    return;
                }
            }

            const response = await api.updateProfile(updateData);


            if (setCurrentUser && response.data.user) {
                setCurrentUser(response.data.user);
            } else {
                window.location.reload();
            }

            setEditingField(null);
        } catch (err) {
            console.error('Failed to update profile:', err);
            const msg = err.response?.data?.message || 'Failed to update profile';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500">Manage your personal and academic information</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-status-applied-bg flex items-center justify-center text-primary-end text-2xl font-bold">
                            {currentUser.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{currentUser.name || 'Student'}</h2>
                            <p className="text-gray-500">{currentUser.email}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 flex items-center">
                            <Hash className="w-4 h-4 mr-2" />
                            University ID
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                            {currentUser.university_id || 'Not provided'}
                        </p>
                    </div>

                    <EditableField
                        label="Email Address"
                        icon={Mail}
                        fieldKey="email"
                        value={currentUser.email}
                        type="email"
                        editingField={editingField}
                        tempValue={tempValue}
                        setTempValue={setTempValue}
                        startEditing={startEditing}
                        handleSave={handleSave}
                        cancelEditing={cancelEditing}
                        loading={loading}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 flex items-center">
                            <Book className="w-4 h-4 mr-2" />
                            Branch / Major
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                            {currentUser.branch || 'Not provided'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Batch Year
                        </label>
                        <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">
                            {currentUser.batch_year || 'Not provided'}
                        </p>
                    </div>

                    <EditableField
                        label="Cumulative GPA"
                        icon={Award}
                        fieldKey="cgpa"
                        value={(() => {
                            const cgpa = parseFloat(currentUser.cgpa);
                            return Number.isFinite(cgpa) ? cgpa.toFixed(2) : '0.00';
                        })()}
                        type="number"
                        editingField={editingField}
                        tempValue={tempValue}
                        setTempValue={setTempValue}
                        startEditing={startEditing}
                        handleSave={handleSave}
                        cancelEditing={cancelEditing}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
