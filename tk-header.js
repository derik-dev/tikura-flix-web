(() => {
    // Mark active nav link based on current page filename
    const page = location.pathname.split('/').pop() || '';
    document.querySelectorAll('.tkh-nav a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (page === href || (page === '' && href === 'cursos.html')) {
            a.classList.add('tkh-active');
        }
    });

    // Load avatar initials from Supabase session
    const cfg = window.TIKURA_SUPABASE;
    if (!cfg || !window.supabase) return;
    const sb = window.supabase.createClient(cfg.url, cfg.anonKey);
    sb.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        const meta = user.user_metadata || {};
        const name = meta.full_name || meta.name || user.email || '';
        const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
        const btn = document.getElementById('tkh-user');
        if (btn && initials) {
            btn.innerHTML = '';
            btn.style.fontSize = '0.8rem';
            btn.style.fontWeight = '700';
            btn.style.color = '#fff';
            btn.textContent = initials;
        }
    });
})();
