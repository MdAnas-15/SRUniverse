document.addEventListener('DOMContentLoaded', function() {
  var root = document.querySelector('body');
  if (!root) return;
  function setCookie(name, value) { try { document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; max-age=31536000'; } catch(e) {} }
  function getCookie(name) { try { var m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')); return m ? m[1] : null; } catch(e) { return null; } }
  var siteAuth = null;
  try { siteAuth = JSON.parse(localStorage.getItem('sru_auth')); } catch(e) { siteAuth = null; }
  var isAdmin = !!(siteAuth && siteAuth.role === 'admin');
  var forumAuth = null;
  try { forumAuth = JSON.parse(localStorage.getItem('sru_forum_auth')); } catch(e) { forumAuth = null; }

  var posts = [];
  try { posts = JSON.parse(localStorage.getItem('sru_forum_posts') || '[]'); } catch(e) { posts = []; }
  if (!Array.isArray(posts) || posts.length === 0) {
    var cp = getCookie('sru_forum_posts');
    if (cp) {
      try { posts = JSON.parse(decodeURIComponent(cp)); } catch(e) { posts = []; }
    }
    if (!Array.isArray(posts) || posts.length === 0) {
      posts = Array(6).fill(0).map(function(_, i){
        return { id: Date.now()+i, title: 'Best resources for Python beginners?', body: 'Share your favourite channels or courses.', by: 'Anjali', replies: 5, cat: ['Academics','General'][i%2], comments: [] };
      });
      try { localStorage.setItem('sru_forum_posts', JSON.stringify(posts)); } catch(e) {}
      setCookie('sru_forum_posts', JSON.stringify(posts));
    }
  }

  function openForumAuthModal() {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.background = 'rgba(0,0,0,0.35)'; overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center'; overlay.style.zIndex = '2100';
    var modal = document.createElement('div');
    modal.style.background = '#fff'; modal.style.borderRadius = '12px'; modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; modal.style.width = '92%'; modal.style.maxWidth = '480px'; modal.style.padding = '22px';
    var title = document.createElement('div'); title.textContent = 'Join SRU Forum'; title.style.fontSize = '22px'; title.style.fontWeight = '700'; title.style.color = '#164d9a'; title.style.marginBottom = '14px';
    var msg = document.createElement('div'); msg.style.color = '#b00020'; msg.style.fontSize = '14px'; msg.style.marginTop = '8px';
    var container = document.createElement('div');

    container.innerHTML = '';
    var name = document.createElement('input'); name.type = 'text'; name.placeholder = 'Full Name'; name.style.cssText = 'width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
    var year = document.createElement('input'); year.type = 'text'; year.placeholder = 'Year (e.g., 2nd Year)'; year.style.cssText = 'width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
    var createBtn = document.createElement('button'); createBtn.textContent = 'Create Forum Account'; createBtn.style.cssText = 'width:100%;padding:12px;background:#1853b2;color:#fff;border:none;border-radius:8px;font-weight:700;';
    var closeBtn = document.createElement('button'); closeBtn.textContent = 'Close'; closeBtn.style.cssText = 'width:100%;padding:10px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;margin-top:10px;';
    container.appendChild(name); container.appendChild(year); container.appendChild(createBtn); container.appendChild(closeBtn);
    modal.appendChild(title); modal.appendChild(container); modal.appendChild(msg); overlay.appendChild(modal); document.body.appendChild(overlay);
    createBtn.addEventListener('click', function(){
      var nm = (name.value || '').trim(); var yr = (year.value || '').trim();
      if (!siteAuth || !siteAuth.user || siteAuth.role !== 'user') { msg.textContent = 'Login to the site first.'; return; }
      if (!nm || !yr) { msg.textContent = 'Fill all fields.'; return; }
      var arr = []; try { arr = JSON.parse(localStorage.getItem('sru_forum_users') || '[]'); } catch(e) { arr = []; }
      var em = siteAuth.user.email.toLowerCase();
      if (arr.find(function(u){ return u.email === em; })) { msg.textContent = 'Forum account already exists.'; return; }
      arr.push({ email: em, name: nm, year: yr }); localStorage.setItem('sru_forum_users', JSON.stringify(arr)); setCookie('sru_forum_users', JSON.stringify(arr));
      localStorage.setItem('sru_forum_auth', JSON.stringify({ email: em })); forumAuth = { email: em };
      document.body.removeChild(overlay);
      renderFull();
    });
    closeBtn.addEventListener('click', function(){ document.body.removeChild(overlay); });
  }

  function renderPreviewPage() {
    var section = document.createElement('section'); section.className = 'forum-preview';
    section.innerHTML = '\n      <div class="forum-header">\n        <h2>SRU Forum</h2>\n        <p>Connect with students and faculty. Ask questions, share knowledge, and stay engaged with your campus.</p>\n      </div>\n      <div class="forum-grid" id="forumPreviewGrid"></div>\n      <div class="forum-cta"><a href="#" id="joinForumBtn" class="join-forum-btn">Join the Forum →</a></div>\n    ';
    document.body.appendChild(section);
    if (isAdmin) {
      var initAdminEls = section.querySelectorAll('.admin-only');
      initAdminEls.forEach(function(el){
        try { el.style.setProperty('display','inline-block','important'); } catch(e) {}
      });
    }
    if (isAdmin) {
      var adminEls = section.querySelectorAll('.admin-only');
      adminEls.forEach(function(el){
        try { el.style.setProperty('display','inline-block','important'); } catch(e) {}
      });
    }
    var data = []; try { data = JSON.parse(localStorage.getItem('sru_forum_preview') || '[]'); } catch(e) { data = []; }
    if (!Array.isArray(data) || data.length === 0) {
      data = [
        { id: Date.now(), title: 'Best resources for Python beginners?', body: 'Share your favourite channels or courses.', by: 'Anjali', replies: 5 },
        { id: Date.now()+1, title: 'Tips for exam preparation', body: 'How do you organize notes in the last week?', by: 'Rahul', replies: 8 },
        { id: Date.now()+2, title: 'Which clubs are best for first-years?', body: 'Looking for beginner-friendly clubs.', by: 'Sara', replies: 3 }
      ];
      try { localStorage.setItem('sru_forum_preview', JSON.stringify(data)); } catch(e) {}
    }
    var grid = section.querySelector('#forumPreviewGrid');
    data.slice(0,3).forEach(function(item){
      var card = document.createElement('div'); card.className = 'forum-card';
      card.innerHTML = '\n        <div class="forum-title">' + item.title + '</div>\n        <div class="forum-body">' + item.body + '</div>\n        <div class="forum-meta">Posted by: ' + item.by + ' | ' + item.replies + ' replies</div>\n      ';
      grid.appendChild(card);
    });
    var joinBtn = section.querySelector('#joinForumBtn');
    joinBtn.addEventListener('click', function(e){ e.preventDefault(); openForumAuthModal(); });
  }

  function renderFull() {
    var section = document.createElement('section'); section.className = 'forum-page';
    section.innerHTML = '\n    <div class="forum-header">\n      <h2>SRU Forum</h2>\n      <p>Ask questions, share knowledge, and find answers together.</p>\n    </div>\n    <div class="forum-toolbar">\n      <input type="text" id="forumSearch" class="forum-search" placeholder="Search topics..." />\n      <div class="forum-categories">\n        <button class="forum-cat" data-cat="All">All</button>\n        <button class="forum-cat" data-cat="Academics">Academics</button>\n        <button class="forum-cat" data-cat="Clubs">Clubs</button>\n        <button class="forum-cat" data-cat="Careers">Careers</button>\n        <button class="forum-cat" data-cat="General">General</button>\n      </div>\n      <button id="createPostBtn" class="create-post-btn">Create Post</button>\n      ' + (isAdmin ? '<button id="manageForumUsersBtn" class="create-post-btn admin-only" style="background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;">Manage Forum Users</button>' : '') + '\n    </div>\n    <div class="forum-grid" id="forumGrid"></div>\n  ';
    document.body.appendChild(section);
    var grid = section.querySelector('#forumGrid');
    var activeCat = 'All';
    var searchInput = section.querySelector('#forumSearch');
    function renderGrid() {
      var q = (searchInput.value || '').toLowerCase();
      grid.innerHTML = '';
      posts.filter(function(p){
        var catOk = activeCat === 'All' || p.cat === activeCat;
        var qOk = !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
        return catOk && qOk;
      }).forEach(function(item){
        var card = document.createElement('div'); card.className = 'forum-card';
        var canEdit = !!(siteAuth && siteAuth.user && String(item.by).toLowerCase() === String(siteAuth.user.email).toLowerCase());
        var actions = '';
        if (isAdmin) actions += '<button class="forum-del admin-only" data-id="'+item.id+'" style="margin-right:8px;padding:8px 12px;background:#f8faff;color:#b00020;border:1px solid #e0e6f2;border-radius:8px;">Delete</button>';
        if (forumAuth && canEdit) actions += '<button class="forum-edit" data-id="'+item.id+'" style="margin-right:8px;padding:8px 12px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;">Edit</button>';
        if (forumAuth && !canEdit) actions += '<button class="forum-reply" data-id="'+item.id+'" style="padding:8px 12px;background:#1853b2;color:#fff;border:none;border-radius:8px;">Reply</button>';
        card.innerHTML = '\n        <div class="forum-title">' + item.title + '</div>\n        <div class="forum-body">' + item.body + '</div>\n        <div class="forum-meta">Posted by: ' + item.by + ' | ' + item.replies + ' replies</div>\n        <div class="forum-actions" style="margin-top:10px;">' + actions + '</div>\n      ';
        grid.appendChild(card);
      });
      if (isAdmin) {
        var dels = grid.querySelectorAll('.forum-del');
        dels.forEach(function(btn){
          btn.addEventListener('click', function(){
            var id = this.getAttribute('data-id');
            posts = posts.filter(function(x){ return String(x.id) !== String(id); });
      try { localStorage.setItem('sru_forum_posts', JSON.stringify(posts)); } catch(e) {}
      setCookie('sru_forum_posts', JSON.stringify(posts));
      renderGrid();
    });
        });
        var adminEls = grid.querySelectorAll('.admin-only');
        adminEls.forEach(function(el){
          try { el.style.setProperty('display','inline-block','important'); } catch(e) {}
        });
      }
      var edits = grid.querySelectorAll('.forum-edit');
      edits.forEach(function(btn){
        btn.addEventListener('click', function(){
          var id = this.getAttribute('data-id');
          var idx = posts.findIndex(function(p){ return String(p.id) === String(id); });
          if (idx < 0) return;
          var overlay = document.createElement('div'); overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='rgba(0,0,0,0.35)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex='2300';
          var modal = document.createElement('div'); modal.style.background='#fff'; modal.style.borderRadius='12px'; modal.style.boxShadow='0 10px 30px rgba(0,0,0,0.15)'; modal.style.width='92%'; modal.style.maxWidth='520px'; modal.style.padding='22px';
          var t = document.createElement('input'); t.type='text'; t.value=posts[idx].title; t.style.cssText='width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
          var b = document.createElement('textarea'); b.value=posts[idx].body; b.style.cssText='width:100%;min-height:120px;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
          var c = document.createElement('input'); c.type='text'; c.value=posts[idx].cat; c.style.cssText='width:100%;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
          var save = document.createElement('button'); save.textContent='Save Changes'; save.style.cssText='width:100%;padding:12px;background:#1853b2;color:#fff;border:none;border-radius:8px;font-weight:700;';
          var close = document.createElement('button'); close.textContent='Close'; close.style.cssText='width:100%;padding:10px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;margin-top:10px;';
          save.addEventListener('click', function(){ posts[idx].title=t.value; posts[idx].body=b.value; posts[idx].cat=c.value || posts[idx].cat; try { localStorage.setItem('sru_forum_posts', JSON.stringify(posts)); } catch(e) {} setCookie('sru_forum_posts', JSON.stringify(posts)); document.body.removeChild(overlay); renderGrid(); });
          close.addEventListener('click', function(){ document.body.removeChild(overlay); });
          modal.appendChild(t); modal.appendChild(b); modal.appendChild(c); modal.appendChild(save); modal.appendChild(close); overlay.appendChild(modal); document.body.appendChild(overlay);
        });
      });
      var replies = grid.querySelectorAll('.forum-reply');
      replies.forEach(function(btn){
        btn.addEventListener('click', function(){
          var id = this.getAttribute('data-id');
          var idx = posts.findIndex(function(p){ return String(p.id) === String(id); });
          if (idx < 0) return;
          var overlay = document.createElement('div'); overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='rgba(0,0,0,0.35)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex='2300';
          var modal = document.createElement('div'); modal.style.background='#fff'; modal.style.borderRadius='12px'; modal.style.boxShadow='0 10px 30px rgba(0,0,0,0.15)'; modal.style.width='92%'; modal.style.maxWidth='520px'; modal.style.padding='22px';
          var ta = document.createElement('textarea'); ta.placeholder='Write your reply'; ta.style.cssText='width:100%;min-height:120px;padding:12px;margin:8px 0;border:1px solid #d1d7e4;border-radius:8px;';
          var postBtn = document.createElement('button'); postBtn.textContent='Post Reply'; postBtn.style.cssText='width:100%;padding:12px;background:#1853b2;color:#fff;border:none;border-radius:8px;font-weight:700;';
          var close = document.createElement('button'); close.textContent='Close'; close.style.cssText='width:100%;padding:10px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;margin-top:10px;';
          postBtn.addEventListener('click', function(){ var txt=(ta.value||'').trim(); if(!txt) return; if(!Array.isArray(posts[idx].comments)) posts[idx].comments=[]; posts[idx].comments.push({ by: siteAuth && siteAuth.user ? siteAuth.user.email : 'Student', text: txt, at: Date.now() }); posts[idx].replies = (posts[idx].replies||0)+1; try { localStorage.setItem('sru_forum_posts', JSON.stringify(posts)); } catch(e) {} setCookie('sru_forum_posts', JSON.stringify(posts)); document.body.removeChild(overlay); renderGrid(); });
          close.addEventListener('click', function(){ document.body.removeChild(overlay); });
          modal.appendChild(ta); modal.appendChild(postBtn); modal.appendChild(close); overlay.appendChild(modal); document.body.appendChild(overlay);
        });
      });
    }
    renderGrid();
    section.querySelectorAll('.forum-cat').forEach(function(btn){ btn.addEventListener('click', function(){ activeCat = this.getAttribute('data-cat'); renderGrid(); }); });
    searchInput.addEventListener('input', renderGrid);
    var createBtn = section.querySelector('#createPostBtn');
    createBtn.addEventListener('click', function(){
      var title = prompt('Post title'); if (!title) return;
      var body = prompt('Post body'); if (!body) return;
      var cat = prompt('Category (Academics/Clubs/Careers/General)') || 'General';
      var id = Date.now();
      posts.unshift({ id: id, title: title, body: body, by: (siteAuth && siteAuth.user ? siteAuth.user.email : 'Student'), replies: 0, cat: cat, comments: [] });
      try { localStorage.setItem('sru_forum_posts', JSON.stringify(posts)); } catch(e) {}
      setCookie('sru_forum_posts', JSON.stringify(posts));
      renderGrid();
    });
    var manageBtn = section.querySelector('#manageForumUsersBtn');
    if (manageBtn) {
      manageBtn.addEventListener('click', function(){
        var overlay = document.createElement('div'); overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.background='rgba(0,0,0,0.35)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; overlay.style.zIndex='2200';
        var modal = document.createElement('div'); modal.style.background='#fff'; modal.style.borderRadius='12px'; modal.style.boxShadow='0 10px 30px rgba(0,0,0,0.15)'; modal.style.width='92%'; modal.style.maxWidth='520px'; modal.style.padding='22px';
        var title = document.createElement('div'); title.textContent='Manage Forum Users'; title.style.fontSize='22px'; title.style.fontWeight='700'; title.style.color='#164d9a'; title.style.marginBottom='14px';
        var list = document.createElement('div');
        var users = []; try { users = JSON.parse(localStorage.getItem('sru_forum_users') || '[]'); } catch(e) { users = []; }
        if (!users.length) { var cu = getCookie('sru_forum_users'); if (cu) { try { users = JSON.parse(decodeURIComponent(cu)); } catch(e) { users = []; } } }
        function renderList(){
          list.innerHTML='';
          if (!users.length) { var empty=document.createElement('div'); empty.textContent='No forum users.'; empty.style.color='#666'; list.appendChild(empty); }
          else {
            users.forEach(function(u, idx){
              var row=document.createElement('div'); row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='8px 0';
              var info=document.createElement('div'); info.textContent = u.name + ' — ' + u.email; info.style.color='#222b38';
              var del=document.createElement('button'); del.textContent='Remove'; del.style.cssText='padding:8px 14px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;';
              del.addEventListener('click', function(){ users.splice(idx,1); localStorage.setItem('sru_forum_users', JSON.stringify(users)); setCookie('sru_forum_users', JSON.stringify(users)); renderList(); });
              row.appendChild(info); row.appendChild(del); list.appendChild(row);
            });
          }
        }
        renderList();
        var close=document.createElement('button'); close.textContent='Close'; close.style.cssText='width:100%;padding:10px;background:#f1f5fb;color:#123b79;border:1px solid #d1d7e4;border-radius:8px;margin-top:10px;';
        close.addEventListener('click', function(){ document.body.removeChild(overlay); });
        modal.appendChild(title); modal.appendChild(list); modal.appendChild(close); overlay.appendChild(modal); document.body.appendChild(overlay);
      });
    }
  }

  if (!siteAuth || !siteAuth.user) { window.location.replace('index.html'); return; }
  if (isAdmin || forumAuth) renderFull(); else renderPreviewPage();
});