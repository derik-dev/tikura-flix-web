document.addEventListener("DOMContentLoaded", async () => {
    const db = window.TikuraDB;
    const logo = document.querySelector(".tkh-logo");

    if (logo && db) {
        const supabaseClient = db.getClient();
        let hasActiveSession = false;

        if (supabaseClient) {
            supabaseClient.auth.getSession().then(({ data }) => {
                hasActiveSession = Boolean(data && data.session);
            });
        }

        logo.addEventListener("click", async (event) => {
            if (hasActiveSession) {
                return;
            }

            event.preventDefault();

            try {
                const { data } = await supabaseClient.auth.getSession();
                window.location.href = data && data.session ? "cursos.html" : "index.html";
            } catch (error) {
                window.location.href = "index.html";
            }
        });
    }

    if (db) {
        const courses = await db.getCourses();
        renderHero(courses[0]);
        renderRows(courses);
    }

    enhanceCourseCards();
    bindScrollControls();
});

function renderHero(course) {
    if (!course) {
        return;
    }

    const heroBg = document.querySelector(".course-hero-bg");
    const title = document.querySelector(".course-hero h1");
    const desc = document.querySelector(".course-hero p");
    const play = document.querySelector(".course-primary-btn");

    if (heroBg) {
        heroBg.style.backgroundImage = `url("${course.hero_image_url || course.image_url}")`;
    }
    if (title) {
        title.textContent = course.title;
    }
    if (desc) {
        desc.textContent = course.description || "Explore aulas completas, apostilas, rituais guiados e experiências conduzidas por Vanessa Tikura.";
    }
    if (play) {
        play.href = course.href;
    }
}

function renderRows(courses) {
    const catalog = document.getElementById("catalogo");
    if (!catalog || !courses.length || !window.TikuraDB) {
        return;
    }

    const continueCourses = courses.slice(0, 5);
    const featuredCourses = courses.filter((course) => course.featured).concat(courses.filter((course) => !course.featured)).slice(0, 10);

    catalog.innerHTML = [
        renderRow("Continuar explorando", continueCourses, false),
        renderRow("Cursos em destaque", featuredCourses, true)
    ].join("");
}

function renderRow(title, courses, large) {
    return `
        <div class="course-row">
            <div class="course-row-head">
                <h2>${window.TikuraDB.escapeHtml(title)}</h2>
                <div class="course-row-controls">
                    <button type="button" class="course-scroll-btn" data-scroll="prev" aria-label="Voltar lista">&#10094;</button>
                    <button type="button" class="course-scroll-btn" data-scroll="next" aria-label="Avancar lista">&#10095;</button>
                </div>
            </div>
            <div class="course-track">
                ${courses.map((course) => renderCard(course, large)).join("")}
            </div>
        </div>
    `;
}

function renderCard(course, large) {
    const safeTitle = window.TikuraDB.escapeHtml(course.title);
    const safeImage = window.TikuraDB.escapeHtml(course.image_url);
    const safeHref = window.TikuraDB.escapeHtml(course.href);
    const classes = large ? "course-card large" : "course-card";

    return `
        <a href="${safeHref}" class="${classes}" data-course-slug="${window.TikuraDB.escapeHtml(course.slug)}">
            <img src="${safeImage}" alt="${safeTitle}">
            <div class="course-play"><span class="course-play-icon">&#9654;</span></div>
        </a>
    `;
}

function enhanceCourseCards() {
    document.querySelectorAll(".course-card").forEach((card) => {
        if (card.querySelector(".course-hover-panel")) {
            return;
        }

        const image = card.querySelector("img");
        const title = image ? image.alt : "Curso Tikura Flix";
        const safeTitle = window.TikuraDB ? window.TikuraDB.escapeHtml(title) : title;
        const panel = document.createElement("div");

        panel.className = "course-hover-panel";
        panel.setAttribute("aria-hidden", "true");
        panel.innerHTML = `
            <div class="course-hover-actions">
                <span class="course-hover-action course-hover-play" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </span>
                <span class="course-hover-action" aria-hidden="true">+</span>
                <span class="course-hover-action" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M7 11v9H4v-9h3z"/><path d="M7 11l4-7c.4-.7 1.5-.5 1.6.3l.4 3.7h5.3c1.1 0 1.9 1 1.7 2.1l-1.2 7.2c-.2 1-1 1.7-2 1.7H7"/></svg>
                </span>
                <span class="course-hover-action course-hover-more" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                </span>
            </div>
            <strong class="course-hover-title">${safeTitle}</strong>
            <div class="course-hover-meta">
                <span class="course-hover-rating">A16</span>
                <span>modulos</span>
                <span class="course-hover-hd">HD</span>
            </div>
            <p class="course-hover-tags">
                <span>Espiritualidade</span>
                <span>Vivencias</span>
                <span>Praticas guiadas</span>
            </p>
        `;

        card.appendChild(panel);
    });
}

function bindScrollControls() {
    document.querySelectorAll(".course-row").forEach((row) => {
        const track = row.querySelector(".course-track");
        const prev = row.querySelector("[data-scroll='prev']");
        const next = row.querySelector("[data-scroll='next']");

        if (!track || !prev || !next) {
            return;
        }

        const scrollCards = (direction) => {
            const firstCard = track.querySelector(".course-card");
            const distance = firstCard ? firstCard.offsetWidth * 2 : 600;

            track.scrollBy({
                left: direction * distance,
                behavior: "smooth"
            });
        };

        prev.addEventListener("click", () => scrollCards(-1));
        next.addEventListener("click", () => scrollCards(1));
    });
}
