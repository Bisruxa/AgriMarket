/** Dashboard & in-app UI strings (farmer / trader portals). */
export type DashboardTranslations = {
  layout: {
    footerTagline: string;
    copyright: string;
  };
  language: {
    switchToAmharic: string;
    switchToEnglish: string;
    labelWhenEn: string;
    labelWhenAm: string;
  };
  notifications: {
    title: string;
    empty: string;
    ariaLabel: string;
    markAllRead: string;
    dismiss: string;
    viewAll: string;
    loadError: string;
    items: Record<string, { title: string; message: string }>;
  };
  watchList: {
    title: string;
    season: string;
    crop: string;
    price: string;
    demand: string;
    yield: string;
    scroll: string;
    demandHigh: string;
    demandMedium: string;
    demandLow: string;
  };
  weather: {
    location: string;
    tempHigh: string;
    tempLow: string;
  };
  farmFacts: {
    badge: string;
    facts: string[];
  };
  cropDetail: {
    title: string;
    subtitle: string;
    selectFarm: string;
    chooseFarmPlaceholder: string;
    loadingFarms: string;
    noFarms: string;
    myFarmsLink: string;
    soilNotSet: string;
    soilSuffix: string;
    locationNotSet: string;
    getRecommendation: string;
    analyzing: string;
    topCrops: string;
    bestMatch: string;
    basedOnData: string;
    disclaimer: string;
    noCropsFound: string;
    failedRecommendation: string;
    networkError: string;
    suitability: {
      highly: string;
      moderate: string;
      low: string;
      notRecommended: string;
    };
  };
  priceForecast: {
    title: string;
    subtitle: string;
    selectCrop: string;
    selectRegion: string;
    year: string;
    month: string;
    predict: string;
    predicting: string;
    predictedPrice: string;
    confidenceRange: string;
    selectCropRegion: string;
    loadError: string;
    trendIncreasing: string;
    trendDecreasing: string;
    trendStable: string;
    months: string[];
    loadingOptions: string;
    selectCropPlaceholder: string;
    selectRegionPlaceholder: string;
    predictedPriceLabel: string;
    priceRange: string;
    expectedChange: string;
    disclaimer: string;
  };
  market: {
    title: string;
    subtitle: string;
    createNew: string;
    tryAgain: string;
    available: string;
    soldOut: string;
    deleteTitle: string;
    deleteDescription: string;
    headers: {
      name: string;
      stock: string;
      price: string;
      unit: string;
      category: string;
      status: string;
      actions: string;
    };
    loadingProducts: string;
    noProducts: string;
    edit: string;
    delete: string;
    productForm: {
      addTitle: string;
      editTitle: string;
      addSubtitle: string;
      editSubtitle: string;
      cropType: string;
      selectCrop: string;
      otherCrop: string;
      otherCropPlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      price: string;
      stock: string;
      harvestDate: string;
      cancel: string;
      addCrop: string;
      updateCrop: string;
      submitting: string;
      updating: string;
      loading: string;
      currency: string;
      crops: Record<string, string>;
      errors: {
        specifyCrop: string;
        selectCrop: string;
        description: string;
        price: string;
        stock: string;
        harvestDate: string;
      };
      toastAdded: string;
      toastUpdated: string;
      toastNetworkError: string;
      toastFailed: string;
    };
  };
  farms: {
    title: string;
    addFarm: string;
    empty: string;
    locationNotSet: string;
    editFarm: string;
    addFarmDialog: string;
    editDescription: string;
    addDescription: string;
    farmName: string;
    farmNamePlaceholder: string;
    soilType: string;
    soilColor: string;
    region: string;
    woreda: string;
    kebele: string;
    kebelePlaceholder: string;
    select: string;
    selectRegion: string;
    selectWoreda: string;
    selectRegionFirst: string;
    noWoredasForRegion: string;
    update: string;
    saveFarm: string;
    deleteTitle: string;
    deleteDescription: string;
    delete: string;
    soilTypes: Record<string, string>;
    soilColors: Record<string, string>;
    listRegistered: string;
    listClimate: string;
    listNotSet: string;
    listKebele: string;
    listSize: string;
    listPh: string;
    listTemp: string;
    listHumidity: string;
    listRainfall: string;
  };
};

