document.addEventListener('DOMContentLoaded', function(){
  var footer = document.createElement('footer');
  footer.className = 'sru-footer';
  footer.innerHTML = '\n    <div class="footer-content">\n      <div class="footer-left">\n        <div class="footer-brand">SRUniverse</div>\n        <div class="footer-tagline">Connecting Campus. Empowering Students.</div>\n      </div>\n      <div class="footer-center">© 2025 SRUniverse. All Rights Reserved.</div>\n      <div class="footer-links">\n        <a href="#">Facebook</a>\n        <a href="#">Instagram</a>\n        <a href="https://sru.edu.in/" target="_blank" rel="noopener">SRU Website</a>\n        <a href="https://www.linkedin.com/school/sr-university/about/?lipi=urn%3Ali%3Apage%3Aschools_school_index%3B727f699b-7930-4bc3-a9b5-37684abefa39" target="_blank" rel="noopener">LinkedIn</a>\n        <a href="#">YouTube</a>\n        <a href="#">Twitter</a>\n      </div>\n    </div>\n  ';
  document.body.appendChild(footer);

  var sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  sentinel.style.width = '100%';
  sentinel.style.position = 'relative';
  document.body.appendChild(sentinel);

  function ensurePadding(){
    document.body.style.paddingBottom = (footer.offsetHeight + 8) + 'px';
  }

  var rafId = null;
  function requestToggle(atBottom){
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function(){
      footer.classList.toggle('visible', atBottom);
      if (atBottom) ensurePadding();
    });
  }

  var io = new IntersectionObserver(function(entries){
    var entry = entries[0];
    var atBottom = entry && entry.isIntersecting;
    requestToggle(!!atBottom);
  }, { root: null, threshold: 0.01 });
  io.observe(sentinel);

  window.addEventListener('resize', ensurePadding, { passive: true });
  ensurePadding();
});