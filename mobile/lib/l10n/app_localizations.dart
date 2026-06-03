enum AppLanguage { en, am }

class AppLocalizations {
  final AppLanguage language;

  const AppLocalizations(this.language);

  bool get isAmharic => language == AppLanguage.am;

  String get languageLabel => isAmharic ? 'EN' : 'አማ';

  // Onboarding
  String get skip => isAmharic ? 'ዝለል' : 'Skip';
  String get getStarted => isAmharic ? 'ጀምር' : 'Get Started';
  String get createAccount => isAmharic ? 'መለያ ፍጠር' : 'Create Account';
  String get onboardingWelcomeTitle =>
      isAmharic ? 'ወደ አግሪማርኬት እንኳን በደህና መጡ' : 'Welcome to AgriMarket';
  String get onboardingWelcomeDescription => isAmharic
      ? 'ለተሻለ ምርት እና ትርፍ የእርሻ ረዳትዎ'
      : 'Your smart farming assistant for better yields and profits';
  String get onboardingAiTitle =>
      isAmharic ? 'በ AI የተመራ ግንዛቤ' : 'AI-Powered Insights';
  String get onboardingAiDescription => isAmharic
      ? 'የተለያየ የአትክልት ምክርና የገበያ ትንተና ያግኙ'
      : 'Get personalized crop recommendations and market forecasts';
  String get onboardingConnectTitle =>
      isAmharic ? 'ተገናኙ እና ይበልጡ' : 'Connect & Grow';
  String get onboardingConnectDescription => isAmharic
      ? 'ከተረጋገጡ ነጋዴዎች ጋር በቀጥታ ተገናኙ እና ትርፍዎን ይጨምሩ'
      : 'Directly connect with verified traders and maximize your profits';

  // Auth
  String get welcomeBack => isAmharic ? 'እንኳን ደህና መጡ' : 'Welcome Back';
  String get signInSubtitle => isAmharic
      ? 'ወደ AgriMarket መለያዎ ይግቡ'
      : 'Sign in to your AgriMarket account';
  String get email => isAmharic ? 'ኢሜይል' : 'Email';
  String get enterEmail => isAmharic ? 'ኢሜይልዎን ያስገቡ' : 'Enter your email';
  String get password => isAmharic ? 'የይለፍ ቃል' : 'Password';
  String get enterPassword =>
      isAmharic ? 'የይለፍ ቃልዎን ያስገቡ' : 'Enter your password';
  String get forgotPassword =>
      isAmharic ? 'የይለፍ ቃል ረሱ?' : 'Forgot Password?';
  String get login => isAmharic ? 'ግባ' : 'Login';
  String get noAccount =>
      isAmharic ? 'መለያ የለዎትም? ' : "Don't have an account? ";
  String get signUp => isAmharic ? 'ተመዝገብ' : 'Sign Up';
  String get joinAgriMarket =>
      isAmharic ? 'AgriMarket ይቀላቀሉ' : 'Join AgriMarket';
  String get chooseRoleSubtitle =>
      isAmharic ? 'ለመጀመር ሚናዎን ይምረጡ' : 'Choose your role to get started';
  String get howWillYouUse => isAmharic
      ? 'AgriMarketን እንዴት ይጠቀማሉ?'
      : 'How will you use AgriMarket?';
  String get selectAccountType => isAmharic
      ? 'ከሚገባዎት የመለያ አይነት ይምረጡ።'
      : 'Select the account type that fits you best.';
  String get continueBtn => isAmharic ? 'ቀጥል' : 'Continue';
  String get alreadyHaveAccount =>
      isAmharic ? 'መለያ አለዎት? ' : 'Already have an account? ';
  String get farmerRoleTitle => isAmharic ? 'ገበሬ' : 'Farmer';
  String get farmerRoleDesc => isAmharic
      ? 'ምርቶችዎን ይሸጡ እና AI ምክሮችን ያግኙ'
      : 'Sell crops, get AI recommendations';
  String get traderRoleTitle => isAmharic ? 'ነጋዴ' : 'Trader';
  String get traderRoleDesc => isAmharic
      ? 'ከገበሬዎች ይግዙ እና ትዕዛዞችን ያስተዳድሩ'
      : 'Buy from farmers, manage orders';

