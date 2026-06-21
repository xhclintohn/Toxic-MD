import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANG_FILE = path.join(__dirname, '..', 'database', 'language.json');

const DEFAULT_LANG = 'en';

const SUPPORTED_LANGS = {
    en: 'English',
    sw: 'Swahili',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    pt: 'Portuguese',
    ar: 'Arabic',
    hi: 'Hindi',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ru: 'Russian',
    tr: 'Turkish',
    id: 'Indonesian',
    ha: 'Hausa',
    yo: 'Yoruba',
    am: 'Amharic'
};

let _currentLang = DEFAULT_LANG;

try {
    if (fs.existsSync(LANG_FILE)) {
        const data = JSON.parse(fs.readFileSync(LANG_FILE, 'utf8'));
        if (data.lang && SUPPORTED_LANGS[data.lang]) _currentLang = data.lang;
    }
} catch { _currentLang = DEFAULT_LANG; }

function _save() {
    try {
        fs.mkdirSync(path.dirname(LANG_FILE), { recursive: true });
        fs.writeFileSync(LANG_FILE, JSON.stringify({ lang: _currentLang }, null, 2));
    } catch {}
}

export function setLanguage(lang) {
    if (!lang || !SUPPORTED_LANGS[lang]) return false;
    _currentLang = lang;
    _save();
    return true;
}

export function getLanguage() {
    return _currentLang;
}

export function getSupportedLanguages() {
    return { ...SUPPORTED_LANGS };
}

