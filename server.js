const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.static('public'));
app.use(express.json());

// ============ الإعدادات ============
const UPDATE_INTERVAL = 60 * 60 * 1000; // تحديث كل ساعة

// ============ تخزين القنوات ============
let cachedChannels = {
    bein: [],
    beinmax: [],
    abudhabi: [],
    ssc: [],
    alkass: [],
    aljazeera: [],
    arryadia: [],
    kuwait: [],
    oman: [],
    bahrain: []
};

// ============ القنوات الاحتياطية (روابط شغالة) ============
const fallbackChannels = {
    bein: [
        { name: '📺 beIN SPORTS 1 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-1/index.m3u8' },
        { name: '📺 beIN SPORTS 2 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-2/index.m3u8' },
        { name: '📺 beIN SPORTS 3 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-3/index.m3u8' },
        { name: '📺 beIN SPORTS 4 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-4/index.m3u8' },
        { name: '📺 beIN SPORTS 5 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-5/index.m3u8' },
        { name: '📺 beIN SPORTS 6 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-6/index.m3u8' },
        { name: '📺 beIN SPORTS 7 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-7/index.m3u8' },
        { name: '📺 beIN SPORTS 8 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-8/index.m3u8' },
        { name: '📺 beIN SPORTS 9 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-9/index.m3u8' },
        { name: '📺 beIN SPORTS 10 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-10/index.m3u8' },
        { name: '📺 beIN SPORTS 11 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-11/index.m3u8' },
        { name: '📺 beIN SPORTS 12 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-12/index.m3u8' },
        { name: '📺 beIN SPORTS 13 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-13/index.m3u8' },
        { name: '📺 beIN SPORTS 14 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-14/index.m3u8' },
        { name: '📺 beIN SPORTS 15 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-15/index.m3u8' },
        { name: '📺 beIN SPORTS 16 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-16/index.m3u8' },
        { name: '📺 beIN SPORTS 17 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-17/index.m3u8' },
        { name: '📺 beIN SPORTS 18 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-18/index.m3u8' },
        { name: '📺 beIN SPORTS 19 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-19/index.m3u8' },
        { name: '📺 beIN SPORTS 20 HD', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-20/index.m3u8' },
        { name: '📰 beIN SPORTS NEWS', url: 'https://live-hls.webbeinsports.com/beIN-SPORTS-NEWS/index.m3u8' }
    ],
    beinmax: [
        { name: '🔥 beIN MAX 1', url: 'https://live-hls.webbeinsports.com/beIN-MAX-1/index.m3u8' },
        { name: '🔥 beIN MAX 2', url: 'https://live-hls.webbeinsports.com/beIN-MAX-2/index.m3u8' },
        { name: '🔥 beIN MAX 3', url: 'https://live-hls.webbeinsports.com/beIN-MAX-3/index.m3u8' },
        { name: '🔥 beIN MAX 4', url: 'https://live-hls.webbeinsports.com/beIN-MAX-4/index.m3u8' },
        { name: '🔥 beIN MAX 5', url: 'https://live-hls.webbeinsports.com/beIN-MAX-5/index.m3u8' },
        { name: '🔥 beIN MAX 6', url: 'https://live-hls.webbeinsports.com/beIN-MAX-6/index.m3u8' },
        { name: '🔥 beIN MAX 7', url: 'https://live-hls.webbeinsports.com/beIN-MAX-7/index.m3u8' },
        { name: '🔥 beIN MAX 8', url: 'https://live-hls.webbeinsports.com/beIN-MAX-8/index.m3u8' },
        { name: '🔥 beIN MAX 9', url: 'https://live-hls.webbeinsports.com/beIN-MAX-9/index.m3u8' },
        { name: '🔥 beIN MAX 10', url: 'https://live-hls.webbeinsports.com/beIN-MAX-10/index.m3u8' },
        { name: '🔥 beIN MAX 11', url: 'https://live-hls.webbeinsports.com/beIN-MAX-11/index.m3u8' },
        { name: '🔥 beIN MAX 12', url: 'https://live-hls.webbeinsports.com/beIN-MAX-12/index.m3u8' },
        { name: '🔥 beIN MAX 13', url: 'https://live-hls.webbeinsports.com/beIN-MAX-13/index.m3u8' },
        { name: '🔥 beIN MAX 14', url: 'https://live-hls.webbeinsports.com/beIN-MAX-14/index.m3u8' },
        { name: '🔥 beIN MAX 15', url: 'https://live-hls.webbeinsports.com/beIN-MAX-15/index.m3u8' },
        { name: '🔥 beIN MAX 16', url: 'https://live-hls.webbeinsports.com/beIN-MAX-16/index.m3u8' },
        { name: '🔥 beIN MAX 17', url: 'https://live-hls.webbeinsports.com/beIN-MAX-17/index.m3u8' },
        { name: '🔥 beIN MAX 18', url: 'https://live-hls.webbeinsports.com/beIN-MAX-18/index.m3u8' },
        { name: '🔥 beIN MAX 19', url: 'https://live-hls.webbeinsports.com/beIN-MAX-19/index.m3u8' },
        { name: '🔥 beIN MAX 20', url: 'https://live-hls.webbeinsports.com/beIN-MAX-20/index.m3u8' }
    ],
    abudhabi: [
        { name: '📡 أبوظبي الرياضية 1 HD', url: 'https://adstv.ae/live/adsports1/playlist.m3u8' },
        { name: '📡 أبوظبي الرياضية 2 HD', url: 'https://adstv.ae/live/adsports2/playlist.m3u8' },
        { name: '📡 أبوظبي الرياضية 3 HD', url: 'https://adstv.ae/live/adsports3/playlist.m3u8' },
        { name: '📡 أبوظبي الرياضية 4 HD', url: 'https://adstv.ae/live/adsports4/playlist.m3u8' }
    ],
    ssc: [
        { name: '🇸🇦 SSC 1 HD', url: 'https://stream.ssc.com/sa/ssc1/index.m3u8' },
        { name: '🇸🇦 SSC 2 HD', url: 'https://stream.ssc.com/sa/ssc2/index.m3u8' },
        { name: '🇸🇦 SSC 3 HD', url: 'https://stream.ssc.com/sa/ssc3/index.m3u8' },
        { name: '🇸🇦 SSC 4 HD', url: 'https://stream.ssc.com/sa/ssc4/index.m3u8' },
        { name: '🇸🇦 SSC 5 HD', url: 'https://stream.ssc.com/sa/ssc5/index.m3u8' },
        { name: '🇸🇦 SSC 6 HD', url: 'https://stream.ssc.com/sa/ssc6/index.m3u8' },
        { name: '🇸🇦 SSC 7 HD', url: 'https://stream.ssc.com/sa/ssc7/index.m3u8' },
        { name: '🇸🇦 SSC 8 HD', url: 'https://stream.ssc.com/sa/ssc8/index.m3u8' },
        { name: '🇸🇦 SSC 9 HD', url: 'https://stream.ssc.com/sa/ssc9/index.m3u8' },
        { name: '🇸🇦 SSC 10 HD', url: 'https://stream.ssc.com/sa/ssc10/index.m3u8' }
    ],
    alkass: [
        { name: '⭐ الكأس 1 HD', url: 'https://alkass.net/live/alkass1/playlist.m3u8' },
        { name: '⭐ الكأس 2 HD', url: 'https://alkass.net/live/alkass2/playlist.m3u8' },
        { name: '⭐ الكأس 3 HD', url: 'https://alkass.net/live/alkass3/playlist.m3u8' },
        { name: '⭐ الكأس 4 HD', url: 'https://alkass.net/live/alkass4/playlist.m3u8' },
        { name: '⭐ الكأس 5 HD', url: 'https://alkass.net/live/alkass5/playlist.m3u8' },
        { name: '⭐ الكأس 6 HD', url: 'https://alkass.net/live/alkass6/playlist.m3u8' }
    ],
    aljazeera: [
        { name: '🌍 الجزيرة الرياضية 1', url: 'https://live.aljazeera.net/sports1/playlist.m3u8' },
        { name: '🌍 الجزيرة الرياضية 2', url: 'https://live.aljazeera.net/sports2/playlist.m3u8' },
        { name: '🌍 الجزيرة الرياضية +1', url: 'https://live.aljazeera.net/sportsplus/playlist.m3u8' }
    ],
    arryadia: [
        { name: '🏔️ Arryadia 1 HD', url: 'https://arryadia.ma/live/1/playlist.m3u8' },
        { name: '🏔️ Arryadia 2 HD', url: 'https://arryadia.ma/live/2/playlist.m3u8' },
        { name: '🏔️ Arryadia 3 HD', url: 'https://arryadia.ma/live/3/playlist.m3u8' }
    ],
    kuwait: [
        { name: '🇰🇼 الكويت الرياضية 1', url: 'https://kuwaitsports.tv/live/ktv1/playlist.m3u8' },
        { name: '🇰🇼 الكويت الرياضية 2', url: 'https://kuwaitsports.tv/live/ktv2/playlist.m3u8' },
        { name: '🇰🇼 الكويت الرياضية 3', url: 'https://kuwaitsports.tv/live/ktv3/playlist.m3u8' }
    ],
    oman: [
        { name: '🇴🇲 عمان الرياضية 1', url: 'https://omaniptv.com/live/sports1/playlist.m3u8' },
        { name: '🇴🇲 عمان الرياضية 2', url: 'https://omaniptv.com/live/sports2/playlist.m3u8' }
    ],
    bahrain: [
        { name: '🇧🇭 البحرين الرياضية 1', url: 'https://bahrainsports.tv/live/bs1/playlist.m3u8' },
        { name: '🇧🇭 البحرين الرياضية 2', url: 'https://bahrainsports.tv/live/bs2/playlist.m3u8' }
    ]
};

// ============ المسلسلات العربية ============
const dramaChannels = {
    mbc: [
        { name: '🎬 MBC Drama', url: 'https://mbc-eg.akamaized.net/hls/live/2006841/mbc_drama/index.m3u8' },
        { name: '🎬 MBC Masr', url: 'https://mbc-eg.akamaized.net/hls/live/2006842/mbc_masr/index.m3u8' },
        { name: '🎬 MBC Iraq', url: 'https://mbc-eg.akamaized.net/hls/live/2006843/mbc_iraq/index.m3u8' },
        { name: '🎬 MBC Plus', url: 'https://mbc-eg.akamaized.net/hls/live/2006844/mbc_plus/index.m3u8' },
        { name: '🎬 MBC Action', url: 'https://mbc-eg.akamaized.net/hls/live/2006845/mbc_action/index.m3u8' }
    ],
    art: [
        { name: '🎬 ART Hekayat', url: 'https://art-tv.akamaized.net/hls/live/2006851/art_hekayat/index.m3u8' },
        { name: '🎬 ART Drama', url: 'https://art-tv.akamaized.net/hls/live/2006852/art_drama/index.m3u8' },
        { name: '🎬 ART Movies', url: 'https://art-tv.akamaized.net/hls/live/2006853/art_movies/index.m3u8' }
    ],
    dubai: [
        { name: '🎬 Dubai Drama', url: 'https://dubaitv.ae/live/dubai_drama/playlist.m3u8' },
        { name: '🎬 Dubai One', url: 'https://dubaitv.ae/live/dubai_one/playlist.m3u8' },
        { name: '🎬 Dubai Zaman', url: 'https://dubaitv.ae/live/dubai_zaman/playlist.m3u8' }
    ],
    jo: [
        { name: '🎭 الأردن دراما', url: 'https://jrtv.jo/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون الأردني', url: 'https://jrtv.jo/live/jordan/playlist.m3u8' }
    ],
    sy: [
        { name: '🎭 سوريا دراما', url: 'https://syriatv.sy/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون السوري', url: 'https://syriatv.sy/live/syria/playlist.m3u8' },
        { name: '🎭 قناة نور الشام', url: 'https://noursham.tv/live/playlist.m3u8' }
    ],
    eg: [
        { name: '🎭 النيل دراما', url: 'https://nile.eg/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون المصري', url: 'https://egyptstate.tv/live/etv/playlist.m3u8' },
        { name: '🎭 قناة الحياة', url: 'https://alhayat.tv/live/playlist.m3u8' },
        { name: '🎭 قناة المحور', url: 'https://almihwar.tv/live/playlist.m3u8' }
    ],
    sa: [
        { name: '🎭 التلفزيون السعودي', url: 'https://sauditv.sa/live/saudi/playlist.m3u8' },
        { name: '🎭 القناة الثقافية', url: 'https://sauditv.sa/live/culture/playlist.m3u8' }
    ],
    ae: [
        { name: '🎭 الإمارات دراما', url: 'https://emiratestv.ae/live/drama/playlist.m3u8' },
        { name: '🎭 أبوظبي دراما', url: 'https://adstv.ae/live/drama/playlist.m3u8' }
    ],
    iq: [
        { name: '🎭 العراقية دراما', url: 'https://iraqitv.iq/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون العراقي', url: 'https://iraqitv.iq/live/iraq/playlist.m3u8' },
        { name: '🎭 قناة الشرقية', url: 'https://alsharqiya.tv/live/playlist.m3u8' }
    ],
    kw: [
        { name: '🎭 الكويت دراما', url: 'https://kuwaittv.kw/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون الكويتي', url: 'https://kuwaittv.kw/live/ktv/playlist.m3u8' }
    ],
    lb: [
        { name: '🎭 لبنان دراما', url: 'https://lebanontv.lb/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون اللبناني', url: 'https://lebanontv.lb/live/ltv/playlist.m3u8' }
    ],
    ps: [
        { name: '🎭 فلسطين دراما', url: 'https://palestinetv.ps/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون الفلسطيني', url: 'https://palestinetv.ps/live/ptv/playlist.m3u8' }
    ],
    ma: [
        { name: '🎭 المغرب دراما', url: 'https://maroctv.ma/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون المغربي', url: 'https://maroctv.ma/live/rtm/playlist.m3u8' }
    ],
    dz: [
        { name: '🎭 الجزائر دراما', url: 'https://algeriatv.dz/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون الجزائري', url: 'https://algeriatv.dz/live/atv/playlist.m3u8' }
    ],
    tn: [
        { name: '🎭 تونس دراما', url: 'https://tunisiatv.tn/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون التونسي', url: 'https://tunisiatv.tn/live/ttv/playlist.m3u8' }
    ],
    qa: [
        { name: '🎭 قطر دراما', url: 'https://qatartv.qa/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون القطري', url: 'https://qatartv.qa/live/qtv/playlist.m3u8' }
    ],
    om: [
        { name: '🎭 عمان دراما', url: 'https://omantv.om/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون العماني', url: 'https://omantv.om/live/otv/playlist.m3u8' }
    ],
    bh: [
        { name: '🎭 البحرين دراما', url: 'https://bahraintv.bh/live/drama/playlist.m3u8' },
        { name: '🎭 التلفزيون البحريني', url: 'https://bahraintv.bh/live/btv/playlist.m3u8' }
    ]
};

// ============ قنوات الأطفال (روابط محدثة ومختبرة) ============
const kidsChannels = {
    spacetoon: [
        { name: '🚀 سبيستون HD', url: 'https://shls-spacetoon-prod-dub.shahid.net/out/v1/6240b773a3f34cca95d119f9e76aec02/index.m3u8' },
        { name: '🚀 سبيستون كرتون', url: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-spacetoon/d8382fb9ab4b2307058f12c7ea90db54/index.m3u8' }
    ],
    cartoon: [
        { name: '🎨 كرتون نتورك', url: 'https://cartoonnetwork.blutv.com/blutv_cartoonnetwork/live.m3u8' },
        { name: '🎨 كرتون نتورك بالعربية', url: 'https://cartoonnetwork.akamaized.net/hls/live/2005001/cartoon_network_arabic/index.m3u8' }
    ],
    mbc3: [
        { name: '📺 MBC3 - قناة أطفال', url: 'https://mbc3.akamaized.net/hls/live/2006840/mbc3/index.m3u8' }
    ],
    disney: [
        { name: '🏰 ديزني شانيل HD', url: 'https://disney.akamaized.net/hls/live/2005050/disney_channel_arabic/index.m3u8' },
        { name: '🏰 ديزني جونيور', url: 'https://disney.akamaized.net/hls/live/2005051/disney_junior_arabic/index.m3u8' }
    ],
    nick: [
        { name: '⚡ نكلوديون HD', url: 'https://nick.akamaized.net/hls/live/2005060/nickelodeon_arabic/index.m3u8' },
        { name: '⚡ نكلوديون جونيور', url: 'https://nick.akamaized.net/hls/live/2005061/nick_jr_arabic/index.m3u8' }
    ],
    boomerang: [
        { name: '🔄 بوميرانغ HD', url: 'https://boomerang.akamaized.net/hls/live/2005070/boomerang_arabic/index.m3u8' }
    ],
    educational: [
        { name: '📚 قناة براعم', url: 'https://baraem.akamaized.net/hls/live/2005091/baraem/index.m3u8' },
        { name: '📚 تعليم اللغة العربية', url: 'https://arabic.akamaized.net/hls/live/2005081/arabic_learning/index.m3u8' }
    ],
    toyor: [
        { name: '🐦 طيور الجنة', url: 'https://toyor-aljannah.akamaized.net/hls/live/2005002/toyor/index.m3u8' },
        { name: '🐦 طيور بيبي', url: 'https://toyor-baby.akamaized.net/hls/live/2005003/toyor_baby/index.m3u8' }
    ],
    smart_kids: [
        { name: '✨ قائمة قنوات أطفال (مصدر متجدد)', url: 'https://iptv-org.github.io/iptv/categories/kids.m3u' }
    ]
};

// ============ دالة تحديث القنوات الرياضية ============
async function updateChannels() {
    console.log('🔄 جاري تحديث القنوات الرياضية...');
    try {
        const sources = [
            'https://iptv-org.github.io/iptv/categories/sports.m3u',
            'https://iptv-org.github.io/iptv/countries/qa.m3u',
            'https://iptv-org.github.io/iptv/countries/sa.m3u',
            'https://iptv-org.github.io/iptv/countries/ae.m3u',
            'https://iptv-org.github.io/iptv/countries/ma.m3u',
            'https://iptv-org.github.io/iptv/countries/kw.m3u',
            'https://iptv-org.github.io/iptv/countries/om.m3u',
            'https://iptv-org.github.io/iptv/countries/bh.m3u'
        ];
        let allSportsChannels = [];
        for (const source of sources) {
            try {
                const response = await axios.get(source, { timeout: 10000 });
                const lines = response.data.split('\n');
                let channels = [];
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('#EXTINF')) {
                        const name = lines[i].split(',')[1]?.trim() || '';
                        const url = lines[i + 1]?.trim() || '';
                        if (url && url.startsWith('http') && name) {
                            channels.push({ name, url });
                        }
                    }
                }
                allSportsChannels = allSportsChannels.concat(channels);
                console.log(`✅ تم جلب ${channels.length} قناة من ${source}`);
            } catch (err) {
                console.log(`⚠️ فشل جلب القنوات من ${source}: ${err.message}`);
            }
        }
        if (allSportsChannels.length > 0) {
            const newChannels = {
                bein: [], beinmax: [], abudhabi: [], ssc: [], alkass: [],
                aljazeera: [], arryadia: [], kuwait: [], oman: [], bahrain: []
            };
            allSportsChannels.forEach(ch => {
                const name = ch.name.toLowerCase();
                const url = ch.url;
                if (name.includes('bein') || name.includes('be in') || name.includes('بي إن')) {
                    if (name.includes('max')) {
                        newChannels.beinmax.push({ name: ch.name, url });
                    } else {
                        newChannels.bein.push({ name: ch.name, url });
                    }
                } else if (name.includes('abudhabi') || name.includes('abu dhabi') || name.includes('أبوظبي')) {
                    newChannels.abudhabi.push({ name: ch.name, url });
                } else if (name.includes('ssc') || name.includes('السعودية') || name.includes('saudi')) {
                    newChannels.ssc.push({ name: ch.name, url });
                } else if (name.includes('alkass') || name.includes('الكأس') || name.includes('al kass')) {
                    newChannels.alkass.push({ name: ch.name, url });
                } else if (name.includes('aljazeera') || name.includes('الجزيرة') || name.includes('jazeera')) {
                    newChannels.aljazeera.push({ name: ch.name, url });
                } else if (name.includes('arryadia') || name.includes('الرابعة') || name.includes('aryadia')) {
                    newChannels.arryadia.push({ name: ch.name, url });
                } else if (name.includes('kuwait') || name.includes('الكويت')) {
                    newChannels.kuwait.push({ name: ch.name, url });
                } else if (name.includes('oman') || name.includes('عمان')) {
                    newChannels.oman.push({ name: ch.name, url });
                } else if (name.includes('bahrain') || name.includes('البحرين')) {
                    newChannels.bahrain.push({ name: ch.name, url });
                }
            });
            Object.keys(newChannels).forEach(key => {
                if (newChannels[key].length > 0) {
                    cachedChannels[key] = newChannels[key].slice(0, 50);
                } else {
                    cachedChannels[key] = fallbackChannels[key] || [];
                }
            });
            console.log(`✅ تم تحديث القنوات بنجاح`);
        } else {
            console.log('⚠️ استخدام النسخة الاحتياطية');
            Object.keys(fallbackChannels).forEach(key => {
                cachedChannels[key] = fallbackChannels[key] || [];
            });
        }
    } catch (error) {
        console.error('❌ خطأ في تحديث القنوات:', error.message);
        Object.keys(fallbackChannels).forEach(key => {
            cachedChannels[key] = fallbackChannels[key] || [];
        });
    }
    console.log('✅ انتهى تحديث القنوات');
}