  // Registration
  String get farmerRegistration =>
      isAmharic ? 'የገበሬ ምዝገባ' : 'Farmer Registration';
  String get farmerRegistrationSubtitle => isAmharic
      ? 'ስለ እርስዎ እና ስለ እርሻዎ ይንገሩን'
      : 'Tell us about yourself and your farm';
  String get personalInformation =>
      isAmharic ? 'የግል መረጃ' : 'Personal Information';
  String get accountDetails =>
      isAmharic ? 'የመለያ ዝርዝሮች' : 'Your account details';
  String get fullName => isAmharic ? 'ሙሉ ስም' : 'Full Name';
  String get phoneNumber => isAmharic ? 'ስልክ ቁጥር' : 'Phone Number';
  String get confirmPassword =>
      isAmharic ? 'የይለፍ ቃል ያረጋግጡ' : 'Confirm Password';
  String get yourLocation => isAmharic ? 'አካባቢዎ' : 'Your Location';
  String get regionWoreda =>
      isAmharic ? 'ክልል እና ወረዳ' : 'Region and woreda';
  String get farmInformation =>
      isAmharic ? 'የእርሻ መረጃ' : 'Farm Information';
  String get registerAsFarmer =>
      isAmharic ? 'እንደ ገበሬ ይመዝገቡ' : 'Register as Farmer';
  String get traderRegistration =>
      isAmharic ? 'የነጋዴ ምዝገባ' : 'Trader Registration';
  String get traderRegistrationSubtitle => isAmharic
      ? 'በኢትዮጵያ ውስጥ ከገበሬዎች ጋር ተገናኙ'
      : 'Connect with farmers across Ethiopia';
  String get registerAsTrader =>
      isAmharic ? 'እንደ ነጋዴ ይመዝገቡ' : 'Register as Trader';
  String get enterFullName =>
      isAmharic ? 'ሙሉ ስምዎን ያስገቡ' : 'Enter your full name';
  String get emailAddress => isAmharic ? 'ኢሜይል አድራሻ' : 'Email Address';
  String get enterEmailAddress =>
      isAmharic ? 'ኢሜይልዎን ያስገቡ' : 'Enter your email';
  String get enterPhoneNumber =>
      isAmharic ? 'ስልክ ቁጥርዎን ያስገቡ' : 'Enter your phone number';
  String get createPassword =>
      isAmharic ? 'የይለፍ ቃል ፍጠር' : 'Create a password';
  String get confirmYourPassword =>
      isAmharic ? 'የይለፍ ቃልዎን ያረጋግጡ' : 'Confirm your password';
  String get selectRegion =>
      isAmharic ? 'ክልል ይምረጡ' : 'Select Region';
  String get selectWoreda =>
      isAmharic ? 'ወረዳ ይምረጡ' : 'Select Woreda';
  String get woreda => isAmharic ? 'ወረዳ' : 'Woreda';
  String get personalizeRecommendations => isAmharic
      ? 'ምክሮችን ለእርስዎ ለማዘጋጀት ይረዱን'
      : 'Help us personalize recommendations';
  String get farmLocation =>
      isAmharic ? 'የእርሻ አካባቢ' : 'Farm Location';
  String get farmLocationHint =>
      isAmharic ? 'የተወሰነ ቦታ ወይም መንደር' : 'Specific area or village';
  String get farmSizeHectares =>
      isAmharic ? 'የእርሻ መጠን (ሄክታር)' : 'Farm Size (hectares)';
  String get farmSizeHint => isAmharic ? 'ለምሳ. 5.5' : 'e.g. 5.5';
  String get cropsYouPlant =>
      isAmharic ? 'የሚተክሉ አትክልቶች' : 'Crops You Plant';
  String get cropsHint =>
      isAmharic ? 'ለምሳ. ጤፍ፣ ስንዴ፣ ገብስ' : 'e.g. Teff, Wheat, Maize';
  String get farmingExperience =>
      isAmharic ? 'የእርሻ ልምድ' : 'Farming Experience';
  String get selectExperienceLevel => isAmharic
      ? 'የልምድ ደረጃዎን ይምረጡ'
      : 'Select your experience level';
  String get passwordsDoNotMatch => isAmharic
      ? 'የይለፍ ቃሎች አይዛመዱም'
      : 'Passwords do not match';
  String get pleaseSelectRegion => isAmharic
      ? 'ክልልዎን ይምረጡ'
      : 'Please select your region';
  String get registrationSuccessful => isAmharic
      ? 'ምዝገባ ተሳክቷል!'
      : 'Registration successful!';
  String get registrationFailed =>
      isAmharic ? 'ምዝገባ አልተሳካም' : 'Registration failed';
  String get businessInformation =>
      isAmharic ? 'የንግድ መረጃ' : 'Business Information';
  String get businessInformationSubtitle => isAmharic
      ? 'የኩባንያዎ ወይም የንግድ ዝርዝሮች'
      : 'Your company or trading details';
  String get fullNameBusinessName => isAmharic
      ? 'ሙሉ ስም / የንግድ ስም'
      : 'Full Name / Business Name';
  String get enterBusinessName => isAmharic
      ? 'ስምዎን ወይም የንግድ ስምዎን ያስገቡ'
      : 'Enter your name or business name';
  String get tinNumber => isAmharic ? 'TIN ቁጥር' : 'TIN Number';
  String get tinNumberHint =>
      isAmharic ? 'የግብር መለያ ቁጥር' : 'Tax Identification Number';
  String get businessLocation =>
      isAmharic ? 'የንግድ አካባቢ' : 'Business Location';
  String get accountSecurity =>
      isAmharic ? 'የመለያ ጥበቃ' : 'Account Security';
  String get approvalRequired =>
      isAmharic ? 'ማፅደቅ ያስፈልጋል' : 'Approval Required';
  String get approvalRequiredDesc => isAmharic
      ? 'መለያዎ ከመግባትዎ በፊት በአስተዳዳሪ ይረጋገጣል።'
      : 'Your account will be verified by admin before you can log in.';
  String get traderRegistrationSubmitted => isAmharic
      ? 'ምዝገባ ቀርቧል! መለያዎ የአስተዳዳሪ ማፅደቅ በመጠበቅ ላይ ነው።'
      : 'Registration submitted! Your account is pending admin approval.';
  String get yes => isAmharic ? 'አዎ' : 'Yes';
  String get no => isAmharic ? 'አይ' : 'No';
  String get allowLocationAccess =>
      isAmharic ? 'አካባቢ መድረስ ይፈቀድ?' : 'Allow location access?';
  String get allowLocationAccessDesc => isAmharic
      ? 'AgriMarket በምዝገባ ጊዜ የአካባቢዎን መጋጠሚያ ለመመዝገብ ይፈልጋል።'
      : 'AgriMarket would like to use your location during registration to record your coordinates.';
  String get locationNotAllowed => isAmharic
      ? 'የአካባቢ መድረስ አልተፈቀደም።'
      : 'Location tracking was not allowed.';
  String get couldNotGetLocation => isAmharic
      ? 'አካባቢዎን ማግኘት አልተቻለም። ፈቃድ ይመልከቱ እና እንደገና ይሞክሩ።'
      : 'Could not get your location. Check permissions and try again.';
  String get failedToReadLocation => isAmharic
      ? 'አካባቢን ማንበብ አልተሳካም። እንደገና ይሞክሩ።'
      : 'Failed to read location. Please try again.';
  String get deviceLocation =>
      isAmharic ? 'የመሣሪያ አካባቢ' : 'Device Location';
  String get gettingLocation =>
      isAmharic ? 'አካባቢዎን በመጫን ላይ...' : 'Getting your location...';
  String get waitingLocationPermission => isAmharic
      ? 'የአካባቢ ፈቃድ በመጠበቅ ላይ...'
      : 'Waiting for location permission...';

