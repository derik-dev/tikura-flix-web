(async () => {
    const db = window.TikuraDB;
    const user = db ? await db.requireUser() : null;
    if (!user || !db) return;

    await Promise.all([loadPosts(user.id), loadStats()]);
})();

async function loadStats() {
    const sb = window.TikuraDB && window.TikuraDB.getClient();
    if (!sb) return;

    const [{ count: members }, { count: posts }] = await Promise.all([
        sb.from("profiles").select("id", { count: "exact", head: true }),
        sb.from("community_posts").select("id", { count: "exact", head: true })
    ]);

    const membersEl = document.getElementById("com-stat-members");
    const postsEl = document.getElementById("com-stat-posts");
    if (membersEl) membersEl.textContent = formatCount(members || 0);
    if (postsEl) postsEl.textContent = formatCount(posts || 0);
}

function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(".", ",") + "k";
    return String(n);
}

async function loadPosts(userId) {
    const db = window.TikuraDB;
    const feed = document.getElementById("com-feed-list");
    const empty = document.getElementById("com-empty");
    const skeletons = document.getElementById("com-skeletons");

    if (!feed) return;

    const posts = await db.getCommunityPosts(userId);

    if (skeletons) skeletons.hidden = true;

    if (!posts.length) {
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;

    const categories = ["Comunidade", "Juremas", "Magia", "Tarô", "Cigano", "Orixás", "Feminino"];

    posts.forEach((post, i) => {
        const cat = categories[i % categories.length];
        feed.appendChild(buildCard(post, cat));
    });
}

function buildCard(post, category) {
    const db = window.TikuraDB;
    const article = document.createElement("article");
    const authorName = post.author_name || "Tikura Flix";
    const initials = db.getInitials(authorName);

    article.className = "com-post";
    article.style.animationDelay = "0ms";
    article.dataset.postId = post.id;

    article.innerHTML = `
        <div class="com-post-header">
            <div class="com-post-avatar">${db.escapeHtml(initials)}</div>
            <div class="com-post-meta">
                <strong>${db.escapeHtml(authorName)}</strong>
                <div class="com-post-meta-row">
                    <span class="com-post-time">${db.escapeHtml(db.timeAgo(post.created_at))}</span>
                    <span class="com-post-cat">${db.escapeHtml(category)}</span>
                </div>
            </div>
        </div>
        <p class="com-post-body">${db.escapeHtml(post.body)}</p>
        <div class="com-post-footer">
            <span class="com-post-action">
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                ${post.likes_count}
            </span>
        </div>
    `;

    return article;
}
