document.addEventListener("DOMContentLoaded",function(){
let current=0;const slides=document.querySelectorAll('.tk-h-slide');const total=slides.length;
const nextHeroBtn=document.querySelector('.tk-h-next');const prevHeroBtn=document.querySelector('.tk-h-prev');
if(!total||!nextHeroBtn||!prevHeroBtn){return;}
function showSlide(index){slides.forEach(s=>s.classList.remove('active'));slides[index].classList.add('active');}
nextHeroBtn.addEventListener('click',function(){current=(current+1)%total;showSlide(current);});
prevHeroBtn.addEventListener('click',function(){current=(current-1+total)%total;showSlide(current);});
setInterval(function(){current=(current+1)%total;showSlide(current);},6000);
});

document.addEventListener("DOMContentLoaded", async function(){
    if (!window.TikuraDB) {
        return;
    }

    const courses = await window.TikuraDB.getCourses();
    const track = document.getElementById("tkCursosTrack");
    const acervo = document.querySelector(".tk-acervo-grid");

    if (track && courses.length) {
        track.innerHTML = courses.map(renderCarouselCourse).join("");
    }

    if (acervo && courses.length) {
        acervo.innerHTML = courses.map(renderAcervoCourse).join("");
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const track = document.getElementById("tkCursosTrack");
    const prevBtn = document.querySelector(".tk-car-prev");
    const nextBtn = document.querySelector(".tk-car-next");

    if(track && prevBtn && nextBtn) {
        track.querySelectorAll(".tk-car-card").forEach((card) => {
            card.setAttribute("role", "link");
            card.setAttribute("tabindex", "0");
            card.addEventListener("click", () => {
                window.location.href = "checkout.html";
            });
            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.location.href = "checkout.html";
                }
            });
        });

        nextBtn.addEventListener("click", () => {
            const cardWidth = track.querySelector(".tk-car-card").offsetWidth + 20;
            track.scrollBy({ left: cardWidth * 2, behavior: "smooth" });
        });
        prevBtn.addEventListener("click", () => {
            const cardWidth = track.querySelector(".tk-car-card").offsetWidth + 20;
            track.scrollBy({ left: -(cardWidth * 2), behavior: "smooth" });
        });
    }
});

function renderCarouselCourse(course) {
    const db = window.TikuraDB;
    return `
        <a class="tk-car-card" href="${db.escapeHtml(course.href)}">
            <img src="${db.escapeHtml(course.image_url)}" alt="${db.escapeHtml(course.title)}" class="tk-car-img">
            <div class="tk-car-overlay">
                <div class="tk-car-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
                <div class="tk-car-meta">${db.escapeHtml(course.title)}</div>
            </div>
        </a>
    `;
}

function renderAcervoCourse(course) {
    const db = window.TikuraDB;
    return `
        <a href="${db.escapeHtml(course.href)}" class="tk-acervo-card">
            <img src="${db.escapeHtml(course.image_url)}" alt="${db.escapeHtml(course.title)}" class="tk-acervo-img">
            <div class="tk-acervo-overlay"><div class="tk-acervo-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>
        </a>
    `;
}