  String experienceLabel(String value) {
    switch (value) {
      case 'Beginner (0-2 years)':
        return isAmharic ? 'ጀማሪ (0-2 ዓመት)' : value;
      case 'Intermediate (3-5 years)':
        return isAmharic ? 'መካከለኛ (3-5 ዓመት)' : value;
      case 'Advanced (6-10 years)':
        return isAmharic ? 'ላቀ (6-10 ዓመት)' : value;
      case 'Expert (10+ years)':
        return isAmharic ? 'ባለሙያ (10+ ዓመት)' : value;
      default:
        return value;
    }
  }

  List<String> get experienceValues => const [
        'Beginner (0-2 years)',
        'Intermediate (3-5 years)',
        'Advanced (6-10 years)',
        'Expert (10+ years)',
      ];

  String coordinatesText(double latitude, double longitude) => isAmharic
      ? 'latitude ${latitude.toStringAsFixed(6)} እና longitude ${longitude.toStringAsFixed(6)} ነው'
      : 'The latitude is ${latitude.toStringAsFixed(6)} and the longitude is ${longitude.toStringAsFixed(6)}';

  // Navigation
  String get navHome => isAmharic ? 'ቤት' : 'Home';
  String get navChat => isAmharic ? 'ውይይት' : 'Chat';
  String get navMarket => isAmharic ? 'ገበያ' : 'Market';
  String get navInsights => isAmharic ? 'ግንዛቤ' : 'Insights';
  String get navProfile => isAmharic ? 'መገለጫ' : 'Profile';
  String get navBrowse => isAmharic ? 'ፈልግ' : 'Browse';
  String get navOrders => isAmharic ? 'ትዕዛዞች' : 'Orders';