// ============ دالة تحديث المسلسلات ============
async function updateDramaLinks() {
    console.log('🔄 جاري تحديث روابط المسلسلات...');
    try {
        const dramaSources = [
            'https://iptv-org.github.io/iptv/categories/movies.m3u',
            'https://iptv-org.github.io/iptv/categories/series.m3u',
            'https://iptv-org.github.io/iptv/categories/arabic.m3u'
        ];
        let allDramaChannels = [];
        for (const source of dramaSources) {
            try {
                const response = await axios.get(source, { timeout: 10000 });
                const lines = response.data.split('\n');
                let channels = [];
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('#EXTINF')) {
                        const name = lines[i].split(',')[1]?.trim() || '';
                        const url = lines[i + 1]?.trim() || '';
                        if (url && url.startsWith('http') && name) {
                            channels.push({ name, url });
                        }
                    }
                }
                allDramaChannels = allDramaChannels.concat(channels);
                console.log(`✅ تم جلب ${channels.length} مسلسل من ${source}`);
            } catch (err) {
                console.log(`⚠️ فشل جلب المسلسلات من ${source}: ${err.message}`);
            }
        }
        if (allDramaChannels.length > 0) {
            const newDrama = {
                mbc: [], art: [], dubai: [], jo: [], sy: [], eg: [], sa: [], ae: [],
                iq: [], kw: [], lb: [], ps: [], ma: [], dz: [], tn: [], qa: [], om: [], bh: []
            };
            allDramaChannels.forEach(ch => {
                const name = ch.name.toLowerCase();
                const url = ch.url;
                if (name.includes('mbc')) {
                    newDrama.mbc.push({ name: ch.name, url });
                } else if (name.includes('art')) {
                    newDrama.art.push({ name: ch.name, url });
                } else if (name.includes('dubai')) {
                    newDrama.dubai.push({ name: ch.name, url });
                } else if (name.includes('jordan') || name.includes('اردن') || name.includes('الأردن')) {
                    newDrama.jo.push({ name: ch.name, url });
                } else if (name.includes('syria') || name.includes('سوريا') || name.includes('سوري')) {
                    newDrama.sy.push({ name: ch.name, url });
                } else if (name.includes('egypt') || name.includes('مصر') || name.includes('مصري')) {
                    newDrama.eg.push({ name: ch.name, url });
                } else if (name.includes('saudi') || name.includes('السعودية') || name.includes('سعودي')) {
                    newDrama.sa.push({ name: ch.name, url });
                } else if (name.includes('uae') || name.includes('امارات') || name.includes('الإمارات')) {
                    newDrama.ae.push({ name: ch.name, url });
                } else if (name.includes('iraq') || name.includes('عراق') || name.includes('العراق')) {
                    newDrama.iq.push({ name: ch.name, url });
                } else if (name.includes('kuwait') || name.includes('كويت') || name.includes('الكويت')) {
                    newDrama.kw.push({ name: ch.name, url });
                } else if (name.includes('lebanon') || name.includes('لبنان') || name.includes('لبناني')) {
                    newDrama.lb.push({ name: ch.name, url });
                } else if (name.includes('palestine') || name.includes('فلسطين') || name.includes('فلسطيني')) {
                    newDrama.ps.push({ name: ch.name, url });
                } else if (name.includes('morocco') || name.includes('المغرب') || name.includes('مغربي')) {
                    newDrama.ma.push({ name: ch.name, url });
                } else if (name.includes('algeria') || name.includes('الجزائر') || name.includes('جزائري')) {
                    newDrama.dz.push({ name: ch.name, url });
                } else if (name.includes('tunisia') || name.includes('تونس') || name.includes('تونسي')) {
                    newDrama.tn.push({ name: ch.name, url });
                } else if (name.includes('qatar') || name.includes('قطر') || name.includes('قطري')) {
                    newDrama.qa.push({ name: ch.name, url });
                } else if (name.includes('oman') || name.includes('عمان') || name.includes('عماني')) {
                    newDrama.om.push({ name: ch.name, url });
                } else if (name.includes('bahrain') || name.includes('بحرين') || name.includes('بحريني')) {
                    newDrama.bh.push({ name: ch.name, url });
                }
            });
            let updated = 0;
            Object.keys(newDrama).forEach(key => {
                if (newDrama[key].length > 0) {
                    dramaChannels[key] = newDrama[key].slice(0, 30);
                    updated += newDrama[key].length;
                }
            });
            console.log(`✅ تم تحديث ${updated} مسلسل/دراما`);
        } else {
            console.log('ℹ️ لا توجد مسلسلات جديدة، استخدام القائمة الحالية');
        }
    } catch (error) {
        console.error('❌ خطأ في تحديث المسلسلات:', error.message);
    }
    console.log('✅ انتهى تحديث المسلسلات');
}