export const dashboardEn: DashboardTranslations = {
  layout: {
    footerTagline: "Ready to farm smarter? Grow with AgriMarket.",
    copyright: "©2026 AgriMarket",
  },
  language: {
    switchToAmharic: "Switch to Amharic",
    switchToEnglish: "Switch to English",
    labelWhenEn: "አማርኛ",
    labelWhenAm: "English",
  },
  notifications: {
    title: "Notifications",
    empty: "You're all caught up — no new alerts.",
    ariaLabel: "Notifications",
    markAllRead: "Dismiss all",
    dismiss: "Dismiss",
    viewAll: "Open",
    loadError: "Could not load notifications.",
    items: {
      "farmer-no-farms": {
        title: "Register your farm",
        message: "Add at least one farm so AgriAI can recommend the best crops for your land.",
      },
      "farmer-sold-out": {
        title: "Products sold out",
        message: "{{count}} product(s) are sold out or out of stock. Update listings in the marketplace.",
      },
      "farmer-low-stock": {
        title: "Low stock alert",
        message: "{{count}} product(s) have 5 units or fewer left. Restock before you miss sales.",
      },
      "farmer-crop-tip": {
        title: "New crop insights",
        message: "Your farms are ready — run an AI crop recommendation for this season.",
      },
      "trader-pending": {
        title: "Account under review",
        message: "Your trader application is pending admin approval. We'll notify you when it's reviewed.",
      },
      "trader-rejected": {
        title: "Application not approved",
        message: "Your trader account was not approved. Contact support or check your application details.",
      },
      "trader-welcome": {
        title: "Welcome to AgriMarket",
        message: "Your account is approved. Browse farmer listings and manage purchases.",
      },
      "admin-pending-traders": {
        title: "Traders awaiting approval",
        message: "{{count}} trader(s) need your review in Trader Approval.",
      },
    },
  },
  watchList: {
    title: "Top Profitable Crops",
    season: "This Season",
    crop: "Crop",
    price: "Price (Birr)",
    demand: "Demand",
    yield: "Yield/ha",
    scroll: "Scroll",
    demandHigh: "High",
    demandMedium: "Medium",
    demandLow: "Low",
  },
  weather: {
    location: "Addis Ababa, Ethiopia",
    tempHigh: "H",
    tempLow: "L",
  },
  farmFacts: {
    badge: "Did you know?",
    facts: [
      "Ethiopia is the birthplace of coffee and a global leader in teff production — a staple for injera and millions of households.",
      "More than 80% of Ethiopians depend on agriculture; smallholder farms grow most of the nation's food.",
      "AgriMarket uses your farm's soil and climate data to suggest crops that fit your land — not generic advice.",
      "Rainfall and altitude vary sharply across regions; planting at the right time can protect yields from drought or frost.",
      "On AgriMarket, list produce, track demand trends, and connect with traders who buy directly from farmers.",
      "AI price forecasts on AgriMarket help you decide when to sell — plan harvests around market signals, not guesswork.",
    ],
  },
  cropDetail: {
    title: "Crop Recommendation",
    subtitle: "AI-powered suggestions tailored to your farm",
    selectFarm: "Select Your Farm",
    chooseFarmPlaceholder: "Choose a registered farm",
    loadingFarms: "Loading farms...",
    noFarms: "No farms registered. Add one from",
    myFarmsLink: "My Farms",
    soilNotSet: "Soil not set",
    soilSuffix: "soil",
    locationNotSet: "Location not set",
    getRecommendation: "Get Recommendation",
    analyzing: "Analyzing your farm data...",
    topCrops: "Top Crops for Your Farm",
    bestMatch: "BEST MATCH",
    basedOnData: "Based on your farm's soil & climate data",
    disclaimer:
      "These recommendations are based on your farm's soil nutrients (N, P, K), pH level, temperature, humidity, and rainfall. Keep your farm data updated for best results.",
    noCropsFound: "No suitable crops found for this farm profile.",
    failedRecommendation: "Failed to get recommendation",
    networkError: "Network error. Please try again.",
    suitability: {
      highly: "Highly Suitable",
      moderate: "Moderately Suitable",
      low: "Low Suitability",
      notRecommended: "Not Recommended",
    },
  },
  priceForecast: {
    title: "Price Forecast",
    subtitle: "Predict crop prices by region and month",
    selectCrop: "Crop",
    selectRegion: "Region",
    year: "Year",
    month: "Month",
    predict: "Get Forecast",
    predicting: "Forecasting...",
    predictedPrice: "Predicted price",
    confidenceRange: "Confidence range",
    selectCropRegion: "Select a crop and region to continue.",
    loadError: "Could not load forecast options.",
    trendIncreasing: "Increasing",
    trendDecreasing: "Decreasing",
    trendStable: "Stable",
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    loadingOptions: "Loading...",
    selectCropPlaceholder: "Select crop",
    selectRegionPlaceholder: "Select region",
    predictedPriceLabel: "Predicted Price (ETB/kg)",
    priceRange: "Price Range",
    expectedChange: "Expected Change",
    disclaimer:
      "The actual market price may vary based on weather, transport costs, and demand. Use this forecast as a planning reference.",
  },
  market: {
    title: "My Agricultural Products",
    subtitle: "View, create and manage your agricultural products",
    createNew: "Create New",
    tryAgain: "Try Again",
    available: "Available",
    soldOut: "Sold Out",
    deleteTitle: "Delete Product",
    deleteDescription:
      "Are you sure you want to delete this product? This action cannot be undone.",
    headers: {
      name: "Product Name",
      stock: "Stock",
      price: "Price",
      unit: "Unit",
      category: "Category",
      status: "Status",
      actions: "Actions",
    },
    loadingProducts: "Loading products...",
    noProducts: "No products found. Click Create New to add your first product.",
    edit: "Edit",
    delete: "Delete",
    productForm: {
      addTitle: "Add New Product",
      editTitle: "Edit Product",
      addSubtitle: "List your crop on the marketplace",
      editSubtitle: "Update your product information",
      cropType: "Crop / Product Name",
      selectCrop: "Select a crop",
      otherCrop: "Other (specify)",
      otherCropPlaceholder: "Enter crop name",
      description: "Description",
      descriptionPlaceholder:
        "Describe quality, freshness, organic status, and other details buyers should know...",
      price: "Price (ETB)",
      stock: "Stock quantity",
      harvestDate: "Harvest date",
      cancel: "Cancel",
      addCrop: "Add product",
      updateCrop: "Update product",
      submitting: "Submitting...",
      updating: "Updating...",
      loading: "Loading...",
      currency: "Br",
      crops: {
        Rice: "Rice",
        Wheat: "Wheat",
        Maize: "Maize",
        Barley: "Barley",
        Soybean: "Soybean",
        Potato: "Potato",
        Tomato: "Tomato",
        Coffee: "Coffee",
        Tea: "Tea",
        Sorghum: "Sorghum",
        Millet: "Millet",
        Chickpea: "Chickpea",
        Sunflower: "Sunflower",
        Sesame: "Sesame",
        Cotton: "Cotton",
        Sugarcane: "Sugarcane",
        Cabbage: "Cabbage",
        Carrot: "Carrot",
        Onion: "Onion",
        Garlic: "Garlic",
        Pepper: "Pepper",
        Strawberry: "Strawberry",
        Avocado: "Avocado",
        Mango: "Mango",
        Banana: "Banana",
        OTHER: "Other (specify)",
      },
      errors: {
        specifyCrop: "Please specify the crop name.",
        selectCrop: "Please select a crop.",
        description: "Please enter a description.",
        price: "Please enter a valid price.",
        stock: "Please enter a valid stock quantity.",
        harvestDate: "Please select a harvest date.",
      },
      toastAdded: "Product added successfully!",
      toastUpdated: "Product updated successfully!",
      toastNetworkError: "Network error. Please try again.",
      toastFailed: "Operation failed",
    },
  },
  farms: {
    title: "Manage Your Farms",
    addFarm: "Add Farm",
    empty: 'No farms yet. Click "Add Farm" to register your land.',
    locationNotSet: "Location not set",
    editFarm: "Edit Farm",
    addFarmDialog: "Add Farm",
    editDescription: "Update your farm details.",
    addDescription: "Tell us about your farm land.",
    farmName: "Farm Name *",
    farmNamePlaceholder: "e.g. North Field, Riverside Plot",
    soilType: "Soil Type",
    soilColor: "Soil Color",
    region: "Region",
    woreda: "Woreda",
    kebele: "Kebele (optional)",
    kebelePlaceholder: "e.g. Kebele 01",
    select: "Select",
    selectRegion: "Select region",
    selectWoreda: "Select woreda",
    selectRegionFirst: "Select region first",
    noWoredasForRegion: "No woredas available for this region.",
    update: "Update",
    saveFarm: "Save Farm",
    deleteTitle: "Delete Farm",
    deleteDescription:
      'Are you sure you want to delete "{name}"? This action cannot be undone.',
    delete: "Delete",
    soilTypes: {
      clay: "Clay",
      sandy: "Sandy",
      loam: "Loam",
      silt: "Silt",
      peaty: "Peaty",
      chalky: "Chalky",
      laterite: "Laterite",
    },
    soilColors: {
      black: "Black",
      red: "Red",
      brown: "Brown",
      gray: "Gray",
      yellowish: "Yellowish",
    },
    listRegistered: "Registered",
    listClimate: "Soil & climate",
    listNotSet: "Not set",
    listKebele: "Kebele",
    listSize: "Size",
    listPh: "pH",
    listTemp: "Temperature",
    listHumidity: "Humidity",
    listRainfall: "Rainfall",
  },
};