  // Dashboard
  String get agriMarketEthiopia =>
      isAmharic ? 'አግሪማርኬት ኢትዮጵያ' : 'AgriMarket Ethiopia';
  String get traderHub => isAmharic ? 'የነጋዴ ማዕከል' : 'Trader Hub';
  String get messages => isAmharic ? 'መልዕክቶች' : 'Messages';
  String get myFarms => isAmharic ? 'እርሻዎቼ' : 'My Farms';
  String get logout => isAmharic ? 'ውጣ' : 'Logout';
  String get accountVerificationStatus =>
      isAmharic ? 'የመለያ ማረጋገጫ' : 'Account Verification Status';
  String get verifiedAccount =>
      isAmharic ? 'ተረጋግጧል' : 'Verified';
  String get marketplaceAnalytics =>
      isAmharic ? 'የገበያ ትንተና' : 'Marketplace Analytics';
  String get myListings => isAmharic ? 'የእኔ ዝርዝሮች' : 'My listings';
  String get commodityTicker =>
      isAmharic ? 'የሸቀጥ ዋጋ' : 'Commodity Ticker';
  String get marketAvg => isAmharic ? '(አማካይ)' : '(market avg)';
  String get myActiveListings =>
      isAmharic ? 'ንቁ ዝርዝሮች' : 'My Active Listings';
  String get viewAll => isAmharic ? 'ሁሉንም' : 'View All';
  String get aiCropRecommendations =>
      isAmharic ? 'AI የአትክልት ምክር' : 'AI Crop Recommendations';
  String get topForRegion => isAmharic ? 'ለ' : 'Top for';
  String get featuredCrop => isAmharic ? 'ተመራጭ አትክልት፡ ' : 'Featured crop: ';
  String get profitabilityScore =>
      isAmharic ? 'የትርፍ ውጤት' : 'profitability score';
  String get totalProducts => isAmharic ? 'ጠቅላላ' : 'Total products';
  String get soldOut => isAmharic ? 'ተሸጡ' : 'Sold out';
  String get activeListings => isAmharic ? 'ንቁ' : 'Active listings';
  String get other => isAmharic ? 'ሌላ' : 'Other';
  String get noActiveListings => isAmharic
      ? 'ንቁ ዝርዝር የለም። በገበያ ውስጥ ይጨምሩ።'
      : 'No active listings. Add products in Market.';
  String get inStock => isAmharic ? 'በመጋዘን' : 'in stock';
  String get hello => isAmharic ? 'ሰላም' : 'Hello';
  String get noMessagesYet =>
      isAmharic ? 'መልዕክት የለም' : 'No messages yet';

  // Weather
  String get checkFieldConditions => isAmharic
      ? 'ለሳምንቱ የእርሻ ሁኔታ ይመልከቱ።'
      : 'Check field conditions for the week ahead.';
  String get heavyRainExpected => isAmharic
      ? 'ከባድ ዝናብ ይጠበቃል — የእርሻ ስራዎን ይቅዱ።'
      : 'Heavy rain expected — plan field work accordingly.';
  String get today => isAmharic ? 'ዛሬ' : 'Today';

