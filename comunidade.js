(async () => {
    const db = window.TikuraDB;
    const user = db ? await db.requireUser() : null;
    if (!user || !db) {
        return;
    }

    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email;
    const initials = db.getInitials(name, user.email);

    const avatar = document.getElementById("com-avatar") || document.getElementById("tkh-user");
    if (avatar) {
        avatar.textContent = initials;
    }
})();
