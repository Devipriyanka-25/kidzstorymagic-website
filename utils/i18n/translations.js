/**
 * frontend/utils/i18n/translations.js
 *
 * Multilingual translations for the app
 * Centralized i18n configuration
 * Easy to extend with new languages and keys
 */

const translations = {
  en: {
    // Form Labels
    childName: 'Child\'s Name',
    childAge: 'Child\'s Age',
    parentEmail: 'Parent/Guardian Email',
    parentConsent: 'I confirm I am a parent/guardian',
    storyLanguage: 'Story Language',
    theme: 'Story Theme',
    storyPrompt: 'Story Prompt (Optional)',

    // Placeholders
    childNamePlaceholder: 'Enter child\'s name',
    childAgePlaceholder: '1 - 17',
    parentEmailPlaceholder: 'parent@example.com',
    storyPromptPlaceholder: 'e.g., "Make it about overcoming fears"',

    // Buttons
    generateStory: 'Generate Story',
    uploadPhotos: 'Upload Photos',
    downloadStory: 'Download Story',
    resetForm: 'Reset',
    next: 'Next',
    back: 'Back',

    // Validation Messages
    nameRequired: 'Child\'s name is required',
    nameTooShort: 'Name must be at least 2 characters',
    ageRequired: 'Age is required',
    ageInvalid: 'Age must be between 1 and 17',
    emailRequired: 'Parent email is required for children under 13',
    emailInvalid: 'Please enter a valid email address',
    consentRequired: 'Parent consent is required',
    languageRequired: 'Please select a language',

    // Safety Messages
    safetyTitle: 'Child Safety Information',
    photosNotStored: 'Photos are not stored after checkout',
    photosDeleted: 'All uploaded photos will be deleted after processing',
    childDataDeleted: 'Child details and prompts will be deleted after story generation',
    noDataSharing: 'We never share or sell any child data',
    consentRequired13: 'Parental consent is required for children under 13',

    // Success Messages
    storyGenerated: 'Story generated successfully!',
    storyReady: 'Your story is ready to view',
    storyExported: 'Story exported successfully',

    // Error Messages
    errorGeneratingStory: 'Error generating story. Please try again.',
    errorUploadingPhotos: 'Error uploading photos',
    errorExportingStory: 'Error exporting story',
    somethingWentWrong: 'Something went wrong. Please try again.',

    // Sections
    uploadPhotosTitle: 'Upload Photos',
    uploadPhotosDescription: 'Upload 3-10 photos of your child or their favorite things',
    storyPreviewTitle: 'Your Story',
    languageSelected: 'Language',
    
    // Help Text
    languageHelpText: 'Choose the language for your story',
    photosHelpText: 'Supported formats: JPG, PNG, WebP (Max 10 images)',
    consentHelpText: 'By checking this box, you confirm you have authority to consent',
  },

  ta: {
    // Form Labels
    childName: 'குழந்தையின் பெயர்',
    childAge: 'குழந்தையின் வயது',
    parentEmail: 'பெற்றோர்/பாதுகாவலர் மின்னஞ்சல்',
    parentConsent: 'நான் பெற்றோர்/பாதுகாவலர் என்பதை உறுதிப்படுத்துகிறேன்',
    storyLanguage: 'கதைக்கான மொழி',
    theme: 'கதையின் தீம்',
    storyPrompt: 'கதைக்கான குறிப்பு (விரும்பினால்)',

    // Placeholders
    childNamePlaceholder: 'குழந்தையின் பெயரை உள்ளிடவும்',
    childAgePlaceholder: '1 - 17',
    parentEmailPlaceholder: 'parent@example.com',
    storyPromptPlaceholder: 'எ.கா., "தைரியத்தைப் பற்றி கதை சொல்லவும்"',

    // Buttons
    generateStory: 'கதை உருவாக்கவும்',
    uploadPhotos: 'புகைப்படங்களை பதிவேற்றவும்',
    downloadStory: 'கதையைப் பதிவிறக்கவும்',
    resetForm: 'மீட்டமை',
    next: 'அடுத்து',
    back: 'முந்தைய',

    // Validation Messages
    nameRequired: 'குழந்தையின் பெயர் தேவை',
    nameTooShort: 'பெயர் குறைந்தது 2 எழுத்துக்கள் இருக்க வேண்டும்',
    ageRequired: 'வயது தேவை',
    ageInvalid: 'வயது 1 முதல் 17 வரை இருக்க வேண்டும்',
    emailRequired: '13 வயதுக்குக் குறைய பெற்றோரின் மின்னஞ்சல் தேவை',
    emailInvalid: 'தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்',
    consentRequired: 'பெற்றோரின் சம்மதி தேவை',
    languageRequired: 'தயவுசெய்து ஒரு மொழியைத் தேர்ந்தெடுக்கவும்',

    // Safety Messages
    safetyTitle: 'குழந்தை பாதுகாப்பு தகவல்',
    photosNotStored: 'வாங்கிய பிறகு புகைப்படங்கள் சேமிக்கப்படாது',
    photosDeleted: 'செயல்முறைக்குப் பிறகு அனைத்து பதிவேற்றப்பட்ட புகைப்படங்களும் நீக்கப்படும்',
    childDataDeleted: 'கதை உருவாக்கப்பட்ட பிறகு குழந்தையின் விவரங்கள் மற்றும் தூண்டுதல்கள் நீக்கப்படும்',
    noDataSharing: 'நாம் எந்த குழந்தை தரவையும் பகிர்ந்து கொள்ளோம் அல்லது விற்கோம் இல்லை',
    consentRequired13: '13 வயதுக்குக் குறைய குழந்தைகளுக்கு பெற்றோரின் சம்மதி தேவை',

    // Success Messages
    storyGenerated: 'கதை வெற்றிகரமாக உருவாக்கப்பட்டது!',
    storyReady: 'உங்கள் கதை பார்க்கத் தயாரაக்கப்பட்டுள்ளது',
    storyExported: 'கதை வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது',

    // Error Messages
    errorGeneratingStory: 'கதை உருவாக்கத்தில் பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    errorUploadingPhotos: 'புகைப்படங்களை பதிவேற்றுவதில் பிழை',
    errorExportingStory: 'கதையை ஏற்றுமதி செய்வதில் பிழை',
    somethingWentWrong: 'ஏதாவது தவறாக இருந்தது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',

    // Sections
    uploadPhotosTitle: 'புகைப்படங்களை பதிவேற்றவும்',
    uploadPhotosDescription: 'உங்கள் குழந்தையின் அல்லது அவர்களின் பிரिय விஷயங்களின் 3-10 புகைப்படங்களைப் பதிவேற்றவும்',
    storyPreviewTitle: 'உங்கள் கதை',
    languageSelected: 'மொழி',
    
    // Help Text
    languageHelpText: 'உங்கள் கதைக்கான மொழியைத் தேர்ந்தெடுக்கவும்',
    photosHelpText: 'ஆதரிக்கப்படும் வடிவங்கள்: JPG, PNG, WebP (அதிகபட்சம் 10 படங்கள்)',
    consentHelpText: 'இந்த பெட்டியைக் கடந்து சென்றுவிட்டுவிட்டுவிட்டுவிட்டுவிட்டுவிட்டு, நீங்கள் சம்மதிக்கிறீர்கள்',
  },

  hi: {
    // Form Labels
    childName: 'बच्चे का नाम',
    childAge: 'बच्चे की उम्र',
    parentEmail: 'माता-पिता/अभिभावक ईमेल',
    parentConsent: 'मैं पुष्टि करता हूँ कि मैं माता-पिता/अभिभावक हूँ',
    storyLanguage: 'कहानी की भाषा',
    theme: 'कहानी की थीम',
    storyPrompt: 'कहानी के लिए संकेत (वैकल्पिक)',

    // Placeholders
    childNamePlaceholder: 'बच्चे का नाम दर्ज करें',
    childAgePlaceholder: '1 - 17',
    parentEmailPlaceholder: 'parent@example.com',
    storyPromptPlaceholder: 'उदा., "साहस के बारे में कहानी सुनाएं"',

    // Buttons
    generateStory: 'कहानी बनाएं',
    uploadPhotos: 'फ़ोटो अपलोड करें',
    downloadStory: 'कहानी डाउनलोड करें',
    resetForm: 'रीसेट करें',
    next: 'अगला',
    back: 'पीछे',

    // Validation Messages
    nameRequired: 'बच्चे का नाम आवश्यक है',
    nameTooShort: 'नाम कम से कम 2 वर्णों का होना चाहिए',
    ageRequired: 'उम्र आवश्यक है',
    ageInvalid: 'उम्र 1 से 17 के बीच होनी चाहिए',
    emailRequired: '13 साल से कम उम्र के बच्चों के लिए माता-पिता का ईमेल आवश्यक है',
    emailInvalid: 'कृपया एक वैध ईमेल पता दर्ज करें',
    consentRequired: 'माता-पिता की सहमति आवश्यक है',
    languageRequired: 'कृपया एक भाषा चुनें',

    // Safety Messages
    safetyTitle: 'बाल सुरक्षा जानकारी',
    photosNotStored: 'चेकआउट के बाद फ़ोटो संग्रहीत नहीं की जाती हैं',
    photosDeleted: 'प्रक्रिया के बाद सभी अपलोड की गई फ़ोटो हटाई जाएंगी',
    childDataDeleted: 'कहानी उत्पन्न होने के बाद बाल विवरण और संकेत हटाए जाएंगे',
    noDataSharing: 'हम कभी भी किसी बाल डेटा को साझा या बेचते नहीं हैं',
    consentRequired13: '13 साल से कम उम्र के बच्चों के लिए माता-पिता की सहमति आवश्यक है',

    // Success Messages
    storyGenerated: 'कहानी सफलतापूर्वक बनाई गई!',
    storyReady: 'आपकी कहानी देखने के लिए तैयार है',
    storyExported: 'कहानी सफलतापूर्वक निर्यात की गई',

    // Error Messages
    errorGeneratingStory: 'कहानी बनाने में त्रुटि। कृपया पुनः प्रयास करें।',
    errorUploadingPhotos: 'फ़ोटो अपलोड करने में त्रुटि',
    errorExportingStory: 'कहानी निर्यात करने में त्रुटि',
    somethingWentWrong: 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',

    // Sections
    uploadPhotosTitle: 'फ़ोटो अपलोड करें',
    uploadPhotosDescription: 'अपने बच्चे या उनकी पसंद की चीजों की 3-10 फ़ोटो अपलोड करें',
    storyPreviewTitle: 'आपकी कहानी',
    languageSelected: 'भाषा',
    
    // Help Text
    languageHelpText: 'अपनी कहानी के लिए भाषा चुनें',
    photosHelpText: 'समर्थित प्रारूप: JPG, PNG, WebP (अधिकतम 10 छवियाँ)',
    consentHelpText: 'इस बॉक्स को चेक करके, आप पुष्टि करते हैं कि आपको सहमति देने का अधिकार है',
  },

  te: {
    // Form Labels
    childName: 'పిల్లల పేరు',
    childAge: 'పిల్లల వయస్సు',
    parentEmail: 'తల్లిదండ్రుల/సంరక్షకుల ఇమెయిల్',
    parentConsent: 'నేను తల్లిదండ్రుల/సంరక్షకుడిని నిర్ధారిస్తున్నాను',
    storyLanguage: 'కథ భాష',
    theme: 'కథ థీమ్',
    storyPrompt: 'కథ ప్రాంప్ట్ (ఐచ్ఛికం)',

    // Placeholders
    childNamePlaceholder: 'పిల్లల పేరు నమోదు చేయండి',
    childAgePlaceholder: '1 - 17',
    parentEmailPlaceholder: 'parent@example.com',
    storyPromptPlaceholder: 'ఉ.దా., "ధైర్యం గురించి కథ చెప్పండి"',

    // Buttons
    generateStory: 'కథను జన్మించండి',
    uploadPhotos: 'ఫోటోలను అప్‌లోడ్ చేయండి',
    downloadStory: 'కథను డౌన్‌లోడ్ చేయండి',
    resetForm: 'రీసెట్ చేయండి',
    next: 'తరువాత',
    back: 'ఆ‌్ర‌్ఫ‌్',

    // Validation Messages
    nameRequired: 'పిల్లల పేరు అవసరం',
    nameTooShort: 'పేరు కనీసం 2 అక్షరాలుగా ఉండాలి',
    ageRequired: 'వయస్సు అవసరం',
    ageInvalid: 'వయస్సు 1 నుండి 17 మధ్య ఉండాలి',
    emailRequired: '13 సంవత్సరాల కంటే తక్కువ వయస్సు ఉన్న పిల్లల కోసం తల్లిదండ్రుల ఇమెయిల్ అవసరం',
    emailInvalid: 'దయచేసి చెల్లుబాటు చేసిన ఇమెయిల్ చిరునామాను నమోదు చేయండి',
    consentRequired: 'తల్లిదండ్రుల సమ్మతి అవసరం',
    languageRequired: 'దయచేసి భాష ఎంచుకోండి',

    // Safety Messages
    safetyTitle: 'బాల్య సురక్ష సమాచారం',
    photosNotStored: 'చెక్‌అవుట్ తర్వాత ఫోటోలు నిల్వ చేయబడవు',
    photosDeleted: 'ప్రక్రియ తర్వాత అప్‌లోడ్ చేసిన అన్ని ఫోటోలు తీసివేయబడతాయి',
    childDataDeleted: 'కథ ఉత్పత్తి తర్వాత పిల్లల వివరాలు మరియు సూచనలు తీసివేయబడతాయి',
    noDataSharing: 'మేము ఎప్పుడూ ఏ చైల్డ్ డేటాను భాగస్వామ్యం చేయము లేదా విక్రయించము',
    consentRequired13: '13 సంవత్సరాల కంటే తక్కువ వయస్సు ఉన్న పిల్లల కోసం తల్లిదండ్రుల సమ్మతి అవసరం',

    // Success Messages
    storyGenerated: 'కథ విజయవంతంగా ఉత్పత్తి చేయబడింది!',
    storyReady: 'మీ కథ చూడడానికి సిద్ధంగా ఉంది',
    storyExported: 'కథ విజయవంతంగా ఎగుమతి చేయబడింది',

    // Error Messages
    errorGeneratingStory: 'కథ ఉత్పత్తిలో లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.',
    errorUploadingPhotos: 'ఫోటోలను అప్‌లోడ్ చేయడంలో లోపం',
    errorExportingStory: 'కథను ఎగుమతి చేయడంలో లోపం',
    somethingWentWrong: 'ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.',

    // Sections
    uploadPhotosTitle: 'ఫోటోలను అప్‌లోడ్ చేయండి',
    uploadPhotosDescription: 'మీ పిల్లల లేదా వారి ఇష్టమైన విషయాల యొక్క 3-10 ఫోటోలను అప్‌లోడ్ చేయండి',
    storyPreviewTitle: 'మీ కథ',
    languageSelected: 'భాష',
    
    // Help Text
    languageHelpText: 'మీ కథకు భాష ఎంచుకోండి',
    photosHelpText: 'సపోర్టెడ్ ఫార్మాట్‌లు: JPG, PNG, WebP (గరిష్ట 10 చిత్రాలు)',
    consentHelpText: 'ఈ బాక్స్‌ను చెక్ చేయడం ద్వారా, మీరు సమ్మతి ఇవ్వడానికి అధికారం ఉందని నిర్ధారిస్తారు',
  },

  kn: {
    // Form Labels
    childName: 'ಮಗುವಿನ ಹೆಸರು',
    childAge: 'ಮಗುವಿನ ವಯಸ್ಸು',
    parentEmail: 'ಪೋಷಕ/ರಕ್ಷಕ ಇಮೇಲ್',
    parentConsent: 'ನಾನು ಪೋಷಕ/ರಕ್ಷಕ ಎಂದು ದೃಢೀಕರಿಸುತ್ತೇನೆ',
    storyLanguage: 'ಕಥೆಯ ಭಾಷೆ',
    theme: 'ಕಥೆಯ ಥೀಮ್',
    storyPrompt: 'ಕಥೆಯ ತುಣುಕು (ಐಚ್ಛಿಕ)',

    // Placeholders
    childNamePlaceholder: 'ಮಗುವಿನ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    childAgePlaceholder: '1 - 17',
    parentEmailPlaceholder: 'parent@example.com',
    storyPromptPlaceholder: 'ಉದಾ., "ಧೈರ್ಯದ ಬಗ್ಗೆ ಕಥೆ ಹೇಳಿ"',

    // Buttons
    generateStory: 'ಕಥೆ ರಚಿಸಿ',
    uploadPhotos: 'ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    downloadStory: 'ಕಥೆಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    resetForm: 'ಮರುಹೊಂದಿಸಿ',
    next: 'ಮುಂದೆ',
    back: 'ಹಿಂದೆ',

    // Validation Messages
    nameRequired: 'ಮಗುವಿನ ಹೆಸರು ಅಗತ್ಯವಾಗಿದೆ',
    nameTooShort: 'ಹೆಸರು ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು',
    ageRequired: 'ವಯಸ್ಸು ಅಗತ್ಯವಾಗಿದೆ',
    ageInvalid: 'ವಯಸ್ಸು 1 ರಿಂದ 17 ರ ನಡುವೆ ಇರಬೇಕು',
    emailRequired: '13 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನ ಮಕ್ಕಳಿಗೆ ಪೋಷಕರ ಇಮೇಲ್ ಅಗತ್ಯವಾಗಿದೆ',
    emailInvalid: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ',
    consentRequired: 'ಪೋಷಕರ ಸಮ್ಮತಿ ಅಗತ್ಯವಾಗಿದೆ',
    languageRequired: 'ದಯವಿಟ್ಟು ಒಂದು ಭಾಷೆಯನ್ನು ಆರಿಸಿ',

    // Safety Messages
    safetyTitle: 'ಮೌಲಿಕ ಸುರಕ್ಷತೆ ಮಾಹಿತಿ',
    photosNotStored: 'ಚೆಕ್‌ಔಟ್ ಮಾಡಿದ ನಂತರ ಫೋಟೋಗಳನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ',
    photosDeleted: 'ಪ್ರಕ್ರಿಯೆಯ ನಂತರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಎಲ್ಲಾ ಫೋಟೋಗಳನ್ನು ಅಳಿಸಲಾಗುತ್ತದೆ',
    childDataDeleted: 'ಕಥೆ ಉತ್ಪಾದಿಸಿದ ನಂತರ ಮೌಲಿಕ ವಿವರಗಳು ಮತ್ತು ಸೂಚನೆಗಳನ್ನು ಅಳಿಸಲಾಗುತ್ತದೆ',
    noDataSharing: 'ನಾವು ಎಂದಿಗೂ ಯಾವುದೇ ಮೌಲಿಕ ಮಾಹಿತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ ಅಥವಾ ಮಾರುತ್ತೇವೆ',
    consentRequired13: '13 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನ ಮಕ್ಕಳಿಗೆ ಪೋಷಕರ ಸಮ್ಮತಿ ಅಗತ್ಯವಾಗಿದೆ',

    // Success Messages
    storyGenerated: 'ಕಥೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಯಿತು!',
    storyReady: 'ನಿಮ್ಮ ಕಥೆ ವೀಕ್ಷಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆ',
    storyExported: 'ಕಥೆ ಯಶಸ್ವಿಯಾಗಿ ರಫ್ತು ಮಾಡಲಾಯಿತು',

    // Error Messages
    errorGeneratingStory: 'ಕಥೆ ರಚನೆಯಲ್ಲಿ ಸಾಂದರ್ಭಿಕ ವಿಷಯ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    errorUploadingPhotos: 'ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ಸಾಂದರ್ಭಿಕ ವಿಷಯ',
    errorExportingStory: 'ಕಥೆಯನ್ನು ರಫ್ತು ಮಾಡುವಲ್ಲಿ ಸಾಂದರ್ಭಿಕ ವಿಷಯ',
    somethingWentWrong: 'ಏನಾದರೂ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',

    // Sections
    uploadPhotosTitle: 'ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    uploadPhotosDescription: 'ನಿಮ್ಮ ಮೌಲಿಕ ಅಥವಾ ಅವರ ನೆಚ್ಚಿನ ವಿಷಯಗಳ 3-10 ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    storyPreviewTitle: 'ನಿಮ್ಮ ಕಥೆ',
    languageSelected: 'ಭಾಷೆ',
    
    // Help Text
    languageHelpText: 'ನಿಮ್ಮ ಕಥೆಗೆ ಭಾಷೆಯನ್ನು ಆರಿಸಿ',
    photosHelpText: 'ಸಮರ್ಥನೀಯ ಫಾರ್ಮ್‌ಯಾಟ್‌ಗಳು: JPG, PNG, WebP (ಗರಿಷ್ಠ 10 ಚಿತ್ರಗಳು)',
    consentHelpText: 'ಈ ಪೆಟ್ಟಿಗೆಯನ್ನು ಚೆಕ್ ಮಾಡುವ ಮೂಲಕ, ನೀವು ಸಮ್ಮತಿ ನೀಡಲು ಅಧಿಕಾರ ಹೊಂದಿದ್ದೀರಿ ಎಂಬುದನ್ನು ದೃಢೀಕರಿಸುತ್ತೀರಿ',
  },

  ml: {
    // Form Labels
    childName: 'കുട്ടിയുടെ പേര്',
    childAge: 'കുട്ടിയുടെ പ്രായം',
    parentEmail: 'മാതാപിതാ/സംരക്ഷകൻ ഇമെയിൽ',
    parentConsent: 'ഞാൻ മാതാപിതാ/സംരക്ഷകൻ ആണെന്ന് സ്ഥിരീകരിക്കുന്നു',
    storyLanguage: 'കഥയുടെ ഭാഷ',
    theme: 'കഥയുടെ തീം',
    storyPrompt: 'കഥയ്ക്കുള്ള പ്രാംപ്ട് (ഐച്ഛികം)',

    // Placeholders
    childNamePlaceholder: 'കുട്ടിയുടെ പേര് നിൽപ്പിക്കുക',
    childAgePlaceholder: '1 - 17',
    parentEmailPlaceholder: 'parent@example.com',
    storyPromptPlaceholder: 'ഉ. ദാ., "ധൈര്യം സംബന്ധിച്ച കഥ പറയുക"',

    // Buttons
    generateStory: 'കഥ സൃഷ്ടിക്കുക',
    uploadPhotos: 'ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക',
    downloadStory: 'കഥ ഡൗൺലോഡ് ചെയ്യുക',
    resetForm: 'റിസെറ്റ് ചെയ്യുക',
    next: 'അടുത്തത്',
    back: 'പിന്നിലേക്ക്',

    // Validation Messages
    nameRequired: 'കുട്ടിയുടെ പേര് ആവശ്യമാണ്',
    nameTooShort: 'പേരിന് കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം',
    ageRequired: 'പ്രായം ആവശ്യമാണ്',
    ageInvalid: 'പ്രായം 1 നും 17 നും ഇടയിലായിരിക്കണം',
    emailRequired: '13 വയസ്സിൽ താഴെയുള്ള കുട്ടികൾക്കായി മാതാപിതാ ഇമെയിൽ ആവശ്യമാണ്',
    emailInvalid: 'ദയവായി സാധുവായ ഇമെയിൽ വിലാസം നിൽപ്പിക്കുക',
    consentRequired: 'മാതാപിതാ സമ്മതി ആവശ്യമാണ്',
    languageRequired: 'ദയവായി ഒരു ഭാഷ തിരഞ്ഞെടുക്കുക',

    // Safety Messages
    safetyTitle: 'കുട്ടികളുടെ സുരക്ഷ വിവരം',
    photosNotStored: 'വാങ്ങലിനുശേഷം ഫോട്ടോകൾ സംഭരിക്കപ്പെടുകയില്ല',
    photosDeleted: 'പ്രക്രിയയ്ക്കുശേഷം അപ്‌ലോഡ് ചെയ്ത എല്ലാ ഫോട്ടോകളും ഇല്ലാതാക്കപ്പെടും',
    childDataDeleted: 'കഥ സൃഷ്ടിച്ചതിനുശേഷം കുട്ടിയുടെ വിവരങ്ങൾ ഉചിതമായി അകറ്റപ്പെടും',
    noDataSharing: 'ഞങ്ങൾ ഒരിക്കലും ഏതെങ്കിലും കുട്ടിയുടെ ഡാറ്റ പങ്കിടില്ല അല്ലെങ്കിൽ വിൽക്കില്ല',
    consentRequired13: '13 വയസ്സിൽ താഴെയുള്ള കുട്ടികൾക്കായി മാതാപിതാ സമ്മതി ആവശ്യമാണ്',

    // Success Messages
    storyGenerated: 'കഥ വിജയകരമായി സൃഷ്ടിക്കപ്പെട്ടു!',
    storyReady: 'നിങ്ങളുടെ കഥ കാണാൻ തയ്യാറാണ്',
    storyExported: 'കഥ വിജയകരമായി കയറ്റുമതി ചെയ്യപ്പെട്ടു',

    // Error Messages
    errorGeneratingStory: 'കഥ സൃഷ്ടിക്കുന്നതിലെ പിശക്. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    errorUploadingPhotos: 'ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുന്നതിലെ പിശക്',
    errorExportingStory: 'കഥ കയറ്റുമതി ചെയ്യുന്നതിലെ പിശക്',
    somethingWentWrong: 'എന്തോ പിശകു സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',

    // Sections
    uploadPhotosTitle: 'ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക',
    uploadPhotosDescription: 'നിങ്ങളുടെ കുട്ടിയുടെ അല്ലെങ്കിൽ അവരുടെ പ്രിയപ്പെട്ട കാര്യങ്ങളുടെ 3-10 ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക',
    storyPreviewTitle: 'നിങ്ങളുടെ കഥ',
    languageSelected: 'ഭാഷ',
    
    // Help Text
    languageHelpText: 'നിങ്ങളുടെ കഥയ്ക്കായി ഭാഷ തിരഞ്ഞെടുക്കുക',
    photosHelpText: 'പിന്തുണയുള്ള ഫോർമാറ്റുകൾ: JPG, PNG, WebP (പരമാവധി 10 ഇമേജുകൾ)',
    consentHelpText: 'ഈ പെട്ടി പരിശോധിക്കുന്നതിലൂടെ, നിങ്ങൾക്ക് സമ്മതി നൽകാൻ അധികാരമുണ്ടെന്ന് നിങ്ങൾ സ്ഥിരീകരിക്കുന്നു',
  },

  es: {
    // Form Labels
    childName: 'Nombre del niño',
    childAge: 'Edad del niño',
    parentEmail: 'Correo electrónico del padre/tutor',
    parentConsent: 'Confirmo que soy padre/tutor',
    storyLanguage: 'Idioma de la historia',
    theme: 'Tema de la historia',
    storyPrompt: 'Indicación de historia (opcional)',

    // Placeholders
    childNamePlaceholder: 'Ingrese el nombre del niño',
    childAgePlaceholder: '1 - 17',
    parentEmailPlaceholder: 'parent@example.com',
    storyPromptPlaceholder: 'Por ejemplo, "Cuente una historia sobre valentía"',

    // Buttons
    generateStory: 'Generar historia',
    uploadPhotos: 'Cargar fotos',
    downloadStory: 'Descargar historia',
    resetForm: 'Restablecer',
    next: 'Siguiente',
    back: 'Anterior',

    // Validation Messages
    nameRequired: 'El nombre del niño es obligatorio',
    nameTooShort: 'El nombre debe tener al menos 2 caracteres',
    ageRequired: 'La edad es obligatoria',
    ageInvalid: 'La edad debe estar entre 1 y 17',
    emailRequired: 'Se requiere correo electrónico de los padres para menores de 13 años',
    emailInvalid: 'Por favor, ingrese una dirección de correo electrónico válida',
    consentRequired: 'Se requiere consentimiento de los padres',
    languageRequired: 'Por favor, seleccione un idioma',

    // Safety Messages
    safetyTitle: 'Información de seguridad infantil',
    photosNotStored: 'Las fotos no se almacenan después del pago',
    photosDeleted: 'Todas las fotos cargadas se eliminarán después del procesamiento',
    childDataDeleted: 'Los datos del niño y los mensajes se eliminarán después de la generación de la historia',
    noDataSharing: 'Nunca compartimos ni vendemos datos de niños',
    consentRequired13: 'Se requiere consentimiento de los padres para menores de 13 años',

    // Success Messages
    storyGenerated: '¡Historia generada exitosamente!',
    storyReady: 'Tu historia está lista para ver',
    storyExported: 'Historia exportada exitosamente',

    // Error Messages
    errorGeneratingStory: 'Error al generar la historia. Por favor, intente nuevamente.',
    errorUploadingPhotos: 'Error al cargar fotos',
    errorExportingStory: 'Error al exportar la historia',
    somethingWentWrong: 'Algo salió mal. Por favor, intente nuevamente.',

    // Sections
    uploadPhotosTitle: 'Cargar fotos',
    uploadPhotosDescription: 'Cargue 3-10 fotos de su hijo o sus cosas favoritas',
    storyPreviewTitle: 'Tu historia',
    languageSelected: 'Idioma',
    
    // Help Text
    languageHelpText: 'Selecciona el idioma para tu historia',
    photosHelpText: 'Formatos soportados: JPG, PNG, WebP (máximo 10 imágenes)',
    consentHelpText: 'Al marcar esta casilla, confirma que tiene autoridad para dar consentimiento',
  },
};

/**
 * Get translation for a key and language
 * @param {string} language - Language code
 * @param {string} key - Translation key
 * @param {string} defaultValue - Default if not found
 * @returns {string} Translated text
 */
export const t = (language, key, defaultValue = key) => {
  if (!translations[language]) {
    language = 'en';
  }

  return translations[language][key] || translations['en'][key] || defaultValue;
};

/**
 * Get all translations for a language
 * @param {string} language - Language code
 * @returns {object} Translation object
 */
export const getTranslations = (language) => {
  return translations[language] || translations['en'];
};

export default translations;