  // Market insights
  String get marketInsights => isAmharic ? 'የገበያ ግንዛቤ' : 'Market Insights';
  String get crop => isAmharic ? 'አትክልት' : 'Crop';
  String get region => isAmharic ? 'ክልል' : 'Region';
  String get noPriceData => isAmharic
      ? 'የዋጋ መረጃ የለም። በሰርቨር ያድርጉ።'
      : 'No price data yet. Sync prices on the server.';
  String get priceHistory => isAmharic ? 'የዋጋ ታሪክ' : 'Price history';
  String get records => isAmharic ? 'መዝገቦች' : 'records';
  String get noTrendData => isAmharic
      ? 'ለዚህ አትክልት እና ክልል መረጃ የለም።'
      : 'No trend data for this crop and region.';
  String get bestTimeToSell =>
      isAmharic ? 'ለመሸጥ ተመራጭ ጊዜ' : 'Best time to sell';
  String get bestMonth => isAmharic ? 'ጥሩ ወር' : 'Best month';
  String get expectedGain => isAmharic ? 'የሚጠበቀ ጭማሪ' : 'Expected gain';
  String get latestPrice => isAmharic ? 'የቅርብ ዋጋ' : 'Latest price';
  String get farmProfitability =>
      isAmharic ? 'የእርሻ ትርፍ' : 'Farm profitability';
  String get farmsAnalyzed =>
      isAmharic ? 'እርሻዎች ተวิเคราะห์ ተደርገዋል' : 'Farms analyzed';
  String get cropsAnalyzed =>
      isAmharic ? 'አትክልቶች ተวิเคราะห์ ተደርገዋል' : 'Crops analyzed';
  String get topPick => isAmharic ? 'ጥሩ ምርጫ' : 'Top pick';
  String get score => isAmharic ? 'ውጤት' : 'score';

  // Marketplace
  String get myMarketplace => isAmharic ? 'የእኔ ገበያ' : 'My Marketplace';
  String get manageListings => isAmharic
      ? 'የምርት ዝርዝሮችዎን ያስተዳድሩ'
      : 'Manage your product listings';
  String get category => isAmharic ? 'ምድብ' : 'Category';
  String get allCategories => isAmharic ? 'ሁሉም' : 'All categories';
  String get available => isAmharic ? 'ይገኛል' : 'Available';
  String get loadingProducts =>
      isAmharic ? 'ምርቶች በመጫን ላይ...' : 'Loading your products...';
  String get couldNotLoadProducts =>
      isAmharic ? 'ምርቶችን መጫን አልተቻለም' : 'Could not load products';
  String get retry => isAmharic ? 'እንደገና' : 'Retry';
  String get noProductsYet =>
      isAmharic ? 'ምርት የለም' : 'No products yet';
  String get tapToAddFirst => isAmharic
      ? '+ ተጫነው የመጀመሪያ ምርትዎን ይጨምሩ'
      : 'Tap + to list your first product on the marketplace';
  String get addProduct => isAmharic ? 'ምርት ጨምር' : 'Add Product';
  String get editProduct => isAmharic ? 'ምርት አርትዕ' : 'Edit Product';
  String get deleteProduct => isAmharic ? 'ምርት ሰርዝ' : 'Delete Product';
  String get deleteProductConfirm => isAmharic
      ? 'ይህን ዝርዝር ለማስወገድ እርግጠኛ ነዎት?'
      : 'Are you sure you want to remove this listing?';
  String get cancel => isAmharic ? 'ይቅር' : 'Cancel';
  String get delete => isAmharic ? 'ሰርዝ' : 'Delete';
  String get productAdded =>
      isAmharic ? 'ምርት ተጨምሯል!' : 'Product added successfully';
  String get productUpdated =>
      isAmharic ? 'ምርት ተዘምኗል!' : 'Product updated successfully';
  String get productDeleted =>
      isAmharic ? 'ምርት ተሰርዟል' : 'Product deleted';
  String get noDescription =>
      isAmharic ? 'መግለጫ የለም' : 'No description';
  String get organic => isAmharic ? 'ኦርጋኒክ' : 'Organic';
  String get edit => isAmharic ? 'አርትዕ' : 'Edit';
  String categoryLabel(String category) {
    switch (category) {
      case 'VEGETABLES':
        return categoryVegetables;
      case 'FRUITS':
        return categoryFruits;
      case 'GRAINS':
        return categoryGrains;
      case 'DAIRY':
        return categoryDairy;
      case 'MEAT':
        return categoryMeat;
      default:
        return categoryOther;
    }
  }

  String get categoryVegetables =>
      isAmharic ? 'አትክልቶች' : 'Vegetables';
  String get categoryFruits => isAmharic ? 'ፍራፍሬዎች' : 'Fruits';
  String get categoryGrains => isAmharic ? 'እህሎች' : 'Grains';
  String get categoryDairy => isAmharic ? 'የወተት ምርቶች' : 'Dairy';
  String get categoryMeat => isAmharic ? 'ስጋ' : 'Meat';
  String get categoryOther => isAmharic ? 'ሌላ' : 'Other';

