// Wizard Step Component 4: Child Details
'use client';

import React, { useState } from 'react';
import { useWizardStore } from '@/utils/store';
import { storyAPI } from '@/utils/api';

export default function Step4ChildDetails() {
  const { formData, updateFormData, nextStep, prevStep } = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    updateFormData(field, value);
  };

  const isFormValid = formData.childName && formData.childGender;

  const handleContinue = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setError('');

    try {
      console.log('[STEP4] Creating project with details:', {
        age_group: formData.ageGroup,
        theme: formData.theme,
        page_count: formData.pageCount,
        child_name: formData.childName,
        child_gender: formData.childGender,
      });

      // Create the project now, before moving to Step 5
      const createResponse = await storyAPI.createProject({
        age_group: formData.ageGroup,
        theme: formData.theme,
        page_count: formData.pageCount,
        child_name: formData.childName,
        child_gender: formData.childGender,
        child_interests: formData.childInterests,
        child_notes: formData.childNotes,
        title: `${formData.childName}'s ${formData.theme} Story`
      });

      const projectId = createResponse.data.project.id;
      console.log('[STEP4] Project created successfully:', projectId);

      // Store the projectId in wizard state
      updateFormData('projectId', projectId);

      // Move to next step
      nextStep();
    } catch (err) {
      console.error('[STEP4_ERROR]', err);
      setError(err.response?.data?.error || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container w-full max-w-4xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-2xl">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Step 4: Child Details</h2>
          <p className="text-xl text-gray-600">Tell us about the child</p>
        </div>

        <form className="space-y-8 py-8">
          {/* Child Name */}
          <div>
            <label className="block text-lg font-bold mb-3 text-gray-900">Child's Name *</label>
            <input
              type="text"
              value={formData.childName}
              onChange={(e) => handleInputChange('childName', e.target.value)}
              placeholder="Enter child's name"
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all text-lg"
            />
          </div>

          {/* Child Gender */}
          <div>
            <label className="block text-lg font-bold mb-4 text-gray-900">Gender *</label>
            <div className="flex gap-8 flex-wrap">
              {['boy', 'girl', 'other'].map((gender) => (
                <label key={gender} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={formData.childGender === gender}
                    onChange={(e) => handleInputChange('childGender', e.target.value)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="capitalize text-lg font-semibold">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-lg font-bold mb-3 text-gray-900">Interests (comma-separated)</label>
            <input
              type="text"
              value={formData.childInterests}
              onChange={(e) => handleInputChange('childInterests', e.target.value)}
              placeholder="e.g., sports, reading, drawing"
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all text-lg"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-lg font-bold mb-3 text-gray-900">Special Notes</label>
            <textarea
              value={formData.childNotes}
              onChange={(e) => handleInputChange('childNotes', e.target.value)}
              placeholder="Any special requests or information..."
              rows="5"
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all text-lg font-medium resize-none"
            />
          </div>
        </form>

        <div className="pt-6 flex gap-4">
          <button
            onClick={prevStep}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-xl hover:bg-gray-400 transition-all duration-300 shadow-md text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!isFormValid || loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 transition-all duration-300 shadow-lg disabled:shadow-none text-lg"
          >
            {loading ? '⏳ Creating Project...' : 'Continue'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
            <p className="text-red-700 font-semibold">⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
