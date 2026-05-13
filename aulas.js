document.addEventListener("DOMContentLoaded", async () => {
    const db = window.TikuraDB;
    const user = db ? await db.requireUser() : null;
    if (!user || !db) {
        return;
    }

    const params = new URLSearchParams(location.search);
    const slug = params.get("curso") || "imersao-das-juremas";
    const data = await db.getCourseWithLessons(slug);

    renderCourse(data);
    bindLessonPlayer(data);
});

function renderCourse(data) {
    const db = window.TikuraDB;
    const course = data.course;
    const courseTitle = document.querySelector(".aulas-course-title");
    const instructorName = document.querySelector(".aulas-instructor-name");
    const instructorAvatar = document.querySelector(".aulas-instructor-avatar");
    const modulesEl = document.getElementById("aulas-modules");

    document.title = course.title + " | Tikura Flix";

    if (courseTitle) {
        courseTitle.textContent = course.title;
    }
    if (instructorName) {
        instructorName.textContent = course.instructor_name || "Vanessa Tikura";
    }
    if (instructorAvatar) {
        instructorAvatar.src = course.instructor_avatar_url;
        instructorAvatar.alt = course.instructor_name || "Vanessa Tikura";
    }
    if (!modulesEl) {
        return;
    }

    modulesEl.innerHTML = data.modules.map((module, moduleIndex) => `
        <div class="aulas-module" data-module="${moduleIndex}">
            <button class="aulas-module-toggle" aria-expanded="${moduleIndex === 0 ? "true" : "false"}">
                <span class="aulas-module-name">${db.escapeHtml(module.title)}</span>
                <svg class="aulas-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <ul class="aulas-episode-list" role="list" ${moduleIndex === 0 ? "" : "hidden"}>
                ${module.lessons.map((lesson) => renderLessonButton(lesson, moduleIndex)).join("")}
            </ul>
        </div>
    `).join("");
}

function renderLessonButton(lesson, moduleIndex) {
    const db = window.TikuraDB;
    return `
        <li>
            <button class="aulas-ep-btn" data-lesson-id="${db.escapeHtml(lesson.id)}"
                data-title="${db.escapeHtml(lesson.title)}"
                data-desc="${db.escapeHtml(lesson.description)}"
                data-dur="${db.escapeHtml(lesson.duration_label || "")}"
                data-module="${db.escapeHtml(lesson.module_title)}"
                data-module-index="${moduleIndex}"
                data-num="Aula ${lesson.lesson_number}"
                data-thumb="${db.escapeHtml(lesson.thumbnail_url || "")}"
                data-video="${db.escapeHtml(lesson.video_url || "")}"
                data-watched="${lesson.watched ? "true" : "false"}">
                <span class="aulas-ep-num-badge">${lesson.lesson_number}</span>
                <span class="aulas-ep-info">
                    <span class="aulas-ep-name">${db.escapeHtml(lesson.title)}</span>
                    <span class="aulas-ep-time">${db.escapeHtml(lesson.duration_label || "")}</span>
                </span>
                ${lesson.watched ? '<svg class="aulas-ep-check" viewBox="0 0 24 24" aria-label="Assistido"><path d="M20 6 9 17l-5-5"/></svg>' : ""}
            </button>
        </li>
    `;
}

function bindLessonPlayer(data) {
    const thumb = document.getElementById("aulas-thumb");
    const playBtn = document.getElementById("aulas-play-btn");
    const iframe = document.getElementById("aulas-iframe");
    const epTitle = document.getElementById("aulas-ep-title");
    const epDesc = document.getElementById("aulas-ep-desc");
    const epDur = document.getElementById("aulas-ep-dur");
    const moduleLabel = document.getElementById("aulas-module-label");
    const epNum = document.getElementById("aulas-ep-num");
    const progressFill = document.getElementById("aulas-progress-fill");
    const progressText = document.querySelector(".aulas-course-progress");
    const allEpBtns = Array.from(document.querySelectorAll(".aulas-ep-btn"));
    const totalEps = allEpBtns.length;

    function updateProgress() {
        const watched = allEpBtns.filter((btn) => btn.dataset.watched === "true").length;
        const pct = totalEps ? Math.round((watched / totalEps) * 100) : 0;
        progressFill.style.width = pct + "%";
        if (progressText) {
            progressText.innerHTML = `<span id="aulas-progress-count">${watched}</span> de ${totalEps} aulas assistidas`;
        }
    }

    async function markActiveWatched() {
        const active = document.querySelector(".aulas-ep-btn.active");
        if (!active) {
            return;
        }
        active.dataset.watched = "true";
        if (!active.querySelector(".aulas-ep-check")) {
            active.insertAdjacentHTML("beforeend", '<svg class="aulas-ep-check" viewBox="0 0 24 24" aria-label="Assistido"><path d="M20 6 9 17l-5-5"/></svg>');
        }
        updateProgress();
        await window.TikuraDB.markLessonWatched(active.dataset.lessonId);
    }

    function loadEpisode(btn) {
        allEpBtns.forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");

        epTitle.textContent = btn.dataset.title;
        epDesc.textContent = btn.dataset.desc;
        epDur.textContent = btn.dataset.dur;
        moduleLabel.textContent = btn.dataset.module;
        epNum.textContent = btn.dataset.num;

        iframe.src = "";
        iframe.hidden = true;
        thumb.src = btn.dataset.thumb || data.course.image_url;
        thumb.parentElement.style.display = "";
    }

    playBtn.addEventListener("click", async () => {
        const active = document.querySelector(".aulas-ep-btn.active");
        const videoSrc = active ? active.dataset.video : "";
        if (videoSrc) {
            iframe.src = videoSrc;
            iframe.hidden = false;
            thumb.parentElement.style.display = "none";
        }
        await markActiveWatched();
    });

    allEpBtns.forEach((btn) => {
        btn.addEventListener("click", () => loadEpisode(btn));
    });

    document.querySelectorAll(".aulas-module-toggle").forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const list = toggle.nextElementSibling;
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            list.hidden = expanded;
        });
    });

    if (allEpBtns[0]) {
        loadEpisode(allEpBtns[0]);
    }
    updateProgress();
}
