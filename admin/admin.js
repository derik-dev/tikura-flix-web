(() => {
    let sb = null;
    let currentUser = null;
    let allCourses = [];

    function withTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]);
    }

    // ── Bootstrap ───────────────────────────────────────────────
    const STORAGE_KEY = 'sb-xmywdzyzpcxjaxmirsig-auth-token';

    function setStatus(msg) {
        const el = document.getElementById('load-status');
        if (el) el.textContent = msg;
    }

    function readLocalSession() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            const session = parsed?.access_token ? parsed : parsed?.currentSession ?? null;
            if (!session?.access_token) return null;
            if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) return null;
            return session;
        } catch { return null; }
    }

    async function init() {
        try {
            const cfg = window.TIKURA_SUPABASE;
            if (!cfg) { showError('supabase-config.js não encontrado.'); return; }
            if (!window.supabase) { showError('Supabase SDK não carregou. Verifique sua conexão.'); return; }

            setStatus('Verificando sessão…');

            // Read session instantly from localStorage — no network call
            const localSession = readLocalSession();
            if (!localSession) {
                setStatus('Sem sessão — redirecionando…');
                setTimeout(() => { location.href = '../login.html'; }, 800);
                return;
            }

            const user = localSession.user;
            if (!user?.id) {
                setStatus('Sessão inválida — redirecionando…');
                setTimeout(() => { location.href = '../login.html'; }, 800);
                return;
            }

            setStatus('Verificando permissões…');

            sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
                auth: { persistSession: true, autoRefreshToken: true }
            });

            const { data: profile, error: profileErr } = await withTimeout(
                sb.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle(),
                8000
            );

            if (profileErr) {
                showError('Erro ao verificar permissões: ' + profileErr.message);
                return;
            }

            if (!profile) {
                showError('Perfil não encontrado.', true);
                return;
            }

            const isAdmin = profile.role === 'admin' || user.email === 'derikgomesfilho@gmail.com';
            if (!isAdmin) {
                showDenied();
                return;
            }

            currentUser = user;
            showAdmin(user, profile);
            loadDashboard();

        } catch (err) {
            if (err.message === 'timeout') {
                showError('Tempo limite excedido. <a href="../login.html">Faça login novamente</a>.');
            } else {
                showError('Erro inesperado: ' + err.message);
            }
        }
    }

    function showError(msg, redirectLogin = false) {
        document.getElementById('screen-loading').hidden = true;
        const denied = document.getElementById('screen-denied');
        denied.hidden = false;
        denied.querySelector('p').innerHTML = msg;
        if (redirectLogin) {
            setTimeout(() => { location.href = '../login.html'; }, 2000);
        }
    }

    function showDenied() {
        document.getElementById('screen-loading').hidden = true;
        document.getElementById('screen-denied').hidden = false;
    }

    function showAdmin(user, profile) {
        document.getElementById('screen-loading').hidden = true;
        document.getElementById('screen-admin').hidden = false;

        const name = profile.full_name || user.email;
        const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
        document.getElementById('adm-avatar').textContent = initials;
        document.getElementById('adm-user-name').textContent = name;
        document.getElementById('adm-user-email').textContent = user.email;

        bindNav();
        bindCursos();
        bindConfig();
        loadWebhookUrl();

        document.getElementById('adm-logout').addEventListener('click', async () => {
            await sb.auth.signOut();
            location.href = '../login.html';
        });
    }

    // ── Navegação ────────────────────────────────────────────────
    function bindNav() {
        document.querySelectorAll('.adm-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.adm-nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showSection(btn.dataset.section);
            });
        });
    }

    function showSection(name) {
        document.querySelectorAll('.adm-section').forEach(s => s.hidden = true);

        if (name === 'dashboard') {
            document.getElementById('section-dashboard').hidden = false;
            loadDashboard();
        } else if (name === 'cursos') {
            document.getElementById('section-cursos').hidden = false;
            loadCursos();
        } else if (name === 'pedidos') {
            document.getElementById('section-pedidos').hidden = false;
            loadPedidos();
        } else if (name === 'config') {
            document.getElementById('section-config').hidden = false;
        }
    }

    // ── Dashboard ────────────────────────────────────────────────
    async function loadDashboard() {
        const [
            { count: totalCursos },
            { count: publicados },
            { count: alunos },
            { count: pedidos },
            { data: recentes }
        ] = await Promise.all([
            sb.from('courses').select('id', { count: 'exact', head: true }),
            sb.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published'),
            sb.from('profiles').select('id', { count: 'exact', head: true }),
            sb.from('checkout_orders').select('id', { count: 'exact', head: true }),
            sb.from('courses').select('id,slug,title,status,sort_order,featured').order('sort_order').limit(8)
        ]);

        document.getElementById('stat-total-cursos').textContent = totalCursos ?? '—';
        document.getElementById('stat-publicados').textContent = publicados ?? '—';
        document.getElementById('stat-alunos').textContent = alunos ?? '—';
        document.getElementById('stat-pedidos').textContent = pedidos ?? '—';

        const wrap = document.getElementById('dash-cursos-list');
        allCourses = recentes || [];
        wrap.innerHTML = allCourses.length ? renderCoursesTable(allCourses, true) : '<p class="adm-empty">Nenhum curso encontrado.</p>';
        bindTableActions(wrap);
    }

    // ── Cursos ───────────────────────────────────────────────────
    async function loadCursos() {
        const wrap = document.getElementById('cursos-list');
        wrap.innerHTML = '<p class="adm-empty">Carregando…</p>';

        const { data } = await sb
            .from('courses')
            .select('id,slug,title,status,sort_order,featured,category')
            .order('sort_order');

        allCourses = data || [];
        wrap.innerHTML = allCourses.length
            ? renderCoursesTable(allCourses, false)
            : '<p class="adm-empty">Nenhum curso encontrado.</p>';
        bindTableActions(wrap);
    }

    function renderCoursesTable(courses, compact) {
        const rows = courses.map(c => `
            <tr>
                <td><strong>${esc(c.title)}</strong><br><small style="color:rgba(255,255,255,0.3)">${esc(c.slug || '—')}</small></td>
                ${compact ? '' : `<td>${esc(c.category || '—')}</td>`}
                <td><span class="adm-badge adm-badge-${c.status === 'published' ? 'published' : 'draft'}">${c.status === 'published' ? 'Publicado' : 'Rascunho'}</span></td>
                <td>${c.sort_order ?? '—'}</td>
                <td>
                    <div class="adm-table-actions">
                        <button class="btn btn-ghost btn-sm" data-action="editar" data-id="${esc(c.id)}">Editar</button>
                        <button class="btn ${c.status === 'published' ? 'btn-ghost' : 'btn-primary'} btn-sm"
                            data-action="${c.status === 'published' ? 'despublicar' : 'publicar'}"
                            data-id="${esc(c.id)}">
                            ${c.status === 'published' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button class="btn btn-danger btn-sm" data-action="excluir" data-id="${esc(c.id)}">Excluir</button>
                    </div>
                </td>
            </tr>
        `).join('');

        return `<table class="adm-table">
            <thead><tr>
                <th>Curso</th>
                ${compact ? '' : '<th>Categoria</th>'}
                <th>Status</th>
                <th>Ordem</th>
                <th>Ações</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    function bindTableActions(wrap) {
        wrap.addEventListener('click', async e => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const { action, id } = btn.dataset;

            if (action === 'editar') openFormEditar(id);
            else if (action === 'publicar') await toggleStatus(id, 'published', btn);
            else if (action === 'despublicar') await toggleStatus(id, 'draft', btn);
            else if (action === 'excluir') await excluirCurso(id);
        });
    }

    async function toggleStatus(id, novoStatus, btn) {
        btn.disabled = true;
        btn.textContent = 'Aguarde…';

        const course = allCourses.find(c => c.id === id);
        const { error } = await sb.from('courses').update({ status: novoStatus }).eq('id', id);

        if (error) { alert('Erro ao atualizar status: ' + error.message); btn.disabled = false; return; }

        if (novoStatus === 'published' && course) {
            const full = await sb.from('courses').select('*').eq('id', id).maybeSingle();
            await fireWebhook('course.published', full.data || course);
        }

        const section = document.querySelector('.adm-nav-item.active').dataset.section;
        section === 'dashboard' ? loadDashboard() : loadCursos();
    }

    async function excluirCurso(id) {
        if (!confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) return;
        const { error } = await sb.from('courses').delete().eq('id', id);
        if (error) { alert('Erro: ' + error.message); return; }
        loadCursos();
    }

    // ── Form curso ───────────────────────────────────────────────
    function bindCursos() {
        document.getElementById('btn-novo-curso').addEventListener('click', openFormNovo);
        document.getElementById('btn-voltar-cursos').addEventListener('click', () => {
            document.getElementById('section-curso-form').hidden = true;
            document.getElementById('section-cursos').hidden = false;
        });
        document.getElementById('btn-salvar-rascunho').addEventListener('click', () => saveCurso('draft'));
        document.getElementById('curso-form').addEventListener('submit', e => {
            e.preventDefault();
            saveCurso('published');
        });

        document.getElementById('curso-titulo').addEventListener('input', e => {
            const slug = e.target.value.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
            if (!document.getElementById('curso-id').value) {
                document.getElementById('curso-slug').value = slug;
            }
        });
    }

    function openFormNovo() {
        document.getElementById('form-titulo-pagina').textContent = 'Novo curso';
        document.getElementById('curso-id').value = '';
        document.getElementById('curso-form').reset();
        hideFormStatus();
        showCursoForm();
    }

    async function openFormEditar(id) {
        const { data: curso } = await sb.from('courses').select('*').eq('id', id).maybeSingle();
        if (!curso) return;

        document.getElementById('form-titulo-pagina').textContent = 'Editar curso';
        document.getElementById('curso-id').value = curso.id;
        document.getElementById('curso-titulo').value = curso.title || '';
        document.getElementById('curso-slug').value = curso.slug || '';
        document.getElementById('curso-descricao').value = curso.description || '';
        document.getElementById('curso-categoria').value = curso.category || '';
        document.getElementById('curso-imagem').value = curso.image_url || '';
        document.getElementById('curso-hero').value = curso.hero_image_url || '';
        document.getElementById('curso-tags').value = (curso.tags || []).join(', ');
        document.getElementById('curso-ordem').value = curso.sort_order ?? '';
        document.getElementById('curso-status').value = curso.status || 'draft';
        document.getElementById('curso-destaque').checked = Boolean(curso.featured);
        hideFormStatus();
        showCursoForm();
    }

    function showCursoForm() {
        document.querySelectorAll('.adm-section').forEach(s => s.hidden = true);
        document.getElementById('section-curso-form').hidden = false;
    }

    async function saveCurso(targetStatus) {
        const id = document.getElementById('curso-id').value;
        const titulo = document.getElementById('curso-titulo').value.trim();
        const slug = document.getElementById('curso-slug').value.trim();

        if (!titulo || !slug) { showFormStatus('Título e slug são obrigatórios.', 'err'); return; }

        const rawTags = document.getElementById('curso-tags').value;
        const tags = rawTags.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);

        const payload = {
            title: titulo,
            slug,
            description: document.getElementById('curso-descricao').value.trim(),
            category: document.getElementById('curso-categoria').value,
            image_url: document.getElementById('curso-imagem').value.trim() || null,
            hero_image_url: document.getElementById('curso-hero').value.trim() || null,
            tags,
            sort_order: parseInt(document.getElementById('curso-ordem').value) || 0,
            featured: document.getElementById('curso-destaque').checked,
            status: targetStatus,
            instructor_name: 'Vanessa Tikura',
            instructor_avatar_url: 'http://www.tikura.com.br/wp-content/uploads/2026/02/allc.png'
        };

        const publishBtn = document.getElementById('btn-publicar');
        publishBtn.disabled = true;
        publishBtn.textContent = 'Salvando…';

        let error, data;
        if (id) {
            ({ error, data } = await sb.from('courses').update(payload).eq('id', id).select().maybeSingle());
        } else {
            ({ error, data } = await sb.from('courses').insert(payload).select().maybeSingle());
        }

        publishBtn.disabled = false;
        publishBtn.textContent = 'Publicar curso';

        if (error) { showFormStatus('Erro: ' + error.message, 'err'); return; }

        if (targetStatus === 'published' && data) {
            await fireWebhook('course.published', data);
        }

        showFormStatus(
            targetStatus === 'published' ? '✓ Curso publicado com sucesso!' : '✓ Rascunho salvo.',
            'ok'
        );

        if (id) document.getElementById('curso-id').value = data?.id || id;
        else {
            document.getElementById('curso-id').value = data?.id || '';
            document.getElementById('curso-titulo').value = data?.title || titulo;
        }
    }

    function showFormStatus(msg, type) {
        const el = document.getElementById('form-status');
        el.textContent = msg;
        el.className = 'adm-form-status ' + type;
        el.hidden = false;
        if (type === 'ok') setTimeout(() => { el.hidden = true; }, 4000);
    }

    function hideFormStatus() {
        document.getElementById('form-status').hidden = true;
    }

    // ── Pedidos ──────────────────────────────────────────────────
    async function loadPedidos() {
        const wrap = document.getElementById('pedidos-list');
        wrap.innerHTML = '<p class="adm-empty">Carregando…</p>';

        const { data } = await sb
            .from('checkout_orders')
            .select('id,full_name,email,phone,cpf,payment_method,coupon,status,created_at')
            .order('created_at', { ascending: false })
            .limit(100);

        if (!data || !data.length) {
            wrap.innerHTML = '<p class="adm-empty">Nenhum pedido recebido ainda.</p>';
            return;
        }

        const rows = data.map(o => `
            <tr>
                <td>${esc(o.full_name)}</td>
                <td>${esc(o.email)}</td>
                <td>${esc(o.phone || '—')}</td>
                <td>${esc(o.payment_method || '—')}</td>
                <td><span class="adm-badge adm-badge-${o.status === 'paid' ? 'published' : 'draft'}">${esc(o.status)}</span></td>
                <td style="font-size:0.78rem;color:rgba(255,255,255,0.4)">${new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
            </tr>
        `).join('');

        wrap.innerHTML = `<table class="adm-table">
            <thead><tr>
                <th>Nome</th><th>E-mail</th><th>Telefone</th>
                <th>Pagamento</th><th>Status</th><th>Data</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    // ── Webhook ──────────────────────────────────────────────────
    function loadWebhookUrl() {
        const saved = localStorage.getItem('tikura_webhook_url') || '';
        const input = document.getElementById('webhook-url');
        if (input) {
            input.value = saved;
            toggleWebhookTest(Boolean(saved));
        }
    }

    function bindConfig() {
        document.getElementById('btn-salvar-webhook').addEventListener('click', () => {
            const url = document.getElementById('webhook-url').value.trim();
            localStorage.setItem('tikura_webhook_url', url);
            toggleWebhookTest(Boolean(url));
            const st = document.getElementById('config-status');
            st.textContent = url ? '✓ Webhook URL salva.' : 'URL removida.';
            st.className = 'adm-form-status ok';
            st.hidden = false;
            setTimeout(() => { st.hidden = true; }, 3000);
        });

        document.getElementById('btn-testar-webhook').addEventListener('click', async () => {
            const status = document.getElementById('webhook-test-status');
            status.textContent = 'Enviando…';
            const ok = await fireWebhook('course.test', { id: 'test', slug: 'teste', title: 'Curso de Teste', status: 'published' });
            status.textContent = ok ? '✓ Enviado com sucesso!' : '✗ Falha ao enviar. Verifique a URL.';
            status.style.color = ok ? '#22c55e' : '#e50914';
        });
    }

    function toggleWebhookTest(show) {
        document.getElementById('webhook-test-area').hidden = !show;
    }

    async function fireWebhook(event, course) {
        const url = localStorage.getItem('tikura_webhook_url');
        if (!url) return true;

        const payload = {
            event,
            course: {
                id: course.id,
                slug: course.slug,
                title: course.title,
                description: course.description,
                category: course.category,
                tags: course.tags || [],
                image_url: course.image_url,
                hero_image_url: course.hero_image_url,
                featured: course.featured,
                sort_order: course.sort_order,
                status: course.status
            },
            timestamp: new Date().toISOString()
        };

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return true;
        } catch {
            return false;
        }
    }

    // ── Utils ────────────────────────────────────────────────────
    function esc(str) {
        return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    init();
})();
