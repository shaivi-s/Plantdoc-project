"""Adds all 9 diseases with medicines to the database, in English and Nepali."""
from app.database import SessionLocal
from app import models
from sqlalchemy import text

db = SessionLocal()

db.execute(text("DELETE FROM disease_medicine"))
db.query(models.Disease).delete()
db.query(models.Medicine).delete()
db.commit()

mancozeb = models.Medicine(
    name="Mancozeb 75% WP",
    dosage="2.5 grams per litre of water",
    application="Spray on both sides of leaves until wet",
    frequency="Every 7-10 days, up to 3 applications",
    precautions="Wear gloves and mask. Do not spray before rain. Keep away from children and livestock.",
    name_ne="म्यान्कोजेब ७५% डब्ल्यूपी",
    dosage_ne="प्रति लिटर पानीमा २.५ ग्राम",
    application_ne="पातको दुवैतिर भिज्ने गरी स्प्रे गर्नुहोस्",
    frequency_ne="हरेक ७-१० दिनमा, बढीमा ३ पटक",
    precautions_ne="पन्जा र मास्क लगाउनुहोस्। पानी पर्नुअघि स्प्रे नगर्नुहोस्। बच्चा र पशुहरूबाट टाढा राख्नुहोस्।",
)
propiconazole = models.Medicine(
    name="Propiconazole 25% EC",
    dosage="1 ml per litre of water",
    application="Foliar spray, covering the whole canopy",
    frequency="Every 14 days, maximum 2 sprays per season",
    precautions="Avoid inhaling. Wash hands and face after use. Do not graze livestock for 14 days.",
    name_ne="प्रोपिकोनाजोल २५% ईसी",
    dosage_ne="प्रति लिटर पानीमा १ मिलिलिटर",
    application_ne="पातमा स्प्रे गर्नुहोस्, सम्पूर्ण बिरुवा ढाक्ने गरी",
    frequency_ne="हरेक १४ दिनमा, सिजनमा बढीमा २ पटक",
    precautions_ne="श्वास नलिनुहोस्। प्रयोग पछि हात र अनुहार धुनुहोस्। १४ दिनसम्म पशु नचराउनुहोस्।",
)
azoxystrobin = models.Medicine(
    name="Azoxystrobin 23% SC",
    dosage="1 ml per litre of water",
    application="Spray at first sign of lesions",
    frequency="Every 14 days, maximum 2 applications",
    precautions="Do not mix with other fungicides. Store in a cool dry place.",
    name_ne="एजोक्सिस्ट्रोबिन २३% एससी",
    dosage_ne="प्रति लिटर पानीमा १ मिलिलिटर",
    application_ne="घाउ देखिनासाथ स्प्रे गर्नुहोस्",
    frequency_ne="हरेक १४ दिनमा, बढीमा २ पटक",
    precautions_ne="अन्य फंगिसाइडसँग नमिसाउनुहोस्। चिसो र सुख्खा ठाउँमा भण्डारण गर्नुहोस्।",
)
tebuconazole = models.Medicine(
    name="Tebuconazole 25% EC",
    dosage="1 ml per litre of water",
    application="Foliar spray during early infection",
    frequency="Every 12-15 days",
    precautions="Use protective clothing. Avoid spraying in strong wind.",
    name_ne="टेबुकोनाजोल २५% ईसी",
    dosage_ne="प्रति लिटर पानीमा १ मिलिलिटर",
    application_ne="सुरुको संक्रमणमा पातमा स्प्रे गर्नुहोस्",
    frequency_ne="हरेक १२-१५ दिनमा",
    precautions_ne="सुरक्षा पोशाक प्रयोग गर्नुहोस्। तेज हावामा स्प्रे नगर्नुहोस्।",
)
none_needed = models.Medicine(
    name="No treatment required",
    dosage="-",
    application="-",
    frequency="-",
    precautions="Continue regular monitoring and good field hygiene.",
    name_ne="उपचार आवश्यक छैन",
    dosage_ne="-",
    application_ne="-",
    frequency_ne="-",
    precautions_ne="नियमित निरीक्षण र राम्रो खेत सरसफाइ जारी राख्नुहोस्।",
)