  // Add product dialog
  String get addNewProduct => isAmharic ? 'አዲስ ምርት' : 'Add New Product';
  String get productName => isAmharic ? 'የምርት ስም' : 'Product Name';
  String get description => isAmharic ? 'መግለጫ' : 'Description';
  String get price => isAmharic ? 'ዋጋ' : 'Price';
  String get unit => isAmharic ? 'መለኪያ' : 'Unit';
  String get stock => isAmharic ? 'መጋዘን' : 'Stock';
  String get location => isAmharic ? 'አካባቢ' : 'Location';
  String get harvestDate => isAmharic ? 'የማጨድ ቀን' : 'Harvest Date';
  String get expiryDateOptional =>
      isAmharic ? 'የማበቂያ ቀን (አማራጭ)' : 'Expiry Date (optional)';
  String get organicProduct =>
      isAmharic ? 'ኦርጋኒክ ምርት' : 'Organic product';
  String get fieldRequired => isAmharic ? 'ያስፈልጋል' : 'is required';
  String get priceRequired =>
      isAmharic ? 'ዋጋ ያስፈልጋል' : 'Price required';
  String get invalidPrice =>
      isAmharic ? 'ልክ ያልሆነ ዋጋ' : 'Invalid price';
  String get stockRequired =>
      isAmharic ? 'መጋዘን ያስፈልጋል' : 'Stock required';
  String get invalidStock =>
      isAmharic ? 'ልክ ያልሆነ መጋዘን' : 'Invalid stock';

  // Profile
  String get profile => isAmharic ? 'መገለጫ' : 'Profile';
  String get account => isAmharic ? 'መለያ' : 'Account';
  String get editDetails => isAmharic ? 'ዝርዝር አርትዕ' : 'Edit details';
  String get saveChanges => isAmharic ? 'ለውጦችን አስቀምጥ' : 'Save changes';
  String get updatePassword =>
      isAmharic ? 'የይለፍ ቃል ቀይር' : 'Update password';
  String get currentPassword =>
      isAmharic ? 'የአሁኑ የይለፍ ቃል' : 'Current password';
  String get newPassword => isAmharic ? 'አዲስ የይለፍ ቃል' : 'New password';
  String get confirmNewPassword =>
      isAmharic ? 'አዲሱን ያረጋግጡ' : 'Confirm new password';
  String get cropRecommendation =>
      isAmharic ? 'የአትክልት ምክር' : 'Crop recommendation';
  String get deleteAccount =>
      isAmharic ? 'መለያ ሰርዝ' : 'Delete account';
  String get tryAgain => isAmharic ? 'እንደገና' : 'Try Again';
  String get couldNotLoadProfile => isAmharic
      ? 'መገለጫ መጫን አልተቻለም'
      : 'Could not load your profile';
  String get updatePasswordHint => isAmharic
      ? 'መለያዎን ለመጠበቅ የይለፍ ቃልዎን ይቀይሩ።'
      : 'Update your password to keep your account secure.';

  // Chat
  String get agriAssistant =>
      isAmharic ? 'Agri AI ረዳት' : 'Agri AI Assistant';
  String get askAboutFarming => isAmharic
      ? 'ስለ እርሻ፣ አትክልት ወይም ገበያ ጠይቁ'
      : 'Ask about farming, crops, or market';
  String get newChat => isAmharic ? 'አዲስ ውይይት' : 'New chat';
  String get deleteChat => isAmharic ? 'ውይይት ሰርዝ?' : 'Delete chat?';
  String get deleteChatConfirm => isAmharic
      ? 'ይህ ውይይት ለዘላለም ይጠፋል።'
      : 'This conversation will be removed permanently.';
  String get typeMessage =>
      isAmharic ? 'መልዕክት ይፃፉ...' : 'Type a message...';
  String get noChatsYet =>
      isAmharic ? 'ውይይት የለም' : 'No chats yet';

  String fieldIsRequired(String field) =>
      isAmharic ? '$field ያስፈልጋል' : '$field is required';

  String priceHistoryCount(int count) => isAmharic
      ? 'የዋጋ ታሪክ ($count መዝገቦች)'
      : 'Price history ($count records)';

  String topFor(String regionName) =>
      isAmharic ? 'ለ $regionName' : 'Top for $regionName';

  String inStockCount(int count) =>
      isAmharic ? '$count በመጋዘን' : '$count in stock';
}
