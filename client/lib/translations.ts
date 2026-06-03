import {
  dashboardAm,
  dashboardEn,
  type DashboardTranslations,
} from './dashboard.translations';

export type Language = 'en' | 'am';

export type AppTranslations = Translations & { dashboard: DashboardTranslations };

export interface Translations {
  nav: {
    about: string;
    signup: string;
    login: string;
  };
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    description: string;
    features: string[];
    buttons: {
      getStarted: string;
      learnMore: string;
    };
    testimonial: string;
    testimonialName: string;
    testimonialRole: string;
    altText: string;
  };
  benefits: {
    title: string;
    description: string;
    items: {
      ai: string;
      market: string;
      traders: string;
      secure: string;
      userFriendly: string;
      weather: string;
      alerts: string;
      dataDriven: string;
    };
  };
  howItWorks: {
    title: string;
    description: string;
    steps: {
      signup: string;
      addFarm: string;
      getInsights: string;
      connectGrow: string;
    };
    stepDescriptions: {
      signup: string;
      addFarm: string;
      getInsights: string;
      connectGrow: string;
    };
    cta: string;
    ctaDescription: string;
  };
  farmingBasics: {
    title: string;
    description: string;
    items: {
      cropSelection: string;
      weatherAwareness: string;
      marketTiming: string;
      profitOptimization: string;
    };
    itemDescriptions: {
      cropSelection: string;
      weatherAwareness: string;
      marketTiming: string;
      profitOptimization: string;
    };
    cta: string;
    ctaDescription: string;
  };
  faq: {
    title: string;
    description: string;
    questions: string[];
    answers: string[];
    contact: {
      title: string;
      description: string;
      button: string;
    };
  };
  footer: {
    description: string;
    quickLinks: string[];
    contact: {
      email: string;
      phone: string;
      address: string;
    };
    social: string;
    projectInfo: string;
    teamMembers: string;
    copyright: string;
    acknowledgement: string;
    academicDisclaimer: string;
  };
  authForm: {
    quote: string;
    subtitle: string;
  };
  signup: {
    title: string;
    subtitle:string;
    fields: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
      farmName: string;
      farmSize: string;
      farmSizeUnit: string;
      soilType: string;
      region: string;
      woreda: string;
      crops: string;
      
      experience: string;
    };
    placeholders: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
      farmName: string;
      farmSize: string;
      soilType: string;
      region: string;
      woreda: string;
      crops: string;
      experience: string;
    };
    soilTypes: {
      clay: string;
      sandy: string;
      loamy: string;
      silt: string;
      peat: string;
      chalky: string;
    };
    experienceLevels: {
      beginner: string;
      intermediate: string;
      advanced: string;
      expert: string;
    };
    buttons: {
      back: string;
      continue: string;
      complete: string;
      processing: string;
    };
    locationInfo: {
      title: string;
      description: string;
      benefits: {
        weather: string;
        crops: string;
        market: string;
      };
    };
    validation: {
      required: string;
      emailInvalid: string;
      passwordMatch: string;
      passwordLength: string;
    };
    links: {
      haveAccount: string;
      signin: string;
    };
  };
  signin: {
    title: string;
    subtitle: string;
    fields: {
      email: string;
      password: string;
    };
    placeholders: {
      email: string;
      password: string;
    };
    buttons: {
      signin: string;
      processing: string;
    };
    links: {
      forgotPassword: string;
      noAccount: string;
      signup: string;
    };
    validation: {
      required: string;
      emailInvalid: string;
    };
    errors: {
      invalidCredentials: string;
    };
  };
  sidebar:{
dashboard:string;
market:string;
trends:string;
portfolio:string;
chats:string;
logout:string;
general:string;
accountPages:string;
support:string;
cropRecommendations:string;
purchases:string;
myspace:string;
myFarms:string;
priceForecast:string;
  };
  welcomeCard:{
    title:string;
    name:string;
    message:string
  };
  weatherCard:{
    date:string,
    location:string,
    month:string
  };
  statusCard:{
stats:{
  farmers:string,
  traders:string,
  totalUsers:string
}
  };
  common: {
    search: string;
    filter: string;
    all: string;
    pending: string;
    approved: string;
    rejected: string;
    noResults :string;
    cancel: string;
    save: string;

  };
  notFound: {
    title: string;
    subtitle: string;
    goHome: string;
    goDashboard: string;
  };
  filters?: {
    status?: {
      all: string;
      pending: string;
      approved: string;
      rejected: string;
    };
    role?: {
      all: string;
      farmer: string;
      trader: string;
    };
  };
  table: {
  headers: {
    name: string,
    email: string, 
    phone: string,
    role: string,
    action:string
  }
},
traderStats?: {
    totalRequests: string;
    pending: string;
    approved: string;
    rejected: string;
  };
  businessInfo?: {
    businessInfo: string;
    registrationNumber: string;
    taxId: string;
    ownerInfo: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  additionalInfo?: {
    applicationStatus: string;
    currentStatus: string;
    registrationDate: string;
    pending: string;
    approved: string;
    rejected: string;
  };
traderApproval?: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    review: string;
  };
  traderDetail?: {
    notFound: string;
    backToApprovals: string;
    reviewApplication: string;
    reject: string;
    approveApplication: string;
    approving:string;
  };
  traderTable?: {
    businessName: string;
    owner: string;
    contact: string;
    registrationDate: string;
    status: string;
    action: string;
  };
  status?: {
    pending: string;
    approved: string;
    rejected: string;
  };
 roles: {
    farmer: string;
    trader: string;
  };
  modals: {
    editUser: {
      title: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      phonePlaceholder: string;
    };
    rejection: {
      title: string;
      description: string;
      placeholder: string;
      rejecting: string;
      confirm: string;
    };
  };
   header?: {
    pages: string;
    home: string;
    dashboard: string;
    traderApproval: string;
    farmer: string;
    admin: string;
    portfolio: string;
    chat: string;
    market: string;
    farms: string;
    cropdetail: string;
    trends: string;
    priceForecast: string;
    purchases: string;
    [key: string]: string;
  };
}

