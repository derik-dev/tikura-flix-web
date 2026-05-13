(() => {
    // Mark active nav link based on current page filename
    const page = location.pathname.split('/').pop() || '';
    document.querySelectorAll('.tkh-nav a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (page === href || (page === '' && href === 'cursos.html')) {
            a.classList.add('tkh-active');
        }
    });

    // Load avatar from Supabase profile
    const cfg = window.TIKURA_SUPABASE;
    if (!cfg || !window.supabase) return;
    const sb = window.supabase.createClient(cfg.url, cfg.anonKey);
    sb.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        const btn = document.getElementById('tkh-user');
        if (!btn) return;

        const { data: profile } = await sb
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        if (profile && profile.avatar_url) {
            btn.innerHTML = `<img src="${profile.avatar_url}?t=${Date.now()}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            const meta = user.user_metadata || {};
            const name = (profile && profile.full_name) || meta.full_name || meta.name || user.email || '';
            const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
            btn.innerHTML = '';
            btn.style.fontSize = '0.8rem';
            btn.style.fontWeight = '700';
            btn.style.color = '#fff';
            btn.textContent = initials;
        }
    });
})();
