function excelDateToString(excelDate) {
    if (typeof excelDate === 'number') {
        const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    if (typeof excelDate === 'string') {
        let datePart = excelDate.trim().substr(0, 10);
        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [y, m, d] = datePart.split('-');
            return `${d}-${m}-${y}`;
        }
        return excelDate.trim();
    }
    return '';
}

function getHeaderIndex(row, targetHeader){
    targetHeader = targetHeader.toLowerCase().replace(/\s+/g, '');
    for(let i=0; i<row.length; i++){
        const norm = (row[i] || '').toString().toLowerCase().replace(/\s+/g, '');
        if(norm === targetHeader) return i;
    }
    return -1;
}

function setCookie(name, value) {
    try { document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=31536000'; } catch(e) {}
}
function getCookie(name) {
    try {
        var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return m ? m[1] : null;
    } catch(e) { return null; }
}

document.getElementById('uploadExcelInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

        let headerRow, idxDate, idxDay, idxUG, dataStartRow;
        for (let row = 0; row < sheetData.length; row++) {
            const arr = sheetData[row];
            idxDate = getHeaderIndex(arr, "Date");
            idxDay = getHeaderIndex(arr, "Day");
            idxUG = getHeaderIndex(arr, "For UG Students");
            if (idxDate !== -1 && idxDay !== -1 && idxUG !== -1) {
                headerRow = arr;
                dataStartRow = row + 1;
                break;
            }
        }
        if(idxDate === -1 || idxDay === -1 || idxUG === -1) {
            document.getElementById('notices-board').innerHTML = 'Column(s) not found: Make sure your Excel sheet has a header row with "Date", "Day", "For UG Students".';
            return;
        }

        const events = [];
        for (let i = dataStartRow; i < sheetData.length; i++) {
            const row = sheetData[i];
            if (!row || row.length === 0) continue;
            const date = excelDateToString(row[idxDate]);
            const day = (row[idxDay] || '').toString().trim();
            const ug = (row[idxUG] || '').toString().trim();
            if(date) events.push({ date, day, ug });
        }
        try { localStorage.setItem('sru_notices_events', JSON.stringify(events)); } catch(e) {}
        setCookie('sru_notices_events', JSON.stringify(events));
        updateNoticeBoard(events);
    };
    reader.readAsArrayBuffer(file);
});

function formatDayName(dayStr) {
    if (!dayStr) return '';
    return dayStr.slice(0, 5).charAt(0).toUpperCase() + dayStr.slice(1, 5).toLowerCase();
}

