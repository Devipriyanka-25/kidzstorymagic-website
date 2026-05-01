'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useWizardStore } from '@/utils/store';
import { useEffect, useState } from 'react';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import AgeGateModal from '@/components/wizard/AgeGateModal';
import ChildSafetyVerificationModal from '@/components/wizard/ChildSafetyVerificationModal';
import AdultUserFormModal from '@/components/wizard/AdultUserFormModal';

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

function deriveAgeGroupFromAge(value) {
  const age = Number(value);

  if (!Number.isFinite(age)) {
    return '';
  }

  if (age <= 2) return '0-2';
  if (age <= 5) return '3-5';
  if (age <= 8) return '5-8';
  if (age <= 12) return '8-12';
  return '12+';
}

const steps = [
  { id: 1, title: 'Age Selection', component: Step1AgeSelection },
  { id: 2, title: 'Theme Selection', component: Step2ThemeSelection },
  { id: 3, title: 'Page Count', component: Step3PageCount },
  { id: 4, title: 'Child Details', component: Step4ChildDetails },
  { id: 5, title: 'Photo Upload', component: Step5PhotoUpload },
  { id: 6, title: 'Review & Checkout', component: Step6ReviewCheckout },
];

function resolveRequestedWizardStep(value) {
  const requestedStep = Number(value);

  if (!Number.isInteger(requestedStep)) {
    return null;
  }

  if (requestedStep < 1 || requestedStep > steps.length) {
    return null;
  }

  return requestedStep;
}

