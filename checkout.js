document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-checkout-form]");
    const status = document.querySelector("[data-checkout-status]");
    const db = window.TikuraDB;

    if (!form || !status || !db) {
        return;
    }

    const supabase = db.getClient();
    let currentUser = null;

    if (supabase) {
        supabase.auth.getUser().then(({ data }) => {
            currentUser = data.user || null;
            if (!currentUser) {
                return;
            }

            const meta = currentUser.user_metadata || {};
            setInputValue("nome", meta.full_name || meta.name || "");
            setInputValue("email", currentUser.email || "");
            setInputValue("telefone", meta.telefone || "");
            setInputValue("cpf", meta.cpf || "");
        });
    }

    addMask("telefone", maskPhone);
    addMask("cpf", maskCpf);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submit = form.querySelector("button[type='submit']");
        const data = Object.fromEntries(new FormData(form).entries());

        showStatus("", "");

        if (!isValidEmail(data.email)) {
            showStatus("Informe um e-mail valido para continuar.", "err");
            focusInput("email");
            return;
        }

        if (onlyDigits(data.telefone).length < 10) {
            showStatus("Informe um WhatsApp valido com DDD.", "err");
            focusInput("telefone");
            return;
        }

        if (onlyDigits(data.cpf).length !== 11) {
            showStatus("Informe um CPF com 11 numeros.", "err");
            focusInput("cpf");
            return;
        }

        setLoading(submit, true);

        const payload = {
            full_name: String(data.nome || "").trim(),
            email: String(data.email || "").trim(),
            phone: String(data.telefone || "").trim(),
            cpf: String(data.cpf || "").trim(),
            payment_method: data.pagamento || "pix",
            coupon: String(data.cupom || "").trim()
        };

        try {
            await db.createCheckoutOrder(payload);
            localStorage.setItem("tikuraCheckoutLead", JSON.stringify({
                ...payload,
                plano: "Tikura Flix Anual",
                criadoEm: new Date().toISOString()
            }));

            if (supabase && currentUser) {
                await supabase.auth.updateUser({
                    data: {
                        full_name: payload.full_name,
                        telefone: payload.phone,
                        cpf: payload.cpf,
                        plano: "Tikura Flix Anual"
                    }
                });
            }

            showStatus("Solicitacao registrada no banco. Voce ja pode acessar a plataforma ou criar sua conta com este e-mail.", "ok");

            setTimeout(() => {
                location.href = currentUser ? "cursos.html" : "registro.html";
            }, 1400);
        } catch (error) {
            showStatus(error.message || "Nao foi possivel registrar a assinatura agora.", "err");
        } finally {
            setLoading(submit, false);
        }
    });

    function setInputValue(name, value) {
        const input = form.elements[name];
        if (input && value && !input.value) {
            input.value = value;
        }
    }

    function focusInput(name) {
        const input = form.elements[name];
        if (input) {
            input.focus();
        }
    }

    function addMask(name, formatter) {
        const input = form.elements[name];
        if (!input) {
            return;
        }

        input.addEventListener("input", () => {
            input.value = formatter(input.value);
        });
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `checkout-status ${type || ""}`.trim();
        status.hidden = !message;
    }

    function setLoading(button, isLoading) {
        if (!button) {
            return;
        }

        if (!button.dataset.defaultText) {
            button.dataset.defaultText = button.textContent;
        }

        button.disabled = isLoading;
        button.textContent = isLoading ? "Processando..." : button.dataset.defaultText;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
    }

    function onlyDigits(value) {
        return String(value || "").replace(/\D/g, "");
    }

    function maskPhone(value) {
        const digits = onlyDigits(value).slice(0, 11);
        if (digits.length <= 2) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    function maskCpf(value) {
        const digits = onlyDigits(value).slice(0, 11);
        return digits
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
});
