document.addEventListener('DOMContentLoaded', () => {
    function setCookie(name, value) { try { document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=31536000'; } catch(e) {} }
    function getCookie(name) { try { const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')); return m ? m[1] : null; } catch(e) { return null; } }
    let auth = null;
    try { auth = JSON.parse(localStorage.getItem('sru_auth')); } catch(e) { auth = null; }
    const isAdmin = !!(auth && auth.role === 'admin');
    let clubs = [];
    try { clubs = JSON.parse(localStorage.getItem('sru_clubs') || '[]'); } catch(e) { clubs = []; }
    if (!clubs || clubs.length === 0) {
        const cc = getCookie('sru_clubs');
        if (cc) { try { const parsed = JSON.parse(decodeURIComponent(cc)); if (Array.isArray(parsed)) clubs = parsed; } catch(e) {} }
    }
    if (!clubs || clubs.length === 0) {
        clubs = [
            { id: Date.now(), title: 'Coding Club', desc: 'A place for coding enthusiasts to collaborate and innovate.' }
        ];
        try { localStorage.setItem('sru_clubs', JSON.stringify(clubs)); } catch(e) {}
        setCookie('sru_clubs', JSON.stringify(clubs));
    }
    const grid = document.getElementById('clubs-grid');
    let showAll = false;
    function getMemberships(){
        let m = [];
        try { m = JSON.parse(localStorage.getItem('sru_club_members') || '[]'); } catch(e) { m = []; }
        if (!Array.isArray(m) || m.length === 0) { const mc = getCookie('sru_club_members'); if (mc) { try { const parsed = JSON.parse(decodeURIComponent(mc)); if (Array.isArray(parsed)) m = parsed; } catch(e) {} } }
        return Array.isArray(m) ? m : [];
    }
    function setMemberships(m){
        try { localStorage.setItem('sru_club_members', JSON.stringify(m)); } catch(e) {}
        setCookie('sru_club_members', JSON.stringify(m));
    }
    function isMember(clubId){
        if (!auth || !auth.user) return false;
        const email = String(auth.user.email).toLowerCase();
        return getMemberships().some(x => String(x.clubId) === String(clubId) && String(x.email).toLowerCase() === email);
    }
    function openJoinModal(club){
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.background = 'rgba(0,0,0,0.35)'; overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = '2200';
        const modal = document.createElement('div');
        modal.style.background = '#fff'; modal.style.borderRadius = '12px'; modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; modal.style.width = '92%'; modal.style.maxWidth = '480px'; modal.style.padding = '22px';
        const title = document.createElement('div'); title.textContent = 'Join ' + club.title; title.style.fontSize = '22px'; title.style.fontWeight = '700'; title.style.color = '#164d9a'; title.style.marginBottom = '14px';
        const name = document.createElement('input'); name.type = 'text'; name.placeholder = 'Full Name'; name.style.cssText = 'width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
        const year = document.createElement('input'); year.type = 'text'; year.placeholder = 'Year (e.g., 2nd Year)'; year.style.cssText = 'width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
        const dept = document.createElement('select'); dept.style.cssText = 'width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
        ['CSE','ECE','Mechanical'].forEach(d => { const opt=document.createElement('option'); opt.value=d; opt.textContent=d; dept.appendChild(opt); });
        const register = document.createElement('button'); register.textContent = 'Register'; register.style.cssText = 'width:100%;padding:12px;background:#1853b2;color:#fff;border:none;border-radius:8px;font-weight:700;';
        const close = document.createElement('button'); close.textContent = 'Close'; close.style.cssText = 'width:100%;padding:10px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;margin-top:10px;';
        const msg = document.createElement('div'); msg.style.cssText = 'margin-top:8px;color:#b00020;font-size:14px;';
        register.addEventListener('click', () => {
            const nm = (name.value||'').trim(); const yr = (year.value||'').trim(); const dp = dept.value;
            if (!auth || !auth.user) { msg.textContent = 'Login to the site first.'; return; }
            if (!nm || !yr || !dp) { msg.textContent = 'Fill all fields.'; return; }
            const email = String(auth.user.email).toLowerCase();
            let m = getMemberships();
            if (m.some(x => String(x.clubId) === String(club.id) && String(x.email).toLowerCase() === email)) { msg.textContent = 'Already a member.'; return; }
            m.push({ clubId: club.id, email, name: nm, year: yr, dept: dp });
            setMemberships(m);
            document.body.removeChild(overlay);
            render();
        });
        close.addEventListener('click', () => { document.body.removeChild(overlay); });
        modal.appendChild(title); modal.appendChild(name); modal.appendChild(year); modal.appendChild(dept); modal.appendChild(register); modal.appendChild(close); modal.appendChild(msg);
        overlay.appendChild(modal); document.body.appendChild(overlay);
    }
    function render() {
        grid.innerHTML = '';
        const list = showAll ? clubs : clubs.slice(0, 3);
        list.forEach((c, i) => {
            const card = document.createElement('div');
            card.className = 'club-card';
            card.style.animationDelay = `${i * 0.08}s`;
            const already = isMember(c.id);
            const cta = already ? `<span class="club-cta" style="background:#f1f5fb;color:#123b79;cursor:default;">Already a member</span>` : `<a href="#" class="club-cta" data-id="${c.id}">Join Club →</a>`;
            card.innerHTML = `
                <h3 class="club-title">${c.title}</h3>
                <p class="club-desc">${c.desc}</p>
                ${cta}
                ${isAdmin ? `<button data-id="${c.id}" class="club-del" style="margin-left:12px; padding:8px 14px; background:#f1f5fb; color:#123b79; border:none; border-radius:8px;">Delete</button>` : ''}
            `;
            grid.appendChild(card);
        });
        const joinBtns = grid.querySelectorAll('.club-cta[href]');
        joinBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                const club = clubs.find(c => String(c.id) === String(id));
                if (!club) return;
                if (isMember(id)) return;
                openJoinModal(club);
            });
        });
        if (isAdmin) {
            const dels = grid.querySelectorAll('.club-del');
            dels.forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    clubs = clubs.filter(c => String(c.id) !== String(id));
                    try { localStorage.setItem('sru_clubs', JSON.stringify(clubs)); } catch(e) {}
                    setCookie('sru_clubs', JSON.stringify(clubs));
                    render();
                });
            });
        }
    }
    render();
    const viewBtn = document.getElementById('viewAllClubsBtn');
    if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAll = true;
            render();
        });
    }
    const addBtn = document.getElementById('addClubBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const title = prompt('Club title');
            if (!title) return;
            const desc = prompt('Club description');
            if (!desc) return;
            const id = Date.now();
            clubs.push({ id, title, desc });
            try { localStorage.setItem('sru_clubs', JSON.stringify(clubs)); } catch(e) {}
            setCookie('sru_clubs', JSON.stringify(clubs));
            render();
        });
    }
    const clearBtn = document.getElementById('clearClubsBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (!confirm('Clear all clubs?')) return;
            clubs = [];
            try { localStorage.setItem('sru_clubs', JSON.stringify(clubs)); } catch(e) {}
            setCookie('sru_clubs', JSON.stringify(clubs));
            render();
        });
    }
});