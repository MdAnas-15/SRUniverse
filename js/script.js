window.addEventListener('load', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


document.addEventListener('DOMContentLoaded', () => {
    const heroBtn = document.querySelector('.hero-btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const features = document.getElementById('features');
            if (features) features.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    const homeLink = document.querySelectorAll('.navbar-links a')[0];
    const hero = document.querySelector('.hero');
    if (homeLink && hero) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    const featureCards = document.querySelectorAll('.features-section .feature-card');
    featureCards.forEach(card => {
        const titleEl = card.querySelector('h3');
        const btn = card.querySelector('.feature-btn');
        if (titleEl && btn && /forum/i.test(titleEl.textContent || '')) {
            btn.setAttribute('href', 'forum.html');
            btn.setAttribute('target', '_blank');
        }
    });
});