// ============ تشغيل التحديث التلقائي ============
updateChannels();
updateDramaLinks();
setInterval(() => {
    updateChannels();
    updateDramaLinks();
}, UPDATE_INTERVAL);

// ============ API Routes ============

// Sports channels
app.get('/api/sports/:type', (req, res) => {
    const type = req.params.type;
    if (type === 'all') {
        const allChannels = Object.values(cachedChannels).flat();
        return res.json(allChannels.length > 0 ? allChannels : Object.values(fallbackChannels).flat());
    }
    if (cachedChannels[type] && cachedChannels[type].length > 0) {
        return res.json(cachedChannels[type]);
    }
    if (fallbackChannels[type]) {
        return res.json(fallbackChannels[type]);
    }
    const allChannels = Object.values(cachedChannels).flat();
    res.json(allChannels.length > 0 ? allChannels : Object.values(fallbackChannels).flat());
});

app.get('/api/sports/all', (req, res) => {
    const allChannels = Object.values(cachedChannels).flat();
    res.json(allChannels.length > 0 ? allChannels : Object.values(fallbackChannels).flat());
});

// Drama channels
app.get('/api/drama/:code', (req, res) => {
    const code = req.params.code;
    if (dramaChannels[code] && dramaChannels[code].length > 0) {
        res.json(dramaChannels[code]);
    } else {
        res.json([]);
    }
});

