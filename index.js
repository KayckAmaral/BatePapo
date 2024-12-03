import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), './pages/public')));

const porta = 3000; 
const host = '0.0.0.0';

let listaUsuarios = [];
let mensagens = [];

function menuView(req, resp) {
    let ultimoAcesso = req.cookies['ultimoAcesso'];
    if (!ultimoAcesso) {
        ultimoAcesso = ''; 
    }
    resp.cookie('ultimoAcesso', new Date().toLocaleString(), { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });

    resp.send(`
        <html>
            <head>
                <title>Menu</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { display: flex; min-height: 100vh; background-color: #f8f9fa; }
                    .sidebar { width: 250px; background-color: #343a40; color: white; padding-top: 20px; }
                    .sidebar a { color: white; padding: 15px; text-decoration: none; display: block; font-weight: 500; }
                    .sidebar a:hover { background-color: #495057; }
                    .content { flex-grow: 1; padding: 20px; }
                    .navbar-brand { font-weight: 600; font-size: 18px; padding-left: 15px; }
                    .logout-btn { margin: 15px; background-color: #dc3545; color: white; border: none; padding: 10px 20px; text-align: center; border-radius: 5px; cursor: pointer; }
                    .logout-btn:hover { background-color: #bb2d3b; }
                </style>
            </head>
            <body>
                <div class="sidebar">
                    <a class="navbar-brand" href="#">MENU</a>
                    <a class="nav-link" href="/cadastrarUsuario">Cadastrar Usuário</a>
                    <a class="nav-link" href="/batePapo">Bate Papo</a>
                    <form action="/logout" method="POST" class="mt-3">
                        <button type="submit" class="logout-btn">Sair</button>
                    </form>
                </div>
                <div class="content">
                    <h2>Bem-vindo ao sistema de gerenciamento de produtos</h2>
                    <p>Seu último acesso foi realizado em: ${ultimoAcesso}</p>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);
}


// Função para exibir o formulário de cadastro de usuários
function cadastroUsuarioView(req, resp, errors = {}, valores = {}) {
    resp.send(`
        <html>
    <head>
        <title>Cadastro de Usuário</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {
                background-color: #f4f7fc; /* Fundo suave e claro */
                font-family: 'Arial', sans-serif;
                color: #333;
                margin: 0;
                padding: 0;
            }

            .container {
                margin-top: 50px;
                max-width: 700px;
                background-color: #fff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                box-sizing: border-box;
            }

            h1 {
                font-size: 2.5em;
                color: #2e3a59;
                margin-bottom: 30px;
                text-align: center;
                font-weight: 700;
            }

            .form-label {
                font-size: 1rem;
                font-weight: 600;
                color: #495057;
            }

            .form-control {
                border-radius: 5px;
                padding: 15px;
                font-size: 1rem;
                background-color: #f8f9fa;
                border: 1px solid #ced4da;
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
            }

            .form-control:focus {
                border-color: #007bff;
                box-shadow: 0 0 8px rgba(0, 123, 255, 0.25);
            }

            .invalid-feedback {
                display: block;
                font-size: 0.875em;
                color: #dc3545;
                margin-top: 5px;
            }

            .btn-primary,
            .btn-secondary {
                border-radius: 5px;
                padding: 12px 25px;
                font-size: 1.1rem;
                text-align: center;
                transition: background-color 0.3s, transform 0.2s;
            }

            .btn-primary {
                background-color: #007bff;
                color: white;
                border: none;
            }

            .btn-primary:hover {
                background-color: #0056b3;
                transform: translateY(-2px);
            }

            .btn-secondary {
                background-color: #6c757d;
                color: white;
                border: none;
            }

            .btn-secondary:hover {
                background-color: #5a6268;
                transform: translateY(-2px);
            }

            .row.g-3 {
                margin-bottom: 20px;
            }

            .container ul {
                list-style-type: none;
                padding: 0;
                margin-top: 30px;
            }

            .container li {
                font-size: 1rem;
                color: #333;
                padding: 10px;
                margin: 5px 0;
                background-color: #f8f9fa;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: background-color 0.3s;
            }

            .container li:hover {
                background-color: #e9ecef;
            }

            /* Responsividade */
            @media (max-width: 768px) {
                .container {
                    padding: 20px;
                }

                h1 {
                    font-size: 2em;
                }
                h2 {
                    text-align: center;
                }


                .btn-primary, .btn-secondary {
                    width: 100%;
                }
            }
        </style>
        <meta charset="utf-8">
    </head>
    <body>
        <div class="container">
    <h1>Cadastro de Usuário</h1>
    <form method="POST" action="/cadastrarUsuario" class="row g-3" novalidate>
            <div class="col-md-12">
                <label for="nome" class="form-label">Nome Completo</label>
                <input type="text" class="form-control ${errors.nome ? 'is-invalid' : ''}" id="nome" name="nome" placeholder="Nome completo" value="${valores.nome || ''}">
                <div class="invalid-feedback">${errors.nome || ''}</div>
            </div>
            <div class="col-md-6">
                <label for="dataNascimento" class="form-label">Data de Nascimento</label>
                <input type="date" class="form-control ${errors.dataNascimento ? 'is-invalid' : ''}" id="dataNascimento" name="dataNascimento" value="${valores.dataNascimento || ''}">
                <div class="invalid-feedback">${errors.dataNascimento || ''}</div>
            </div>
            <div class="col-md-6">
                <label for="apelido" class="form-label">Apelido</label>
                <input type="text" class="form-control ${errors.apelido ? 'is-invalid' : ''}" id="apelido" name="apelido" placeholder="Apelido" value="${valores.apelido || ''}">
                <div class="invalid-feedback">${errors.apelido || ''}</div>
            </div>
            <div class="col-12 d-flex justify-content-center">
                <button class="btn btn-primary" type="submit">Cadastrar</button>
                <a href="/" class="btn btn-secondary ms-3">Voltar para o Menu</a>
            </div>
        </form>

        <h2 class="mt-4 text-center">Usuários Cadastrados</h2> <!-- Centralizado com Bootstrap -->
        
        <!-- Melhoria na exibição da lista -->
        <div class="table-responsive">
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Data de Nascimento</th>
                        <th>Apelido</th>
                    </tr>
                </thead>
                <tbody>
                    ${listaUsuarios.map(usuario => `
                        <tr>
                            <td>${usuario.nome}</td>
                            <td>${usuario.dataNascimento}</td>
                            <td>${usuario.apelido}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    </body>
</html>
    `);
}

// Função para cadastrar o usuário e validar os dados
function cadastrarUsuario(req, resp) {
    const { nome, dataNascimento, apelido } = req.body;

    const errors = {};
    if (!nome) errors.nome = "O nome é obrigatório.";
    if (!dataNascimento) errors.dataNascimento = "A data de nascimento é obrigatória.";
    if (!apelido) errors.apelido = "O apelido é obrigatório.";

    if (Object.keys(errors).length > 0) {
        cadastroUsuarioView(req, resp, errors, req.body);
    } else {
        listaUsuarios.push({ nome, dataNascimento, apelido });
        cadastroUsuarioView(req, resp);
    }
}

// Configuração de rotas e middleware
app.use(session({
    secret: 'Minha chave secreta',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 30 }
}));

app.use(cookieParser());

// Validação de login
app.post('/login', (req, resp) => {
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === '123') { // Exemplo de autenticação
        req.session.usuario = usuario;
        resp.cookie('dataHoraUltimoLogin', new Date().toLocaleString(), {maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true});
        resp.redirect('/');
    } else {
        resp.send(`<html>
        <head>
            <title>Login Inválido</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f8f9fa;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: Arial, sans-serif;
                }
                .message-box {
                    text-align: center;
                    background-color: white;
                    border: 1px solid #dee2e6;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    font-size: 2rem;
                    color: #dc3545;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 1.2rem;
                    color: #495057;
                    margin-bottom: 30px;
                }
                .btn-primary {
                    background-color: #007bff;
                    border: none;
                    padding: 10px 20px;
                    font-size: 1rem;
                    text-decoration: none;
                    color: white;
                    border-radius: 5px;
                    transition: background-color 0.3s ease;
                }
                .btn-primary:hover {
                    background-color: #0056b3;
                }
            </style>
            <meta charset="utf-8">
        </head>
        <body>
            <div class="message-box">
                <h1>Login Inválido</h1>
                <p>O nome de usuário ou senha está incorreto. Por favor, tente novamente.</p>
                <a href="/login.html" class="btn btn-primary">Tentar Novamente</a>
            </div>
        </body>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    </html>`);
    }
});

function verificarAutenticacao(req, resp, next) {
    if (req.session.usuario) {
        return next();
    }
    resp.redirect('/login.html');
}

function logout(req, resp) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao encerrar sessão:', err);
            return resp.status(500).send('Erro ao encerrar a sessão.');
        }
        resp.clearCookie('ultimoAcesso');
        resp.redirect('/login.html');
    });
}

app.use(verificarAutenticacao);

// Rota para a página inicial, mostrando o menu com as opções.

app.get('/', (req, resp) => {
    menuView(req, resp);
});

// Página de cadastro de usuário
app.get('/cadastrarUsuario', verificarAutenticacao, cadastroUsuarioView);  // Exibe o formulário de cadastro
app.post('/cadastrarUsuario', verificarAutenticacao, cadastrarUsuario);     // Processa o cadastro

// Página de bate-papo (em construção)
app.get('/batePapo', (req, resp) => {
    resp.send('<h1>Página de Bate Papo em Construção</h1>');
});

// Função para logout (limpar cookies e redirecionar)
app.post('/logout', logout);

// Inicia o servidor
app.listen(porta, host, () => {
    console.log(`Servidor iniciado em http://${host}:${porta}`);
});

