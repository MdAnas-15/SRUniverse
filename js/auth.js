(function() {
  var path = (window.location.pathname || '').replace(/\\/g, '/');
  var isHome = /(?:^|\/)index\.html$/.test(path) || path === '/' || path === '';
  var isForum = /(?:^|\/)forum\.html$/.test(path);
  var authStr = localStorage.getItem('sru_auth');
  var auth = null;
  try { auth = authStr ? JSON.parse(authStr) : null; } catch(e) { auth = null; }
  if (!auth && !isHome) {
    window.location.replace('index.html');
    return;
  }
  function hideAdminOnly(role) {
    var needHide = role !== 'admin';
    var nodes = document.querySelectorAll('.admin-only');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n.dataset.origDisplay) {
        var inlineDisplay = n.style.display;
        if (inlineDisplay) {
          n.dataset.origDisplay = inlineDisplay;
        } else {
          var comp = window.getComputedStyle ? getComputedStyle(n) : null;
          var val = comp && comp.display && comp.display !== 'none' ? comp.display : 'block';
          n.dataset.origDisplay = val;
        }
      }
      if (needHide) {
        n.style.setProperty('display', 'none', 'important');
      } else {
        n.style.setProperty('display', n.dataset.origDisplay || 'block', 'important');
      }
    }
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
  function updateNavbar() {
    var btn = document.querySelector('.navbar-login');
    if (!btn) return;
    if (auth) {
      btn.textContent = 'Logout';
      btn.onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('sru_auth');
        auth = null;
        window.location.replace('index.html');
      };
      if (auth && auth.role === 'admin') { ensureComplaintsButton(); } else { restoreContactButton(); }
    } else {
      btn.textContent = 'Login';
      btn.onclick = function(e) {
        e.preventDefault();
        openAuthModal();
      };
      restoreContactButton();
    }
  }
  function ensureComplaintsButton() {
    if (!(auth && auth.role === 'admin')) return;
    var links = document.querySelectorAll('.navbar-links a');
    var target = null;
    for (var i = 0; i < links.length; i++) {
      var txt = (links[i].textContent || '').trim().toLowerCase();
      if (txt === 'contact') { target = links[i]; break; }
    }
    if (!target) return;
    target.textContent = 'Complaints';
    target.setAttribute('href', '#');
    target.onclick = function(e){ e.preventDefault(); if (!(auth && auth.role==='admin')) return; openComplaintsModal(); };
    try { target.parentElement && target.parentElement.style.setProperty('display','inline-block','important'); } catch(e) {}
  }
  function restoreContactButton() {
    var links = document.querySelectorAll('.navbar-links a');
    var target = null;
    for (var i = 0; i < links.length; i++) {
      var txt = (links[i].textContent || '').trim().toLowerCase();
      if (txt === 'complaints' || txt === 'contact') { target = links[i]; break; }
    }
    if (!target) return;
    target.textContent = 'Contact';
    target.setAttribute('href', '#');
    target.onclick = function(ev){ ev.preventDefault(); openContactModal(); };
  }
  function openManageUsersModal() {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2000';

    var modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    modal.style.width = '92%';
    modal.style.maxWidth = '520px';
    modal.style.padding = '22px';

    var title = document.createElement('div');
    title.textContent = 'Manage Users';
    title.style.fontSize = '22px';
    title.style.fontWeight = '700';
    title.style.color = '#164d9a';
    title.style.marginBottom = '14px';

    var list = document.createElement('div');
    var users = [];
    try { users = JSON.parse(localStorage.getItem('sru_users') || '[]'); } catch(e) { users = []; }
    if (!users.length) {
      var c = getCookie('sru_users');
      if (c) { try { users = JSON.parse(decodeURIComponent(c)); } catch(e) { users = []; } }
    }
    function render() {
      list.innerHTML = '';
      if (!users.length) {
        var empty = document.createElement('div');
        empty.textContent = 'No registered users.';
        empty.style.color = '#666';
        list.appendChild(empty);
      } else {
        for (var i = 0; i < users.length; i++) {
          var row = document.createElement('div');
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.style.alignItems = 'center';
          row.style.padding = '10px 0';
          var email = document.createElement('div');
          email.textContent = users[i].email;
          email.style.color = '#222b38';
          var del = document.createElement('button');
          del.textContent = 'Remove';
          del.style.padding = '8px 14px';
          del.style.background = '#f1f5fb';
          del.style.color = '#123b79';
          del.style.border = '1px solid #d1d7e4';
          del.style.borderRadius = '8px';
          (function(idx){
            del.addEventListener('click', function() {
              users.splice(idx, 1);
              try { localStorage.setItem('sru_users', JSON.stringify(users)); } catch(e) {}
              setCookie('sru_users', JSON.stringify(users));
              render();
            });
          })(i);
          row.appendChild(email);
          row.appendChild(del);
          list.appendChild(row);
        }
      }
    }
    render();

    var clear = document.createElement('button');
    clear.textContent = 'Clear All Users';
    clear.style.width = '100%';
    clear.style.padding = '10px';
    clear.style.background = '#f1f5fb';
    clear.style.color = '#123b79';
    clear.style.border = '1px solid #d1d7e4';
    clear.style.borderRadius = '8px';
    clear.style.marginTop = '10px';
    clear.addEventListener('click', function(){
      if (!confirm('Remove all users?')) return;
      try { localStorage.setItem('sru_users', JSON.stringify([])); } catch(e) {}
      setCookie('sru_users', JSON.stringify([]));
      render();
    });

    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.width = '100%';
    closeBtn.style.padding = '10px';
    closeBtn.style.background = '#f1f5fb';
    closeBtn.style.color = '#123b79';
    closeBtn.style.border = '1px solid #d1d7e4';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.marginTop = '10px';
    closeBtn.addEventListener('click', function(){
      document.body.removeChild(overlay);
    });

    modal.appendChild(title);
    modal.appendChild(list);
    modal.appendChild(clear);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
  function openContactModal() {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2100';
    var modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    modal.style.width = '92%';
    modal.style.maxWidth = '520px';
    modal.style.padding = '22px';
    var title = document.createElement('div');
    title.textContent = 'Contact Form';
    title.style.fontSize = '22px';
    title.style.fontWeight = '700';
    title.style.color = '#164d9a';
    title.style.marginBottom = '14px';
    var name = document.createElement('input'); name.type='text'; name.placeholder='Full Name'; name.style.cssText='width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
    var email = document.createElement('input'); email.type='email'; email.placeholder='Email'; email.style.cssText='width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
    var dept = document.createElement('select'); dept.style.cssText='width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
    ;['CSE','ECE','Mechanical'].forEach(function(d){ var o=document.createElement('option'); o.value=d; o.textContent=d; dept.appendChild(o); });
    var subject = document.createElement('input'); subject.type='text'; subject.placeholder='Subject'; subject.style.cssText='width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
    var message = document.createElement('textarea'); message.placeholder='Message'; message.style.cssText='width:100%;min-height:120px;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
    var actions = document.createElement('div'); actions.style.display='grid'; actions.style.gridTemplateColumns='1fr 1fr 1fr'; actions.style.gap='8px'; actions.style.marginTop='10px';
    var submit = document.createElement('button'); submit.textContent='Submit'; submit.style.cssText='padding:12px;background:#164d9a;color:#fff;border:none;border-radius:8px;font-weight:700;';
    var clear = document.createElement('button'); clear.textContent='Clear'; clear.style.cssText='padding:12px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;';
    var close = document.createElement('button'); close.textContent='Close'; close.style.cssText='padding:12px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;';
    var msg = document.createElement('div'); msg.style.marginTop='8px'; msg.style.color='#b00020'; msg.style.fontSize='14px';
    submit.addEventListener('click', function(){
      var nm=(name.value||'').trim(); var em=(email.value||'').trim(); var dp=dept.value; var sj=(subject.value||'').trim(); var ms=(message.value||'').trim();
      if (!nm || !em || !dp || !sj || !ms) { msg.textContent='Fill all fields.'; return; }
      var arr=[]; try { arr=JSON.parse(localStorage.getItem('sru_complaints')||'[]'); } catch(e) { arr=[]; }
      if (!arr.length) { var cc0 = getCookie('sru_complaints'); if (cc0) { try { arr = JSON.parse(decodeURIComponent(cc0)); } catch(e) { arr = []; } } }
      var who = auth && auth.user ? auth.user.email : em;
      arr.push({ id: Date.now(), name: nm, email: em, dept: dp, subject: sj, message: ms, by: who, at: Date.now() });
      try { localStorage.setItem('sru_complaints', JSON.stringify(arr)); } catch(e) {}
      setCookie('sru_complaints', JSON.stringify(arr));
      document.body.removeChild(overlay);
    });
    clear.addEventListener('click', function(){ name.value=''; email.value=''; subject.value=''; message.value=''; dept.selectedIndex=0; msg.textContent=''; });
    close.addEventListener('click', function(){ document.body.removeChild(overlay); });
    actions.appendChild(submit); actions.appendChild(clear); actions.appendChild(close);
    modal.appendChild(title); modal.appendChild(name); modal.appendChild(email); modal.appendChild(dept); modal.appendChild(subject); modal.appendChild(message); modal.appendChild(actions); modal.appendChild(msg);
    overlay.appendChild(modal); document.body.appendChild(overlay);
  }
  function openComplaintsModal() {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed'; overlay.style.top='0'; overlay.style.left='0'; overlay.style.right='0'; overlay.style.bottom='0'; overlay.style.background='rgba(0,0,0,0.35)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex='2200';
    var modal = document.createElement('div'); modal.style.background='#fff'; modal.style.borderRadius='12px'; modal.style.boxShadow='0 10px 30px rgba(0,0,0,0.15)'; modal.style.width='92%'; modal.style.maxWidth='760px'; modal.style.padding='22px';
    var title = document.createElement('div'); title.textContent='Complaints'; title.style.fontSize='22px'; title.style.fontWeight='700'; title.style.color='#164d9a'; title.style.marginBottom='14px';
    var list = document.createElement('div');
    var items=[]; try { items=JSON.parse(localStorage.getItem('sru_complaints')||'[]'); } catch(e) { items=[]; }
    if (!items.length) { var cc = getCookie('sru_complaints'); if (cc) { try { items=JSON.parse(decodeURIComponent(cc)); } catch(e) { items=[]; } } }
    function render(){
      list.innerHTML='';
      if (!items.length) { var empty=document.createElement('div'); empty.textContent='No complaints submitted.'; empty.style.color='#666'; list.appendChild(empty); return; }
      items.slice().reverse().forEach(function(it, idx){
        var row=document.createElement('div'); row.style.display='grid'; row.style.gridTemplateColumns='1fr auto'; row.style.alignItems='start'; row.style.gap='8px'; row.style.padding='10px 0'; row.style.borderBottom='1px solid #eef2f8';
        var info=document.createElement('div'); info.innerHTML='<div style="color:#1853b2;font-weight:700;">'+(it.subject||'')+'</div><div style="color:#222b38;">'+(it.message||'')+'</div><div style="color:#666;font-size:12px;">'+(it.name||'')+' • '+(it.email||'')+' • '+(it.dept||'')+'</div>';
        var act=document.createElement('div'); var del=document.createElement('button'); del.textContent='Delete'; del.style.cssText='padding:8px 14px;background:#f8faff;color:#b00020;border:1px solid #e0e6f2;border-radius:8px;';
        del.addEventListener('click', function(){ var realIndex = items.length - 1 - idx; items.splice(realIndex,1); try { localStorage.setItem('sru_complaints', JSON.stringify(items)); } catch(e) {} setCookie('sru_complaints', JSON.stringify(items)); render(); });
        act.appendChild(del); row.appendChild(info); row.appendChild(act); list.appendChild(row);
      });
    }
    render();
    var clearAll=document.createElement('button'); clearAll.textContent='Clear All'; clearAll.style.cssText='width:100%;padding:10px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;margin-top:10px;';
    clearAll.addEventListener('click', function(){ if(!confirm('Remove all complaints?')) return; try { localStorage.setItem('sru_complaints', JSON.stringify([])); } catch(e) {} setCookie('sru_complaints', JSON.stringify([])); items=[]; render(); });
    var close=document.createElement('button'); close.textContent='Close'; close.style.cssText='width:100%;padding:10px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;margin-top:10px;';
    close.addEventListener('click', function(){ document.body.removeChild(overlay); });
    modal.appendChild(title); modal.appendChild(list); modal.appendChild(clearAll); modal.appendChild(close); overlay.appendChild(modal); document.body.appendChild(overlay);
  }
  function openAuthModal() {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2000';

    var modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    modal.style.width = '92%';
    modal.style.maxWidth = '420px';
    modal.style.padding = '22px';

    var title = document.createElement('div');
    title.textContent = 'Login';
    title.style.fontSize = '22px';
    title.style.fontWeight = '700';
    title.style.color = '#164d9a';
    title.style.marginBottom = '14px';

    var form = document.createElement('form');
    form.autocomplete = 'off';

    var email = document.createElement('input');
    email.type = 'email';
    email.placeholder = 'Email';
    email.style.width = '100%';
    email.style.padding = '12px';
    email.style.margin = '8px 0';
    email.style.border = '1px solid #d1d7e4';
    email.style.borderRadius = '8px';

    var pass = document.createElement('input');
    pass.type = 'password';
    pass.placeholder = 'Password';
    pass.style.width = '100%';
    pass.style.padding = '12px';
    pass.style.margin = '8px 0';
    pass.style.border = '1px solid #d1d7e4';
    pass.style.borderRadius = '8px';

    var loginBtn = document.createElement('button');
    loginBtn.type = 'submit';
    loginBtn.textContent = 'Login';
    loginBtn.style.width = '100%';
    loginBtn.style.padding = '12px';
    loginBtn.style.background = '#164d9a';
    loginBtn.style.color = '#fff';
    loginBtn.style.border = 'none';
    loginBtn.style.borderRadius = '8px';
    loginBtn.style.fontWeight = '700';
    loginBtn.style.marginTop = '6px';

    var msg = document.createElement('div');
    msg.style.marginTop = '10px';
    msg.style.color = '#b00020';
    msg.style.fontSize = '14px';

    var sep = document.createElement('div');
    sep.style.margin = '14px 0 10px 0';
    sep.style.textAlign = 'center';
    sep.style.color = '#666';
    sep.textContent = 'No account? Sign up';

    var signupBtn = document.createElement('button');
    signupBtn.type = 'button';
    signupBtn.textContent = 'Sign Up';
    signupBtn.style.width = '100%';
    signupBtn.style.padding = '12px';
    signupBtn.style.background = '#1853b2';
    signupBtn.style.color = '#fff';
    signupBtn.style.border = 'none';
    signupBtn.style.borderRadius = '8px';
    signupBtn.style.fontWeight = '700';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.style.width = '100%';
    closeBtn.style.padding = '10px';
    closeBtn.style.background = '#f1f5fb';
    closeBtn.style.color = '#123b79';
    closeBtn.style.border = '1px solid #d1d7e4';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.marginTop = '10px';

    form.appendChild(email);
    form.appendChild(pass);
    form.appendChild(loginBtn);
    modal.appendChild(title);
    modal.appendChild(form);
    modal.appendChild(msg);
    modal.appendChild(sep);
    modal.appendChild(signupBtn);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    form.addEventListener('submit', function(ev) {
      ev.preventDefault();
      var em = email.value.trim().toLowerCase();
      var pw = pass.value;
      if (em === 'admin@sru.edu.in' && pw === 'Admin@123') {
        localStorage.setItem('sru_auth', JSON.stringify({ role: 'admin', user: { email: em } }));
        auth = { role: 'admin', user: { email: em } };
        hideAdminOnly(auth.role);
        updateNavbar();
        document.body.removeChild(overlay);
        return;
      }
      var usersStr = localStorage.getItem('sru_users');
      if (!usersStr) {
        var uc = getCookie('sru_users');
        if (!uc) { msg.textContent = 'Please sign up first.'; return; }
        usersStr = decodeURIComponent(uc);
      }
      var users;
      try { users = JSON.parse(usersStr); } catch(e) { users = null; }
      if (!users || !Array.isArray(users) || users.length === 0) {
        msg.textContent = 'Please sign up first.';
        return;
      }
      var found = users.find(function(u){ return u.email === em && u.password === pw; });
      if (!found) {
        msg.textContent = 'Invalid credentials.';
        return;
      }
      localStorage.setItem('sru_auth', JSON.stringify({ role: 'user', user: { email: found.email } }));
      auth = { role: 'user', user: { email: found.email } };
      hideAdminOnly(auth.role);
      updateNavbar();
      document.body.removeChild(overlay);
    });

    signupBtn.addEventListener('click', function() {
      modal.innerHTML = '';
      var t = document.createElement('div');
      t.textContent = 'Student Sign Up';
      t.style.fontSize = '22px';
      t.style.fontWeight = '700';
      t.style.color = '#164d9a';
      t.style.marginBottom = '14px';
      var f = document.createElement('form');
      var se = document.createElement('input');
      se.type = 'email';
      se.placeholder = 'SRU Email (name@sru.edu.in)';
      se.style.width = '100%';
      se.style.padding = '12px';
      se.style.margin = '8px 0';
      se.style.border = '1px solid #d1d7e4';
      se.style.borderRadius = '8px';
      var sp = document.createElement('input');
      sp.type = 'password';
      sp.placeholder = 'Password';
      sp.style.width = '100%';
      sp.style.padding = '12px';
      sp.style.margin = '8px 0';
      sp.style.border = '1px solid #d1d7e4';
      sp.style.borderRadius = '8px';
      var sbtn = document.createElement('button');
      sbtn.type = 'submit';
      sbtn.textContent = 'Create Account';
      sbtn.style.width = '100%';
      sbtn.style.padding = '12px';
      sbtn.style.background = '#1853b2';
      sbtn.style.color = '#fff';
      sbtn.style.border = 'none';
      sbtn.style.borderRadius = '8px';
      sbtn.style.fontWeight = '700';
      var back = document.createElement('button');
      back.type = 'button';
      back.textContent = 'Back to Login';
      back.style.width = '100%';
      back.style.padding = '10px';
      back.style.background = '#f1f5fb';
      back.style.color = '#123b79';
      back.style.border = '1px solid #d1d7e4';
      back.style.borderRadius = '8px';
      back.style.marginTop = '10px';
      var sMsg = document.createElement('div');
      sMsg.style.marginTop = '10px';
      sMsg.style.color = '#b00020';
      sMsg.style.fontSize = '14px';
      f.appendChild(se);
      f.appendChild(sp);
      f.appendChild(sbtn);
      modal.appendChild(t);
      modal.appendChild(f);
      modal.appendChild(sMsg);
      modal.appendChild(back);

      f.addEventListener('submit', function(ev) {
        ev.preventDefault();
        var em = se.value.trim().toLowerCase();
        var pw = sp.value;
        if (!/@sru\.edu\.in$/.test(em)) {
          sMsg.textContent = 'Only sru.edu.in emails allowed.';
          return;
        }
        if (!pw || pw.length < 4) {
          sMsg.textContent = 'Use a longer password.';
          return;
        }
        var arr = [];
        try { arr = JSON.parse(localStorage.getItem('sru_users') || '[]'); } catch(e) { arr = []; }
        if (!arr.length) { var uc2 = getCookie('sru_users'); if (uc2) { try { arr = JSON.parse(decodeURIComponent(uc2)); } catch(e) { arr = []; } } }
        if (arr.find(function(u){ return u.email === em; })) {
          sMsg.textContent = 'Account already exists.';
          return;
        }
        arr.push({ email: em, password: pw });
        localStorage.setItem('sru_users', JSON.stringify(arr));
        setCookie('sru_users', JSON.stringify(arr));
        localStorage.setItem('sru_auth', JSON.stringify({ role: 'user', user: { email: em } }));
        auth = { role: 'user', user: { email: em } };
        hideAdminOnly(auth.role);
        updateNavbar();
        document.body.removeChild(overlay);
      });
      back.addEventListener('click', function() {
        document.body.removeChild(overlay);
        openAuthModal();
      });
    });

    closeBtn.addEventListener('click', function() {
      document.body.removeChild(overlay);
    });
  }
  function showLoginRequired() {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2100';
    var modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    modal.style.width = '92%';
    modal.style.maxWidth = '420px';
    modal.style.padding = '22px';
    var text = document.createElement('div');
    text.textContent = 'Please Login to Continue';
    text.style.fontSize = '18px';
    text.style.fontWeight = '600';
    text.style.color = '#164d9a';
    text.style.textAlign = 'center';
    text.style.marginBottom = '12px';
    var login = document.createElement('button');
    login.textContent = 'Login';
    login.style.width = '100%';
    login.style.padding = '12px';
    login.style.background = '#164d9a';
    login.style.color = '#fff';
    login.style.border = 'none';
    login.style.borderRadius = '8px';
    login.style.fontWeight = '700';
    login.style.marginTop = '6px';
    var close = document.createElement('button');
    close.textContent = 'Close';
    close.style.width = '100%';
    close.style.padding = '10px';
    close.style.background = '#f1f5fb';
    close.style.color = '#123b79';
    close.style.border = '1px solid #d1d7e4';
    close.style.borderRadius = '8px';
    close.style.marginTop = '10px';
    login.addEventListener('click', function(){
      document.body.removeChild(overlay);
      openAuthModal();
    });
    close.addEventListener('click', function(){
      document.body.removeChild(overlay);
    });
    modal.appendChild(text);
    modal.appendChild(login);
    modal.appendChild(close);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
  document.addEventListener('DOMContentLoaded', function() {
    hideAdminOnly(auth && auth.role);
    updateNavbar();
    var manageBtn = document.getElementById('manageUsersBtn');
    if (manageBtn) {
      manageBtn.addEventListener('click', function(e){
        e.preventDefault();
        if (!(auth && auth.role === 'admin')) return;
        openManageUsersModal();
      });
    }
    if (auth && auth.role === 'admin') { ensureComplaintsButton(); } else { restoreContactButton(); }
    var anchorsAll = document.querySelectorAll('a');
    for (var i = 0; i < anchorsAll.length; i++) {
      (function(a){
        var href = a.getAttribute('href') || '';
        var isHomeLink = /index\.html$/.test(href) || href === '#';
        var isRestricted = (/\.html$/.test(href) && !/index\.html$/.test(href));
        if (isRestricted) {
          a.addEventListener('click', function(ev){
            if (!auth) {
              ev.preventDefault();
              showLoginRequired();
            }
          });
        }
      })(anchorsAll[i]);
    }
  });
})();