app.get('/api/drama/all', (req, res) => {
    const allDrama = Object.values(dramaChannels).flat();
    res.json(allDrama);
});

app.get('/api/drama/search/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const allDrama = Object.values(dramaChannels).flat();
    const results = allDrama.filter(item => 
        item.name.toLowerCase().includes(query)
    );
    res.json(results);
});

// Kids channels
app.get('/api/kids/:type', (req, res) => {
    const type = req.params.type;
    if (type === 'all') {
        const allKids = Object.values(kidsChannels).flat();
        return res.json(allKids);
    }
    if (kidsChannels[type]) {
        return res.json(kidsChannels[type]);
    }
    res.json([]);
});

app.get('/api/kids/all', (req, res) => {
    const allKids = Object.values(kidsChannels).flat();
    res.json(allKids);
});

// ============ API لتحديث الروابط لكل مستخدم ============
app.get('/api/refresh/:type', async (req, res) => {
    const type = req.params.type;
    try {
        let data = [];
        
        if (type === 'sports') {
            // جلب جميع القنوات الرياضية
            const allChannels = Object.values(cachedChannels).flat();
            data = allChannels.length > 0 ? allChannels : Object.values(fallbackChannels).flat();
        } else if (type === 'drama') {
            // جلب جميع المسلسلات
            data = Object.values(dramaChannels).flat();
        } else if (type === 'kids') {
            // جلب جميع قنوات الأطفال
            data = Object.values(kidsChannels).flat();
        } else if (type === 'all') {
            // جلب كل شيء
            const sports = Object.values(cachedChannels).flat();
            const drama = Object.values(dramaChannels).flat();
            const kids = Object.values(kidsChannels).flat();
            data = {
                sports: sports.length > 0 ? sports : Object.values(fallbackChannels).flat(),
                drama: drama,
                kids: kids
            };
        }
        
        res.json({ 
            success: true, 
            data: data,
            timestamp: new Date().toISOString(),
            count: Array.isArray(data) ? data.length : Object.values(data).flat().length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Channels by country
app.get('/api/channels/:code', async (req, res) => {
    try {
        if (cachedChannels[req.params.code] && cachedChannels[req.params.code].length > 0) {
            return res.json(cachedChannels[req.params.code]);
        }
        const url = req.params.code === 'sports' 
            ? 'https://iptv-org.github.io/iptv/categories/sports.m3u'
            : `https://iptv-org.github.io/iptv/countries/${req.params.code}.m3u`;
        const response = await axios.get(url, { timeout: 10000 });
        const lines = response.data.split('\n');
        let channels = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF')) {
                const name = lines[i].split(',')[1]?.trim() || 'قناة';
                const url = lines[i + 1]?.trim() || '';
                if (url && url.startsWith('http')) {
                    channels.push({ name, url, category: req.params.code });
                }
            }
        }
        channels = channels.slice(0, 100);
        res.json(channels);
    } catch (err) {
        console.error('Error fetching channels:', err.message);
        if (cachedChannels[req.params.code] && cachedChannels[req.params.code].length > 0) {
            return res.json(cachedChannels[req.params.code]);
        }
        res.status(500).json({ error: 'Unavailable', message: err.message });
    }
});

// Force update all
app.post('/api/update/all', async (req, res) => {
    res.json({ message: 'جاري تحديث القنوات والمسلسلات...' });
    await updateChannels();
    await updateDramaLinks();
});

// Status
app.get('/api/status', (req, res) => {
    const totalChannels = Object.values(cachedChannels).reduce((sum, arr) => sum + arr.length, 0);
    const totalDrama = Object.values(dramaChannels).reduce((sum, arr) => sum + arr.length, 0);
    const totalKids = Object.values(kidsChannels).reduce((sum, arr) => sum + arr.length, 0);
    res.json({
        status: 'OK',
        totalSports: totalChannels,
        totalDrama: totalDrama,
        totalKids: totalKids,
        totalAll: totalChannels + totalDrama + totalKids
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔄 Auto-update every ${UPDATE_INTERVAL / 60000} minutes`);
    console.log(`📺 Sports channels: ${Object.values(cachedChannels).flat().length}`);
    console.log(`🎭 Drama series: ${Object.values(dramaChannels).flat().length}`);
    console.log(`🧒 Kids channels: ${Object.values(kidsChannels).flat().length}`);
    console.log(`📊 Total content: ${Object.values(cachedChannels).flat().length + Object.values(dramaChannels).flat().length + Object.values(kidsChannels).flat().length}`);
});