const TRANSLATIONS = {
    en: {
        greetings: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', night: 'Good night' },
        errors: { ownerOnly: 'You dare use an Owner command? Your mere existence insults my code.', adminOnly: 'Admin privileges are required.', botAdmin: 'I need admin rights to obey.', groupOnly: 'This command only works in groups.', failed: 'Something broke. Shocker.' },
        common: { enabled: 'ENABLED', disabled: 'DISABLED', success: 'Done', failed: 'Failed', loading: 'Loading...', wait: 'Please wait...' },
        welcome: { welcome: 'Welcome', goodbye: 'Goodbye' }
    },
    sw: {
        greetings: { morning: 'Habari za asubuhi', afternoon: 'Habari za mchana', evening: 'Habari za jioni', night: 'Usiku mwema' },
        errors: { ownerOnly: 'Wewe? Tumia amri ya mmiliki? Usiruhusiwi hata kidogo.', adminOnly: 'Unahitaji ruhusa za msimamizi.', botAdmin: 'Ninahitaji ruhusa za msimamizi kufanya kazi.', groupOnly: 'Amri hii inafanya kazi katika vikundi pekee.', failed: 'Kuna hitilafu. Ajabu.' },
        common: { enabled: 'IMEWASHWA', disabled: 'IMEZIMWA', success: 'Imefanyika', failed: 'Imeshindwa', loading: 'Inapakia...', wait: 'Tafadhali subiri...' },
        welcome: { welcome: 'Karibu', goodbye: 'Kwa heri' }
    },
    es: {
        greetings: { morning: 'Buenos dias', afternoon: 'Buenas tardes', evening: 'Buenas tardes', night: 'Buenas noches' },
        errors: { ownerOnly: 'Comando solo para el propietario.', adminOnly: 'Se requieren privilegios de administrador.', botAdmin: 'Necesito ser administrador.', groupOnly: 'Solo funciona en grupos.', failed: 'Algo salio mal.' },
        common: { enabled: 'ACTIVADO', disabled: 'DESACTIVADO', success: 'Hecho', failed: 'Fallido', loading: 'Cargando...', wait: 'Por favor espera...' },
        welcome: { welcome: 'Bienvenido', goodbye: 'Adios' }
    },
    fr: {
        greetings: { morning: 'Bonjour', afternoon: 'Bon apres-midi', evening: 'Bonsoir', night: 'Bonne nuit' },
        errors: { ownerOnly: 'Commande reservee au proprietaire.', adminOnly: 'Privileges administrateur requis.', botAdmin: 'J ai besoin de droits d administrateur.', groupOnly: 'Cette commande fonctionne uniquement dans les groupes.', failed: 'Quelque chose s est mal passe.' },
        common: { enabled: 'ACTIVE', disabled: 'DESACTIVEE', success: 'Termine', failed: 'Echoue', loading: 'Chargement...', wait: 'Veuillez patienter...' },
        welcome: { welcome: 'Bienvenue', goodbye: 'Au revoir' }
    },
    de: {
        greetings: { morning: 'Guten Morgen', afternoon: 'Guten Tag', evening: 'Guten Abend', night: 'Gute Nacht' },
        errors: { ownerOnly: 'Nur fuer den Besitzer.', adminOnly: 'Admin-Rechte erforderlich.', botAdmin: 'Ich brauche Admin-Rechte.', groupOnly: 'Nur in Gruppen verfuegbar.', failed: 'Etwas ist schiefgelaufen.' },
        common: { enabled: 'AKTIVIERT', disabled: 'DEAKTIVIERT', success: 'Erledigt', failed: 'Fehlgeschlagen', loading: 'Laden...', wait: 'Bitte warten...' },
        welcome: { welcome: 'Willkommen', goodbye: 'Auf Wiedersehen' }
    },
    pt: {
        greetings: { morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa tarde', night: 'Boa noite' },
        errors: { ownerOnly: 'Comando apenas para o proprietario.', adminOnly: 'Privilegios de admin necessarios.', botAdmin: 'Preciso de direitos de admin.', groupOnly: 'Funciona apenas em grupos.', failed: 'Algo deu errado.' },
        common: { enabled: 'ATIVADO', disabled: 'DESATIVADO', success: 'Feito', failed: 'Falhou', loading: 'Carregando...', wait: 'Por favor aguarde...' },
        welcome: { welcome: 'Bem-vindo', goodbye: 'Adeus' }
    },
    ar: {
        greetings: { morning: 'Sabah al-khair', afternoon: 'Masaa al-khair', evening: 'Masaa al-khair', night: 'Tusbih ala khair' },
        errors: { ownerOnly: 'Amr lil-malik faqat.', adminOnly: 'Mataalibu al-mudir matluba.', botAdmin: 'Ahtaju huquq al-mudir.', groupOnly: 'Yafalu haadha al-amr fi al-majamie faqat.', failed: 'Haadha say maa kharab.' },
        common: { enabled: 'MUFAAAL', disabled: 'MUGHLAQ', success: 'Tamma', failed: 'Fashila', loading: 'Jari al-tahmil...', wait: 'IntaZar min fadlik...' },
        welcome: { welcome: 'Marhaban', goodbye: 'Ma al-salama' }
    },
    hi: {
        greetings: { morning: 'Suprabhat', afternoon: 'Shubh dupahar', evening: 'Shubh sandhya', night: 'Shubh raatri' },
        errors: { ownerOnly: 'Yeh command sirf owner ke liye hai.', adminOnly: 'Admin rights chahiye.', botAdmin: 'Mujhe admin banana padega.', groupOnly: 'Ye sirf group mein kaam karta hai.', failed: 'Kuchh galat ho gaya.' },
        common: { enabled: 'CHALU', disabled: 'BAND', success: 'Ho gaya', failed: 'Asafal', loading: 'La raha hai...', wait: 'Kripaya intezaar karein...' },
        welcome: { welcome: 'Swagat hai', goodbye: 'Alvida' }
    },
    zh: {
        greetings: { morning: 'Zao shang hao', afternoon: 'Xia wu hao', evening: 'Wan shang hao', night: 'Wan an' },
        errors: { ownerOnly: 'Jin xian yong you zhe shi yong.', adminOnly: 'Xu yao guan li yuan quan xian.', botAdmin: 'Wo xu yao guan li yuan quan xian.', groupOnly: 'Gai ming ling jin zai qun zu zhong you xiao.', failed: 'Chu cuo le.' },
        common: { enabled: 'Yi qi yong', disabled: 'Yi guan bi', success: 'Wan cheng', failed: 'Shi bai', loading: 'Jia zai zhong...', wait: 'Qing shao deng...' },
        welcome: { welcome: 'Huan ying', goodbye: 'Zai jian' }
    },
    ja: {
        greetings: { morning: 'Ohayo gozaimasu', afternoon: 'Konnichiwa', evening: 'Konbanwa', night: 'Oyasumi nasai' },
        errors: { ownerOnly: 'Ona shi sen yo no komando desu.', adminOnly: 'Kanri-sha ken-gen ga hitsuyo desu.', botAdmin: 'Admin ken-gen ga hitsuyo desu.', groupOnly: 'Gurupu sen yo no komando desu.', failed: 'Erara ga hassei shimashita.' },
        common: { enabled: 'YUUKO', disabled: 'MUKO', success: 'Kanryo', failed: 'Shippai', loading: 'Rodo chu...', wait: 'Shosho omachi kudasai...' },
        welcome: { welcome: 'Yokoso', goodbye: 'Sayonara' }
    },
    ko: {
        greetings: { morning: 'Joh-eun achim', afternoon: 'Joh-eun ohu', evening: 'Annyeonghaseyo', night: 'Annyeonghi jumusipsio' },
        errors: { ownerOnly: 'Jugmyeon-yong myeongnyeong ipnida.', adminOnly: 'Gwanrija gwonhan-i pilyohabnida.', botAdmin: 'Gwanrija gwonhan-i pilyohabnida.', groupOnly: 'Geulubeseoman sayong ganeunghan myeongnyeong ida.', failed: 'Munjega balsaenghaessseubnida.' },
        common: { enabled: 'SAYONG JUNG', disabled: 'SAYONG AN HWAM', success: 'Wanryo', failed: 'Silpae', loading: 'Lodeu jung...', wait: 'Jamkkanmanyo...' },
        welcome: { welcome: 'Hwan-yeong', goodbye: 'Annyeong' }
    },
    ru: {
        greetings: { morning: 'Dobroye utro', afternoon: 'Dobryy den', evening: 'Dobryy vecher', night: 'Spokoynoy nochi' },
        errors: { ownerOnly: 'Tolko dlya vladeltsa.', adminOnly: 'Nuzhny prava administratora.', botAdmin: 'Mne nuzhny prava administratora.', groupOnly: 'Etot prikaz rabotayet tolko v gruppakh.', failed: 'Chto-to sluchilos.' },
        common: { enabled: 'VKLYUCHENO', disabled: 'VYKLYUCHENO', success: 'Gotovo', failed: 'Neudacha', loading: 'Zagruzka...', wait: 'Pozhaluysta podozhdite...' },
        welcome: { welcome: 'Dobro pozhalovat', goodbye: 'Do svidaniya' }
    },
    tr: {
        greetings: { morning: 'Gunaydin', afternoon: 'Iyi oglenler', evening: 'Iyi aksamlar', night: 'Iyi geceler' },
        errors: { ownerOnly: 'Sadece sahip icin.', adminOnly: 'Admin yetkileri gerekli.', botAdmin: 'Admin yetkilerine ihtiyacim var.', groupOnly: 'Bu komut sadece gruplarda calisir.', failed: 'Bir seyler ters gitti.' },
        common: { enabled: 'AKTIF', disabled: 'PASIF', success: 'Tamamlandi', failed: 'Basarisiz', loading: 'Yukleniyor...', wait: 'Lutfen bekleyin...' },
        welcome: { welcome: 'Hos geldiniz', goodbye: 'Gule gule' }
    },
    id: {
        greetings: { morning: 'Selamat pagi', afternoon: 'Selamat siang', evening: 'Selamat sore', night: 'Selamat malam' },
        errors: { ownerOnly: 'Hanya untuk pemilik.', adminOnly: 'Hak admin diperlukan.', botAdmin: 'Saya butuh hak admin.', groupOnly: 'Perintah ini hanya untuk grup.', failed: 'Ada yang salah.' },
        common: { enabled: 'AKTIF', disabled: 'NONAKTIF', success: 'Selesai', failed: 'Gagal', loading: 'Memuat...', wait: 'Mohon tunggu...' },
        welcome: { welcome: 'Selamat datang', goodbye: 'Selamat tinggal' }
    },
    ha: {
        greetings: { morning: 'Barka da safe', afternoon: 'Barka da rana', evening: 'Barka da yamma', night: 'Barka da dare' },
        errors: { ownerOnly: 'Umarni na mai shi kadai.', adminOnly: 'Bukatar izinin admin.', botAdmin: 'Ina bukatar izinin admin.', groupOnly: 'Wannan umarni yana aiki ne kawai a cikin rukuni.', failed: 'Wani abu ya faru.' },
        common: { enabled: 'KUNNE', disabled: 'ASE', success: 'Anyi', failed: 'Ya gaza', loading: 'Ana lodawa...', wait: 'Da fatan za a jira...' },
        welcome: { welcome: 'Barka da zuwa', goodbye: 'Sai an jima' }
    },
    yo: {
        greetings: { morning: 'E kaaro', afternoon: 'E kaasan', evening: 'E ku irole', night: 'O daaro' },
        errors: { ownerOnly: 'Aṣẹ oluni nikan.', adminOnly: 'A nilo aṣẹ abojuto.', botAdmin: 'Mo nilo aṣẹ abojuto.', groupOnly: 'Aṣẹ yii n ṣiṣe ni ajọ nikan.', failed: 'Nkankan ko tọ.' },
        common: { enabled: 'TI IBU', disabled: 'TI PA', success: 'Ti ṣetan', failed: 'Kuṣe', loading: 'N gbe wole...', wait: 'Jọwọ duro...' },
        welcome: { welcome: 'Kaabo', goodbye: 'O dabo' }
    },
    am: {
        greetings: { morning: 'Indemin aderu', afternoon: 'Indemin wala', evening: 'Indemin amshi', night: 'Dehna dur anx' },
        errors: { ownerOnly: 'La may qutir lay wede.', adminOnly: 'Adimin aschaffa yame tal.', botAdmin: 'Adimin aschaffa alanye tal.', groupOnly: 'Ye zeweter lela qer shi lemay yame chernet.', failed: 'Yachi huala.' },
        common: { enabled: 'TEQEM', disabled: 'TERA', success: 'Gude', failed: 'Hedsh', loading: 'Qedeme yame chernet...', wait: 'Ime tal aychalem...' },
        welcome: { welcome: 'Iqiwot', goodbye: 'Chaw' }
    }
};

export function t(key, section = 'common') {
    const langData = TRANSLATIONS[_currentLang] || TRANSLATIONS[DEFAULT_LANG];
    return langData?.[section]?.[key] || TRANSLATIONS[DEFAULT_LANG]?.[section]?.[key] || key;
}

export function getGreeting() {
    const hour = new Date().getHours();
    const translations = TRANSLATIONS[_currentLang] || TRANSLATIONS[DEFAULT_LANG];
    const greetings = translations?.greetings || TRANSLATIONS[DEFAULT_LANG].greetings;
    if (hour >= 5 && hour < 12) return greetings.morning;
    if (hour >= 12 && hour < 17) return greetings.afternoon;
    if (hour >= 17 && hour < 21) return greetings.evening;
    return greetings.night;
}
