
export const validationMessages = {
  en: {
    fullName: {
      invalid: 'Full name must contain at least 3 letters',
    },
    email: {
      invalid: 'Must be a valid email address',
    },
    whatsappNumber: {
      invalid: 'WhatsApp number must contain 10 to 15 digits',
    },
    githubHandle: {
      invalid: 'GitHub handle must contain only letters, numbers, and hyphens',
    },
    discordHandle: {
      invalid: 'Please enter a valid Discord handle',
    },
    currentStatus: {
      invalid: 'Please select a valid current status',
    },
    collegeMajor: {
      whitespace: 'College and major cannot contain only whitespace',
    },
    programmingExperience: {
      whitespace: 'Programming experience cannot contain only whitespace',
    },
    technologies: {
      whitespace: 'Technologies cannot contain only whitespace',
    },
    gitExperience: {
      invalid: 'Please select a valid Git experience level',
    },
    personalPageUrl: {
      invalid: 'URL must start with http:// or https://',
    },
    githubRepoUrl: {
      invalid: 'Must be a valid GitHub repository URL',
    },
    aiUsage: {
      whitespace: 'AI usage description cannot contain only whitespace',
    },
    motivation: {
      minLength: 'Motivation must be at least 50 characters long',
      whitespace: 'Motivation cannot contain only whitespace',
    },
  },

  ar: {
    fullName: {
      invalid: 'يرجى إدخال الاسم الكامل بشكل صحيح، على أن يتضمن ثلاثة أحرف على الأقل',
    },
    email: {
      invalid: 'يرجى إدخال بريد إلكتروني صحيح',
    },
    whatsappNumber: {
      invalid: 'يرجى إدخال رقم واتساب صحيح مكوّن من 10 إلى 15 رقمًا',
    },
    githubHandle: {
      invalid: 'يُسمح باستخدام الحروف الإنجليزية والأرقام والشرطة (-) فقط',
    },
    discordHandle: {
      invalid: 'يرجى إدخال اسم مستخدم Discord صحيح',
    },
    currentStatus: {
      invalid: 'يرجى اختيار الحالة التي تصف وضعك الحالي',
    },
    collegeMajor: {
      whitespace: 'يرجى إدخال اسم الكلية والتخصص',
    },
    programmingExperience: {
      whitespace: 'يرجى توضيح خبرتك في البرمجة',
    },
    technologies: {
      whitespace: 'يرجى إدخال التقنيات التي تستخدمها أو تعرفها',
    },
    gitExperience: {
      invalid: 'يرجى اختيار مستوى خبرتك',
    },
    personalPageUrl: {
      invalid: 'يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://',
    },
    githubRepoUrl: {
      invalid: 'يرجى إدخال رابط صحيح لمستودع GitHub',
    },
    aiUsage: {
      whitespace: 'يرجى توضيح كيفية استخدامك لأدوات الذكاء الاصطناعي',
    },
    motivation: {
      minLength: 'يرجى كتابة رسالة لا تقل عن 50 حرفًا لتوضيح دوافعك للانضمام',
      whitespace: 'يرجى توضيح أسباب رغبتك في الانضمام',
    },
  },
} as const;

export type SupportedLanguage = keyof typeof validationMessages;