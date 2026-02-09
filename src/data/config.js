// --- DATA & CONFIG ---
export const ACCOUNTS = [
    { username: 'Administrator', password: '123456', role: 'Super Admin', name: 'Administrator' },
    { username: 'Rupam I', password: '123456', role: 'Regu Pengamanan I', name: 'Ka. Rupam I' },
    { username: 'Rupam II', password: '123456', role: 'Regu Pengamanan II', name: 'Ka. Rupam II' },
    { username: 'Rupam III', password: '123456', role: 'Regu Pengamanan III', name: 'Ka. Rupam III' },
    { username: 'Rupam IV', password: '123456', role: 'Regu Pengamanan IV', name: 'Ka. Rupam IV' },
];

export const INITIAL_QR_DATA = [
    { id: 'QR_001', location: 'Pos Utama Menara' },
    { id: 'QR_002', location: 'Blok Anggrek - Pintu Utama' },
    { id: 'QR_003', location: 'Blok Cempaka - Titik Rawan' },
    { id: 'QR_004', location: 'Area Dapur' },
    { id: 'QR_005', location: 'Area Bengkel Kerja' },
];

export const BLOCK_CONFIG = {
    Anggrek: { floors: 2 },
    Bougenville: { floors: 2 },
    Cempaka: { floors: 2 },
    Dahlia: { floors: 2 },
    Edelweise: { floors: 2 },
    Dapur: { floors: 1 }
};

// --- DUMMY DATA GENERATOR ---
export const generateDummyData = () => {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const apelData = [
        { id: 101, pic: 'Ka. Rupam I', shift: 'Pagi', total: 452, time: '07:30', dateISO: formatDate(today) },
        { id: 102, pic: 'Ka. Rupam II', shift: 'Siang', total: 452, time: '13:30', dateISO: formatDate(today) },
        { id: 103, pic: 'Ka. Rupam III', shift: 'Malam', total: 452, time: '19:30', dateISO: formatDate(today) },
        { id: 201, pic: 'Ka. Rupam IV', shift: 'Pagi', total: 450, time: '07:30', dateISO: formatDate(yesterday) },
    ];

    const activities = [];
    const activityTypes = ['Kontrol keliling area blok', 'Serah terima pos', 'Penerimaan bahan makanan', 'Pengawalan WBP ke klinik', 'Pemeriksaan instalasi'];

    [today, yesterday].forEach((date, dayIdx) => {
        for (let i = 0; i < 15; i++) {
            const hour = 8 + i;
            const timeStr = `${hour < 10 ? '0' + hour : hour}:15`;
            activities.push({
                id: `act_${dayIdx}_${i}`,
                time: timeStr,
                name: `Petugas ${String.fromCharCode(65 + (i % 5))}`,
                desc: `${activityTypes[i % activityTypes.length]} - Situasi aman.`,
                user: `Rupam ${['I', 'II', 'III', 'IV'][i % 4]}`,
                dateISO: formatDate(date),
                images: []
            });
        }
    });

    const scans = [];
    [today, yesterday].forEach((date, dayIdx) => {
        for (let i = 0; i < 15; i++) {
            const hour = 9 + Math.floor(i / 2);
            const min = (i % 2) * 30;
            const timeStr = `${hour < 10 ? '0' + hour : hour}:${min < 10 ? '0' + min : min}`;
            scans.push({
                id: `scan_${dayIdx}_${i}`,
                loc: INITIAL_QR_DATA[i % 5].location,
                time: timeStr,
                status: i % 10 === 0 ? 'Waspada' : 'Aman',
                desc: i % 10 === 0 ? 'Perlu pengecekan ulang' : 'Aman terkendali',
                dateISO: formatDate(date)
            });
        }
    });

    return { apelData, activities, scans };
};
