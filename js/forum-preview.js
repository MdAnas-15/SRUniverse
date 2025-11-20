document.addEventListener('DOMContentLoaded', function() {
  var container = document.querySelector('.features-section');
  if (!container) return;
  var auth = null;
  try { auth = JSON.parse(localStorage.getItem('sru_auth')); } catch(e) { auth = null; }
  var isAdmin = !!(auth && auth.role === 'admin');
  var data = [];
  try { data = JSON.parse(localStorage.getItem('sru_forum_preview') || '[]'); } catch(e) { data = []; }
  if (!Array.isArray(data) || data.length === 0) {
    data = [
      { id: Date.now(), title: 'Best resources for Python beginners?', body: 'Share your favourite YouTube channels or courses to learn Python from scratch.', by: 'Anjali', replies: 5 },
      { id: Date.now()+1, title: 'Tips for exam preparation', body: 'How do you organize notes and revision in the last week?', by: 'Rahul', replies: 8 },
      { id: Date.now()+2, title: 'Which clubs are best for first-years?', body: 'Looking for beginner-friendly clubs to join this semester.', by: 'Sara', replies: 3 }
    ];
    try { localStorage.setItem('sru_forum_preview', JSON.stringify(data)); } catch(e) {}
  }
  var section = document.createElement('section');
  section.className = 'forum-preview';
  section.innerHTML = '\n    <div class="forum-header">\n      <h2>SRU Forum</h2>\n      <p>Connect with students and faculty. Ask questions, share knowledge, and stay engaged with your campus.</p>\n    </div>\n    <div class="forum-grid" id="forumPreviewGrid"></div>\n    <div class="forum-cta">\n      <a href="forum.html" class="join-forum-btn">Join the Forum →</a>\n    </div>\n  ';
  container.appendChild(section);
  var grid = section.querySelector('#forumPreviewGrid');
  function render() {
    grid.innerHTML = '';
    data.forEach(function(item){
      var card = document.createElement('div');
      card.className = 'forum-card';
      card.innerHTML = '\n        <div class="forum-title">' + item.title + '</div>\n        <div class="forum-body">' + item.body + '</div>\n        <div class="forum-meta">Posted by: ' + item.by + ' | ' + item.replies + ' replies</div>\n        ' + (isAdmin ? ('<button class="forum-del admin-only" data-id="'+item.id+'">Delete</button>') : '') + '\n      ';
      grid.appendChild(card);
    });
    if (isAdmin) {
      var dels = grid.querySelectorAll('.forum-del');
      dels.forEach(function(btn){
        btn.addEventListener('click', function(){
          var id = this.getAttribute('data-id');
          data = data.filter(function(x){ return String(x.id) !== String(id); });
          try { localStorage.setItem('sru_forum_preview', JSON.stringify(data)); } catch(e) {}
          render();
        });
      });
    }
  }
  render();
});