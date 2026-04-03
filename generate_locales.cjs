const fs = require('fs');
const path = require('path');

const locales = {
  en: {
    sidebar: { dashboard: "Dashboard", transactions: "Transactions", analytics: "Analytics", insights: "Insights", settings: "Settings" },
    dashboard: { 
      systemDynamics: "System Dynamics", coreMetrics: "High Performance Finance Core v4.0",
      reports: "Reports", image: "Image", pdf: "PDF",
      capitalReservoir: "Capital Reservoir", inflowVelocity: "Inflow Velocity",
      burnCoefficient: "Burn Coefficient", retentionYield: "Retention Yield",
      activeLiquidity: "Active Liquidity", realtimeBalance: "Real-time Balance Flow",
      flow: "FLOW", burn: "BURN", capitalMap: "Capital Map", portfolio: "Portfolio",
      realtimeFeed: "Real-time Feed", viewAll: "View All"
    },
    categories: { food: "Food", Rent: "Rent", travel: "Travel", subscriptions: "Subscriptions", others: "Others", income: "Income" },
    topbar: { search: "Search...", admin: "Admin", viewer: "Viewer" }
  },
  hi: {
    sidebar: { dashboard: "डैशबोर्ड", transactions: "लेन-देन", analytics: "विश्लेषण", insights: "अंतर्दृष्टि", settings: "सेटिंग्स" },
    dashboard: { 
      systemDynamics: "सिस्टम डायनेमिक्स", coreMetrics: "उच्च प्रदर्शन वित्त कोर v4.0",
      reports: "रिपोर्ट", image: "छवि", pdf: "पीडीएफ",
      capitalReservoir: "पूंजी भंडार", inflowVelocity: "आय वेग",
      burnCoefficient: "खर्च गुणांक", retentionYield: "प्रतिधारण उपज",
      activeLiquidity: "सक्रिय तरलता", realtimeBalance: "रीयल-टाइम बैलेंस प्रवाह",
      flow: "प्रवाह", burn: "खर्च", capitalMap: "पूंजी मानचित्र", portfolio: "पोर्टफोलियो",
      realtimeFeed: "रीयल-टाइम फ़ीड", viewAll: "सभी देखें"
    },
    categories: { food: "भोजन", Rent: "किराया", travel: "यात्रा", subscriptions: "सदस्यता", others: "अन्य", income: "आय" },
    topbar: { search: "खोजें...", admin: "प्रशासक", viewer: "दर्शक" }
  },
  de: {
    sidebar: { dashboard: "Dashboard", transactions: "Transaktionen", analytics: "Analysen", insights: "Einblicke", settings: "Einstellungen" },
    dashboard: { 
      systemDynamics: "Systemdynamik", coreMetrics: "Hochleistungs-Finanzkern v4.0",
      reports: "Berichte", image: "Bild", pdf: "PDF",
      capitalReservoir: "Kapitalreserve", inflowVelocity: "Zuflussgeschwindigkeit",
      burnCoefficient: "Verbrennungskoeffizient", retentionYield: "Rendite",
      activeLiquidity: "Aktive Liquidität", realtimeBalance: "Echtzeit-Saldo-Fluss",
      flow: "FLUSS", burn: "VERBRENNEN", capitalMap: "Kapitalkarte", portfolio: "Portfolio",
      realtimeFeed: "Echtzeit-Feed", viewAll: "Alle ansehen"
    },
    categories: { food: "Essen", Rent: "Miete", travel: "Reisen", subscriptions: "Abonnements", others: "Andere", income: "Einkommen" },
    topbar: { search: "Suchen...", admin: "Admin", viewer: "Zuschauer" }
  },
  fr: {
    sidebar: { dashboard: "Tableau de bord", transactions: "Transactions", analytics: "Analytique", insights: "Aperçus", settings: "Paramètres" },
    dashboard: { 
      systemDynamics: "Dynamique du système", coreMetrics: "Noyau financier haute performance v4.0",
      reports: "Rapports", image: "Image", pdf: "PDF",
      capitalReservoir: "Réserve de capital", inflowVelocity: "Vitesse d'entrée",
      burnCoefficient: "Coefficient de combustion", retentionYield: "Rendement de rétention",
      activeLiquidity: "Liquidité active", realtimeBalance: "Flux de solde en temps réel",
      flow: "FLUX", burn: "COMBUSTION", capitalMap: "Carte des capitaux", portfolio: "Portefeuille",
      realtimeFeed: "Flux en temps réel", viewAll: "Voir tout"
    },
    categories: { food: "Nourriture", Rent: "Loyer", travel: "Voyage", subscriptions: "Abonnements", others: "Autres", income: "Revenu" },
    topbar: { search: "Rechercher...", admin: "Admin", viewer: "Spectateur" }
  },
  es: {
    sidebar: { dashboard: "Panel", transactions: "Transacciones", analytics: "Analítica", insights: "Perspectivas", settings: "Configuración" },
    dashboard: { 
      systemDynamics: "Dinámica del sistema", coreMetrics: "Núcleo financiero de alto rendimiento v4.0",
      reports: "Informes", image: "Imagen", pdf: "PDF",
      capitalReservoir: "Reserva de capital", inflowVelocity: "Velocidad de entrada",
      burnCoefficient: "Coeficiente de quema", retentionYield: "Rendimiento de retención",
      activeLiquidity: "Liquidez activa", realtimeBalance: "Flujo de saldo en tiempo real",
      flow: "FLUJO", burn: "QUEMA", capitalMap: "Mapa de capital", portfolio: "Portafolio",
      realtimeFeed: "Feed en tiempo real", viewAll: "Ver todo"
    },
    categories: { food: "Comida", Rent: "Alquiler", travel: "Viaje", subscriptions: "Suscripciones", others: "Otros", income: "Ingresos" },
    topbar: { search: "Buscar...", admin: "Administrador", viewer: "Espectador" }
  },
  zh: {
    sidebar: { dashboard: "仪表板", transactions: "交易", analytics: "分析", insights: "洞察", settings: "设置" },
    dashboard: { 
      systemDynamics: "系统动态", coreMetrics: "高性能财务核心 v4.0",
      reports: "报告", image: "图片", pdf: "PDF",
      capitalReservoir: "资本储备", inflowVelocity: "流入速度",
      burnCoefficient: "燃烧系数", retentionYield: "留存收益",
      activeLiquidity: "活跃流动性", realtimeBalance: "实时余额流量",
      flow: "流动", burn: "消耗", capitalMap: "资本图", portfolio: "投资组合",
      realtimeFeed: "实时动态", viewAll: "查看全部"
    },
    categories: { food: "餐饮", Rent: "租金", travel: "旅行", subscriptions: "订阅", others: "其他", income: "收入" },
    topbar: { search: "搜索...", admin: "管理员", viewer: "访客" }
  },
  ja: {
    sidebar: { dashboard: "ダッシュボード", transactions: "取引", analytics: "分析", insights: "洞察", settings: "設定" },
    dashboard: { 
      systemDynamics: "システム動態", coreMetrics: "高性能ファイナンスコア v4.0",
      reports: "レポート", image: "画像", pdf: "PDF",
      capitalReservoir: "資本準備金", inflowVelocity: "流入速度",
      burnCoefficient: "バーン係数", retentionYield: "保持利回り",
      activeLiquidity: "アクティブ流動性", realtimeBalance: "リアルタイム残高フロー",
      flow: "フロー", burn: "バーン", capitalMap: "資本マップ", portfolio: "ポートフォリオ",
      realtimeFeed: "リアルタイムフィード", viewAll: "すべて見る"
    },
    categories: { food: "食品", Rent: "家賃", travel: "旅行", subscriptions: "サブスク", others: "その他", income: "収入" },
    topbar: { search: "検索...", admin: "管理者", viewer: "視聴者" }
  },
  ar: {
    sidebar: { dashboard: "لوحة القيادة", transactions: "المعاملات", analytics: "التحليلات", insights: "رؤى", settings: "إعدادات" },
    dashboard: { 
      systemDynamics: "ديناميكيات النظام", coreMetrics: "النواة المالية عالية الأداء الإصدار 4.0",
      reports: "تقارير", image: "صورة", pdf: "بي دي إف",
      capitalReservoir: "احتياطي رأس المال", inflowVelocity: "سرعة التدفق",
      burnCoefficient: "معامل الحرق", retentionYield: "عائد الاحتفاظ",
      activeLiquidity: "السيولة النشطة", realtimeBalance: "تدفق الرصيد في الوقت الحقيقي",
      flow: "تدفق", burn: "حرق", capitalMap: "خريطة رأس المال", portfolio: "محفظة",
      realtimeFeed: "تغذية حية", viewAll: "عرض الكل"
    },
    categories: { food: "طعام", Rent: "إيجار", travel: "سفر", subscriptions: "اشتراكات", others: "أخرى", income: "دخل" },
    topbar: { search: "يبحث...", admin: "مسؤول", viewer: "مشاهد" }
  },
  ta: {
    sidebar: { dashboard: "கட்டுப்பாட்டு அறை", transactions: "பரிவர்த்தனைகள்", analytics: "பகுப்பாய்வு", insights: "நுண்ணறிவு", settings: "அமைப்புகள்" },
    dashboard: { 
      systemDynamics: "அமைப்பு இயக்கவியல்", coreMetrics: "அதிக செயல்திறன் நிதி தளம் v4.0",
      reports: "அறிக்கைகள்", image: "படம்", pdf: "PDF",
      capitalReservoir: "மூலதன இருப்பு", inflowVelocity: "உள்வரும் வேகம்",
      burnCoefficient: "எரியும் குணகம்", retentionYield: "தக்கவைப்பு மகசூல்",
      activeLiquidity: "செயலில் உள்ள பணப்புழக்கம்", realtimeBalance: "நிகழ்நேர இருப்பு ஓட்டம்",
      flow: "ஓட்டம்", burn: "எரி", capitalMap: "மூலதன வரைபடம்", portfolio: "முதலீட்டுத் தொகுப்பு",
      realtimeFeed: "நிகழ்நேர ஊட்டம்", viewAll: "அனைத்தையும் பார்"
    },
    categories: { food: "உணவு", Rent: "வாடகை", travel: "பயணம்", subscriptions: "சந்தாக்கள்", others: "மற்றவை", income: "வருமானம்" },
    topbar: { search: "தேடு...", admin: "நிர்வாகி", viewer: "பார்வையாளர்" }
  },
  ru: {
    sidebar: { dashboard: "Главная", transactions: "Транзакции", analytics: "Аналитика", insights: "Инсайты", settings: "Настройки" },
    dashboard: { 
      systemDynamics: "Системная динамика", coreMetrics: "Ядро финансов высокой производительности v4.0",
      reports: "Отчеты", image: "Изображение", pdf: "PDF",
      capitalReservoir: "Капитальный резерв", inflowVelocity: "Скорость притока",
      burnCoefficient: "Коэффициент сжигания", retentionYield: "Доходность удержания",
      activeLiquidity: "Активная ликвидность", realtimeBalance: "Поток баланса в реальном времени",
      flow: "ПОТОК", burn: "СЖИГАНИЕ", capitalMap: "Карта капитала", portfolio: "Портфель",
      realtimeFeed: "Лента событий", viewAll: "Смотреть все"
    },
    categories: { food: "Еда", Rent: "Аренда", travel: "Путешествия", subscriptions: "Подписки", others: "Другое", income: "Доход" },
    topbar: { search: "Поиск...", admin: "Админ", viewer: "Зритель" }
  }
};

const baseDir = path.join(__dirname, 'src', 'locales');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

for (const [lang, data] of Object.entries(locales)) {
  const langDir = path.join(baseDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir);
  fs.writeFileSync(path.join(langDir, 'translation.json'), JSON.stringify(data, null, 2));
}

console.log('Locales generated successfully!');