db.add_all([mancozeb, propiconazole, azoxystrobin, tebuconazole, none_needed])
db.flush()

diseases = [
    models.Disease(
        name="Maize Blight",
        plant_type="Maize",
        description="Northern Corn Leaf Blight, a fungal disease caused by Exserohilum turcicum.",
        symptoms="Long, cigar-shaped grey-green or tan lesions on leaves, usually starting on lower leaves.",
        prevention="Use resistant hybrids, rotate crops, remove infected crop residue after harvest.",
        severity="high",
        name_ne="मकैको ब्लाइट",
        description_ne="नर्दन कर्न लिफ ब्लाइट, Exserohilum turcicum नामक फंगसले हुने रोग।",
        symptoms_ne="पातमा लामो, चुरोट आकारको खैरो-हरियो वा खैरो घाउहरू, सामान्यतया तल्लो पातबाट सुरु हुन्छ।",
        prevention_ne="प्रतिरोधी जातहरू प्रयोग गर्नुहोस्, बाली फेर्नुहोस्, बाली काटेपछि संक्रमित अवशेष हटाउनुहोस्।",
        medicines=[mancozeb, azoxystrobin],
    ),
    models.Disease(
        name="Maize Common Rust",
        plant_type="Maize",
        description="A fungal disease caused by Puccinia sorghi.",
        symptoms="Small reddish-brown powdery pustules scattered on both leaf surfaces.",
        prevention="Plant resistant varieties, ensure good spacing for airflow, avoid late planting.",
        severity="moderate",
        name_ne="मकैको सामान्य खैरो रोग",
        description_ne="Puccinia sorghi नामक फंगसले हुने रोग।",
        symptoms_ne="पातको दुवैतिर सानो रातो-खैरो धुलो जस्तो दानाहरू छरिएका हुन्छन्।",
        prevention_ne="प्रतिरोधी जातहरू रोप्नुहोस्, हावा चल्ने ठाउँ छाड्नुहोस्, ढिलो रोप्न नहुने।",
        medicines=[mancozeb, propiconazole],
    ),
    models.Disease(
        name="Maize Gray Leaf Spot",
        plant_type="Maize",
        description="A fungal disease caused by Cercospora zeae-maydis.",
        symptoms="Rectangular grey to tan lesions running parallel to leaf veins.",
        prevention="Rotate with non-host crops, till residue under, plant resistant hybrids.",
        severity="high",
        name_ne="मकैको ग्रे लिफ स्पट",
        description_ne="Cercospora zeae-maydis नामक फंगसले हुने रोग।",
        symptoms_ne="पातको नसाहरूसँग समानान्तर आयताकार खैरो-खैरो घाउहरू।",
        prevention_ne="अन्य बाली फेर्नुहोस्, अवशेष माटोमा गाड्नुहोस्, प्रतिरोधी जात रोप्नुहोस्।",
        medicines=[azoxystrobin, propiconazole],
    ),
    models.Disease(
        name="Maize Healthy",
        plant_type="Maize",
        description="No disease detected. The leaf appears healthy.",
        symptoms="Uniform green colour, no lesions, spots or discolouration.",
        prevention="Maintain balanced fertilisation, adequate irrigation and regular field inspection.",
        severity="none",
        name_ne="स्वस्थ मकै",
        description_ne="कुनै रोग फेला परेन। पात स्वस्थ देखिन्छ।",
        symptoms_ne="एकसमान हरियो रङ, कुनै घाउ, दाग वा रङ परिवर्तन छैन।",
        prevention_ne="सन्तुलित मल प्रयोग गर्नुहोस्, पर्याप्त सिँचाइ र नियमित खेत निरीक्षण गर्नुहोस्।",
        medicines=[none_needed],
    ),
    models.Disease(
        name="Wheat Brown Rust",
        plant_type="Wheat",
        description="Leaf rust of wheat, caused by Puccinia triticina.",
        symptoms="Small round orange-brown pustules scattered mainly on the upper leaf surface.",
        prevention="Grow resistant cultivars, sow early, remove volunteer wheat plants.",
        severity="high",
        name_ne="गहुँको खैरो खैरो रोग",
        description_ne="Puccinia triticina नामक फंगसले हुने गहुँको पात रोग।",
        symptoms_ne="पातको माथिल्लो सतहमा प्रायः सुन्तला-खैरो गोलाकार दानाहरू छरिएका।",
        prevention_ne="प्रतिरोधी जात लगाउनुहोस्, चाँडो रोप्नुहोस्, बाँकी रहेका गहुँका बिरुवा हटाउनुहोस्।",
        medicines=[propiconazole, tebuconazole],
    ),
    models.Disease(
        name="Wheat Yellow Rust",
        plant_type="Wheat",
        description="Stripe rust, caused by Puccinia striiformis. Spreads fast in cool humid weather.",
        symptoms="Yellow-orange pustules arranged in narrow stripes along the leaf veins.",
        prevention="Use resistant varieties, monitor fields from tillering stage, avoid excess nitrogen.",
        severity="high",
        name_ne="गहुँको पहेंलो खैरो रोग",
        description_ne="स्ट्राइप रस्ट, Puccinia striiformis ले हुने रोग। चिसो र आर्द्र मौसममा छिटो फैलिन्छ।",
        symptoms_ne="पातको नसाहरूसँगै साँघुरो धर्कामा पहेंलो-सुन्तला दानाहरू।",
        prevention_ne="प्रतिरोधी जात प्रयोग गर्नुहोस्, टिलरिङ चरणदेखि खेत निरीक्षण गर्नुहोस्, बढी नाइट्रोजन नदिनुहोस्।",
        medicines=[tebuconazole, propiconazole],
    ),
    models.Disease(
        name="Wheat Healthy",
        plant_type="Wheat",
        description="No disease detected. The leaf appears healthy.",
        symptoms="Even green colour, no pustules, stripes or yellowing.",
        prevention="Maintain proper spacing, balanced nutrients and routine scouting.",
        severity="none",
        name_ne="स्वस्थ गहुँ",
        description_ne="कुनै रोग फेला परेन। पात स्वस्थ देखिन्छ।",
        symptoms_ne="एकसमान हरियो रङ, कुनै दाना, धर्का वा पहेंलोपन छैन।",
        prevention_ne="उचित दूरी, सन्तुलित पोषक तत्व र नियमित निरीक्षण कायम राख्नुहोस्।",
        medicines=[none_needed],
    ),
    models.Disease(
        name="Not Maize Or Wheat",
        plant_type="Other",
        description="The image does not appear to be a maize or wheat leaf.",
        symptoms="-",
        prevention="-",
        severity="none",
        name_ne="मकै वा गहुँ होइन",
        description_ne="यो तस्बिर मकै वा गहुँको पात जस्तो देखिँदैन।",
        symptoms_ne="-",
        prevention_ne="-",
        medicines=[],
    ),
    models.Disease(
        name="Background",
        plant_type="Other",
        description="No leaf was detected in the image.",
        symptoms="-",
        prevention="-",
        severity="none",
        name_ne="पृष्ठभूमि",
        description_ne="तस्बिरमा कुनै पात फेला परेन।",
        symptoms_ne="-",
        prevention_ne="-",
        medicines=[],
    ),
]

db.add_all(diseases)
db.commit()
print(f"Added {len(diseases)} diseases and 5 medicines, with Nepali translations.")
db.close()