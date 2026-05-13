const FILTER_MAP = {
    imersao: ["imersao"],
    cigano: ["cigano"],
    magia: ["magia", "bruxaria"],
    juremas: ["juremas"],
    tarot: ["tarot"]
};

let activeFilter = "todos";
let activeQuery = "";
let courses = [];

(async () => {
    const db = window.TikuraDB;
    const user = db ? await db.requireUser() : null;
    if (!user || !db) {
        return;
    }

    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email;
    const avatar = document.getElementById("ps-avatar");
    if (avatar) {
        avatar.textContent = db.getInitials(name, user.email);
    }

    courses = await db.getCourses();

    const input = document.getElementById("ps-input");
    const clearBtn = document.getElementById("ps-clear");

    input.addEventListener("input", () => {
        activeQuery = input.value.trim().toLowerCase();
        clearBtn.hidden = !activeQuery;
        render();
    });

    clearBtn.addEventListener("click", () => {
        input.value = "";
        activeQuery = "";
        clearBtn.hidden = true;
        render();
        input.focus();
    });

    document.querySelectorAll(".ps-filter").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".ps-filter").forEach((item) => item.classList.remove("active"));
            btn.classList.add("active");
            activeFilter = btn.dataset.filter;
            render();
        });
    });

    render();
})();

function render() {
    const db = window.TikuraDB;
    const empty = document.getElementById("ps-empty-state");
    const noRes = document.getElementById("ps-no-results");
    const results = document.getElementById("ps-results");
    const grid = document.getElementById("ps-grid");
    const countEl = document.getElementById("ps-results-count");

    if (!activeQuery) {
        empty.hidden = false;
        noRes.hidden = true;
        results.hidden = true;
        return;
    }

    const filtered = courses.filter((course) => {
        const title = course.title.toLowerCase();
        const tags = course.tags || [];
        const matchQuery = title.includes(activeQuery) || tags.some((tag) => tag.toLowerCase().includes(activeQuery));
        const matchFilter = activeFilter === "todos" || (FILTER_MAP[activeFilter] || []).some((tag) => tags.includes(tag));
        return matchQuery && matchFilter;
    });

    empty.hidden = true;

    if (!filtered.length) {
        noRes.hidden = false;
        results.hidden = true;
        document.getElementById("ps-no-results-term").textContent = activeQuery;
        return;
    }

    noRes.hidden = true;
    results.hidden = false;
    countEl.textContent = `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`;

    grid.innerHTML = filtered.map((course) => `
        <a href="${db.escapeHtml(course.href)}" class="ps-card">
            <div class="ps-card-thumb">
                <img src="${db.escapeHtml(course.image_url)}" alt="${db.escapeHtml(course.title)}">
                <div class="ps-card-play"><span>&#9654;</span></div>
            </div>
            <div class="ps-card-body">
                <h3>${db.escapeHtml(course.title)}</h3>
                <span class="ps-card-tag">${db.escapeHtml(course.category)}</span>
            </div>
        </a>
    `).join("");
}