// English translations
const en: Translations = {
  nav: {
    about: "About",
    signup: "Signup",
    login: "Login"
  },
  hero: {
    title: "Smart Farming for a",
    titleHighlight: "Sustainable",
    subtitle: "Future",
    description: "Revolutionizing Ethiopian agriculture with AI-driven solutions. Join thousands of farmers making data-driven decisions for better profits and sustainable farming practices.",
    features: ["Fast", "Secure", "Insightful", "User-Friendly"],
    buttons: {
      getStarted: "Get Started Free",
      learnMore: "Learn More"
    },
    testimonial: "AgriMarket helped increase my profits by 40% with smart crop recommendations!",
    testimonialName: "Tesfaye K.",
    testimonialRole: "Teff Farmer, Amhara",
    altText: "Ethiopian farmers using AgriMarket app"
  },
  benefits: {
    title: "Why Choose AgriMarket?",
    description: "Empowering Ethiopian farmers with technology-driven solutions for smarter farming, better profits, and sustainable agriculture.",
    items: {
      ai: "AI-Powered Insights",
      market: "Market Trend Analysis",
      traders: "Direct Trader Connections",
      secure: "Secure & Reliable",
      userFriendly: "User-Friendly Platform",
      weather: "Weather & Soil Analysis",
      alerts: "Real-Time Alerts",
      dataDriven: "Data-Driven Decisions"
    }
  },
  howItWorks: {
    title: "How AgriMarket Works",
    description: "Join thousands of Ethiopian farmers who are transforming their agriculture with data-driven decisions.",
    steps: {
      signup: "Sign Up",
      addFarm: "Add Your Farm",
      getInsights: "Get AI Insights",
      connectGrow: "Connect & Grow"
    },
    stepDescriptions: {
      signup: "Create your free account in minutes. Register as a farmer or trader and get access.",
      addFarm: "Enter your farm details, location, soil type, and crops. Our AI starts analyzing your data immediately.",
      getInsights: "Receive personalized crop recommendations, price forecasts, and market alerts for your farm.",
      connectGrow: "Sell directly to verified traders, optimize your sales timing, and maximize your profits."
    },
    cta: "Start Your Journey Today",
    ctaDescription: "Ready to transform your farming with data-driven insights?"
  },
  farmingBasics: {
    title: "Smart Farming Basics",
    description: "Master these fundamentals and take your farming to the next level with AgriMarket's data-driven insights.",
    items: {
      cropSelection: "Smart Crop Selection",
      weatherAwareness: "Weather & Climate Awareness",
      marketTiming: "Market Timing",
      profitOptimization: "Profit Optimization"
    },
    itemDescriptions: {
      cropSelection: "Choosing the right crops based on soil type, climate, and market demand is key to maximizing your farm's profitability and sustainability.",
      weatherAwareness: "Understanding local weather patterns and seasonal changes helps you plan planting and harvesting times for optimal crop yields.",
      marketTiming: "Knowing when to sell your produce based on market trends, demand cycles, and price fluctuations can significantly increase your income.",
      profitOptimization: "Balancing input costs with expected returns and implementing efficient farming practices leads to sustainable profit growth over time."
    },
    cta: "Learn More About Smart Farming",
    ctaDescription: "Master these fundamentals and take your farming to the next level with AgriMarket's data-driven insights."
  },
  faq: {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about AgriMarket and how it helps Ethiopian farmers.",
    questions: [
      "Is AgriMarket free for farmers?",
      "Do I need internet access to use AgriMarket?",
      "How accurate are the crop recommendations?",
      "Is my farm data secure?",
      "Can I use AgriMarket on my mobile phone?",
      "How do I connect with traders?",
      "What crops does AgriMarket support?",
    ],
    answers: [
      "Yes! Our basic platform is completely free for farmers. You can access crop recommendations, market trends, and price forecasts at no cost. Premium features are available with optional subscriptions.",
      "While real-time features require internet, you can download market reports and recommendations for offline use. Our platform is optimized for low-bandwidth areas common in rural Ethiopia.",
      "Our AI models are trained on Ethiopian agricultural data and achieve over 85% accuracy. Recommendations consider soil type, local climate, historical yields, and current market demand specific to your region.",
      "Absolutely. We use military-grade encryption and never share your personal or farm data with third parties without your consent. Your information is stored securely on Ethiopian servers.",
      "Yes! AgriMarket is fully optimized for mobile devices. You can access all features through our mobile-friendly website.",
      "Once registered, you can list your available crops on our marketplace. Verified traders can view your listings and contact you directly through the platform's messaging system.",
      "We support all major Ethiopian crops including teff, wheat, maize, coffee, pulses, oilseeds, and horticultural products. New crops are added regularly based on regional demand.",
    ],
    contact: {
      title: "Still have questions?",
      description: "Our agricultural experts are here to help you.",
      button: "Contact Support"
    }
  },
  footer: {
    description: "An AI-powered decision support platform helping Ethiopian farmers choose profitable crops, forecast market prices, and connect directly with traders.",
    quickLinks: ["Home", "About Project", "Features", "How It Works", "FAQ"],
    contact: {
      email: "agrimarket@edu.et",
      phone: "+251 911******",
      address: "Addis Ababa University"
    },
    social: "Connect With Us",
    projectInfo: "Academic Project",
    teamMembers: "Biruk Demissie · Bisart Alemayehu · Kaletsidik Ayalew · Khalid Abdifetah",
    copyright: `© ${new Date().getFullYear()} AgriMarket AI Decision Support System. • Final Year Project`,
    acknowledgement: "Special thanks to Ethiopian Institute of Agricultural Research (EIAR)",
    academicDisclaimer: "This project is developed for academic purposes as part of the Computer Science curriculum."
  },
  authForm: {
    quote: "Grow Smarter, Trade Better",
    subtitle: "Get AI-powered insights on crops, prices and markets - all in one place."
  },
  signup: {
    title: "Welcome",
    subtitle:"SignUp",
    fields: {
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      farmName: "Farm Name",
      farmSize: "Farm Size",
      farmSizeUnit: "Hectares",
      soilType: "Soil Type",
      region: "Region",
      woreda: "Woreda",
      crops: "Preferred Crops",
      
      experience: "Farming Experience"
    },
    placeholders: {
      fullName: "Enter your full name",
      email: "Enter your email address",
      phone: "Enter your phone number",
      password: "Create a password",
      confirmPassword: "Confirm your password",
      farmName: "Enter your farm name",
      farmSize: "e.g., 5",
      soilType: "Select soil type",
      region: "Enter your region",
      woreda: "Enter your woreda",
      crops: "e.g., Teff, Wheat, Maize",
      experience: "Select your experience level"
    },
    soilTypes: {
      clay: "Clay Soil",
      sandy: "Sandy Soil",
      loamy: "Loamy Soil",
      silt: "Silt Soil",
      peat: "Peat Soil",
      chalky: "Chalky Soil"
    },
    experienceLevels: {
      beginner: "Beginner (0-2 years)",
      intermediate: "Intermediate (3-5 years)",
      advanced: "Advanced (6-10 years)",
      expert: "Expert (10+ years)"
    },
    buttons: {
      back: "Back",
      continue: "Continue",
      complete: "Complete Registration",
      processing: "Processing..."
    },
    locationInfo: {
      title: "Why we need your location?",
      description: "Your location helps us provide:",
      benefits: {
        weather: "Weather prediction for your specific area",
        crops: "Crop recommendations based on local climate",
        market: "Market insights specific to your region"
      }
    },
    validation: {
      required: "This field is required",
      emailInvalid: "Please enter a valid email address",
      passwordMatch: "Passwords do not match",
      passwordLength: "Password must be at least 8 characters"
    },
    links: {
      haveAccount: "Already have an account?",
      signin: "Sign in"
    }
  },
  signin: {
    title: "Welcome Back",
    subtitle: "Sign in to your account",
    fields: {
      email: "Email Address",
      password: "Password"
    },
    placeholders: {
      email: "Enter your email",
      password: "Enter your password"
    },
    buttons: {
      signin: "Sign In",
      processing: "Signing in..."
    },
    links: {
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      signup: "Sign up"
    },
    validation: {
      required: "This field is required",
      emailInvalid: "Please enter a valid email address"
    },
    errors: {
      invalidCredentials: "Invalid email or password"
    }
  },
  sidebar: {
    dashboard: "Dashboard",
    market: "Companies/Market",
    trends: "Trends",
    portfolio: "My Portfolio",
    chats: "Chats",
    logout: "Log out",
    general: "General",
    accountPages: "Account Pages",
    support: "Support",
     cropRecommendations: "Crop Recommendations", 
   purchases: "Purchases",
   myspace:"My Space",
   myFarms: "My Farms",
   priceForecast: "Price Forecast"
   },
  welcomeCard:{
    title:"Welcome to AgriMarket",
    name:"Bisrat Alemayehu",
    message:"Glad to see you!"

  },
  weatherCard:{
    date:"",
    month:"",
    location:""
  },
  statusCard:{
    stats:{
       farmers: "Farmers",
      traders: "Traders",
      totalUsers: "Total Users"
    }
  },
  common: {
  search: "Search...",
  filter: "Filter",
  all: "All",
  pending: "Pending",
  approved: "Approved", 
  rejected: "Rejected",
  noResults :"No results found",
  cancel: "Cancel",
  save: "Save",
},
notFound: {
  title: "Page not found",
  subtitle: "This field hasn't been planted yet — the page you're looking for doesn't exist or was moved.",
  goHome: "Back to home",
  goDashboard: "Go to dashboard",
},
filters: {
  status: {
    all: "All Status",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected"
  },
  role: {
    all: "All Roles",
    farmer: "Farmers",
    trader: "Traders"
  }
},
table: {
  headers: {
    name: "Name",
    email: "Email", 
    phone: "Phone",
    role: "Role",
    action: "Action"
  }
},
traderStats: {
  totalRequests: "Total Requests",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
},
businessInfo: {
  businessInfo: "Business Information",
  registrationNumber: "Registration Number",
  taxId: "Tax ID",
  ownerInfo: "Owner Information",
  fullName: "Full Name",
  email: "Email",
  phone: "Phone",
  address: "Address"
},
additionalInfo: {
  applicationStatus: "Application Status",
  currentStatus: "Current Status",
  registrationDate: "Registration Date",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected"
},
traderApproval: {
  title: "Trader Approvals",
  subtitle: "Review and manage trader registration requests",
  searchPlaceholder: "Search by business name, owner, or email...",
  review: "Review"
},
traderDetail: {
  notFound: "Trader not found",
  backToApprovals: "Back to Approvals",
  reviewApplication: "Review trader application",
  reject: "Reject",
  approveApplication: "Approve Application",
  approving:"Approving..."
},
traderTable: {
  businessName: "Business Name",
  owner: "Owner",
  contact: "Contact",
  registrationDate: "Registration Date",
  status: "Status",
  action: "Action"
},
status: {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected"
},
roles: {
  farmer: "Farmer",
  trader: "Trader"
},
modals: {
  editUser: {
    title: "Edit User",
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    phonePlaceholder: "Phone"
  },
  rejection: {
    title: "Reject Application",
    description: "Please provide a reason for rejecting this trader application. This will be shared with the applicant.",
    placeholder: "Enter rejection reason...",
    rejecting: "Rejecting...",
    confirm: "Confirm Reject"
  }
},
header: {
  pages: "Pages",
  home: "Home",
  dashboard: "Dashboard",
  traderApproval: "Trader Approvals",
  farmer: "Farmer",
  admin: "Admin",
  portfolio: "Portfolio",
  chat: "Chat",
  market: "Market",
  farms: "My Farms",
  cropdetail: "Crop Recommendations",
  trends: "Trends & Forecast",
  priceForecast: "Price Forecast",
  purchases: "Purchases",
}
};

