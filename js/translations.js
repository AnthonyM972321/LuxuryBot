// Translations for all supported languages
const translations = {
    fr: {
        welcome: "Bienvenue",
        welcomeGuide: "Guide d'accueil",
        access: "Accès au logement",
        equipment: "Équipements",
        neighborhood: "Le quartier",
        checkout: "Instructions de départ",
        emergency: "Numéros utiles",
        map: "Carte",
        emergencyNumbers: `Propriétaire: +33 6 XX XX XX XX
Urgences: 112
Police: 17
Pompiers: 18
SAMU: 15`,
        defaultWelcome: "Nous sommes ravis de vous accueillir dans notre {property_name} ! Nous avons préparé ce guide pour rendre votre séjour aussi agréable que possible.",
        defaultCheckout: `☐ Fermer toutes les fenêtres
☐ Éteindre tous les appareils électriques
☐ Vider les poubelles
☐ Laisser les clés dans la boîte
☐ Vérifier de ne rien oublier`
    },
    en: {
        welcome: "Welcome",
        welcomeGuide: "Welcome Guide",
        access: "Property Access",
        equipment: "Equipment",
        neighborhood: "The Neighborhood",
        checkout: "Check-out Instructions",
        emergency: "Emergency Contacts",
        map: "Map",
        emergencyNumbers: `Owner: +33 6 XX XX XX XX
Emergency: 112
Police: 17
Fire Department: 18
Medical Emergency: 15`,
        defaultWelcome: "We are delighted to welcome you to our {property_name}! We have prepared this guide to make your stay as pleasant as possible.",
        defaultCheckout: `☐ Close all windows
☐ Turn off all electrical appliances
☐ Empty the trash
☐ Leave keys in the box
☐ Check you haven't forgotten anything`
    },
    es: {
        welcome: "Bienvenido",
        welcomeGuide: "Guía de Bienvenida",
        access: "Acceso a la propiedad",
        equipment: "Equipamiento",
        neighborhood: "El barrio",
        checkout: "Instrucciones de salida",
        emergency: "Contactos de emergencia",
        map: "Mapa",
        emergencyNumbers: `Propietario: +33 6 XX XX XX XX
Emergencias: 112
Policía: 17
Bomberos: 18
Emergencia médica: 15`,
        defaultWelcome: "¡Estamos encantados de darle la bienvenida a nuestro {property_name}! Hemos preparado esta guía para que su estancia sea lo más agradable posible.",
        defaultCheckout: `☐ Cerrar todas las ventanas
☐ Apagar todos los aparatos eléctricos
☐ Vaciar la basura
☐ Dejar las llaves en la caja
☐ Verificar que no olvide nada`
    },
    de: {
        welcome: "Willkommen",
        welcomeGuide: "Willkommensführer",
        access: "Zugang zur Unterkunft",
        equipment: "Ausstattung",
        neighborhood: "Die Nachbarschaft",
        checkout: "Check-out Anweisungen",
        emergency: "Notfallkontakte",
        map: "Karte",
        emergencyNumbers: `Eigentümer: +33 6 XX XX XX XX
Notruf: 112
Polizei: 17
Feuerwehr: 18
Rettungsdienst: 15`,
        defaultWelcome: "Wir freuen uns, Sie in unserem {property_name} willkommen zu heißen! Wir haben diesen Leitfaden vorbereitet, um Ihren Aufenthalt so angenehm wie möglich zu gestalten.",
        defaultCheckout: `☐ Alle Fenster schließen
☐ Alle elektrischen Geräte ausschalten
☐ Müll leeren
☐ Schlüssel in der Box lassen
☐ Überprüfen, dass nichts vergessen wurde`
    },
    it: {
        welcome: "Benvenuto",
        welcomeGuide: "Guida di Benvenuto",
        access: "Accesso alla proprietà",
        equipment: "Attrezzature",
        neighborhood: "Il quartiere",
        checkout: "Istruzioni per il check-out",
        emergency: "Contatti di emergenza",
        map: "Mappa",
        emergencyNumbers: `Proprietario: +33 6 XX XX XX XX
Emergenze: 112
Polizia: 17
Vigili del fuoco: 18
Emergenza medica: 15`,
        defaultWelcome: "Siamo lieti di darvi il benvenuto nel nostro {property_name}! Abbiamo preparato questa guida per rendere il vostro soggiorno il più piacevole possibile.",
        defaultCheckout: `☐ Chiudere tutte le finestre
☐ Spegnere tutti gli apparecchi elettrici
☐ Svuotare la spazzatura
☐ Lasciare le chiavi nella scatola
☐ Verificare di non aver dimenticato nulla`
    },
    pt: {
        welcome: "Bem-vindo",
        welcomeGuide: "Guia de Boas-vindas",
        access: "Acesso à propriedade",
        equipment: "Equipamentos",
        neighborhood: "O bairro",
        checkout: "Instruções de check-out",
        emergency: "Contatos de emergência",
        map: "Mapa",
        emergencyNumbers: `Proprietário: +33 6 XX XX XX XX
Emergências: 112
Polícia: 17
Bombeiros: 18
Emergência médica: 15`,
        defaultWelcome: "Estamos encantados em recebê-lo em nosso {property_name}! Preparamos este guia para tornar sua estadia o mais agradável possível.",
        defaultCheckout: `☐ Fechar todas as janelas
☐ Desligar todos os aparelhos elétricos
☐ Esvaziar o lixo
☐ Deixar as chaves na caixa
☐ Verificar se não esqueceu nada`
    },
    nl: {
        welcome: "Welkom",
        welcomeGuide: "Welkomstgids",
        access: "Toegang tot de woning",
        equipment: "Apparatuur",
        neighborhood: "De buurt",
        checkout: "Uitcheck instructies",
        emergency: "Noodcontacten",
        map: "Kaart",
        emergencyNumbers: `Eigenaar: +33 6 XX XX XX XX
Noodgevallen: 112
Politie: 17
Brandweer: 18
Medische noodhulp: 15`,
        defaultWelcome: "We zijn verheugd u te verwelkomen in onze {property_name}! We hebben deze gids voorbereid om uw verblijf zo aangenaam mogelijk te maken.",
        defaultCheckout: `☐ Sluit alle ramen
☐ Schakel alle elektrische apparaten uit
☐ Leeg de prullenbak
☐ Laat de sleutels in de doos
☐ Controleer of u niets bent vergeten`
    },
    ru: {
        welcome: "Добро пожаловать",
        welcomeGuide: "Путеводитель",
        access: "Доступ к жилью",
        equipment: "Оборудование",
        neighborhood: "Район",
        checkout: "Инструкции по выезду",
        emergency: "Экстренные контакты",
        map: "Карта",
        emergencyNumbers: `Владелец: +33 6 XX XX XX XX
Экстренная помощь: 112
Полиция: 17
Пожарная служба: 18
Скорая помощь: 15`,
        defaultWelcome: "Мы рады приветствовать вас в нашем {property_name}! Мы подготовили это руководство, чтобы сделать ваше пребывание максимально приятным.",
        defaultCheckout: `☐ Закрыть все окна
☐ Выключить все электроприборы
☐ Вынести мусор
☐ Оставить ключи в коробке
☐ Проверить, что ничего не забыто`
    },
    zh: {
        welcome: "欢迎",
        welcomeGuide: "欢迎指南",
        access: "房产入住",
        equipment: "设备",
        neighborhood: "周边环境",
        checkout: "退房须知",
        emergency: "紧急联系",
        map: "地图",
        emergencyNumbers: `房东: +33 6 XX XX XX XX
紧急电话: 112
警察: 17
消防: 18
医疗急救: 15`,
        defaultWelcome: "欢迎入住我们的{property_name}！我们准备了这份指南，让您的住宿尽可能愉快。",
        defaultCheckout: `☐ 关闭所有窗户
☐ 关闭所有电器
☐ 清空垃圾
☐ 将钥匙留在盒子里
☐ 检查是否有遗漏物品`
    },
    ja: {
        welcome: "ようこそ",
        welcomeGuide: "ウェルカムガイド",
        access: "物件へのアクセス",
        equipment: "設備",
        neighborhood: "周辺地域",
        checkout: "チェックアウトの手順",
        emergency: "緊急連絡先",
        map: "地図",
        emergencyNumbers: `オーナー: +33 6 XX XX XX XX
緊急: 112
警察: 17
消防: 18
救急: 15`,
        defaultWelcome: "私たちの{property_name}へようこそ！快適にお過ごしいただけるよう、このガイドを準備しました。",
        defaultCheckout: `☐ すべての窓を閉める
☐ すべての電気機器を切る
☐ ゴミを捨てる
☐ 鍵をボックスに入れる
☐ 忘れ物がないか確認する`
    },
    ar: {
        welcome: "مرحباً",
        welcomeGuide: "دليل الترحيب",
        access: "الوصول إلى العقار",
        equipment: "المعدات",
        neighborhood: "الحي",
        checkout: "تعليمات المغادرة",
        emergency: "أرقام الطوارئ",
        map: "خريطة",
        emergencyNumbers: `المالك: +33 6 XX XX XX XX
الطوارئ: 112
الشرطة: 17
الإطفاء: 18
الإسعاف: 15`,
        defaultWelcome: "نرحب بكم في {property_name}! لقد أعددنا هذا الدليل لجعل إقامتكم ممتعة قدر الإمكان.",
        defaultCheckout: `☐ إغلاق جميع النوافذ
☐ إطفاء جميع الأجهزة الكهربائية
☐ إفراغ سلة المهملات
☐ ترك المفاتيح في الصندوق
☐ التحقق من عدم نسيان أي شيء`
    },
    pl: {
        welcome: "Witamy",
        welcomeGuide: "Przewodnik powitalny",
        access: "Dostęp do nieruchomości",
        equipment: "Wyposażenie",
        neighborhood: "Okolica",
        checkout: "Instrukcje wymeldowania",
        emergency: "Kontakty alarmowe",
        map: "Mapa",
        emergencyNumbers: `Właściciel: +33 6 XX XX XX XX
Pogotowie: 112
Policja: 17
Straż pożarna: 18
Pogotowie medyczne: 15`,
        defaultWelcome: "Cieszymy się, że możemy powitać Państwa w naszym {property_name}! Przygotowaliśmy ten przewodnik, aby uczynić Państwa pobyt jak najprzyjemniejszym.",
        defaultCheckout: `☐ Zamknąć wszystkie okna
☐ Wyłączyć wszystkie urządzenia elektryczne
☐ Opróżnić kosze na śmieci
☐ Zostawić klucze w skrzynce
☐ Sprawdzić, czy niczego nie zapomniano`
    }
};
