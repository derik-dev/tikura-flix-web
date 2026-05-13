(async () => {
    const cfg = window.TIKURA_SUPABASE;
    if (!cfg) { console.error('Supabase config não encontrada.'); return; }

    const supabase = window.TikuraDB ? window.TikuraDB.getClient() : window.supabase.createClient(cfg.url, cfg.anonKey);

    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { location.href = 'login.html'; return; }

    const meta = user.user_metadata || {};
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

    const name = (profile && profile.full_name) || meta.full_name || meta.name || '';
    const email = user.email || '';

    const initials = name
        ? name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : email[0].toUpperCase();

    document.getElementById('conta-avatar-initials').textContent = initials;
    document.getElementById('conta-display-name').textContent = name || email;
    document.getElementById('conta-display-email').textContent = email;
    document.getElementById('conta-email').value = email;
    document.getElementById('conta-nome').value = name;

    // Salvar perfil
    document.getElementById('conta-form-perfil').addEventListener('submit', async e => {
        e.preventDefault();
        const status = document.getElementById('conta-status-perfil');
        const novoNome = document.getElementById('conta-nome').value.trim();
        const senha = document.getElementById('conta-senha').value;
        const senhaConfirm = document.getElementById('conta-senha-confirm').value;

        if (senha && senha !== senhaConfirm) {
            showStatus(status, 'As senhas não coincidem.', 'err');
            return;
        }

        const updates = { data: { full_name: novoNome } };
        if (senha) updates.password = senha;

        const { error: updateErr } = await supabase.auth.updateUser(updates);
        if (updateErr) {
            showStatus(status, updateErr.message, 'err');
            return;
        }

        await supabase
            .from('profiles')
            .update({ full_name: novoNome })
            .eq('id', user.id);

        const novasIniciais = novoNome
            ? novoNome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
            : initials;

        document.getElementById('conta-display-name').textContent = novoNome || email;
        document.getElementById('conta-avatar-initials').textContent = novasIniciais;
        document.getElementById('conta-senha').value = '';
        document.getElementById('conta-senha-confirm').value = '';
        showStatus(status, 'Dados atualizados com sucesso!', 'ok');
    });

    // Logout
    document.getElementById('conta-logout').addEventListener('click', async () => {
        await supabase.auth.signOut();
        location.href = 'login.html';
    });

    function showStatus(el, msg, type) {
        el.textContent = msg;
        el.className = 'conta-status ' + type;
        el.hidden = false;
        setTimeout(() => { el.hidden = true; }, 4000);
    }
})();