// Amharic translations
const am: Translations = {
  nav: {
    about: "ስለኛ",
    signup: "ተመዝገብ",
    login: "ግባ"
  },
  hero: {
    title: "ዘመናዊ ግብርና ለ",
    titleHighlight: "ዘላቂ",
    subtitle: "ትርፋማ ምርት",
    description: "የኢትዮጵያን ግብርና በአዲስ የቴክኖሎጂ መፍትሄዎች እየለወጥን ነው። በሺዎች የሚቆጠሩ ገበሬዎች ለተሻለ ትርፍና ዘላቂ ግብርና በመረጃ የተመሰረተ ውሳኔ በመስጠት እየተቀላቀሉን ነው።",
    features: ["ፈጣን", "ደህንነቱ የተጠበቀ", "ዕውቀት የሚሰጥ", "ቀላል አጠቃቀም"],
    buttons: {
      getStarted: "ነፃ ጀምር",
      learnMore: "ተጨማሪ ለመማር"
    },
    testimonial: "አግሪማርኬት በብቃት ባለው የምርት ምክር ትርፌን በ40% አሳድጎኛል!",
    testimonialName: "ተስፋዬ ከ.",
    testimonialRole: "ጤፍ ገበሬ፣ አማራ",
    altText: "አግሪማርኬት መተግበሪያ እየተጠቀሙ ያሉ የኢትዮጵያ ገበሬዎች"
  },
  benefits: {
    title: "ለምን አግሪማርኬትን መምረጥ ይጠቅማል?",
    description: "የኢትዮጵያ ገበሬዎችን በቴክኖሎጂ አማካኝነት ለዘመናዊ፣ ትርፋማ እና ዘላቂ ግብርና እናበረታታለን።",
    items: {
      ai: "የሰው አስተውሎት ማሳያ",
      market: "የገበያ አዝማሚያ ትንተና",
      traders: "ቀጥተኛ ነጋዴ ግንኙነት",
      secure: "ደህንነቱ የተጠበቀ እና አስተማማኝ",
      userFriendly: "ቀላል የሆነ መጠቀሚያ",
      weather: "የአየር ሁኔታና የበለስ ምርመራ",
      alerts: "ቅጽበታዊ ማሳወቂያዎች",
      dataDriven: "በመረጃ የተመሰረተ ውሳኔ"
    }
  },
  howItWorks: {
    title: "አግሪማርኬት እንዴት ይሰራል",
    description: "በሺዎች የሚቆጠሩ ገበሬዎች በመረጃ የተመሰረተ ውሳኔ በመስጠት ግብርናቸውን እየለወጡ ነው።",
    steps: {
      signup: "ተመዝገብ",
      addFarm: "እርሻህን አክል",
      getInsights: "የሰው አስተውሎት ማሳያ ያግኙ",
      connectGrow: "ይገናኙና ያድጉ"
    },
    stepDescriptions: {
      signup: "በጥቂት ደቂቃዎች ውስጥ ነፃ መለያ ይፍጠሩ። እንደ ገበሬ ወይም ነጋዴ ይመዝገቡና ግላዊ መዳረሻ ያግኙ።",
      addFarm: "የእርሻዎን ዝርዝሮች፣ አካባቢ፣ የበለስ አይነት እና የሚተከሉ አዝፍሮች ያስገቡ። የሰው አስተውሎት ስርዓታችን መረጃዎን ወዲያውኑ ለመተንተን ይጀምራል።",
      getInsights: "ለእርሻዎ ብጁ የተደረጉ የአዝፍሮ ምክሮች፣ የዋጋ ትንበያዎችና የገበያ ማሳወቂያዎችን ይቀበሉ።",
      connectGrow: "በቀጥታ ለተረጋገጡ ነጋዴዎች ይሽጡ፣ የሽያጭ ጊዜዎን ያሻሽሉ እና ትርፍዎን ያሳድጉ።"
    },
    cta: "ጉዞህን ዛሬ ጀምር",
    ctaDescription: "በመረጃ ላይ የተመሰረተ ዕውቀት እርሻህን ለመለወጥ ዝግጁ ነህ?"
  },
  farmingBasics: {
    title: "ዘመናዊ ግብርና መሰረታዊ ነገሮች",
    description: "እነዚህን መሰረታዊ ነገሮች በመቆጣጠር እርሻህን ወደ ቀጣይ ደረጃ በአግሪማርኬት በመረጃ የተመሰረተ ዕውቀት አምጣ።",
    items: {
      cropSelection: "ብቃት ያለው የአዝፍሮ ምርጫ",
      weatherAwareness: "የአየር ሁኔታ እውቀት",
      marketTiming: "የገበያ ጊዜ ምርጫ",
      profitOptimization: "ትርፍ ማሳደግ"
    },
    itemDescriptions: {
      cropSelection: "ትክክለኛውን አዝፍሮች በበለስ አይነት፣ አየር ጠባይ እና የገበያ ፍላጎት መሰረት መምረጥ የእርሻዎን ትርፋማነት እና ዘላቂነት ለማሳደግ ቁልፍ ነው።",
      weatherAwareness: "የአካባቢ የአየር ሁኔታን እና የወቅት ለውጦችን መረዳት ለተመቻቸ ምርት የመትከል እና የማጨድ ጊዜዎችን ለመወሰን ይረዳዎታል።",
      marketTiming: "የገበያ አዝማሚያዎችን፣ የፍላጎት ዑደቶችን እና የዋጋ ለውጦችን በመከታተል የምርትዎን የመሸጥ ጊዜ መምረጥ ገቢዎን በከፍተኛ ሁኔታ ማሳደግ ይችላል።",
      profitOptimization: "የግብዓት ወጪዎችን ከተጠበቀ ገቢ ጋር ማመጣጠን እና ውጤታማ የግብርና ዘዴዎችን መተግበር በጊዜ ሂደት ወደ ዘላቂ የትርፍ እድገት ይመራል።"
    },
    cta: "ስለ ዘመናዊ ግብርና ተጨማሪ ይወቁ",
    ctaDescription: "እነዚህን መሰረታዊ ነገሮች በመቆጣጠር እርሻህን ወደ ቀጣይ ደረጃ በአግሪማርኬት በመረጃ የተመሰረተ ዕውቀት አምጣ።"
  },
  faq: {
    title: "በተደጋጋሚ የሚጠየቁ ጥያቄዎች",
    description: "ስለ አግሪማርኬት እና እንዴት የኢትዮጵያ ገበሬዎችን እንደሚረዳ የተለመዱ ጥያቄዎችን መልስ ያግኙ።",
    questions: [
      "አግሪማርኬት ለገበሬዎች ነፃ ነው?",
      "አግሪማርኬትን ለመጠቀም በኢንተርኔት መዳረሻ ያስፈልገኛል?",
      "የአዝፍሮ ምክሮች ምን ያህል ትክክለኛ ናቸው?",
      "የእርሻዬ መረጃ ደህንነቱ ተጠብቋል?",
      "አግሪማርኬትን በሞባይል ስልኬ ላይ መጠቀም እችላለሁ?",
      "ከነጋዴዎች ጋር እንዴት እገናኛለሁ?",
      "አግሪማርኬት ምን አይነት አዝፍሮችን ይደግፋል?",
    ],
    answers: [
      "አዎ! መሰረታዊው መድረኳችን ለገበሬዎች ሙሉ በሙሉ ነፃ ነው። የአዝፍሮ ምክር፣ የገበያ አዝማሚያ እና የዋጋ ትንበያ ያለ ክፍያ መዳረሻ አለዎት። ተጨማሪ ባህሪያት በአመቻችት በሚደረጉ የደንበኝነት አገልግሎቶች ይገኛሉ።",
      "ቅጽበታዊ ባህሪያት በኢንተርኔት ይፈልጋሉ፣ ነገር ግን የገበያ ሪፖርቶችን እና ምክሮችን ለመስመር ውጭ አጠቃቀም ማውረድ ይችላሉ። መድረኳችን ለበርካታ የኢትዮጵያ ገጠር አካባቢዎች በጣም ጥቂት የይዘት አቅም ባለው ቦታ እንዲሠራ ተዘጋጅቷል።",
      "የኛ የሰው አስተውሎት ሞዴሎች በኢትዮጵያ ግብርና መረጃ ላይ ተሰልፈው ከ85% በላይ ትክክለኛነት ያሳያሉ። ምክሮቹ የበለስ አይነት፣ የአካባቢ አየር ጠባይ፣ ታሪካዊ ምርት እና የአካባቢዎ የአሁኑ የገበያ ፍላጎት ያስባሉ።",
      "በእርግጠኝነት። ሰራዊታዊ ደረጃ ኢንክሪፕሽን እንጠቀማለን እና ፈቃድዎ ካልተሰጠ የግል ወይም የግብርና መረጃዎን ከሶስተኛ ወገን ጋር አንጋራም። መረጃዎችዎ በኢትዮጵያ ውስጥ ባሉ ሰርቨሮች ላይ በደህንነት ይከማቻሉ።",
      "አዎ! አግሪማርኬት ሙሉ በሙሉ ለሞባይል መሣሪያዎች ተገቢ ተደርጎ ተዘጋጅቷል። ሁሉንም ባህሪያት በሞባይል ድር ጣቢያችን በመጠቀም ማግኘት ይችላሉ።",
      "አንዴ ከተመዘገቡ በኋላ፣ ለሽያጭ የሚዘጋጁትን አዝፍሮችዎን በገበያ ቦታችን ላይ ማሰባሰብ ይችላሉ። ተረጋግጠው የተመዘገቡ ነጋዴዎች ዝርዝሮችዎን ማየት እና በቀጥታ በመድረኩ የመልእክት ስርዓት ማነጋገር ይችላሉ።",
      "ሁሉንም ዋና ዋና የኢትዮጵያ አዝፍሮችን እንደ ጤፍ፣ ስንዴ፣ በቆሎ፣ ቡና፣ እንጆሬ፣ ዘይትኛ ፍሬዎች እና የአትክልት ምርቶች እንደገና እናደርጋለን። አዲስ አዝፍሮች በክልላዊ ፍላጎት መሰረት በየጊዜው ይጨመራሉ።",
    ],
    contact: {
      title: "አሁንም ጥያቄዎች አሉዎት?",
      description: "የኛ የግብርና ባለሙያዎች ለመርዳት እዚህ አሉ።",
      button: "ደጋፍ ያግኙ"
    }
  },
  footer: {
    description: "የሰው አስተውሎት ማሳያ መድረክ የኢትዮጵያ ገበሬዎች ትርፋማ አዝፍሮችን እንዲመርጡ፣ የገበያ ዋጋ እንዲተነብዩ እና በቀጥታ ከነጋዴዎች ጋር እንዲገናኙ ይረዳቸዋል።",
    quickLinks: ["መነሻ ገጽ", "ስለ ፕሮጀክቱ", "ባህሪያት", "እንዴት እንደሚሰራ", "ጥያቄዎች"],
    contact: {
      email: "agrimarket@edu.et",
      phone: "+251 911******",
      address: "አዲስ አበባ ዩኒቨርሲቲ"
    },
    social: "ከእኛ ጋር ይገናኙ",
    projectInfo: "የትምህርት ፕሮጀክት",
    teamMembers: "ብሩክ ደምሴ · ብሳርት አለማየሁ · ቃለጽድቅ አያሌው · ኻሊድ አብዲፌታህ",
    copyright: `© ${new Date().getFullYear()} አግሪማርኬት AI ውሳኔ ድጋፍ ስርዓት • የመጨረሻ አመት ፕሮጀክት`,
    acknowledgement: "ለኢትዮጵያ የግብርና ምርምር ኢንስቲትዩት (EIAR) ልዩ እናመሰግናለን",
    academicDisclaimer: "ይህ ፕሮጀክት የኮምፒዩተር ሳይንስ ሥርዓተ ትምህርት አካል ሆኖ ለትምህርታዊ ዓላማዎች ተዘጋጅቷል።"
  },
  authForm: {
    quote: "ብልህ በሆነ መንገድ አብቅል፣ በተሻለ መንገድ ንገድ",
    subtitle: "ለሰብሎች፣ ዋጋዎች እና ገበያዎች በ AI የተመረቱ ግንዛቤዎችን ያግኙ - ሁሉም በአንድ ቦታ"
  },
  signup: {
    title: "እንኳን በደህና መጡ",
    subtitle:"ተመዝገብ",
    fields: {
      fullName: "ሙሉ ስም",
      email: "ኢሜይል አድራሻ",
      phone: "ስልክ ቁጥር",
      password: "የይለፍ ቃል",
      confirmPassword: "የይለፍ ቃል ያረጋግጡ",
      farmName: "የእርሻ ስም",
      farmSize: "የእርሻ ስፋት",
      farmSizeUnit: "ሄክታር",
      soilType: "የበለስ አይነት",
      region: "ክልል",
      woreda: "ወረዳ",
      crops: "የሚመረጡ አዝፍሮች",
      experience: "የግብርና ልምድ"
    },
    placeholders: {
      fullName: "ሙሉ ስምዎን ያስገቡ",
      email: "ኢሜይል አድራሻዎን ያስገቡ",
      phone: "ስልክ ቁጥርዎን ያስገቡ",
      password: "የይለፍ ቃል ይፍጠሩ",
      confirmPassword: "የይለፍ ቃልዎን ያረጋግጡ",
      farmName: "የእርሻዎን ስም ያስገቡ",
      farmSize: "ለምሳሌ 5",
      soilType: "የበለስ አይነት ይምረጡ",
      region: "ክልልዎን ያስገቡ",
      woreda: "ወረዳዎን ያስገቡ",
      crops: "ለምሳሌ ጤፍ፣ ስንዴ፣ በቆሎ",
      experience: "የልምድ ደረጃዎን ይምረጡ"
    },
    soilTypes: {
      clay: "የሸክላ በለስ",
      sandy: "አሸዋማ በለስ",
      loamy: "ለም በለስ",
      silt: "ደለል በለስ",
      peat: "አተር በለስ",
      chalky: "ኖራማ በለስ"
    },
    experienceLevels: {
      beginner: "ጀማሪ (0-2 ዓመት)",
      intermediate: "መካከለኛ (3-5 ዓመት)",
      advanced: "ላቀ (6-10 ዓመት)",
      expert: "ባለሙያ (10+ ዓመት)"
    },
    buttons: {
      back: "ተመለስ",
      continue: "ቀጥል",
      complete: "ምዝገባ ጨርስ",
      processing: "በሂደት ላይ..."
    },
    locationInfo: {
      title: "ለምን አካባቢዎን እንፈልጋለን?",
      description: "የአካባቢዎ መረጃ የሚከተሉትን እንድንሰጥ ይረዳናል፡",
      benefits: {
        weather: "ለአካባቢዎ የተዘጋጀ የአየር ሁኔታ ትንበያ",
        crops: "በአካባቢው የአየር ጠባይ መሰረት የአዝፍሮ ምክሮች",
        market: "ለክልልዎ የተወሰኑ የገበያ ግንዛቤዎች"
      }
    },
    validation: {
      required: "ይህ መረጃ ያስፈልጋል",
      emailInvalid: "እባክዎ ትክክለኛ ኢሜይል አድራሻ ያስገቡ",
      passwordMatch: "የይለፍ ቃሎች አይዛመዱም",
      passwordLength: "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት"
    },
    links: {
      haveAccount: "መለያ አለዎት?",
      signin: "ግባ"
    }
  },
  signin: {
    title: "እንኳን በደህና መጡ",
    subtitle: "ወደ መለያዎ ይግቡ",
    fields: {
      email: "ኢሜይል አድራሻ",
      password: "የይለፍ ቃል"
    },
    placeholders: {
      email: "ኢሜይልዎን ያስገቡ",
      password: "የይለፍ ቃልዎን ያስገቡ"
    },
    buttons: {
      signin: "ግባ",
      processing: "በመግባት ላይ..."
    },
    links: {
      forgotPassword: "የይለፍ ቃል ረስተዋል?",
      noAccount: "መለያ የለዎትም?",
      signup: "ተመዝገብ"
    },
    validation: {
      required: "ይህ መረጃ ያስፈልጋል",
      emailInvalid: "እባክዎ ትክክለኛ ኢሜይል አድራሻ ያስገቡ"
    },
    errors: {
      invalidCredentials: "ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል"
    }
  },
  sidebar: {
    dashboard: "ዳሽቦርድ",
    market: "ገበያ",
    trends: "አዝማሚያዎች",
    portfolio: "ፖርትፎሊዮዬ",
    chats: "ውይይቶች",
    logout: "ውጣ",
    general: "አጠቃላይ",
    accountPages: "መለያ ገጾች",
    support: "ድጋፍ",
     cropRecommendations: "የሰብል ምክሮች", 
   purchases: "ግዢዎች",
   myspace:"ፖርትፎሊዮዬ",
   myFarms: "እርሻዎቼ",
   priceForecast: "የዋጋ ትንበያ"
   },
 welcomeCard: {
  title: "እንኳን ወደ አግሪማርኬት በደህና መጡ",
  name: "ብስራት አለማየሁ",
  message: "ስለተመለሱ ደስ ብሎናል!"
},
weatherCard:{
  location:"",
  date:"",
  month:""
},
statusCard:{
  stats:{
     farmers: "ገበሬዎች",
      traders: "ነጋዴዎች",
      totalUsers: "አጠቃላይ ተጠቃሚዎች"
  }
},
common: {
  search: "ፈልግ...",
  filter: "አጣራ",
  all: "ሁሉም",
  pending: "በመጠባበቅ ላይ",
  approved: "ጸድቋል",
  rejected: "ውድቅ ተደርጓል",
  noResults:"ምንም ውጤት አልተገኘም",
  cancel: "ሰርዝ",
  save: "አስቀምጥ",
},
notFound: {
  title: "ገጽ አልተገኘም",
  subtitle: "የሚፈልጉት ገጽ የለም ወይም ተዛውሯል — እንደገና ይሞክሩ ወይም ወደ መነሻ ገጽ ይመለሱ።",
  goHome: "ወደ መነሻ ገጽ",
  goDashboard: "ወደ ዳሽቦርድ",
},
filters: {
  status: {
    all: "ሁሉም ሁኔታ",
    pending: "በመጠባበቅ ላይ",
    approved: "ጸድቋል",
    rejected: "ውድቅ ተደርጓል"
  },
  role: {
    all: "ሁሉም ሚናዎች",
    farmer: "ገበሬዎች",
    trader: "ነጋዴዎች"
  }},
  table: {
  headers: {
    name: "ስም",
    email: "ኢሜይል",
    phone: "ስልክ",
    role: "ሚና",
    action: "ተግባር"
  }
},
traderStats: {
  totalRequests: "ጠቅላላ ጥያቄዎች",
  pending: "በመጠባበቅ ላይ",
  approved: "ጸድቋል",
  rejected: "ውድቅ ተደርጓል"
},
businessInfo: {
  businessInfo: "የንግድ መረጃ",
  registrationNumber: "የምዝገባ ቁጥር",
  taxId: "ግብር ቁጥር",
  ownerInfo: "የባለቤት መረጃ",
  fullName: "ሙሉ ስም",
  email: "ኢሜይል",
  phone: "ስልክ",
  address: "አድራሻ"
},
additionalInfo: {
  applicationStatus: "የማመልከቻ ሁኔታ",
  currentStatus: "አሁን ያለበት ሁኔታ",
  registrationDate: "የምዝገብ ቀን",
  pending: "በመጠባበቅ ላይ",
  approved: "ጸድቋል",
  rejected: "ውድቅ ተደርጓል"
},
traderApproval: {
  title: "የነጋዴ ማረጋገጫዎች",
  subtitle: "የነጋዴ ምዝገባ ጥያቄዎችን ይገምግሙ እና ያስተዳድሩ",
  searchPlaceholder: "በንግድ ስም፣ በባለቤት ወይም በኢሜይል ይፈልጉ...",
  review: "ገምግም"
},
traderDetail: {
  notFound: "ነጋዴ አልተገኘም",
  backToApprovals: "ወደ ማረጋገጫዎች ተመለስ",
  reviewApplication: "የነጋዴ ማመልከቻ ይገምግሙ",
  reject: "ውድቅ አድርግ",
  approveApplication: "ማመልከቻውን ይቀበሉ",
  approving:" ማረጋገጫዎች... "
},
traderTable: {
  businessName: "የንግድ ስም",
  owner: "ባለቤት",
  contact: "መገናኛ",
  registrationDate: "የምዝገብ ቀን",
  status: "ሁኔታ",
  action: "ተግባር"
},
status: {
  pending: "በመጠባበቅ ላይ",
  approved: "ጸድቋል",
  rejected: "ውድቅ ተደርጓል"
},
roles: {
  farmer: "ገበሬ",
  trader: "ነጋዴ"
},
modals: {
  editUser: {
    title: "ተጠቃሚ አርትዕ",
    namePlaceholder: "ስም",
    emailPlaceholder: "ኢሜይል",
    phonePlaceholder: "ስልክ"
  },
  rejection: {
    title: "ማመልከቻ ውድቅ አድርግ",
    description: "እባክዎ ይህን የነጋዴ ማመልከቻ ውድቅ ለማድረግ ምክንያት ያቅርቡ። ይህ ለአመልካቹ ይተላለፋል።",
    placeholder: "ውድቅ የማድረጊያ ምክንያት ያስገቡ...",
    rejecting: "እየተደመጠ ነው...",
    confirm: "ውድቅ መሆኑን አረጋግጥ"
  }
},
header: {
  pages: "ገጾች",
  home: "መነሻ",
  dashboard: "ዳሽቦርድ",
  traderApproval: "የነጋዴ ማረጋገጫ",
  farmer: "ገበሬ",
  admin: "አስተዳዳሪ",
  portfolio: "ፖርትፎሊዮ",
  chat: "ውይይት",
  market: "ገበያ",
  farms: "እርሻዎቼ",
  cropdetail: "የሰብል ምክሮች",
  trends: "አዝማሚያ እና ትንበያ",
  priceForecast: "የዋጋ ትንበያ",
  purchases: "ግዢዎች",
}
};

// Export translation function
export const translations: Record<Language, Translations> = { en, am };

// Helper function to get translations (includes dashboard portal strings)
export function getTranslations(lang: Language): AppTranslations {
  const base = translations[lang];
  return {
    ...base,
    dashboard: lang === 'am' ? dashboardAm : dashboardEn,
  };
}