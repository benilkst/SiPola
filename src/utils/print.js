// --- PRINT HELPERS ---
export const handlePrintSingle = (qrData) => {
    const w = window.open('', '_blank', 'width=500,height=600');
    if (!w) return alert("Izinkan pop-up!");
    w.document.write(`<html><body onload="window.print()" style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;"><div style="text-align:center;border:3px solid #000;padding:40px;border-radius:20px;"><h2>${qrData.location}</h2><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData.id}"/><br/><br/><code>${qrData.id}</code></div></body></html>`);
    w.document.close();
};

export const handlePrintAll = (data) => {
    const w = window.open('', '_blank', 'width=900,height=1000');
    if (!w) return alert("Izinkan pop-up!");
    const cards = data.map(i => `
    <div style="border:3px solid #000; padding:20px; text-align:center; border-radius:15px; break-inside:avoid; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <h2 style="margin:0 0 15px 0; font-size:22px; line-height:1.2; text-transform:uppercase;">${i.location}</h2>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${i.id}" style="width:200px; height:200px;"/>
        <p style="margin:15px 0 0 0; font-family:monospace; font-size:16px; font-weight:bold; color:#333;">${i.id}</p>
    </div>
  `).join('');

    w.document.write(`<html><head><style>@page{size:A4;margin:10mm;}body{font-family:'Arial',sans-serif;padding:20px;margin:0;}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;}</style></head><body onload="window.print()"><div class="grid">${cards}</div></body></html>`);
    w.document.close();
};
