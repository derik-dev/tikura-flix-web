const supabaseConfig = window.TIKURA_SUPABASE;
const hasSupabase = Boolean(window.supabase && supabaseConfig && supabaseConfig.url && supabaseConfig.anonKey);

if (!hasSupabase) {
    console.error("Configuracao do Supabase nao encontrada.");
}

const supabaseClient = hasSupabase
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;

const authMessages = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar.",
    "User already registered": "Este e-mail ja esta cadastrado.",
    "Password should be at least 6 characters": "A senha precisa ter pelo menos 6 caracteres."
};

function getFriendlyMessage(error) {
    if (!error) {
        return "";
    }

    return authMessages[error.message] || error.message || "Nao foi possivel concluir a solicitacao.";
}

function setStatus(form, type, message) {
    const status = form.querySelector("[data-auth-status]");

    if (!status) {
        return;
    }

    status.textContent = message;
    status.className = `auth-status ${type ? `auth-status-${type}` : ""}`.trim();
    status.hidden = !message;
}

function setLoading(button, isLoading, loadingText) {
    if (!button) {
        return;
    }

    if (!button.dataset.defaultText) {
        button.dataset.defaultText = button.textContent;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}

async function handleLogin(form) {
    if (!supabaseClient) {
        setStatus(form, "error", "Nao foi possivel conectar ao servico de login. Tente abrir a pagina por um servidor local.");
        return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("senha") || "");

    setStatus(form, "", "");
    setLoading(submitButton, true, "Entrando...");

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    setLoading(submitButton, false);

    if (error) {
        setStatus(form, "error", getFriendlyMessage(error));
        return;
    }

    setStatus(form, "success", "Login realizado. Redirecionando...");
    window.location.href = "cursos.html";
}

async function handleRegister(form) {
    if (!supabaseClient) {
        setStatus(form, "error", "Nao foi possivel conectar ao servico de cadastro. Tente abrir a pagina por um servidor local.");
        return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const name = String(formData.get("nome") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("senha") || "");
    const confirmPassword = String(formData.get("confirmar_senha") || "");

    setStatus(form, "", "");

    if (password !== confirmPassword) {
        setStatus(form, "error", "As senhas nao conferem.");
        return;
    }

    setLoading(submitButton, true, "Criando conta...");

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name
            }
        }
    });

    setLoading(submitButton, false);

    if (error) {
        setStatus(form, "error", getFriendlyMessage(error));
        return;
    }

    form.reset();
    setStatus(form, "success", "Conta criada. Verifique seu e-mail para confirmar o acesso.");
}

async function handlePasswordReset(form) {
    if (!supabaseClient) {
        setStatus(form, "error", "Nao foi possivel conectar ao servico de recuperacao de senha.");
        return;
    }

    const emailInput = form.querySelector("input[name='email']");
    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
        setStatus(form, "error", "Digite seu e-mail para receber o link de recuperacao.");
        if (emailInput) {
            emailInput.focus();
        }
        return;
    }

    const options = {};
    if (location.protocol === "http:" || location.protocol === "https:") {
        options.redirectTo = `${location.origin}${location.pathname.replace(/login\.html$/i, "login.html")}`;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, options);

    if (error) {
        setStatus(form, "error", getFriendlyMessage(error));
        return;
    }

    setStatus(form, "success", "Enviamos um link de recuperacao para o seu e-mail.");
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("[data-auth-form='login']");
    const registerForm = document.querySelector("[data-auth-form='register']");
    const resetButton = document.querySelector("[data-auth-reset]");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            handleLogin(loginForm);
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();
            handleRegister(registerForm);
        });
    }

    if (loginForm && resetButton) {
        resetButton.addEventListener("click", () => {
            handlePasswordReset(loginForm);
        });
    }
});