export default function WizardPage() {
  const searchParams = useSearchParams();
  const { step: currentStep, loadDraft, clearDraft, resetWizard, formData, updateFormData } = useWizardStore();
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [showAgeGateModal, setShowAgeGateModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showAdultFormModal, setShowAdultFormModal] = useState(false);
  const [draftStep, setDraftStep] = useState(null);
  const [error, setError] = useState(null);
  const [languageChanged, setLanguageChanged] = useState(false);
  const [selectedAge, setSelectedAge] = useState(null);

  const applyQueryPrefill = () => {
    const childName = searchParams.get('childName')?.trim() || '';
    const childAge = searchParams.get('childAge')?.trim() || '';
    const ageGroup =
      searchParams.get('ageGroup')?.trim() || deriveAgeGroupFromAge(childAge);
    const theme = searchParams.get('theme')?.trim() || '';
    const originalTheme = searchParams.get('originalTheme')?.trim() || '';
    const chapterNumber = Number(searchParams.get('chapterNumber'));
    const isSeries = searchParams.get('isSeries') === 'true';
    const hasBundleFlag = searchParams.has('bundle');

    const hasPrefillData =
      childName ||
      childAge ||
      ageGroup ||
      theme ||
      originalTheme ||
      isSeries ||
      hasBundleFlag;

    if (!hasPrefillData) {
      return;
    }

    useWizardStore.setState((state) => ({
      formData: {
        ...state.formData,
        ...(childName ? { childName } : {}),
        ...(childAge ? { childAge } : {}),
        ...(ageGroup ? { ageGroup } : {}),
        ...(theme ? { theme } : {}),
        ...(isSeries ? { isSeries: true } : {}),
        ...(originalTheme ? { seriesOriginalTheme: originalTheme } : {}),
        ...(Number.isFinite(chapterNumber) && chapterNumber > 1
          ? { seriesChapterNumber: chapterNumber }
          : {}),
        ...(hasBundleFlag
          ? { seriesBundleSelected: searchParams.get('bundle') === 'true' }
          : {}),
      },
    }));
  };

  useEffect(() => {
    // Check for existing draft on mount
    if (typeof window !== 'undefined') {
      const requestedStep = resolveRequestedWizardStep(searchParams.get('step'));
      const requestedProjectId =
        searchParams.get('projectId')?.trim() ||
        searchParams.get('project_id')?.trim() ||
        '';
      const resumeSource = searchParams.get('resume')?.trim() || '';
      const shouldAutoResumeFromCheckout =
        resumeSource === 'checkout' ||
        Boolean(requestedProjectId && requestedStep === 6);

      try {
        const draft = localStorage.getItem('wizardDraft');
        const parsedDraft = draft ? JSON.parse(draft) : null;

        if (shouldAutoResumeFromCheckout) {
          const draftProjectId = String(
            parsedDraft?.formData?.projectId || ''
          ).trim();
          const shouldLoadSavedDraft =
            Boolean(parsedDraft) &&
            (!requestedProjectId ||
              !draftProjectId ||
              draftProjectId === requestedProjectId);

          if (shouldLoadSavedDraft) {
            loadDraft();
          } else {
            useWizardStore.setState((state) => ({
              step: requestedStep || 6,
              formData: {
                ...state.formData,
                projectId: requestedProjectId || state.formData.projectId || null,
                storyPreview:
                  requestedProjectId &&
                  String(state.formData.projectId || '').trim() !==
                    requestedProjectId
                    ? null
                    : state.formData.storyPreview || null,
              },
            }));
          }

          if (requestedProjectId) {
            useWizardStore.setState((state) => ({
              formData: {
                ...state.formData,
                projectId: requestedProjectId,
              },
            }));
          }

          useWizardStore.getState().setStep(requestedStep || 6);
          applyQueryPrefill();
          setShowDraftPrompt(false);
          setShowAgeGateModal(false);
          return;
        }

        if (parsedDraft) {
          const { step } = parsedDraft;
          setDraftStep(step);
          setShowDraftPrompt(true);
        } else {
          // No draft, reset wizard and show age gate modal
          resetWizard();
          applyQueryPrefill();
          setShowAgeGateModal(true);
        }
      } catch (err) {
        console.error('[WIZARD] Error checking draft:', err);
        resetWizard();
        applyQueryPrefill();
        setShowAgeGateModal(true);
      }
    }
  }, [loadDraft, resetWizard, searchParams]);

  const handleResumeDraft = () => {
    loadDraft();
    setShowDraftPrompt(false);
  };

  const handleAgeGateComplete = (ageData) => {
    console.log('[WIZARD] Age Gate Data:', ageData);
    setSelectedAge(ageData.age);
    setShowAgeGateModal(false);
    
    // Store the verified age in formData for use by downstream steps
    updateFormData('childAge', String(ageData.age));

    // Route based on age
    if (ageData.age < 13) {
      // Show child safety verification for users under 13
      console.log('[WIZARD] Age < 13, showing child safety verification');
      setShowSafetyModal(true);
    } else {
      // Show adult user form for users 13+
      console.log('[WIZARD] Age >= 13, showing adult user form');
      setShowAdultFormModal(true);
    }
  };

  const handleAgeGateCancel = () => {
    setShowAgeGateModal(false);
    // Redirect to home if user cancels
    window.location.href = '/';
  };

  const handleStartNew = () => {
    clearDraft();
    resetWizard();
    applyQueryPrefill();
    setShowDraftPrompt(false);
    setShowAgeGateModal(true);
  };

  const handleSafetyModalComplete = (safetyData) => {
    console.log('[WIZARD] Child Safety Data Collected:', safetyData);
    
    // Store safety data
    updateFormData('childName', safetyData.childName);
    updateFormData('childAge', safetyData.childAge);
    updateFormData('parentEmail', safetyData.parentEmail);
    updateFormData('parentConsent', safetyData.parentConsent);
    
    // Auto-fill age group based on child's age, go directly to Step 2 (Theme Selection)
    const age = parseInt(safetyData.childAge, 10);
    const { setStep } = useWizardStore.getState();
    
    let ageGroup = '0-2';
    if (age >= 3 && age <= 5) ageGroup = '3-5';
    else if (age >= 6 && age <= 8) ageGroup = '5-8';
    else if (age >= 9 && age <= 12) ageGroup = '8-12';
    
    console.log(`[WIZARD] Child safety verified for age ${age}, auto-filling age group: ${ageGroup}`);
    updateFormData('ageGroup', ageGroup);
    
    // Skip Step 1, go directly to Step 2 (Theme Selection)
    setStep(2);
    setShowSafetyModal(false);
  };

  const handleSafetyModalCancel = () => {
    setShowSafetyModal(false);
    // Redirect to home if user cancels
    window.location.href = '/';
  };

  const handleAdultFormComplete = (adultData) => {
    console.log('[WIZARD] Adult User Data Collected:', adultData);
    
    // Store adult user data - map to childName/childAge for compatibility with downstream steps
    updateFormData('username', adultData.username);
    updateFormData('userAge', adultData.age);
    updateFormData('isAdultUser', true);
    
    // Map adult data to child data fields for step compatibility
    // This allows adult users to proceed through the same step flow as children
    updateFormData('childName', adultData.username);  // Use username as the character name
    updateFormData('childAge', adultData.age);  // Use adult age
    updateFormData('childGender', adultData.gender);  // Use selected gender
    updateFormData('parentConsent', true);  // Adults don't need parental consent
    updateFormData('parentEmail', 'N/A');  // Placeholder for adults
    
    // Auto-select age group for adults - based on age (12+ = "12+" group)
    // Skip Step 1 entirely for adults since they've already provided age
    updateFormData('ageGroup', '12+');
    
    // Route to Step 2 (Theme Selection) - skip Step 1
    const { setStep } = useWizardStore.getState();
    setStep(2);
    setShowAdultFormModal(false);
  };

  const handleAdultFormCancel = () => {
    setShowAdultFormModal(false);
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

      {/* Age Gate Modal */}
      <AgeGateModal
        isOpen={showAgeGateModal}
        onComplete={handleAgeGateComplete}
        onCancel={handleAgeGateCancel}
      />

      {/* Adult User Form Modal */}
      <AdultUserFormModal
        isOpen={showAdultFormModal}
        onComplete={handleAdultFormComplete}
        onCancel={handleAdultFormCancel}
      />
    </main>
  );
}
