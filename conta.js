(async () => {
    const cfg = window.TIKURA_SUPABASE;
    if (!cfg) { console.error('Supabase config não encontrada.'); return; }

    const supabase = window.TikuraDB ? window.TikuraDB.getClient() : window.supabase.createClient(cfg.url, cfg.anonKey);

    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { location.href = 'login.html'; return; }

    const meta = user.user_metadata || {};
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

    const name = (profile && profile.full_name) || meta.full_name || meta.name || '';
    const email = user.email || '';

    const initials = name
        ? name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : (email[0] || '?').toUpperCase();

    document.getElementById('conta-avatar-initials').textContent = initials;
    document.getElementById('conta-display-name').textContent = name || email;
    document.getElementById('conta-display-email').textContent = email;
    document.getElementById('conta-email').value = email;
    document.getElementById('conta-nome').value = name;

    if (profile && profile.avatar_url) {
        setAvatarPhoto(profile.avatar_url + '?t=' + Date.now());
    }

    // ── Cropper ──────────────────────────────────────────────────
    const avatarInput = document.getElementById('conta-avatar-input');
    const avatarWrap  = avatarInput.closest('.conta-avatar-wrap');
    const cropModal   = document.getElementById('crop-modal');
    const cropSource  = document.getElementById('crop-source');
    let cropperInstance = null;

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        avatarInput.value = '';
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 10 MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = e => openCropper(e.target.result);
        reader.readAsDataURL(file);
    });

    function openCropper(src) {
        cropSource.src = src;
        cropModal.hidden = false;
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            cropperInstance = new Cropper(cropSource, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                background: false,
            });
        }, 80);
    }

    function closeCropper() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        cropModal.hidden = true;
        cropSource.src = '';
        document.body.style.overflow = '';
    }

    document.getElementById('crop-cancel-btn').addEventListener('click', closeCropper);

    document.getElementById('crop-confirm-btn').addEventListener('click', () => {
        if (!cropperInstance) return;
        const canvas = cropperInstance.getCroppedCanvas({ width: 400, height: 400 });
        closeCropper();
        canvas.toBlob(blob => uploadAvatarBlob(blob), 'image/jpeg', 0.92);
    });

    async function uploadAvatarBlob(blob) {
        avatarWrap.classList.add('uploading');
        const path = `${user.id}/avatar.jpg`;

        const { error: uploadErr } = await supabase.storage
            .from('avatars')
            .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

        if (uploadErr) {
            avatarWrap.classList.remove('uploading');
            alert('Erro ao enviar imagem: ' + uploadErr.message);
            return;
        }

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        const cleanUrl = urlData.publicUrl;

        const { error: dbErr } = await supabase
            .from('profiles')
            .upsert({ id: user.id, avatar_url: cleanUrl }, { onConflict: 'id' });

        if (dbErr) {
            avatarWrap.classList.remove('uploading');
            alert('Erro ao salvar foto no perfil: ' + dbErr.message);
            return;
        }

        setAvatarPhoto(cleanUrl + '?t=' + Date.now());
        avatarWrap.classList.remove('uploading');
    }

    function setAvatarPhoto(url) {
        const img       = document.getElementById('conta-avatar-img');
        const initEl    = document.getElementById('conta-avatar-initials');
        const headerBtn = document.getElementById('tkh-user');

        img.src = url;
        img.hidden = false;
        initEl.hidden = true;

        if (headerBtn) {
            headerBtn.innerHTML = `<img src="${url}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
    }

    // ── Salvar perfil ────────────────────────────────────────────
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
        if (updateErr) { showStatus(status, updateErr.message, 'err'); return; }

        await supabase.from('profiles').update({ full_name: novoNome }).eq('id', user.id);

        const novasIniciais = novoNome
            ? novoNome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
            : initials;

        document.getElementById('conta-display-name').textContent = novoNome || email;
        document.getElementById('conta-avatar-initials').textContent = novasIniciais;
        document.getElementById('conta-senha').value = '';
        document.getElementById('conta-senha-confirm').value = '';
        showStatus(status, 'Dados atualizados com sucesso!', 'ok');
    });

    // ── Logout ───────────────────────────────────────────────────
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