export const dashboardAm: DashboardTranslations = {
  layout: {
    footerTagline: "ብልህ እርሻ ለመስራት ዝግጁ ነዎት? ከአግሪማርኬት ጋር ይበለጽጉ።",
    copyright: "©2026 አግሪማርኬት",
  },
  language: {
    switchToAmharic: "ወደ አማርኛ ቀይር",
    switchToEnglish: "Switch to English",
    labelWhenEn: "አማርኛ",
    labelWhenAm: "English",
  },
  notifications: {
    title: "ማሳወቂያዎች",
    empty: "አዲስ ማሳወቂያ የለም — ሁሉ ተከታትሏል።",
    ariaLabel: "ማሳወቂያዎች",
    markAllRead: "ሁሉን አጥፋ",
    dismiss: "አጥፋ",
    viewAll: "ክፈት",
    loadError: "ማሳወቂያዎችን መጫን አልተሳካም።",
    items: {
      "farmer-no-farms": {
        title: "እርሻዎን ይመዝግቡ",
        message: "አግሪአይ ለመሬትዎ ተስማሚ ሰብሎችን እንዲመክር ቢያንስ አንድ እርሻ ይጨምሩ።",
      },
      "farmer-sold-out": {
        title: "ምርቶች ተሸጡ",
        message: "{{count}} ምርት(ዎች) ተሸጥተዋል ወይም ክምችት አልቋል። በገበያ ዝርዝሮችን ያዘምኑ።",
      },
      "farmer-low-stock": {
        title: "ዝቅተኛ ክምችት",
        message: "{{count}} ምርት(ዎች) 5 ወይም ከዚያ በታች ክምችት አላቸው። ሽያጭ ከመታገድ በፊት ያስተካክሉ።",
      },
      "farmer-crop-tip": {
        title: "አዲስ የሰብል ምክር",
        message: "እርሻዎች ዝግጁ ናቸው — ለዚህ ወቅት የአይአይ የሰብል ምክር ያሂዱ።",
      },
      "trader-pending": {
        title: "መለያ በመገምገም ላይ",
        message: "የነጋዴ ማመልከቻዎ በአስተዳዳሪ ፈቃድ በመጠባበቅ ላይ ነው።",
      },
      "trader-rejected": {
        title: "ማመልከቻ አልጸድቀም",
        message: "የነጋዴ መለያዎ አልጸድቀም። ዝርዝሮችን ይመልከቱ ወይም ድጋፍ ያግኙ።",
      },
      "trader-welcome": {
        title: "እንኳን ወደ አግሪማርኬት በደህና መጡ",
        message: "መለያዎ ጸድቋል። የገበሬ ዝርዝሮችን ይመልከቱ እና ግዢዎችን ያስተዳድሩ።",
      },
      "admin-pending-traders": {
        title: "ነጋዴዎች ፈቃድ ይጠብቃሉ",
        message: "{{count}} ነጋዴ(ዎች) በ«የነጋዴ ማረጋገጫ» ውስጥ ግምገማ ይፈልጋሉ።",
      },
    },
  },
  watchList: {
    title: "ከፍተኛ ትርፍ የሚያመጡ ሰብሎች",
    season: "የዚህ ወቅት",
    crop: "ሰብል",
    price: "ዋጋ (ብር)",
    demand: "ፍላጎት",
    yield: "ምርት/ሄክታር",
    scroll: "ሸብልል",
    demandHigh: "ከፍተኛ",
    demandMedium: "መካከለኛ",
    demandLow: "ዝቅተኛ",
  },
  weather: {
    location: "አዲስ አበባ፣ ኢትዮጵያ",
    tempHigh: "ከፍ",
    tempLow: "ዝቅ",
  },
  farmFacts: {
    badge: "እውቀ ነው?",
    facts: [
      "ኢትዮጵያ የቡና መገዛድ ሀገር ናት እና ተፍ ለእንጀራና ለሚሊዮኖች የቤት አገልግሎት ዋና ምንጭ ነው።",
      "ከ80% በላይ የኢትዮጵያ ሕዝብ በግብርና ይተዳደራል፤ ትናንሽ ገበሬዎች አብዛኛውን የሀገሪቱ ምግብ ያመራሉ።",
      "አግሪማርኬት የእርሻዎን አፈር እና የአየር ሁኔታ መረጃ በመጠቀም ለመሬትዎ የሚስማሙ ሰብሎችን ይመክራል።",
      "ዝናብና ቁመት በክልሎች ይለያያሉ፤ በትክክለኛው ጊዜ መዝራት ምርትን ከድርቅ ወይም ከብርድ ሊጠብቅ ይችላል።",
      "በአግሪማርኬት ምርት ይዘርዙ፣ የፍላጎት አዝማሚያ ይከታተሉ እና ከገበሬዎች በቀጥታ ከሚገዙ ነጋዴዎች ጋር ይገናኙ።",
      "የአይአይ የዋጋ ትንበያ በአግሪማርኬት መቼ ለመሸጥ እንዳለብዎ ይረዳዎታል — በዕጥበት ሳይሆን በመረጃ ይቅዱ።",
    ],
  },
  cropDetail: {
    title: "የሰብል ምክር",
    subtitle: "ለእርሻዎ በሰው ሰራሽ ብልህነት የተዘጋጁ ምክሮች",
    selectFarm: "እርሻዎን ይምረጡ",
    chooseFarmPlaceholder: "የተመዘገበ እርሻ ይምረጡ",
    loadingFarms: "እርሻዎች በመጫን ላይ...",
    noFarms: "ምንም እርሻ አልተመዘገበም። በመጀመሪያ ከ",
    myFarmsLink: "እርሻዎቼ",
    soilNotSet: "አፈር አልተመዘገበም",
    soilSuffix: "አፈር",
    locationNotSet: "ቦታ አልተመዘገበም",
    getRecommendation: "ምክር ያግኙ",
    analyzing: "የእርሻዎን መረጃ በመተንተን ላይ...",
    topCrops: "ለእርሻዎ የሚመረጡ ምርጥ ሰብሎች",
    bestMatch: "ምርጥ ምርጫ",
    basedOnData: "በእርሻዎ አፈር እና የአየር ሁኔታ መረጃ ላይ የተመሰረተ",
    disclaimer:
      "እነዚህ ምክሮች በእርሻዎ የአፈር ንጥረቶች (N, P, K)፣ pH፣ ሙቀት፣ እርጥበት እና ዝናብ ላይ የተመሰረቱ ናቸው። ለተሻለ ውጤት የእርሻ መረጃዎን ያዘምኑ።",
    noCropsFound: "ለዚህ የእርሻ መገለጫ ተስማሚ ሰብል አልተገኘም።",
    failedRecommendation: "ምክር ማግኘት አልተሳካም",
    networkError: "የአውታረ መረብ ስህተት። እባክዎ እንደገና ይሞክሩ።",
    suitability: {
      highly: "በጣም ተስማሚ",
      moderate: "መካከለኛ ተስማሚ",
      low: "ዝቅተኛ ተስማሚነት",
      notRecommended: "አይመከርም",
    },
  },
  priceForecast: {
    title: "የዋጋ ትንበያ",
    subtitle: "በክልል እና በወር የሰብል ዋጋ ይተንብዩ",
    selectCrop: "ሰብል",
    selectRegion: "ክልል",
    year: "ዓመት",
    month: "ወር",
    predict: "ትንበያ ያግኙ",
    predicting: "በመተንበይ ላይ...",
    predictedPrice: "የተገመተ ዋጋ",
    confidenceRange: "የማመን ክልል",
    selectCropRegion: "ለመቀጠል ሰብል እና ክልል ይምረጡ።",
    loadError: "የትንበያ አማራጮችን መጫን አልተሳካም።",
    trendIncreasing: "በመጨመር ላይ",
    trendDecreasing: "በመቀነስ ላይ",
    trendStable: "ቋሚ",
    months: [
      "ጃንዋሪ", "ፌብሩዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን",
      "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር",
    ],
    loadingOptions: "በመጫን ላይ...",
    selectCropPlaceholder: "ሰብል ይምረጡ",
    selectRegionPlaceholder: "ክልል ይምረጡ",
    predictedPriceLabel: "የተገመተ ዋጋ (ብር/ኪ.ግ)",
    priceRange: "የዋጋ ክልል",
    expectedChange: "የሚጠበቀ ለውጥ",
    disclaimer:
      "እውነተኛ የገበያ ዋጋ በአየር ሁኔታ፣ በመጓጓዣ ወጪ እና በፍላጎት ሊለዋወጥ ይችላል። ይህን ትንበያ እንደ የታቅደ ማጣቀሻ ይጠቀሙበት።",
  },
  market: {
    title: "የግብርና ምርቶቼ",
    subtitle: "የግብርና ምርቶችዎን ይመልከቱ፣ ይፍጠሩ እና ያስተዳድሩ",
    createNew: "አዲስ ፍጠር",
    tryAgain: "እንደገና ይሞክሩ",
    available: "ይገኛል",
    soldOut: "ተሽጧል",
    deleteTitle: "ምርት ሰርዝ",
    deleteDescription: "ይህን ምርት መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይህ ተግባር ሊቀለበስ አይችልም።",
    headers: {
      name: "የምርት ስም",
      stock: "ክምችት",
      price: "ዋጋ",
      unit: "መለኪያ",
      category: "ምድብ",
      status: "ሁኔታ",
      actions: "ተግባራት",
    },
    loadingProducts: "ምርቶች በመጫን ላይ...",
    noProducts: "ምንም ምርት አልተገኘም። የመጀመሪያ ምርትዎን ለመጨመር «አዲስ ፍጠር» ይጫኑ።",
    edit: "አርትዕ",
    delete: "ሰርዝ",
    productForm: {
      addTitle: "አዲስ ምርት ጨምር",
      editTitle: "ምርት አርትዕ",
      addSubtitle: "ምርትዎን በገበያ ዝርዝር ያስመዝግቡ",
      editSubtitle: "የምርት መረጃዎን ያዘምኑ",
      cropType: "ሰብል / የምርት ስም",
      selectCrop: "ሰብል ይምረጡ",
      otherCrop: "ሌላ (ያስገቡ)",
      otherCropPlaceholder: "የሰብል ስም ያስገቡ",
      description: "መግለጫ",
      descriptionPlaceholder:
        "ጥራት፣ ትኩስነት፣ ኦርጋኒክ ሁኔታ እና ለገዢዎች አስፈላጊ ዝርዝሮችን ይጥቀሱ...",
      price: "ዋጋ (ብር)",
      stock: "ክምችት",
      harvestDate: "የመከር ቀን",
      cancel: "ሰርዝ",
      addCrop: "ምርት ጨምር",
      updateCrop: "ምርት አዘምን",
      submitting: "በመላክ ላይ...",
      updating: "በመዘመን ላይ...",
      loading: "በመጫን ላይ...",
      currency: "ብር",
      crops: {
        Rice: "ሩዝ",
        Wheat: "ስንዴ",
        Maize: "በቆሎ",
        Barley: "ገብስ",
        Soybean: "ሶያ",
        Potato: "ድንች",
        Tomato: "ቲማቲም",
        Coffee: "ቡና",
        Tea: "ሻይ",
        Sorghum: "ማሽላ",
        Millet: "ዱሃ",
        Chickpea: "ሽምብራ",
        Sunflower: "ሱፍ",
        Sesame: "ሰሊጥ",
        Cotton: "ጥጥ",
        Sugarcane: "አኮሽ",
        Cabbage: "ጎመን",
        Carrot: "ካሮት",
        Onion: "ሽንኩርት",
        Garlic: "ነጭ ሽንኩርት",
        Pepper: "በርበሬ",
        Strawberry: "እርድ",
        Avocado: "አቮካዶ",
        Mango: "ማንጎ",
        Banana: "ሙዝ",
        OTHER: "ሌላ (ያስገቡ)",
      },
      errors: {
        specifyCrop: "እባክዎ የሰብል ስም ያስገቡ።",
        selectCrop: "እባክዎ ሰብል ይምረጡ።",
        description: "እባክዎ መግለጫ ያስገቡ።",
        price: "እባክዎ ትክክለኛ ዋጋ ያስገቡ።",
        stock: "እባክዎ ትክክለኛ ክምችት ያስገቡ።",
        harvestDate: "እባክዎ የመከር ቀን ይምረጡ።",
      },
      toastAdded: "ምርት በተሳካ ሁኔታ ታክሏል!",
      toastUpdated: "ምርት በተሳካ ሁኔታ ተዘምኗል!",
      toastNetworkError: "የአውታረ መረብ ስህተት። እንደገና ይሞክሩ።",
      toastFailed: "ክወናው አልተሳካም",
    },
  },
  farms: {
    title: "እርሻዎችዎን ያስተዳድሩ",
    addFarm: "እርሻ ጨምር",
    empty: 'እስካሁን እርሻ የለም። መሬትዎን ለመመዝገብ «እርሻ ጨምር» ይጫኑ።',
    locationNotSet: "ቦታ አልተመዘገበም",
    editFarm: "እርሻ አርትዕ",
    addFarmDialog: "እርሻ ጨምር",
    editDescription: "የእርሻ ዝርዝሮችን ያዘምኑ።",
    addDescription: "ስለ እርሻ መሬትዎ ይንገሩን።",
    farmName: "የእርሻ ስም *",
    farmNamePlaceholder: "ለምሳሌ፡ ሰሜን መሬት፣ ወንዝ ዳርቻ",
    soilType: "የአፈር አይነት",
    soilColor: "የአፈር ቀለም",
    region: "ክልል",
    woreda: "ወረዳ",
    kebele: "ቀበሌ (አማራጭ)",
    kebelePlaceholder: "ለምሳሌ፡ ቀበሌ 01",
    select: "ይምረጡ",
    selectRegion: "ክልል ይምረጡ",
    selectWoreda: "ወረዳ ይምረጡ",
    selectRegionFirst: "በመጀመሪያ ክልል ይምረጡ",
    noWoredasForRegion: "ለዚህ ክልል ወረዳ አልተመዘገበም።",
    update: "አዘምን",
    saveFarm: "እርሻ አስቀምጥ",
    deleteTitle: "እርሻ ሰርዝ",
    deleteDescription: '«{name}» መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይህ ተግባር ሊቀለበስ አይችልም።',
    delete: "ሰርዝ",
    soilTypes: {
      clay: "የጭቃ",
      sandy: "የአሸዋ",
      loam: "የሸክላ አፈር",
      silt: "የጭቃ አፈር",
      peaty: "የጭቃ ሸክላ",
      chalky: "የዱቄት አፈር",
      laterite: "ላተራይት",
    },
    soilColors: {
      black: "ጥቁር",
      red: "ቀይ",
      brown: "ቡናማ",
      gray: "ግራጫ",
      yellowish: "ቢጫማ",
    },
    listRegistered: "ተመዝግቧል",
    listClimate: "አፈር እና አየር",
    listNotSet: "አልተመዘገበም",
    listKebele: "ቀበሌ",
    listSize: "ስፋት",
    listPh: "pH",
    listTemp: "ሙቀት",
    listHumidity: "እርጥበት",
    listRainfall: "ዝናብ",
  },
};
