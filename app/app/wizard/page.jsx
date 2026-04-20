'use client';

import dynamic from 'next/dynamic';
import { useWizardStore } from '@/utils/store';
import { useEffect, useState } from 'react';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import ChildSafetyVerificationModal from '@/components/wizard/ChildSafetyVerificationModal';

// Dynamically import wizard steps
const Step1AgeSelection = dynamic(() =>
  import('@/components/wizard/Step1AgeSelection')
);
const Step2ThemeSelection = dynamic(() =>
  import('@/components/wizard/Step2ThemeSelection')
);
const Step3PageCount = dynamic(() =>
  import('@/components/wizard/Step3PageCount')
);
const Step4ChildDetails = dynamic(() =>
  import('@/components/wizard/Step4ChildDetails')
);
const Step5PhotoUpload = dynamic(() =>
  import('@/components/wizard/Step5PhotoUpload')
);
const Step6ReviewCheckout = dynamic(() =>
  import('@/components/wizard/Step6ReviewCheckout')
);

const steps = [
  { id: 1, title: 'Age Selection', component: Step1AgeSelection },
  { id: 2, title: 'Theme Selection', component: Step2ThemeSelection },
  { id: 3, title: 'Page Count', component: Step3PageCount },
  { id: 4, title: 'Child Details', component: Step4ChildDetails },
  { id: 5, title: 'Photo Upload', component: Step5PhotoUpload },
  { id: 6, title: 'Review & Checkout', component: Step6ReviewCheckout },
];

export default function WizardPage() {
  const { step: currentStep, loadDraft, clearDraft, resetWizard, formData, updateFormData } = useWizardStore();
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [draftStep, setDraftStep] = useState(null);
  const [error, setError] = useState(null);
  const [languageChanged, setLanguageChanged] = useState(false);

  useEffect(() => {
    // Check for existing draft on mount
    if (typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem('wizardDraft');
        if (draft) {
          const { step } = JSON.parse(draft);
          setDraftStep(step);
          setShowDraftPrompt(true);
        } else {
          // No draft, reset wizard and show safety modal
          resetWizard();
          setShowSafetyModal(true);
        }
      } catch (err) {
        console.error('[WIZARD] Error checking draft:', err);
        resetWizard();
        setShowSafetyModal(true);
      }
    }
  }, [resetWizard]);

  const handleResumeDraft = () => {
    loadDraft();
    setShowDraftPrompt(false);
  };

  const handleStartNew = () => {
    clearDraft();
    resetWizard();
    setShowDraftPrompt(false);
    setShowSafetyModal(true);
  };

  const handleSafetyModalComplete = (safetyData) => {
    console.log('[WIZARD] Child Safety Data Collected:', safetyData);
    
    // Store safety data
    updateFormData('childName', safetyData.childName);
    updateFormData('childAge', safetyData.childAge);
    updateFormData('parentEmail', safetyData.parentEmail);
    updateFormData('parentConsent', safetyData.parentConsent);
    
    // Auto-fill age group if age < 13, skip Step 1
    const age = parseInt(safetyData.childAge, 10);
    const { setStep } = useWizardStore.getState();
    
    if (age < 13) {
      // Auto-select age group based on child's age
      let ageGroup = '0-2';
      if (age >= 3 && age <= 5) ageGroup = '3-5';
      else if (age >= 6 && age <= 8) ageGroup = '5-8';
      else if (age >= 9 && age <= 12) ageGroup = '8-12';
      
      console.log(`[WIZARD] Auto-filling age group: ${ageGroup} for age ${age}`);
      updateFormData('ageGroup', ageGroup);
      
      // Skip Step 1, go directly to Step 2 (Theme Selection)
      setStep(2);
    } else {
      // For 13+, go to Step 1 (Age Selection)
      setStep(1);
    }
    
    setShowSafetyModal(false);
  };

  const handleSafetyModalCancel = () => {
    setShowSafetyModal(false);
    // Redirect to home if user cancels
    window.location.href = '/';
  };

  const handleLanguageChange = (newLanguage) => {
    console.log('[WIZARD] Language changed to:', newLanguage);
    // Update form data with new language
    updateFormData('storyLanguage', newLanguage);
    setLanguageChanged(true);
    
    // Emit event for story components to listen to
    const event = new CustomEvent('storyLanguageChanged', { 
      detail: { language: newLanguage } 
    });
    window.dispatchEvent(event);
  };

  const Step = steps[currentStep - 1]?.component;

  // Show draft prompt
  if (showDraftPrompt) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            📖 Welcome Back!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            We found your draft story in progress at <span className="font-semibold text-blue-600">Step {draftStep}</span>.
          </p>
          <p className="text-gray-500 mb-8">
            Would you like to continue where you left off?
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleStartNew}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-all"
            >
              Start New
            </button>
            <button
              onClick={handleResumeDraft}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              Resume Draft
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ✨ Create Your Child's Story
          </h1>
          <p className="text-gray-600 mb-6">
            Personalized, AI-powered storybooks for children
          </p>
          
          {/* Language Selector */}
          <div className="flex justify-center mb-4">
            <LanguageSelector 
              size="md" 
              showLabel={true}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                  index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-center ${
                  index + 1 <= currentStep ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Step {step.id}
              </div>
            ))}
          </div>
        </div>

        {/* Current step component */}
        {Step ? (
          <Step />
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 text-center">
            <p className="text-red-500 font-semibold text-lg">
              Unable to load Step {currentStep}. Please refresh the page.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            Need help? Email us at{' '}
            <a href="mailto:support@kidzstorymagic.com" className="text-blue-600 hover:underline">
              support@kidzstorymagic.com
            </a>
          </p>
          <p className="mt-1">
            Secure payment powered by{' '}
            <span className="font-semibold">Stripe</span>
          </p>
        </div>
      </div>

      {/* Child Safety Verification Modal */}
      <ChildSafetyVerificationModal
        isOpen={showSafetyModal}
        onComplete={handleSafetyModalComplete}
        onCancel={handleSafetyModalCancel}
      />
    </main>
  );
}
