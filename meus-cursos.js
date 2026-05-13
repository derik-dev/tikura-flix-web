(async () => {
    const db = window.TikuraDB;
    const user = db ? await db.requireUser() : null;
    if (!user || !db) {
        return;
    }

    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email;
    const avatar = document.getElementById("mc-avatar");
    if (avatar) {
        avatar.textContent = db.getInitials(name, user.email);
    }

    const items = await db.getMyCourses(user.id);
    renderMyCourses(items);
})();

function renderMyCourses(items) {
    const inProgressGrid = document.getElementById("mc-em-andamento");
    const completedGrid = document.querySelectorAll(".mc-grid")[1];
    const db = window.TikuraDB;

    if (!inProgressGrid || !completedGrid || !db) {
        return;
    }

    const inProgress = items.filter((item) => item.percent < 100);
    const completed = items.filter((item) => item.percent >= 100);

    inProgressGrid.innerHTML = inProgress.length
        ? inProgress.map((item) => renderCard(item)).join("")
        : '<p class="mc-card-meta">Nenhum curso em andamento.</p>';

    completedGrid.innerHTML = completed.length
        ? completed.map((item) => renderCard(item, true)).join("")
        : '<p class="mc-card-meta">Nenhum curso concluído ainda.</p>';
}

function renderCard(item, completed) {
    const db = window.TikuraDB;
    const course = item.course;
    const percent = Math.max(0, Math.min(100, item.percent || 0));

    return `
        <a href="${db.escapeHtml(course.href)}" class="mc-card">
            <div class="mc-thumb">
                <img src="${db.escapeHtml(course.image_url)}" alt="${db.escapeHtml(course.title)}">
                <div class="mc-play"><span>&#9654;</span></div>
                ${completed ? '<span class="mc-badge-done">Concluído</span>' : ""}
            </div>
            <div class="mc-card-body">
                <h3>${db.escapeHtml(course.title)}</h3>
                <p class="mc-card-meta">${db.escapeHtml(item.meta || "Continue assistindo")}</p>
                <div class="mc-progress-bar"><span style="width:${percent}%"></span></div>
                <span class="mc-pct">${percent}% concluído</span>
            </div>
        </a>
    `;
}
