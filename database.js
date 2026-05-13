(function () {
    const IMAGE_BASE = "http://www.tikura.com.br/wp-content/uploads/2026/02/";
    const INSTRUCTOR_AVATAR = IMAGE_BASE + "allc.png";
    const DEFAULT_THUMBNAIL_URL = "https://img.youtube.com/vi/RylLBe8yAwc/hqdefault.jpg";
    const DEFAULT_VIDEO_URL = "https://www.youtube.com/embed/RylLBe8yAwc?autoplay=1";

    const fallbackCourses = [
        { slug: "imersao-das-juremas", title: "Imersão das Juremas", description: "Uma viagem ao universo das Juremas, suas ervas, entidades e vivências.", image_url: IMAGE_BASE + "c1.jpg", hero_image_url: IMAGE_BASE + "c1.jpg", category: "imersao", tags: ["juremas", "imersao", "ervas"], featured: true, sort_order: 1 },
        { slug: "imersao-da-magia-de-hecate", title: "Imersão da Magia de Hécate", description: "Fundamentos e práticas de magia em uma jornada iniciática.", image_url: IMAGE_BASE + "c2.jpg", hero_image_url: IMAGE_BASE + "c2.jpg", category: "magia", tags: ["magia", "imersao", "bruxaria"], featured: true, sort_order: 2 },
        { slug: "convencao-das-bruxas", title: "Convenção das Bruxas", description: "Encontros, ritos e estudos no reino de Hécate.", image_url: IMAGE_BASE + "c3.jpg", hero_image_url: IMAGE_BASE + "c3.jpg", category: "magia", tags: ["magia", "bruxaria", "evento"], featured: true, sort_order: 3 },
        { slug: "semana-da-magia", title: "Semana da Magia", description: "Aulas especiais para aprofundar sua prática mágica.", image_url: IMAGE_BASE + "c4.jpg", hero_image_url: IMAGE_BASE + "c4.jpg", category: "magia", tags: ["magia", "imersao"], featured: false, sort_order: 4 },
        { slug: "a-sacerdotisa", title: "A Sacerdotisa", description: "Desperte sua intuição e fortaleça sua conexão espiritual.", image_url: IMAGE_BASE + "c5.jpg", hero_image_url: IMAGE_BASE + "c5.jpg", category: "tarot", tags: ["tarot", "magia"], featured: true, sort_order: 5 },
        { slug: "profissao-tarologo-rico", title: "Profissão Tarólogo Rico", description: "Estruture sua jornada profissional com o Tarô.", image_url: IMAGE_BASE + "c6.jpg", hero_image_url: IMAGE_BASE + "c6.jpg", category: "tarot", tags: ["tarot", "profissao"], featured: false, sort_order: 6 },
        { slug: "roda-de-oxumare", title: "Roda de Oxumaré", description: "Vivência espiritual de força, transformação e movimento.", image_url: IMAGE_BASE + "c7.jpg", hero_image_url: IMAGE_BASE + "c7.jpg", category: "imersao", tags: ["imersao", "orixas"], featured: false, sort_order: 7 },
        { slug: "imersao-povo-cigano", title: "Imersão Povo Cigano", description: "Danças, símbolos e práticas do povo cigano espiritual.", image_url: IMAGE_BASE + "c8.jpg", hero_image_url: IMAGE_BASE + "c8.jpg", category: "cigano", tags: ["cigano", "imersao"], featured: true, sort_order: 8 },
        { slug: "roda-cigana", title: "Roda Cigana", description: "A estrela da sorte em vivências e estudos guiados.", image_url: IMAGE_BASE + "c9.jpg", hero_image_url: IMAGE_BASE + "c9.jpg", category: "cigano", tags: ["cigano", "danca"], featured: false, sort_order: 9 },
        { slug: "circulo-despertar-da-mulher-sabia", title: "Círculo Despertar da Mulher Sábia", description: "Um círculo de estudo e cuidado para a força feminina.", image_url: IMAGE_BASE + "c10.jpg", hero_image_url: IMAGE_BASE + "c10.jpg", category: "feminino", tags: ["imersao", "feminino"], featured: false, sort_order: 10 }
    ];

    const fallbackModules = [
        {
            title: "Módulo 1 - As Juremas Sagradas",
            lessons: [
                { title: "Abertura e introdução às Juremas", description: "Uma viagem ao universo das Juremas - origem, significado e a presença desse povo sagrado na espiritualidade brasileira.", duration_label: "48 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL },
                { title: "O povo das Juremas e suas entidades", description: "Conheça as principais entidades do povo das Juremas, suas forças, missões e como se manifestam no culto.", duration_label: "54 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL },
                { title: "Rituais de preparação e proteção", description: "Aprenda os rituais fundamentais de preparação espiritual antes de adentrar o trabalho com as Juremas.", duration_label: "62 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL }
            ]
        },
        {
            title: "Módulo 2 - A Magia das Ervas",
            lessons: [
                { title: "Ervas sagradas das Juremas", description: "As plantas aliadas do povo das Juremas - identificação, colheita, preparo e uso nos rituais.", duration_label: "55 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL },
                { title: "Defumações e banhos de ervas", description: "Passo a passo para preparar defumações e banhos ritualísticos com as ervas do povo das Juremas.", duration_label: "47 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL },
                { title: "Altar de ervas e oferendas", description: "Como montar e ativar um altar dedicado às Juremas com flores, ervas e elementos naturais.", duration_label: "51 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL }
            ]
        },
        {
            title: "Módulo 3 - Vivências e Incorporação",
            lessons: [
                { title: "Preparando o corpo para a vivência", description: "Exercícios, respiração e intenção: como se preparar física e espiritualmente para a incorporação.", duration_label: "38 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL },
                { title: "Cantos e pontos das Juremas", description: "Os pontos cantados que evocam as entidades - origem, letra, melodia e como cantar com respeito.", duration_label: "66 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL },
                { title: "A vivência guiada - Imersão completa", description: "A experiência central da imersão: uma vivência conduzida ao vivo por Vanessa Tikura com o povo das Juremas.", duration_label: "90 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL }
            ]
        },
        {
            title: "Módulo 4 - Encerramento e Integração",
            lessons: [
                { title: "Como integrar a experiência no cotidiano", description: "Práticas simples para manter a conexão com as Juremas depois da imersão - no dia a dia, na casa e na espiritualidade.", duration_label: "42 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL },
                { title: "Cuidados pós-vivência e fechamento", description: "Rituais de fechamento energético, limpeza e cuidados essenciais após a imersão.", duration_label: "35 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL },
                { title: "Encerramento - Uma palavra de Vanessa Tikura", description: "Mensagem final de Vanessa Tikura com gratidão, bênção e os próximos passos na sua jornada espiritual.", duration_label: "22 min", thumbnail_url: DEFAULT_THUMBNAIL_URL, video_url: DEFAULT_VIDEO_URL }
            ]
        }
    ];

    const fallbackPosts = [
        { id: "local-1", author_name: "Maria Clara", body: "Acabei de terminar a Imersão das Juremas e estou sem palavras. Foi uma experiência que transformou completamente minha relação com a espiritualidade. Obrigada, Vanessa!", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), likes_count: 24, liked: false },
        { id: "local-2", author_name: "Juliana Ferreira", body: "Quem mais está na Imersão Povo Cigano? Estou no módulo 3 e cada aula é uma revelação. As danças guiadas são incríveis!", created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), likes_count: 18, liked: false },
        { id: "local-3", author_name: "Renata Pires", body: "Dica: façam a aula de banho de ervas à luz de vela. Fiz ontem antes de dormir e foi mágico. A energia ficou completamente diferente no ambiente.", created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), likes_count: 41, liked: false }
    ];

    function getClient() {
        const cfg = window.TIKURA_SUPABASE;
        if (!cfg || !window.supabase || !cfg.url || !cfg.anonKey) {
            return null;
        }
        if (!window.__tikuraSupabaseClient) {
            window.__tikuraSupabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
        }
        return window.__tikuraSupabaseClient;
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[char]));
    }

    function getInitials(name, email) {
        const source = String(name || email || "?").trim();
        return source.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
    }

    function normalizeCourse(course) {
        return {
            id: course.id || course.slug,
            slug: course.slug,
            title: course.title,
            description: course.description || "",
            image_url: course.image_url || course.hero_image_url || IMAGE_BASE + "c1.jpg",
            hero_image_url: course.hero_image_url || course.image_url || IMAGE_BASE + "c1.jpg",
            category: course.category || "imersao",
            tags: Array.isArray(course.tags) ? course.tags : [],
            featured: Boolean(course.featured),
            sort_order: Number(course.sort_order || 0),
            instructor_name: course.instructor_name || "Vanessa Tikura",
            instructor_avatar_url: course.instructor_avatar_url || INSTRUCTOR_AVATAR,
            href: "aulas.html?curso=" + encodeURIComponent(course.slug || "imersao-das-juremas")
        };
    }

    function fallbackCourseWithLessons(slug) {
        const course = normalizeCourse(fallbackCourses.find((item) => item.slug === slug) || fallbackCourses[0]);
        let lessonIndex = 0;
        return {
            course,
            modules: fallbackModules.map((module, moduleIndex) => ({
                id: "local-module-" + moduleIndex,
                title: module.title,
                sort_order: moduleIndex + 1,
                lessons: module.lessons.map((lesson, index) => {
                    lessonIndex += 1;
                    return {
                        id: "local-lesson-" + lessonIndex,
                        module_title: "Módulo " + (moduleIndex + 1),
                        module_index: moduleIndex,
                        lesson_number: lessonIndex,
                        sort_order: index + 1,
                        watched: lessonIndex === 1,
                        ...lesson
                    };
                })
            }))
        };
    }

    async function requireUser() {
        const sb = getClient();
        if (!sb) {
            location.href = "login.html";
            return null;
        }
        const { data, error } = await sb.auth.getUser();
        if (error || !data.user) {
            location.href = "login.html";
            return null;
        }
        await sb.from("profiles").upsert({
            id: data.user.id,
            full_name: (data.user.user_metadata || {}).full_name || (data.user.user_metadata || {}).name || data.user.email
        }, { onConflict: "id" });
        return data.user;
    }

    async function getCourses() {
        const sb = getClient();
        if (!sb) {
            return fallbackCourses.map(normalizeCourse);
        }
        const { data, error } = await sb
            .from("courses")
            .select("id, slug, title, description, image_url, hero_image_url, category, tags, featured, sort_order, instructor_name, instructor_avatar_url, status")
            .eq("status", "published")
            .order("sort_order", { ascending: true });

        if (error || !data || !data.length) {
            return fallbackCourses.map(normalizeCourse);
        }
        return data.map(normalizeCourse);
    }

    async function getCourseWithLessons(slug) {
        const targetSlug = slug || "imersao-das-juremas";
        const sb = getClient();
        if (!sb) {
            return fallbackCourseWithLessons(targetSlug);
        }

        const { data: course, error } = await sb
            .from("courses")
            .select("id, slug, title, description, image_url, hero_image_url, category, tags, featured, sort_order, instructor_name, instructor_avatar_url, course_modules(id, title, sort_order, lessons(id, title, description, duration_label, video_url, thumbnail_url, sort_order))")
            .eq("slug", targetSlug)
            .eq("status", "published")
            .maybeSingle();

        if (error || !course) {
            return fallbackCourseWithLessons(targetSlug);
        }

        const { data: { user } } = await sb.auth.getUser();
        const modules = (course.course_modules || []).sort((a, b) => a.sort_order - b.sort_order);
        const lessonIds = modules.flatMap((module) => module.lessons || []).map((lesson) => lesson.id);
        let watchedIds = new Set();

        if (user && lessonIds.length) {
            const { data: progress } = await sb
                .from("lesson_progress")
                .select("lesson_id")
                .eq("user_id", user.id)
                .eq("watched", true)
                .in("lesson_id", lessonIds);
            watchedIds = new Set((progress || []).map((item) => item.lesson_id));
        }

        let lessonIndex = 0;
        return {
            course: normalizeCourse(course),
            modules: modules.map((module, moduleIndex) => ({
                id: module.id,
                title: module.title,
                sort_order: module.sort_order,
                lessons: (module.lessons || []).sort((a, b) => a.sort_order - b.sort_order).map((lesson) => {
                    lessonIndex += 1;
                    return {
                        ...lesson,
                        module_title: "Módulo " + (moduleIndex + 1),
                        module_index: moduleIndex,
                        lesson_number: lessonIndex,
                        watched: watchedIds.has(lesson.id)
                    };
                })
            }))
        };
    }

    async function markLessonWatched(lessonId) {
        const sb = getClient();
        if (!sb || String(lessonId).startsWith("local-")) {
            return;
        }
        const { data: { user } } = await sb.auth.getUser();
        if (!user) {
            return;
        }
        await sb.from("lesson_progress").upsert({
            user_id: user.id,
            lesson_id: lessonId,
            watched: true,
            watched_at: new Date().toISOString()
        }, { onConflict: "user_id,lesson_id" });
    }

    async function getMyCourses(userId) {
        const courses = await getCourses();
        const sb = getClient();
        if (!sb) {
            return courses.slice(0, 5).map((course, index) => ({
                course,
                percent: index > 2 ? 100 : [33, 20, 77][index] || 0,
                meta: index > 2 ? "Concluído" : "Continue assistindo"
            }));
        }

        const { data: enrollments } = await sb
            .from("enrollments")
            .select("course_id, status, courses(id, slug, title, description, image_url, hero_image_url, category, tags, featured, sort_order, instructor_name, instructor_avatar_url)")
            .eq("user_id", userId)
            .order("enrolled_at", { ascending: false });

        const enrolledCourses = (enrollments || []).map((row) => normalizeCourse(row.courses)).filter((course) => course.slug);
        const source = enrolledCourses.length ? enrolledCourses : courses.slice(0, 5);

        return Promise.all(source.map(async (course) => {
            const { data: lessons } = await sb.from("lessons").select("id").eq("course_id", course.id);
            const lessonIds = (lessons || []).map((lesson) => lesson.id);
            let watched = 0;
            if (lessonIds.length) {
                const { count } = await sb
                    .from("lesson_progress")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", userId)
                    .eq("watched", true)
                    .in("lesson_id", lessonIds);
                watched = count || 0;
            }
            const total = lessonIds.length || 1;
            const percent = Math.round((watched / total) * 100);
            return {
                course,
                percent,
                meta: percent >= 100 ? "Concluído" : `${watched || 1} de ${total} aulas assistidas`
            };
        }));
    }

    async function createCheckoutOrder(payload) {
        const sb = getClient();
        if (!sb) {
            throw new Error("Supabase não configurado.");
        }
        const { data: { user } } = await sb.auth.getUser();
        const { error } = await sb.from("checkout_orders").insert({
            user_id: user ? user.id : null,
            full_name: payload.full_name,
            email: payload.email,
            phone: payload.phone,
            cpf: payload.cpf,
            payment_method: payload.payment_method,
            coupon: payload.coupon || null,
            status: "pending"
        });
        if (error) {
            throw error;
        }
    }

    async function getCommunityPosts(userId) {
        const sb = getClient();
        if (!sb) {
            return [];
        }
        const { data: posts, error } = await sb
            .from("community_posts")
            .select("id, user_id, body, created_at")
            .order("created_at", { ascending: false })
            .limit(50);

        if (error || !posts) {
            return [];
        }

        const postIds = posts.map((post) => post.id);
        const userIds = [...new Set(posts.map((post) => post.user_id).filter(Boolean))];

        const [likesResult, profilesResult] = await Promise.all([
            postIds.length
                ? sb.from("community_likes").select("post_id, user_id").in("post_id", postIds)
                : Promise.resolve({ data: [] }),
            userIds.length
                ? sb.from("profiles").select("id, full_name").in("id", userIds)
                : Promise.resolve({ data: [] })
        ]);

        const likes = likesResult.data || [];
        const profileMap = Object.fromEntries((profilesResult.data || []).map((p) => [p.id, p.full_name]));

        return posts.map((post) => {
            const postLikes = likes.filter((like) => like.post_id === post.id);
            return {
                id: post.id,
                user_id: post.user_id,
                author_name: profileMap[post.user_id] || "Membro Tikura",
                body: post.body,
                created_at: post.created_at,
                likes_count: postLikes.length,
                liked: postLikes.some((like) => like.user_id === userId)
            };
        });
    }

    async function createCommunityPost(body) {
        const sb = getClient();
        const user = await requireUser();
        if (!sb || !user) {
            return null;
        }
        const { data, error } = await sb
            .from("community_posts")
            .insert({ user_id: user.id, body })
            .select("id, user_id, body, created_at")
            .single();
        if (error) {
            throw error;
        }
        return data;
    }

    async function setCommunityLike(postId, liked) {
        const sb = getClient();
        const user = await requireUser();
        if (!sb || !user || String(postId).startsWith("local-")) {
            return;
        }
        if (liked) {
            await sb.from("community_likes").upsert({ post_id: postId, user_id: user.id }, { onConflict: "post_id,user_id" });
            return;
        }
        await sb.from("community_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    }

    function timeAgo(dateString) {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.max(1, Math.floor(diff / 60000));
        if (minutes < 60) return "há " + minutes + " min";
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return "há " + hours + " hora" + (hours > 1 ? "s" : "");
        const days = Math.floor(hours / 24);
        if (days === 1) return "ontem";
        return "há " + days + " dias";
    }

    window.TikuraDB = {
        escapeHtml,
        fallbackCourses,
        getClient,
        getInitials,
        normalizeCourse,
        requireUser,
        getCourses,
        getCourseWithLessons,
        markLessonWatched,
        getMyCourses,
        createCheckoutOrder,
        getCommunityPosts,
        createCommunityPost,
        setCommunityLike,
        timeAgo
    };
})();
