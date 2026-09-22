import { SupportedLanguage } from '../types.js';

export const TRANSLATIONS = {
  en: {
    appTitle: 'KisanMandi Maharashtra AI',
    appSubtitle: 'Agro Channel Intelligence, APMC Mandi, Processors & Logistics Estimator',
    badge: 'Maharashtra Agro Edition',
    tabs: {
      channels: 'Mandi vs Processor vs Retailer',
      recommend: 'Mandi Net Realization',
      calculator: 'Fuel & Toll Estimator',
      forecast: '14-Day Price Trajectory (Past 7D + Next 7D)',
      map: 'Maharashtra Mandi Map',
      buyers: 'Verified Buyer Match',
      collector: 'AGMARKNET Pipeline',
      chatbot: 'Farmer AI Audio Voice Bot'
    },
    filterLabels: {
      location: 'Farmer Location (District/Taluka)',
      commodity: 'Produce / Crop',
      quantityKg: 'Quantity (in Kilograms)',
      grade: 'Quality Grade',
      searchPlaceholder: 'Search mandi, company, crop...'
    },
    channelHeaders: {
      title: '3-Way Sales Channel Comparison & Direct Net Payout',
      subtitle: 'Compare APMC Mandis, Food Processing Companies & Modern Retailers with actual transport, fuel, tolls, and rejection risks.',
      channelMandi: 'APMC Mandi (बाजार समिती)',
      channelProcessor: 'Food Processing Co. (प्रक्रिया उद्योग)',
      channelRetailer: 'Modern Retailer (किरकोळ साखळी / हब)',
      grossRevenue: 'Gross Value',
      logisticsDeductions: 'Fuel, Toll & Freight',
      rejectionLoss: 'Quality Rejection Risk',
      netRealization: 'Net In-Pocket Payout',
      netRatePerKg: 'Net Realized Rate',
      viewBreakdown: 'View Cost Breakdown',
      pros: 'Key Advantages (फायदे)',
      cons: 'Key Risks & Deductions (तोटे / कपात)',
      paymentTerms: 'Payment Terms & Turnaround',
      weighingType: 'Weighing System',
      audioAdvice: 'Listen to AI Voice Advice'
    },
    logisticsConfig: {
      title: 'Fuel, Toll, Road Quality & Unexpected Heads Calculator',
      fuelType: 'Fuel Type',
      diesel: 'Diesel (₹92.80/L)',
      petrol: 'Petrol (₹104.20/L)',
      mileage: 'Vehicle Mileage (km/L)',
      roadQuality: 'Road Quality & Terrain',
      expressway: 'Expressway / Samruddhi (Smooth, <1% spoilage)',
      stateHighway: 'State Highway (Moderate, 2.5% bruising)',
      ghatRough: 'Kasara Ghat / Rough Rural (+40% transit, 5.5% spoilage)',
      tollPreset: 'Highway Toll Charges (Fastag ₹)',
      hamali: 'Hamali / Unloading (₹/Quintal)',
      mandiCess: 'APMC Cess / Brokerage (%)',
      parkingFee: 'Market Entry & Weighbridge (₹)',
      roundTrip: 'Calculate 2-Way Round Trip Fuel'
    },
    chatbot: {
      title: 'KisanMandi Intelligent Voice & Audio Assistant',
      subtitle: 'Speak or type in Marathi (मराठी), Hindi (हिंदी), or English. AI analyzes live rates & deductions.',
      speakPrompt: 'Press mic to speak in Marathi, Hindi, or English...',
      listening: 'Listening to your voice...',
      speaking: 'AI Speaking out answer...',
      stopSpeaking: 'Stop Audio',
      send: 'Send',
      sampleQuestions: [
        'माझ्याकडे नाशिकमध्ये १००० किलो कांदा आहे, वाशीला पाठवू का लासलगावला?',
        'सह्याद्री फार्म्स आणि वाशी एपीएमसीमध्ये टोमॅटो विकल्यास कुठे जास्त नफा होईल?',
        'Kasara Ghat route diesel and toll cost for Tata Ace pickup to Vashi APMC?'
      ]
    }
  },
  mr: {
    appTitle: 'किसानमंडी महाराष्ट्र एआय',
    appSubtitle: 'कृषी बाजार समिती, प्रक्रिया उद्योग, किरकोळ साखळी व वाहतूक खर्च तुलना',
    badge: 'महाराष्ट्र कृषी विशेष आवृत्ती',
    tabs: {
      channels: 'मंडी vs प्रक्रिया कंपन्या vs रिटेलर्स',
      recommend: 'मंडी निव्वळ नफा',
      calculator: 'इंधन, टोल व रस्ता खर्च',
      forecast: '१४ दिवसांचा भाव आलेख (मागील व पुढील आठवडा)',
      map: 'महाराष्ट्र बाजार समिती नकाशा',
      buyers: 'थेट खरेदीदार जुळणी',
      collector: 'अ‍ॅगमार्कनेट डेटा पाईपलाईन',
      chatbot: 'शेतकरी व्हॉईस/ऑडिओ बॉट'
    },
    filterLabels: {
      location: 'शेतकऱ्याचे ठिकाण (जिल्हा/तालुका)',
      commodity: 'शेतमाल / पीक',
      quantityKg: 'शेतमालाचे वजन (किलोमध्ये)',
      grade: 'प्रतवारी / ग्रेड',
      searchPlaceholder: 'मंडी, कंपनी किंवा पीक शोधा...'
    },
    channelHeaders: {
      title: 'विक्री पर्याय तुलना व थेट हातात मिळणारा निव्वळ नफा',
      subtitle: 'बाजार समिती, प्रक्रिया कंपन्या (उदा. सह्याद्री, जैन) व रिटेलर्स (रिलायन्स, डीमार्ट) यांची डिझेल, टोल व रिजेक्शन खर्चासह तुलना.',
      channelMandi: 'कृषी उत्पन्न बाजार समिती (APMC)',
      channelProcessor: 'अन्न प्रक्रिया उद्योग / कंपन्या',
      channelRetailer: 'किरकोळ साखळी व थेट खरेदी केंद्र',
      grossRevenue: 'एकूण बाजार मूल्य',
      logisticsDeductions: 'इंधन, टोल व वाहतूक खर्च',
      rejectionLoss: 'गुणवत्ता रिजेक्शन धोका',
      netRealization: 'हातात मिळणारा निव्वळ नफा',
      netRatePerKg: 'प्रति किलो निव्वळ भाव',
      viewBreakdown: 'खर्चाचा तपशील पहा',
      pros: 'प्रमुख फायदे व वैशिष्ट्ये',
      cons: 'जोखीम, नियम व कपात',
      paymentTerms: 'पेमेंट कालावधी व पद्धत',
      weighingType: 'वजन काटा पद्धत',
      audioAdvice: 'मराठीत ऑडिओ सल्ला ऐका'
    },
    logisticsConfig: {
      title: 'इंधन, टोल, रस्ता प्रत व इतर अनपेक्षित खर्च कॅल्क्युलेटर',
      fuelType: 'इंधनाचा प्रकार',
      diesel: 'डिझेल (₹९२.८०/लिटर)',
      petrol: 'पेट्रोल (₹१०४.२०/लिटर)',
      mileage: 'गाडीचे मायलेज (किमी/लिटर)',
      roadQuality: 'रस्त्याची प्रत व घाट',
      expressway: 'समृद्धी / एक्सप्रेसवे (गुळगुळीत, <१% नुकसान)',
      stateHighway: 'राज्य महामार्ग (मध्यम, २.५% फळे दबणे)',
      ghatRough: 'कसारा घाट / ग्रामीण खराब रस्ता (+४०% वेळ, ५.५% फळे नुकसान)',
      tollPreset: 'महामार्ग टोल दर (फास्टॅग ₹)',
      hamali: 'हमाली व उतराई (₹/क्विंटल)',
      mandiCess: 'मंडी सेस व अडत (%)',
      parkingFee: 'बाजार प्रवेश व वजन पावती (₹)',
      roundTrip: 'येण्या-जाण्याचा दुहेरी इंधन खर्च जोडा'
    },
    chatbot: {
      title: 'किसानमंडी मराठी व्हॉईस व ऑडिओ सहाय्यक',
      subtitle: 'मराठी, हिंदी किंवा इंग्रजीत बोला किंवा टाईप करा. एआय थेट बाजारभाव व नफ्याची माहिती देईल.',
      speakPrompt: 'माईक दाबा आणि मराठीत बोला...',
      listening: 'तुमचा आवाज ऐकत आहे...',
      speaking: 'एआय ऑडिओ सल्ला वाचत आहे...',
      stopSpeaking: 'ऑडिओ थांबवा',
      send: 'पाठवा',
      sampleQuestions: [
        'माझ्याकडे नाशिकमध्ये १००० किलो कांदा आहे, वाशीला पाठवू का लासलगावला?',
        'सह्याद्री फार्म्स आणि वाशी एपीएमसीमध्ये टोमॅटो विकल्यास कुठे जास्त नफा होईल?',
        'कसारा घाटातून वाशी एपीएमसीला पिकअप नेल्यास डिझेल व टोल किती खर्च येईल?'
      ]
    }
  },
  hi: {
    appTitle: 'किसानमंडी महाराष्ट्र एआई',
    appSubtitle: 'कृषि मंडी, खाद्य प्रसंस्करण उद्योग, रिटेलर्स व परिवहन लागत विश्लेषक',
    badge: 'महाराष्ट्र एग्री स्पेशल एडिशन',
    tabs: {
      channels: 'मंडी vs प्रोसेसर vs रिटेलर तुलना',
      recommend: 'मंडी शुद्ध लाभ',
      calculator: 'ईंधन, टोल व सड़क लागत',
      forecast: '14-दिवसीय भाव प्रक्षेप (पिछला व अगला सप्ताह)',
      map: 'महाराष्ट्र मंडी मानचित्र',
      buyers: 'सत्यापित खरीदार मिलान',
      collector: 'एगमार्कनेट डेटा पाइपलाइन',
      chatbot: 'किसान वॉइस/ऑडियो बॉट'
    },
    filterLabels: {
      location: 'किसान का स्थान (जिला/तालुका)',
      commodity: 'उपज / फसल',
      quantityKg: 'मात्रा (किलोग्राम में)',
      grade: 'गुणवत्ता ग्रेड',
      searchPlaceholder: 'मंडी, कंपनी या फसल खोजें...'
    },
    channelHeaders: {
      title: '3-तरफा बिक्री चैनल तुलना और इन-पॉकेट शुद्ध लाभ',
      subtitle: 'एपीएमसी मंडी, खाद्य प्रसंस्करण कंपनियां (सह्याद्री, जैन) व आधुनिक रिटेलर्स (रिलायंस, डीमार्ट) की ईंधन, टोल व रिजेक्शन सहित तुलना।',
      channelMandi: 'कृषि उपज मंडी (APMC)',
      channelProcessor: 'खाद्य प्रसंस्करण उद्योग / कंपनी',
      channelRetailer: 'आधुनिक रिटेलर्स व प्रोक्योरमेंट हब',
      grossRevenue: 'कुल सकल मूल्य',
      logisticsDeductions: 'ईंधन, टोल व मालभाड़ा',
      rejectionLoss: 'गुणवत्ता रिजेक्शन जोखिम',
      netRealization: 'हाथ में मिलने वाली शुद्ध आय',
      netRatePerKg: 'प्रति किग्रा शुद्ध दर',
      viewBreakdown: 'लागत विवरण देखें',
      pros: 'प्रमुख फायदे',
      cons: 'जोखिम, नियम व कटौतियां',
      paymentTerms: 'भुगतान समयसीमा व माध्यम',
      weighingType: 'वजन कांटा प्रणाली',
      audioAdvice: 'हिंदी में ऑडियो सलाह सुनें'
    },
    logisticsConfig: {
      title: 'ईंधन, टोल, सड़क गुणवत्ता व अप्रत्याशित खर्च कैलकुलेटर',
      fuelType: 'ईंधन का प्रकार',
      diesel: 'डीजल (₹92.80/लीटर)',
      petrol: 'पेट्रोल (₹104.20/लीटर)',
      mileage: 'वाहन माइलेज (किमी/लीटर)',
      roadQuality: 'सड़क की स्थिति व घाट',
      expressway: 'समृद्धि / एक्सप्रेसवे (तेज, <1% नुकसान)',
      stateHighway: 'स्टेट हाईवे (मध्यम, 2.5% उपज नुकसान)',
      ghatRough: 'कसारा घाट / कच्ची सड़क (+40% समय, 5.5% फल दबने का जोखिम)',
      tollPreset: 'हाईवे टोल शुल्क (फास्टैग ₹)',
      hamali: 'हम्माली व उतराई (₹/क्विंटल)',
      mandiCess: 'मंडी सेस व आढ़त (%)',
      parkingFee: 'मार्केट प्रवेश व तौल शुल्क (₹)',
      roundTrip: 'आने-जाने का दोहरा ईंधन खर्च जोड़ें'
    },
    chatbot: {
      title: 'किसानमंडी हिंदी वॉइस व ऑडियो सहायक',
      subtitle: 'हिंदी, मराठी या अंग्रेजी में बोलें या लिखें। एआई लाइव मंडी दरों व शुद्ध लाभ की पूरी जानकारी देगा।',
      speakPrompt: 'माइक दबाकर हिंदी में बोलें...',
      listening: 'आपकी आवाज रिकॉर्ड की जा रही है...',
      speaking: 'एआई ऑडियो सलाह सुना रहा है...',
      stopSpeaking: 'ऑडियो रोकें',
      send: 'भेजें',
      sampleQuestions: [
        'नासिक में 1000 किलो प्याज है, वाशी मंडी भेजूं या लासलगांव?',
        'सह्याद्री फार्म्स और वाशी एपीएमसी में टमाटर बेचने पर कहां ज्यादा मुनाफा होगा?',
        'कसारा घाट होकर वाशी जाने में पिकअप गाड़ी का डीजल व टोल खर्च कितना आएगा?'
      ]
    }
  }
};
