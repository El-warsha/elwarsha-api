
export const validationMessages = {
  en: {
    fullName: {
      required: 'Full name is required',
      invalidType: 'Full name must be a string',
      invalid: 'Full name must contain at least 3 letters',
    },
    email: {
      required: 'Email is required',
      invalidType: 'Email must be a string',
      invalid: 'Must be a valid email address',
    },
    whatsappNumber: {
      required: 'WhatsApp number is required',
      invalidType: 'WhatsApp number must be a string',
      invalid: 'WhatsApp number must contain 10 to 15 digits',
    },
    githubHandle: {
      required: 'GitHub handle is required',
      invalidType: 'GitHub handle must be a string',
      invalid: 'GitHub handle must contain only letters, numbers, and hyphens',
    },
    discordHandle: {
      required: 'Discord handle is required',
      invalidType: 'Discord handle must be a string',
      invalid: 'Please enter a valid Discord handle',
    },
    currentStatus: {
      required: 'Current status is required',
      invalidType: 'Current status must be a string',
      invalid: 'Please select a valid current status',
    },
    collegeMajor: {
      required: 'College and major are required',
      invalidType: 'College and major must be a string',
      whitespace: 'College and major cannot contain only whitespace',
    },
    programmingExperience: {
      required: 'Programming experience is required',
      invalidType: 'Programming experience must be a string',
      whitespace: 'Programming experience cannot contain only whitespace',
    },
    technologies: {
      required: 'Technologies are required',
      invalidType: 'Technologies must be a string',
      whitespace: 'Technologies cannot contain only whitespace',
    },
    gitExperience: {
      required: 'Git experience is required',
      invalidType: 'Git experience must be a string',
      invalid: 'Please select a valid Git experience level',
    },
    personalPageUrl: {
      required: 'Personal page URL is required',
      invalidType: 'Personal page URL must be a string',
      invalid: 'URL must be a valid URL starting with http:// or https://',
    },
    githubRepoUrl: {
      required: 'GitHub repository URL is required',
      invalidType: 'GitHub repository URL must be a string',
      invalid: 'Must be a valid GitHub repository URL',
    },
    aiUsage: {
      required: 'AI usage description is required',
      invalidType: 'AI usage description must be a string',
      whitespace: 'AI usage description cannot contain only whitespace',
    },
    motivation: {
      required: 'Motivation is required',
      invalidType: 'Motivation must be a string',
      minLength: 'Motivation must be at least 50 characters long',
      whitespace: 'Motivation cannot contain only whitespace',
    },
  },

  ar: {
    fullName: {
      required: 'الاسم الكامل مطلوب',
      invalidType: 'يجب إدخال الاسم الكامل كنص',
      invalid: 'يرجى إدخال الاسم الكامل بشكل صحيح، على أن يتضمن ثلاثة أحرف على الأقل',
    },
    email: {
      required: 'البريد الإلكتروني مطلوب',
      invalidType: 'يجب إدخال البريد الإلكتروني كنص',
      invalid: 'يرجى إدخال بريد إلكتروني صحيح',
    },
    whatsappNumber: {
      required: 'رقم واتساب مطلوب',
      invalidType: 'يجب إدخال رقم واتساب كنص',
      invalid: 'يرجى إدخال رقم واتساب صحيح مكوّن من 10 إلى 15 رقمًا',
    },
    githubHandle: {
      required: 'اسم مستخدم GitHub مطلوب',
      invalidType: 'يجب إدخال اسم مستخدم GitHub كنص',
      invalid: 'يُسمح باستخدام الحروف الإنجليزية والأرقام والشرطة (-) فقط',
    },
    discordHandle: {
      required: 'اسم مستخدم Discord مطلوب',
      invalidType: 'يجب إدخال اسم مستخدم Discord كنص',
      invalid: 'يرجى إدخال اسم مستخدم Discord صحيح',
    },
    currentStatus: {
      required: 'الحالة الحالية مطلوبة',
      invalidType: 'يجب إدخال الحالة الحالية كنص',
      invalid: 'يرجى اختيار الحالة التي تصف وضعك الحالي',
    },
    collegeMajor: {
      required: 'اسم الكلية والتخصص مطلوبان',
      invalidType: 'يجب إدخال الكلية والتخصص كنص',
      whitespace: 'يرجى إدخال اسم الكلية والتخصص',
    },
    programmingExperience: {
      required: 'وصف الخبرة في البرمجة مطلوب',
      invalidType: 'يجب إدخال الخبرة في البرمجة كنص',
      whitespace: 'يرجى توضيح خبرتك في البرمجة',
    },
    technologies: {
      required: 'التقنيات التي تستخدمها أو تعرفها مطلوبة',
      invalidType: 'يجب إدخال التقنيات كنص',
      whitespace: 'يرجى إدخال التقنيات التي تستخدمها أو تعرفها',
    },
    gitExperience: {
      required: 'مستوى الخبرة في Git مطلوب',
      invalidType: 'يجب إدخال مستوى الخبرة في Git كنص',
      invalid: 'يرجى اختيار مستوى خبرتك',
    },
    personalPageUrl: {
      required: 'رابط الصفحة الشخصية مطلوب',
      invalidType: 'يجب إدخال رابط الصفحة الشخصية كنص',
      invalid: 'يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://',
    },
    githubRepoUrl: {
      required: 'رابط مستودع GitHub مطلوب',
      invalidType: 'يجب إدخال رابط مستودع GitHub كنص',
      invalid: 'يرجى إدخال رابط صحيح لمستودع GitHub',
    },
    aiUsage: {
      required: 'وصف كيفية استخدام أدوات الذكاء الاصطناعي مطلوب',
      invalidType: 'يجب إدخال وصف استخدام أدوات الذكاء الاصطناعي كنص',
      whitespace: 'يرجى توضيح كيفية استخدامك لأدوات الذكاء الاصطناعي',
    },
    motivation: {
      required: 'توضيح دوافع الانضمام مطلوب',
      invalidType: 'يجب إدخال دوافع الانضمام كنص',
      minLength: 'يرجى كتابة رسالة لا تقل عن 50 حرفًا لتوضيح دوافعك للانضمام',
      whitespace: 'يرجى توضيح أسباب رغبتك في الانضمام',
    },
  },
} as const;

export type SupportedLanguage = keyof typeof validationMessages;
