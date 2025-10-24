// FIX: Define AgentData interface for dynamic access to agent translations
export interface AgentData {
  en: {
    name: string;
    description: string;
    tasks: Record<string, string>;
    placeholders: Record<string, string>;
    mockResults: Record<string, string | Record<string, any>>; // Updated to allow object for mockResults
  };
  ar: {
    name: string;
    description: string;
    tasks: Record<string, string>;
    placeholders: Record<string, string>;
    mockResults: Record<string, string | Record<string, any>>; // Updated to allow object for mockResults
  };
}

// FIX: Update translations type to allow string indexing for agents
export const translations: {
  global: Record<'en' | 'ar', Record<string, string>>;
  agents: Record<string, AgentData>;
} = {
  global: {
    en: {
      appName: "Amrikyy QuantumOS",
      poweredBy: "Powered By Gemini Pro",
      loginHeader: "Login to your AI OS",
      usernamePlaceholder: "Username",
      passwordPlaceholder: "Password",
      loginButton: "Login",
      loginError: "Invalid username or password. Try 'admin' and 'password'.",
      loginPrompt: "Unlock the future of intelligent computing.",
      loginAsGuest: "Login as Guest",
      offline: "You are currently offline. Some features may be limited.",
      miniAgentsHub: "Mini Agents Hub", // Renamed to App Launcher conceptually
      taskHistory: "Task History",
      taskHistoryDescription: "View and manage executed agent tasks.",
      clearHistory: "Clear History",
      noTasksYet: "No tasks executed yet.",
      searchHistory: "Search history...",
      noResultsFound: "No results found.",
      agent: "Agent",
      task: "Task",
      input: "Input",
      output: "Output",
      status: "Status",
      success: "Success",
      error: "Error",
      errorMessage: "Error Message",
      timestamp: "Timestamp",
      loading: "AI is processing...",
      // Settings
      language: "Language",
      english: "English",
      arabic: "Arabic",
      theme: "Theme",
      notifications: "Notifications",
      enableNotifications: "Enable Notifications",
      ttsVoice: "TTS Voice",
      ttsSpeed: "TTS Playback Speed",
      // Main AI Orchestration
      mainAITitle: "Gemini Pro Orchestrator",
      mainAIPlaceholder: "Ask Gemini Pro to perform a complex task (e.g., 'Plan a 7-day trip to Egypt')",
      mainAIButton: "Ask Gemini Pro",
      aiPlanning: "Gemini Pro is planning your workflow...",
      workflowStep: "Workflow Step",
      orchestrationFailed: "Orchestration failed: ",
      // Unified Settings Modal
      generalSettings: "General",
      agentSettings: "Agent Settings",
      selectAgent: "Select Agent",
      apiKey: "API Key",
      defaultParameter: "Default Parameter",
      saveSettings: "Save Settings",
      settingsSaved: "Settings saved!",
      selectAgentToConfigure: "Select an agent to configure its settings.",
      // Telegram Integration
      telegramNotificationSent: "Telegram notification sent!",
      telegramChatId: "Telegram Chat ID",
      telegramMessage: "Telegram Message",
      // New OS UI elements
      appLauncher: "App Launcher",
      fileManager: "File Manager",
      terminal: "Terminal",
      minimize: "Minimize",
      maximize: "Maximize",
      close: "Close",
      restore: "Restore",
      dragWindow: "Drag Window",
      noFilesFound: "No files or folders found.",
      commandPrompt: "Enter command...",
      terminalOutput: "Terminal Output",
      start: "Start",
      settings: "Settings", // General settings button in Taskbar/Desktop
      sources: "Sources",
      // Guardian Agent & Self-Healing
      askGuardian: "Ask Guardian to Debug",
      debugging: "Guardian is analyzing...",
      guardianDiagnosis: "Guardian's Diagnosis",
      guardianSuggestion: "Guardian's Suggestion",
      retryWithSuggestion: "Retry with Suggestion",
      // System Health
      systemHealth: "System Health",
      totalTasks: "Total Tasks",
      successfulTasks: "Successful",
      failedTasks: "Failed",
      reliability: "Reliability",
      successfulDebugs: "Successful Debugs",
      system: "System",
    },
    ar: {
      appName: "نظام التشغيل Amrikyy QuantumOS",
      poweredBy: "مدعوم من Gemini Pro",
      loginHeader: "تسجيل الدخول إلى نظام التشغيل AI الخاص بك",
      usernamePlaceholder: "اسم المستخدم",
      passwordPlaceholder: "كلمة المرور",
      loginButton: "تسجيل الدخول",
      loginError: "اسم المستخدم أو كلمة المرور غير صحيحة. جرب 'admin' و 'password'.",
      loginPrompt: "اطلق العنان لمستقبل الحوسبة الذكية.",
      loginAsGuest: "تسجيل الدخول كضيف",
      offline: "أنت غير متصل بالإنترنت حالياً. قد تكون بعض الميزات محدودة.",
      miniAgentsHub: "مركز العملاء المصغر", // Renamed to App Launcher conceptually
      taskHistory: "سجل المهام",
      taskHistoryDescription: "عرض وإدارة مهام الوكيل المنفذة.",
      clearHistory: "مسح السجل",
      noTasksYet: "لم يتم تنفيذ أي مهام بعد.",
      searchHistory: "ابحث في السجل...",
      noResultsFound: "لم يتم العثور على نتائج.",
      agent: "العميل",
      task: "المهمة",
      input: "الإدخال",
      output: "الإخراج",
      status: "الحالة",
      success: "نجاح",
      error: "خطأ",
      errorMessage: "رسالة الخطأ",
      timestamp: "التاريخ والوقت",
      loading: "الذكاء الاصطناعي يعالج...",
      // Settings
      language: "اللغة",
      english: "الإنجليزية",
      arabic: "العربية",
      theme: "السمة",
      notifications: "الإشعارات",
      enableNotifications: "تمكين الإشعارات",
      ttsVoice: "صوت TTS",
      ttsSpeed: "سرعة تشغيل TTS",
      // Main AI Orchestration
      mainAITitle: "منسق Gemini Pro",
      mainAIPlaceholder: "اطلب من Gemini Pro أداء مهمة معقدة (مثال: 'خطط لرحلة 7 أيام إلى مصر')",
      mainAIButton: "اسأل Gemini Pro",
      aiPlanning: "Gemini Pro يخطط لسير عملك...",
      workflowStep: "خطوة سير العمل",
      orchestrationFailed: "فشل التنسيق: ",
      // Unified Settings Modal
      generalSettings: "عام",
      agentSettings: "إعدادات العميل",
      selectAgent: "اختر العميل",
      apiKey: "مفتاح الـ API",
      defaultParameter: "المعامل الافتراضي",
      saveSettings: "حفظ الإعدادات",
      settingsSaved: "تم حفظ الإعدادات!",
      selectAgentToConfigure: "حدد عميلاً لتكوين إعداداته.",
      // Telegram Integration
      telegramNotificationSent: "تم إرسال إشعار تيليجرام!",
      telegramChatId: "معرف دردشة تيليجرام",
      telegramMessage: "رسالة تيليجرام",
      // New OS UI elements
      appLauncher: "مشغل التطبيقات",
      fileManager: "مدير الملفات",
      terminal: "الطرفية",
      minimize: "تصغير",
      maximize: "تكبير",
      close: "إغلاق",
      restore: "استعادة",
      dragWindow: "سحب النافذة",
      noFilesFound: "لم يتم العثور على ملفات أو مجلدات.",
      commandPrompt: "أدخل الأمر...",
      terminalOutput: "إخراج الطرفية",
      start: "ابدأ",
      settings: "الإعدادات",
      sources: "المصادر",
      // Guardian Agent & Self-Healing
      askGuardian: "اطلب من الحارس التصحيح",
      debugging: "الحارس يقوم بالتحليل...",
      guardianDiagnosis: "تشخيص الحارس",
      guardianSuggestion: "اقتراح الحارس",
      retryWithSuggestion: "أعد المحاولة مع الاقتراح",
      // System Health
      systemHealth: "صحة النظام",
      totalTasks: "مجموع المهام",
      successfulTasks: "الناجحة",
      failedTasks: "الفاشلة",
      reliability: "الموثوقية",
      successfulDebugs: "التصحيحات الناجحة",
      system: "النظام",
    },
  },
  agents: {
    contentCreator: { // NEW CONTENT CREATOR AGENT
      en: {
        name: "Content Creator",
        description: "Generate content grounded in your source documents, like NotebookLM.",
        tasks: {
          generateFromSources: "Generate from Sources",
        },
        placeholders: {
          uploadPrompt: "Upload one or more source files (.txt, .md)",
          queryPrompt: "Ask a question about your sources...",
          yourSources: "Your Sources",
          addSources: "Add Sources",
          noSources: "Upload documents to begin.",
          ask: "Ask",
        },
        mockResults: {},
      },
      ar: {
        name: "صانع المحتوى",
        description: "أنشئ محتوى مستندًا إلى مستنداتك المصدر، مثل NotebookLM.",
        tasks: {
          generateFromSources: "أنشئ من المصادر",
        },
        placeholders: {
          uploadPrompt: "قم بتحميل ملف مصدر واحد أو أكثر (.txt, .md)",
          queryPrompt: "اطرح سؤالاً عن مصادرك...",
          yourSources: "مصادرك",
          addSources: "إضافة مصادر",
          noSources: "قم بتحميل المستندات للبدء.",
          ask: "اسأل",
        },
        mockResults: {},
      },
    },
    nexus: { // NEW NEXUS AGENT
      en: {
        name: "The Nexus",
        description: "Your social and collaborative hub for media, coding, and games.",
        tasks: {
          sharedLounge: "Shared Media Lounge",
          vibeCodingSpace: "Vibe Coding Space",
          aiAssistant: "AI Assistant",
          summarizeVideo: "Summarize Video",
          suggestRelated: "Suggest Related",
          aiCopilot: "AI Co-pilot",
          explainCode: "Explain",
          reviewCode: "Review",
          refactorCode: "Refactor",
        },
        placeholders: {
          youtubeUrl: "Enter YouTube URL...",
          chatMessage: "Type a message...",
          participants: "Participants",
          codeEditorPlaceholder: "Start coding together...",
          terminalPlaceholder: "Enter shared command...",
          refactorInstructions: "Instructions for refactoring...",
          selectCode: "Select some code to get started.",
        },
        mockResults: {},
      },
      ar: {
        name: "الرابط (The Nexus)",
        description: "مركزك الاجتماعي والتعاوني للوسائط والبرمجة والألعاب.",
        tasks: {
          sharedLounge: "صالة الوسائط المشتركة",
          vibeCodingSpace: "مساحة البرمجة الإبداعية",
          aiAssistant: "المساعد الذكي",
          summarizeVideo: "لخص الفيديو",
          suggestRelated: "اقترح فيديوهات مشابهة",
          aiCopilot: "المساعد البرمجي",
          explainCode: "اشرح",
          reviewCode: "راجع",
          refactorCode: "أعد الصياغة",
        },
        placeholders: {
          youtubeUrl: "أدخل رابط يوتيوب...",
          chatMessage: "اكتب رسالة...",
          participants: "المشاركون",
          codeEditorPlaceholder: "ابدأوا البرمجة معاً...",
          terminalPlaceholder: "أدخل أمراً مشتركاً...",
          refactorInstructions: "تعليمات إعادة الصياغة...",
          selectCode: "حدد جزءاً من الكود للبدء.",
        },
        mockResults: {},
      },
    },
    promptEngineer: { // NEW PROMPT ENGINEERING AGENT
      en: {
        name: "Prompt Engineer",
        description: "Refines prompts for other agents.",
        tasks: {
          refinePrompt: "Refine Prompt",
        },
        placeholders: {},
        mockResults: {},
      },
      ar: {
        name: "مهندس الأوامر",
        description: "يحسن الأوامر للوكلاء الآخرين.",
        tasks: {
          refinePrompt: "تحسين الأمر",
        },
        placeholders: {},
        mockResults: {},
      },
    },
    chatbot: {
      en: {
        name: "Chatbot",
        description: "Have a conversation with Gemini.",
        tasks: {
          sendMessage: "Send Message",
        },
        placeholders: {
          prompt: "Ask me anything...",
        },
        mockResults: {
          response: "Hello! How can I help you today?",
        },
      },
      ar: {
        name: "بوت الدردشة",
        description: "تحدث مع Gemini.",
        tasks: {
          sendMessage: "إرسال رسالة",
        },
        placeholders: {
          prompt: "اسألني أي شيء...",
        },
        mockResults: {
          response: "مرحباً! كيف يمكنني مساعدتك اليوم؟",
        },
      },
    },
    travel: {
      en: {
        name: "Travel Agent",
        description: "Your AI friend for planning trips, finding flights, hotels, and local spots.",
        tasks: {
          createItinerary: "Plan Itinerary",
          findFlights: "Find Flights",
          findHotels: "Find Hotels",
          findPlacesOfInterest: "Find Places",
          getDirections: "Get Directions",
        },
        placeholders: {
          itineraryPrompt: "Describe your trip (e.g., 'a 5-day cultural trip to Rome for a family of 4')",
          flightOrigin: "Origin",
          flightDestination: "Destination",
          flightDates: "Dates (e.g., 'next week', 'Oct 15-22')",
          hotelLocation: "Location (e.g., 'downtown Paris')",
          hotelDates: "Dates",
          hotelCriteria: "Criteria (e.g., 'wifi, pool, budget-friendly')",
          placesLocation: "Location (e.g., 'near me')",
          placesType: "Type (e.g., 'japanese restaurant', 'museum')",
          directionsOrigin: "Origin",
          directionsDestination: "Destination",
        },
        mockResults: {},
      },
      ar: {
        name: "وكيل السفر",
        description: "صديقك الذكي لتخطيط الرحلات، إيجاد الرحلات الجوية، الفنادق، والأماكن المحلية.",
        tasks: {
          createItinerary: "تخطيط مسار الرحلة",
          findFlights: "البحث عن رحلات",
          findHotels: "البحث عن فنادق",
          findPlacesOfInterest: "البحث عن أماكن",
          getDirections: "الحصول على الاتجاهات",
        },
        placeholders: {
          itineraryPrompt: "صف رحلتك (مثال: 'رحلة ثقافية لمدة 5 أيام إلى روما لعائلة من 4 أفراد')",
          flightOrigin: "المصدر",
          flightDestination: "الوجهة",
          flightDates: "التواريخ (مثال: 'الأسبوع القادم'، '15-22 أكتوبر')",
          hotelLocation: "الموقع (مثال: 'وسط مدينة باريس')",
          hotelDates: "التواريخ",
          hotelCriteria: "المعايير (مثال: 'واي فاي، مسبح، اقتصادي')",
          placesLocation: "الموقع (مثال: 'بالقرب مني')",
          placesType: "النوع (مثال: 'مطعم ياباني'، 'متحف')",
          directionsOrigin: "المصدر",
          directionsDestination: "الوجهة",
        },
        mockResults: {},
      },
    },
    vision: {
      en: {
        name: "Vision",
        description: "Analyze images, OCR & landmark detection",
        tasks: {
          analyzeImage: "Analyze Image",
          extractText: "Extract Text (OCR)",
          identifyLandmark: "Identify Landmark",
          detectObjects: "Detect Objects",
        },
        placeholders: {
          imageUrl: "Image URL or Base64 (mock)",
          prompt: "Prompt (e.g., Describe this image)",
        },
        mockResults: {
          analyze: "This image shows a desert landscape with ancient pyramids under a clear sky.",
          extract: "Extracted text: 'Welcome to Egypt'",
          landmark: "Identified landmark: 'Great Pyramid of Giza'.",
          objects: "Detected objects: 'camel', 'person', 'sand'.",
        },
      },
      ar: {
        name: "الرؤية",
        description: "تحليل الصور، التعرف الضوئي على الحروف والكشف عن المعالم",
        tasks: {
          analyzeImage: "تحليل الصورة",
          extractText: "استخراج النص (OCR)",
          identifyLandmark: "التعرف على المعالم",
          detectObjects: "الكشف عن الكائنات",
        },
        placeholders: {
          imageUrl: "رابط الصورة أو Base64 (وهمي)",
          prompt: "الموجه (مثال: صف هذه الصورة)",
        },
        mockResults: {
          analyze: "تظهر هذه الصورة منظرًا صحراويًا به أهرامات قديمة تحت سماء صافية.",
          extract: "النص المستخرج: 'مرحباً بكم في مصر'",
          landmark: "المعلم المحدد: 'هرم خوفو الأكبر'.",
          objects: "الكائنات المكتشفة: 'جمل', 'شخص', 'رمل'.",
        },
      },
    },
    research: {
      en: {
        name: "Research",
        description: "Web & Maps search with Gemini",
        tasks: {
          webSearch: "Web Search",
          locationQuery: "Location Query",
        },
        placeholders: {
          query: "Ask about anything...",
          locationQuery: "Ask about a place or address...",
        },
        mockResults: {
          webSearch: "Found 10 results for 'best travel apps'. Top result: 'Wanderlust App'.",
          locationQuery: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.",
        },
      },
      ar: {
        name: "البحث",
        description: "بحث الويب والخرائط مع Gemini",
        tasks: {
          webSearch: "بحث الويب",
          locationQuery: "استعلام عن موقع",
        },
        placeholders: {
          query: "اسأل عن أي شيء...",
          locationQuery: "اسأل عن مكان أو عنوان...",
        },
        mockResults: {
          webSearch: "تم العثور على 10 نتائج لـ 'أفضل تطبيقات السفر'. النتيجة الأولى: 'تطبيق Wanderlust'.",
          locationQuery: "برج إيفل هو برج شبكي من الحديد المطاوع في Champ de Mars في باريس، فرنسا.",
        },
      },
    },
    translator: {
      en: {
        name: "Translator",
        description: "Translate text, detect language & voice",
        tasks: {
          translateText: "Translate Text",
          detectLanguage: "Detect Language",
          voiceToText: "Voice to Text",
          textToVoice: "Text to Voice",
        },
        placeholders: {
          text: "Text to translate",
          targetLang: "Target Language (e.g., ar)",
          sourceLang: "Source Language (optional)",
          audioInput: "Audio input (mock Base64)",
        },
        mockResults: {
          translate: "Translated text: 'مرحباً بالعالم'",
          detect: "Detected language: 'English' (confidence: 0.98)",
          voiceToText: "Transcription: 'Hello, how are you today?'",
          textToVoice: "Generated audio for 'Welcome'.",
        },
      },
      ar: {
        name: "المترجم",
        description: "ترجمة النصوص، الكشف عن اللغة والصوت",
        tasks: {
          translateText: "ترجمة النص",
          detectLanguage: "الكشف عن اللغة",
          voiceToText: "تحويل الصوت إلى نص",
          textToVoice: "تحويل النص إلى صوت",
        },
        placeholders: {
          text: "النص للترجمة",
          targetLang: "اللغة المستهدفة (مثال: en)",
          sourceLang: "اللغة المصدر (اختياري)",
          audioInput: "إدخال صوتي (وهمي Base64)",
        },
        mockResults: {
          translate: "النص المترجم: 'Hello World'",
          detect: "اللغة المكتشفة: 'العربية' (ثقة: 0.98)",
          voiceToText: "النسخ: 'مرحباً، كيف حالك اليوم؟'",
          textToVoice: "تم إنشاء صوت لـ 'أهلاً'.",
        },
      },
    },
    scheduler: {
      en: {
        name: "Scheduler",
        description: "Create events, reminders & sync itineraries",
        tasks: {
          createEvent: "Create Event",
          checkAvailability: "Check Availability",
          setReminder: "Set Reminder",
          syncItinerary: "Sync Itinerary",
        },
        placeholders: {
          title: "Event Title",
          location: "Location",
          startTime: "Start Time (YYYY-MM-DDTHH:MM)",
          endTime: "End Time (YYYY-MM-DDTHH:MM)",
          timeRange: "Time Range (e.g., 2025-01-01T09:00/2025-01-01T17:00)",
          eventId: "Event ID",
          reminder: "Reminder (e.g., 30 minutes before)",
          itineraryData: "Itinerary Data (JSON mock)",
        },
        mockResults: {
          create: "Event 'Cairo Trip' created in your calendar.",
          check: "You are available from 10:00 to 12:00 on Jan 23.",
          reminder: "Reminder set for 'Flight to Luxor'.",
          sync: "Itinerary 'Egypt Adventure' synced to calendar.",
        },
      },
      ar: {
        name: "الجدولة",
        description: "إنشاء الأحداث، التذكيرات ومزامنة مسارات الرحلة",
        tasks: {
          createEvent: "إنشاء حدث",
          checkAvailability: "التحقق من التوفر",
          setReminder: "تعيين تذكير",
          syncItinerary: "مزامنة مسار الرحلة",
        },
        placeholders: {
          title: "عنوان الحدث",
          location: "الموقع",
          startTime: "وقت البدء (YYYY-MM-DDTHH:MM)",
          endTime: "وقت الانتهاء (YYYY-MM-DDTHH:MM)",
          timeRange: "النطاق الزمني (مثال: 2025-01-01T09:00/2025-01-01T17:00)",
          eventId: "معرف الحدث",
          reminder: "التذكير (مثال: 30 دقيقة قبل)",
          itineraryData: "بيانات مسار الرحلة (JSON وهمي)",
        },
        mockResults: {
          create: "تم إنشاء حدث 'رحلة القاهرة' في تقويمك.",
          check: "أنت متاح من 10:00 إلى 12:00 في 23 يناير.",
          reminder: "تم تعيين تذكير لـ 'رحلة إلى الأقصر'.",
          sync: "تمت مزامنة مسار الرحلة 'مغامرة مصر' مع التقويم.",
        },
      },
    },
    storage: {
      en: {
        name: "Storage",
        description: "Save documents, photos & itineraries",
        tasks: {
          saveDocument: "Save Document",
          createItinerary: "Create Itinerary",
          uploadFile: "Upload File",
          shareFile: "Share File",
        },
        placeholders: {
          content: "Document content",
          filename: "Filename (e.g., MyNotes.txt)",
          tripData: "Trip Data (JSON mock)",
          fileInput: "File to upload (Base64 mock)",
          fileId: "File ID",
          email: "Recipient Email",
        },
        mockResults: {
          save: "Document 'MyNotes.txt' saved to Drive.",
          create: "Itinerary 'Egypt Adventure' created in Google Docs.",
          upload: "File 'photo.jpg' uploaded to Drive.",
          share: "File shared with user@example.com.",
        },
      },
      ar: {
        name: "التخزين",
        description: "حفظ المستندات، الصور ومسارات الرحلة",
        tasks: {
          saveDocument: "حفظ مستند",
          createItinerary: "إنشاء مسار رحلة",
          uploadFile: "تحميل ملف",
          shareFile: "مشاركة ملف",
        },
        placeholders: {
          content: "محتوى المستند",
          filename: "اسم الملف (مثال: MyNotes.txt)",
          tripData: "بيانات الرحلة (JSON وهمي)",
          fileInput: "ملف للتحميل (وهمي Base64)",
          fileId: "معرف الملف",
          email: "بريد المستلم الإلكتروني",
        },
        mockResults: {
          save: "تم حفظ المستند 'MyNotes.txt' في Drive.",
          create: "تم إنشاء مسار الرحلة 'مغامرة مصر' في مستندات Google.",
          upload: "تم تحميل الملف 'photo.jpg' إلى Drive.",
          share: "تمت مشاركة الملف مع user@example.com.",
        },
      },
    },
    media: {
      en: {
        name: "Media",
        description: "Generate & edit images and videos",
        tasks: {
          generateImage: "Generate Image (Imagen)",
          generateVideo: "Generate Video (Veo)",
          editImage: "Edit Image (Gemini)",
          searchVideos: "Search YouTube",
          analyzeVideo: "Analyze Video",
        },
        placeholders: {
          query: "Search query (e.g., Cairo travel vlogs)",
          videoId: "Video ID (e.g., abcdefg)",
          prompt: "Generation Prompt (e.g., a futuristic city)",
          editPrompt: "Edit instruction (e.g., add a retro filter)",
          videoUrl: "YouTube URL",
          videoPrompt: "What do you want to know about the video?",
        },
        mockResults: {
          generate: "Video/Image generated and ready.",
          search: "Found 5 videos for 'Cairo travel vlogs'.",
          edit: "Image edited successfully.",
        },
      },
      ar: {
        name: "الوسائط",
        description: "إنشاء وتعديل الصور والفيديوهات",
        tasks: {
          generateImage: "إنشاء صورة (Imagen)",
          generateVideo: "إنشاء فيديو (Veo)",
          editImage: "تعديل صورة (Gemini)",
          searchVideos: "بحث يوتيوب",
          analyzeVideo: "تحليل الفيديو",
        },
        placeholders: {
          query: "استعلام البحث (مثال: مدونات سفر القاهرة)",
          videoId: "معرف الفيديو (مثال: abcdefg)",
          prompt: "موجه الإنشاء (مثال: مدينة مستقبلية)",
          editPrompt: "تعليمات التعديل (مثال: أضف فلتر قديم)",
          videoUrl: "رابط يوتيوب",
          videoPrompt: "ماذا تريد أن تعرف عن الفيديو؟",
        },
        mockResults: {
          generate: "تم إنشاء الفيديو/الصورة وهي جاهزة.",
          search: "تم العثور على 5 مقاطع فيديو لـ 'مدونات سفر القاهرة'.",
          edit: "تم تعديل الصورة بنجاح.",
        },
      },
    },
    communicator: {
      en: {
        name: "Communicator",
        description: "Send emails, notifications & share info",
        tasks: {
          sendEmail: "Send Email",
          emailItinerary: "Email Itinerary",
          sendNotification: "Send Notification",
          sendTelegramMessage: "Send Telegram Message", // New task
        },
        placeholders: {
          to: "Recipient Email",
          subject: "Subject",
          body: "Email Body",
          itineraryData: "Itinerary Data (JSON mock)",
          message: "Notification Message",
          telegramChatId: "Telegram Chat ID", // New placeholder
          telegramMessage: "Message", // New placeholder
        },
        mockResults: {
          email: "Email sent successfully to user@example.com.",
          itinerary: "Itinerary emailed to family members.",
          notification: "Notification 'Your flight is delayed' sent.",
          telegram: "Telegram message sent successfully.", // New mock result
        },
      },
      ar: {
        name: "المتواصل",
        description: "إرسال رسائل البريد الإلكتروني، الإشعارات ومشاركة المعلومات",
        tasks: {
          sendEmail: "إرسال بريد إلكتروني",
          emailItinerary: "إرسال مسار الرحلة بالبريد الإلكتروني",
          sendNotification: "إرسال إشعار",
          sendTelegramMessage: "إرسال رسالة تيليجرام", // New task
        },
        placeholders: {
          to: "بريد المستلم الإلكتروني",
          subject: "الموضوع",
          body: "محتوى البريد الإلكتروني",
          itineraryData: "بيانات مسار الرحلة (JSON وهمي)",
          message: "رسالة الإشعار",
          telegramChatId: "معرف دردشة تيليجرام", // New placeholder
          telegramMessage: "الرسالة", // New placeholder
        },
        mockResults: {
          email: "تم إرسال البريد الإلكتروني بنجاح إلى user@example.com.",
          itinerary: "تم إرسال مسار الرحلة بالبريد الإلكتروني لأفراد العائلة.",
          notification: "تم إرسال إشعار 'رحلتك متأخرة'.",
          telegram: "تم إرسال رسالة تيليجرام بنجاح.", // New mock result
        },
      },
    },
    coding: { // NEW CODING AGENT
      en: {
        name: "Coding Agent",
        description: "Generates code with specialized sub-agents for UI, API, DevOps, QA, Documentation, and Code Review.",
        tasks: {
          generateUI: "Generate UI Code",
          designAPI: "Design API & Backend",
          createDeploymentConfig: "Create Deployment Config",
          writeTests: "Write Test Cases",
          generateDocumentation: "Generate Documentation",
          reviewCode: "Review Code",
        },
        placeholders: {
          projectDescription: "Describe the project or feature (e.g., 'A login form with email and password')",
          uiComponent: "UI Component (e.g., 'button', 'card', 'navigation bar')",
          uiFramework: "UI Framework (e.g., 'React', 'Vue', 'Angular')",
          apiEndpoints: "API Endpoints (e.g., '/users', '/products/{id}')",
          backendLanguage: "Backend Language (e.g., 'Node.js', 'Python', 'Go')",
          serviceDescription: "Service Description (e.g., 'a user authentication service')",
          platform: "Deployment Platform (e.g., 'AWS Lambda', 'Kubernetes', 'Firebase')",
          ciCdTool: "CI/CD Tool (e.g., 'GitHub Actions', 'GitLab CI')",
          featureToTest: "Feature to test (e.g., 'user registration', 'API endpoint response')",
          testFramework: "Test Framework (e.g., 'Jest', 'Pytest')",
          codeDescription: "Code description or function signature (e.g., 'User registration function')",
          codeToReview: "Paste code to be reviewed here (e.g., JavaScript function, Python script)",
          docType: "Type of documentation (e.g., 'README.md', 'API Reference', 'User Guide')",
        },
        mockResults: { // These are now illustrative, real data comes from Gemini
          generatedUI: "Generated React component for a login form:\n```jsx\n// React Login Form Code\n```",
          designedAPI: "Designed RESTful API for user management:\n```json\n// API Schema\n```",
          createdDeployment: "Created a basic Dockerfile and Kubernetes deployment YAML.",
          writtenTests: "Generated Jest test suite for user registration.",
          generatedDoc: "Generated documentation for the specified code/feature.",
          reviewedCode: "Code review: Overall good quality, but consider adding input validation. Rating: 7/10",
        },
      },
      ar: {
        name: "عميل البرمجة",
        description: "ينشئ الكود مع عملاء فرعيين متخصصين لواجهة المستخدم، الـ API، DevOps، ضمان الجودة، التوثيق، ومراجعة الكود.",
        tasks: {
          generateUI: "إنشاء كود واجهة المستخدم",
          designAPI: "تصميم الـ API والواجهة الخلفية",
          createDeploymentConfig: "إنشاء إعدادات النشر",
          writeTests: "كتابة حالات الاختبار",
          generateDocumentation: "إنشاء التوثيق",
          reviewCode: "مراجعة الكود",
        },
        placeholders: {
          projectDescription: "صف المشروع أو الميزة (مثال: 'نموذج تسجيل دخول بالبريد الإلكتروني وكلمة المرور')",
          uiComponent: "مكون واجهة المستخدم (مثال: 'زر'، 'بطاقة'، 'شريط التنقل')",
          uiFramework: "إطار عمل واجهة المستخدم (مثال: 'React', 'Vue', 'Angular')",
          apiEndpoints: "نقاط نهاية الـ API (مثال: '/users', '/products/{id}')",
          backendLanguage: "لغة الواجهة الخلفية (مثال: 'Node.js', 'Python', 'Go')",
          serviceDescription: "وصف الخدمة (مثال: 'خدمة مصادقة المستخدم')",
          platform: "منصة النشر (مثال: 'AWS Lambda', 'Kubernetes', 'Firebase')",
          ciCdTool: "أداة CI/CD (مثال: 'GitHub Actions', 'GitLab CI')",
          featureToTest: "الميزة المراد اختبارها (مثال: 'تسجيل المستخدم'، 'استجابة نقطة نهاية الـ API')",
          testFramework: "إطار عمل الاختبار (مثال: 'Jest', 'Pytest')",
          codeDescription: "وصف الكود أو توقيع الدالة (مثال: 'دالة تسجيل المستخدم')",
          codeToReview: "الصق الكود للمراجعة هنا (مثال: دالة JavaScript، نص Python)",
          docType: "نوع التوثيق (e.g., 'README.md', 'API Reference', 'User Guide')",
        },
        mockResults: { // These are now illustrative, real data comes from Gemini
          generatedUI: "تم إنشاء مكون React لنموذج تسجيل الدخول:\n```jsx\n// كود نموذج تسجيل الدخول React\n```",
          designedAPI: "تم تصميم API RESTful لإدارة المستخدمين:\n```json\n// مخطط API\n```",
          createdDeployment: "تم إنشاء Dockerfile أساسي و YAML نشر Kubernetes.",
          writtenTests: "تم إنشاء مجموعة اختبار Jest لتسجيل المستخدمين.",
          generatedDoc: "تم إنشاء التوثيق للكود/الميزة المحددة.",
          reviewedCode: "مراجعة الكود: جودة جيدة بشكل عام، ولكن فكر في إضافة التحقق من المدخلات. التقييم: 7/10",
        },
      },
    },
    marketing: { // NEW MARKETING AGENT
      en: {
        name: "Marketing Agent",
        description: "Develops strategies, creates content, and analyzes campaigns with specialized sub-agents.",
        tasks: {
          marketResearch: "Conduct Market Research",
          seoSpecialist: "Optimize SEO Strategy",
          contentStrategist: "Develop Content Strategy",
          socialMediaManager: "Manage Social Media",
          campaignManager: "Launch Marketing Campaign",
          analyticsExpert: "Analyze Marketing Data",
        },
        placeholders: {
          targetAudience: "Target audience (e.g., 'young adults interested in tech')",
          productService: "Product or service (e.g., 'new AI assistant app')",
          keywords: "Keywords (e.g., 'AI assistant', 'productivity app', 'smart help')",
          competitors: "Competitors (e.g., 'Google Assistant', 'Siri')",
          topic: "Content topic (e.g., 'benefits of AI in daily life')",
          platform: "Social media platform (e.g., 'Instagram', 'LinkedIn')",
          campaignGoal: "Campaign goal (e.g., 'increase brand awareness by 20%')",
          budget: "Budget (e.g., '$5000')",
          duration: "Duration (e.g., '3 weeks')",
          dataToAnalyze: "Data to analyze (e.g., 'Q3 website traffic, conversion rates')",
          metrics: "Key metrics (e.g., 'CTR', 'ROI', 'engagement')",
          searchQuery: "Search query for analytics (e.g., 'user engagement trends')",
        },
        mockResults: { // Updated mockResults to reflect potential grounding chunks
          marketResearch: {
            text: "Market research complete: Identified key demographics and competitive landscape.",
            groundingChunks: [{ web: { uri: "https://example.com/market-trends", title: "Market Trends 2024" } }]
          },
          seoSpecialist: {
            text: "SEO strategy optimized: Recommended keywords and content improvements for ranking.",
            groundingChunks: [{ web: { uri: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", title: "Google SEO Guide" } }]
          },
          contentStrategist: {
            text: "Content strategy developed: Proposed blog posts, videos, and social media themes.",
            groundingChunks: [{ web: { uri: "https://blog.hubspot.com/marketing/content-strategy", title: "HubSpot Content Strategy" } }]
          },
          socialMediaManager: {
            text: "Social media plan drafted: Scheduled posts and engagement tactics for Instagram.",
            groundingChunks: [{ web: { uri: "https://business.instagram.com/", title: "Instagram for Business" } }]
          },
          campaignManager: {
            text: "Marketing campaign launched: Initial results show strong engagement.",
            groundingChunks: [{ web: { uri: "https://ads.google.com/", title: "Google Ads" } }]
          },
          analyticsExpert: {
            text: "Marketing data analyzed: Identified high-performing channels and areas for improvement.",
            groundingChunks: [{ web: { uri: "https://analytics.google.com/analytics/web/", title: "Google Analytics" } }]
          },
        },
      },
      ar: {
        name: "عميل التسويق",
        description: "يطور الاستراتيجيات، ينشئ المحتوى، ويحلل الحملات مع عملاء فرعيين متخصصين.",
        tasks: {
          marketResearch: "إجراء بحث السوق",
          seoSpecialist: "تحسين استراتيجية تحسين محركات البحث (SEO)",
          contentStrategist: "تطوير استراتيجية المحتوى",
          socialMediaManager: "إدارة وسائل التواصل الاجتماعي",
          campaignManager: "إطلاق حملة تسويقية",
          analyticsExpert: "تحليل بيانات التسويق",
        },
        placeholders: {
          targetAudience: "الجمهور المستهدف (مثال: 'الشباب المهتمون بالتكنولوجيا')",
          productService: "المنتج أو الخدمة (مثال: 'تطبيق مساعد الذكاء الاصطناعي الجديد')",
          keywords: "الكلمات المفتاحية (مثال: 'مساعد الذكاء الاصطناعي', 'تطبيق إنتاجي', 'مساعدة ذكية')",
          competitors: "المنافسون (مثال: 'مساعد جوجل', 'سيري')",
          topic: "موضوع المحتوى (مثال: 'فوائد الذكاء الاصطناعي في الحياة اليومية')",
          platform: "منصة التواصل الاجتماعي (مثال: 'إنستغرام', 'لينكد إن')",
          campaignGoal: "هدف الحملة (مثال: 'زيادة الوعي بالعلامة التجارية بنسبة 20%')",
          budget: "الميزانية (مثال: '5000 دولار')",
          duration: "المدة (مثال: '3 أسابيع')",
          dataToAnalyze: "البيانات المراد تحليلها (مثال: 'حركة مرور الموقع للربع الثالث، معدلات التحويل')",
          metrics: "المقاييس الرئيسية (مثال: 'نسبة النقر إلى الظهور', 'العائد على الاستثمار', 'التفاعل')",
          searchQuery: "استعلام البحث للتحليلات (مثال: 'اتجاهات تفاعل المستخدم')",
        },
        mockResults: { // Updated mockResults to reflect potential grounding chunks
          marketResearch: {
            text: "اكتمل بحث السوق: تم تحديد التركيبة السكانية الرئيسية والمشهد التنافسي.",
            groundingChunks: [{ web: { uri: "https://example.com/market-trends", title: "اتجاهات السوق 2024" } }]
          },
          seoSpecialist: {
            text: "تم تحسين استراتيجية تحسين محركات البحث: تم التوصية بالكلمات المفتاحية وتحسينات المحتوى للترتيب.",
            groundingChunks: [{ web: { uri: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", title: "دليل جوجل لتحسين محركات البحث" } }]
          },
          contentStrategist: {
            text: "تم تطوير استراتيجية المحتوى: تم اقتراح منشورات المدونة ومقاطع الفيديو وموضوعات وسائل التواصل الاجتماعي.",
            groundingChunks: [{ web: { uri: "https://blog.hubspot.com/marketing/content-strategy", title: "استراتيجية المحتوى من HubSpot" } }]
          },
          socialMediaManager: {
            text: "تمت صياغة خطة وسائل التواصل الاجتماعي: تم جدولة المنشورات وتكتيكات التفاعل لـ Instagram.",
            groundingChunks: [{ web: { uri: "https://business.instagram.com/", title: "إنستغرام للأعمال" } }]
          },
          campaignManager: {
            text: "تم إطلاق الحملة التسويقية: تظهر النتائج الأولية تفاعلاً قوياً.",
            groundingChunks: [{ web: { uri: "https://ads.google.com/", title: "إعلانات جوجل" } }]
          },
          analyticsExpert: {
            text: "تم تحليل بيانات التسويق: تم تحديد القنوات عالية الأداء ومجالات التحسين.",
            groundingChunks: [{ web: { uri: "https://analytics.google.com/analytics/web/", title: "تحليلات جوجل" } }]
          },
        },
      },
    },
     guardian: { // NEW GUARDIAN AGENT
      en: {
        name: "Guardian Agent",
        description: "Analyzes and debugs failed agent tasks.",
        tasks: {
          debugTask: "Debug Task",
        },
        placeholders: {},
        mockResults: {},
      },
      ar: {
        name: "العميل الحارس",
        description: "يحلل ويصحح مهام الوكيل الفاشلة.",
        tasks: {
          debugTask: "تصحيح المهمة",
        },
        placeholders: {},
        mockResults: {},
      },
    },
  },
};