function updateNoticeBoard(events) {
    const noticeBoard = document.getElementById('notices-board');
    noticeBoard.classList.remove('center-empty');
    noticeBoard.classList.add('filled');

    const now = new Date();
    const dd = now.getDate().toString().padStart(2, '0');
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = now.getFullYear();
    const todayStr = `${dd}-${mm}-${yyyy}`;
    const todayDate = new Date(yyyy, now.getMonth(), now.getDate());

    const todayEvent = events.find(ev => ev.date === todayStr);

    let html = '<div style="font-weight:600; font-size:1.2em; margin-bottom:8px; color:#2537a4;"><span style="color:#2537a4;">Today:</span> <span style="color:#444;">' +
        (todayEvent ? `${formatDayName(todayEvent.day)}, ${todayEvent.date}` : todayStr) + '</span></div>';
    html += '<div style="font-weight:600; color:#2537a4; margin-bottom:4px;">For UG Students:</div>';
    html += '<div style="background:#f5f9fe; border-radius:10px; padding:12px 14px; margin-bottom:20px; font-size:1.05em; text-align:left; width:fit-content;">' +
        (todayEvent && todayEvent.ug ? todayEvent.ug : 'No Event') + '</div>';

    html += '<div style="font-weight:600; color:#2537a4; font-size:1.15em; margin-bottom:10px;">Upcoming Events:</div>';
    for (let diff = 1; diff <= 4; diff++) {
        const future = new Date(todayDate.getTime() + diff * 24 * 60 * 60 * 1000);
        const dd = future.getDate().toString().padStart(2, '0');
        const mm = (future.getMonth() + 1).toString().padStart(2, '0');
        const yyyy = future.getFullYear();
        const futureStr = `${dd}-${mm}-${yyyy}`;
        const event = events.find(ev => ev.date === futureStr);
        const ugText = event && event.ug ? event.ug : 'No Event';
        const dayTxt = event && event.day ? formatDayName(event.day) : '';
        html += '<div style="background:#f5f9fe; border-radius:10px; padding:12px 14px; margin-bottom:14px; text-align:left; width:fit-content;">'
            + `<div style="margin-bottom:4px;">${ugText}</div>`
            + `<div style="font-weight:600; color:#2537a4;">Date: ${futureStr} (${dayTxt})</div>`
            + '</div>';
    }

    var manual = [];
    try { manual = JSON.parse(localStorage.getItem('sru_manual_notices') || '[]'); } catch(e) { manual = []; }
    if (!manual.length) {
        var c = getCookie('sru_manual_notices');
        if (c) { try { manual = JSON.parse(decodeURIComponent(c)); } catch(e) { manual = []; } }
    }
    var auth = null;
    try { auth = JSON.parse(localStorage.getItem('sru_auth')); } catch(e) { auth = null; }
    var isAdmin = !!(auth && auth.role === 'admin');
    if (manual.length) {
        html += '<div style="font-weight:700; color:#164d9a; font-size:1.2em; margin-top:18px;">Manual Notices</div>';
        for (var i = 0; i < manual.length; i++) {
            var m = manual[i];
            html += '<div style="background:#fff; border:1px solid rgba(0,0,0,0.06); box-shadow:0 4px 18px rgba(30,50,120,0.08); border-radius:10px; padding:12px 14px; margin-top:10px; width:fit-content;">'
                + '<div style="font-weight:700; color:#1853b2; margin-bottom:6px;">' + m.title + '</div>'
                + '<div style="color:#222b38; margin-bottom:8px;">' + m.body + '</div>'
                + '<div style="font-size:12px; color:#666;">' + (m.date || '') + '</div>'
                + (isAdmin ? ('<button data-id="' + m.id + '" class="notice-del-btn" style="margin-top:8px; padding:6px 12px; border:none; background:#f1f5fb; color:#123b79; border-radius:8px;">Delete</button>') : '')
                + '</div>';
        }
    }
    noticeBoard.innerHTML = html;
    if (isAdmin) {
        var buttons = noticeBoard.querySelectorAll('.notice-del-btn');
        for (var j = 0; j < buttons.length; j++) {
            buttons[j].addEventListener('click', function(ev) {
                var id = this.getAttribute('data-id');
                var arr = [];
                try { arr = JSON.parse(localStorage.getItem('sru_manual_notices') || '[]'); } catch(e) { arr = []; }
                arr = arr.filter(function(x){ return String(x.id) !== String(id); });
                try { localStorage.setItem('sru_manual_notices', JSON.stringify(arr)); } catch(e) {}
                setCookie('sru_manual_notices', JSON.stringify(arr));
                updateNoticeBoard(events);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var stored = [];
    try { stored = JSON.parse(localStorage.getItem('sru_notices_events') || '[]'); } catch(e) { stored = []; }
    if (!stored || !stored.length) {
        var c = getCookie('sru_notices_events');
        if (c) { try { stored = JSON.parse(decodeURIComponent(c)); } catch(e) { stored = []; } }
    }
    if (stored && stored.length) updateNoticeBoard(stored);
    var addBtn = document.getElementById('addManualNoticeBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            var title = prompt('Notice title');
            if (!title) return;
            var body = prompt('Notice body');
            if (!body) return;
            var now = new Date();
            var dd = now.getDate().toString().padStart(2, '0');
            var mm = (now.getMonth()+1).toString().padStart(2, '0');
            var yyyy = now.getFullYear();
            var id = Date.now();
            var arr = [];
            try { arr = JSON.parse(localStorage.getItem('sru_manual_notices') || '[]'); } catch(e) { arr = []; }
            arr.push({ id: id, title: title, body: body, date: dd+'-'+mm+'-'+yyyy });
            try { localStorage.setItem('sru_manual_notices', JSON.stringify(arr)); } catch(e) {}
            setCookie('sru_manual_notices', JSON.stringify(arr));
            var evs = [];
            try { evs = JSON.parse(localStorage.getItem('sru_notices_events') || '[]'); } catch(e) { evs = []; }
            if (!evs || !evs.length) {
                var c = getCookie('sru_notices_events');
                if (c) { try { evs = JSON.parse(decodeURIComponent(c)); } catch(e) { evs = []; } }
            }
            updateNoticeBoard(evs);
        });
    }
    var clearBtn = document.getElementById('clearAllNoticesBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (!confirm('Clear all uploaded events and manual notices?')) return;
            try { localStorage.removeItem('sru_notices_events'); } catch(e) {}
            try { localStorage.removeItem('sru_manual_notices'); } catch(e) {}
            setCookie('sru_notices_events', JSON.stringify([]));
            setCookie('sru_manual_notices', JSON.stringify([]));
            document.getElementById('notices-board').innerHTML = '<div class="notice-card no-data"><p>No Data Uploaded by Admin</p></div>';
        });
    }
});
