/**
 * BiblioTech — Gerenciador de Acervo Bibliográfico
 * Consumo da API REST e Modo Simulado de Alta Fidelidade.
 */

// Estado global da aplicação
let livrosCache = [];
let idLivroExclusao = null;
let modoSimulado = false;

// Banco de dados em memória para o Modo Simulado (espelha o MySQL)
let bancoEmMemoria = [
    {
        id: 1,
        titulo: "Clean Code: A Handbook of Agile Software Craftsmanship",
        autor: "Robert C. Martin",
        isbn: "9780132350884",
        genero: "Engenharia de Software",
        exemplares: 5
    },
    {
        id: 2,
        titulo: "O Programador Pragmático",
        autor: "Andrew Hunt e David Thomas",
        isbn: "9788577807000",
        genero: "Engenharia de Software",
        exemplares: 3
    },
    {
        id: 3,
        titulo: "Domain-Driven Design: Atacando as Complexidades no Coração do Software",
        autor: "Eric Evans",
        isbn: "9788550800653",
        genero: "Arquitetura de Software",
        exemplares: 2
    }
];
let proximoIdSimulado = 4;

// Elementos DOM
const apiUrlInput = document.getElementById('apiUrlInput');
const tabelaCorpo = document.getElementById('tabelaCorpo');
const emptyState = document.getElementById('emptyState');
const alertContainer = document.getElementById('alertContainer');
const livroModal = document.getElementById('livroModal');
const deleteModal = document.getElementById('deleteModal');
const helpModal = document.getElementById('helpModal');
const livroForm = document.getElementById('livroForm');
const modalErrorAlert = document.getElementById('modalErrorAlert');
const modalTitulo = document.getElementById('modalTitulo');
const btnSalvarTexto = document.getElementById('btnSalvarTexto');
const btnSalvarSpinner = document.getElementById('btnSalvarSpinner');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const btnModoReal = document.getElementById('btnModoReal');
const btnModoSimulado = document.getElementById('btnModoSimulado');
const modoAtualBadge = document.getElementById('modoAtualBadge');
const connectionBanner = document.getElementById('connectionBanner');
const bannerMsg = document.getElementById('bannerMsg');
const bannerActionBtn = document.getElementById('bannerActionBtn');

/**
 * Retorna a URL base configurada para a API REST
 */
function getApiUrl() {
    return (apiUrlInput.value || 'http://localhost:8080/livros').trim().replace(/\/$/, '');
}

/**
 * Inicialização ao carregar a página
 */
document.addEventListener('DOMContentLoaded', () => {
    // Tenta carregar inicialmente da API Real
    carregarLivros();

    // Atualiza caso o usuário altere manualmente a URL
    apiUrlInput.addEventListener('change', () => {
        if (!modoSimulado) {
            mostrarAlerta('info', `URL da API atualizada para: ${getApiUrl()}`);
            carregarLivros();
        }
    });
});

/**
 * Alterna entre Modo Real (Spring Boot) e Modo Simulado (In-Memory)
 */
function alternarModo(simulado) {
    modoSimulado = simulado;

    if (simulado) {
        btnModoSimulado.classList.add('active');
        btnModoReal.classList.remove('active');
        modoAtualBadge.textContent = 'Modo Simulado (Offline)';
        modoAtualBadge.style.background = '#f3e8ff';
        modoAtualBadge.style.color = '#7e22ce';

        statusIndicator.className = 'status-indicator status-mock';
        statusText.textContent = 'Modo Simulado Ativo';
        fecharBanner();
        mostrarAlerta('info', '🧪 Modo Simulado Ativado: Todas as 4 operações do CRUD e validações (400, 404, 409) funcionam localmente.');
    } else {
        btnModoReal.classList.add('active');
        btnModoSimulado.classList.remove('active');
        modoAtualBadge.textContent = 'API Real (Spring Boot)';
        modoAtualBadge.style.background = 'var(--primary-light)';
        modoAtualBadge.style.color = 'var(--primary)';

        statusIndicator.className = 'status-indicator';
        statusText.textContent = 'Verificando API...';
    }

    carregarLivros();
}

/**
 * Atualiza o indicador visual de status da API
 */
function atualizarStatusApi(online, mensagem) {
    if (modoSimulado) {
        statusIndicator.className = 'status-indicator status-mock';
        statusText.textContent = 'Modo Simulado Ativo';
        return;
    }

    if (online) {
        statusIndicator.className = 'status-indicator status-online';
        statusText.textContent = mensagem || 'API Conectada (200 OK)';
        fecharBanner();
    } else {
        statusIndicator.className = 'status-indicator status-offline';
        statusText.textContent = mensagem || 'API Offline (Porta 8080)';
    }
}

/**
 * READ (Listar): GET /livros
 */
async function carregarLivros() {
    tabelaCorpo.innerHTML = `
        <tr>
            <td colspan="7" class="loading-state">
                <div class="spinner"></div>
                <p>Carregando livros do acervo...</p>
            </td>
        </tr>
    `;
    emptyState.style.display = 'none';

    // 1. MODO SIMULADO
    if (modoSimulado) {
        setTimeout(() => {
            livrosCache = JSON.parse(JSON.stringify(bancoEmMemoria));
            renderizarTabela(livrosCache);
            atualizarEstatisticas(livrosCache);
        }, 150);
        return;
    }

    // 2. MODO REAL: Consumo via fetch na porta 8080
    try {
        const response = await fetch(getApiUrl(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Falha HTTP ${response.status}`);
        }

        const data = await response.json();
        livrosCache = Array.isArray(data) ? data : [];

        atualizarStatusApi(true, 'API Conectada (200 OK)');
        renderizarTabela(livrosCache);
        atualizarEstatisticas(livrosCache);

    } catch (error) {
        // Trata erro de conexão (backend offline / ERR_CONNECTION_REFUSED)
        atualizarStatusApi(false, 'API Desconectada');

        exibirBannerConexao(
            'O servidor Spring Boot não está rodando na porta 8080 (ERR_CONNECTION_REFUSED). Para testar a interface imediatamente e tirar os prints, ative o Modo Simulado.',
            'Ativar Modo Simulado Agora',
            () => alternarModo(true)
        );

        tabelaCorpo.innerHTML = `
            <tr>
                <td colspan="7" class="loading-state">
                    <p style="color: var(--danger); font-weight: 600; font-size: 1rem;">
                        ⚠️ O back-end Spring Boot não está em execução na porta 8080
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px; max-width: 600px; margin-left: auto; margin-right: auto;">
                        O front-end tentou consultar <code>${getApiUrl()}</code>, mas nenhum serviço está escutando na porta.
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 14px;">
                        <button class="btn btn-primary btn-sm" onclick="alternarModo(true)">
                            🧪 Ativar Modo Simulado (Testar Agora)
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="abrirModalAjuda()">
                            ❓ Como Iniciar o Backend
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="carregarLivros()">
                            🔄 Tentar Novamente
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Renderiza as linhas da tabela
 */
function renderizarTabela(lista) {
    if (!lista || lista.length === 0) {
        tabelaCorpo.innerHTML = '';
        emptyState.style.display = 'block';
        document.getElementById('badgeTotalFiltrados').textContent = '0 livros listados';
        return;
    }

    emptyState.style.display = 'none';
    document.getElementById('badgeTotalFiltrados').textContent = `${lista.length} livro(s) listado(s)`;

    tabelaCorpo.innerHTML = lista.map(livro => {
        const estoqueClasse = livro.exemplares > 0 ? 'stock-positive' : 'stock-zero';
        const estoqueTexto = livro.exemplares > 0 ? `${livro.exemplares} unid.` : 'Esgotado (0)';

        return `
            <tr id="livro-row-${livro.id}">
                <td><strong>#${livro.id}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--dark);">${escapeHtml(livro.titulo)}</div>
                </td>
                <td>${escapeHtml(livro.autor)}</td>
                <td><span class="isbn-code">${escapeHtml(livro.isbn)}</span></td>
                <td><span class="badge badge-genre">${escapeHtml(livro.genero)}</span></td>
                <td><span class="stock-badge ${estoqueClasse}">${estoqueTexto}</span></td>
                <td>
                    <div class="actions-cell">
                        <button class="btn btn-sm btn-edit" title="Editar este livro (PUT)" onclick="abrirModalEdicao(${livro.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-sm btn-delete" title="Excluir este livro (DELETE)" onclick="abrirModalExclusao(${livro.id}, '${escapeJs(livro.titulo)}', '${escapeJs(livro.autor)}')">
                            🗑️ Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Atualiza os contadores de títulos e exemplares no topo
 */
function atualizarEstatisticas(lista) {
    const totalTitulos = lista.length;
    const totalExemplares = lista.reduce((acc, curr) => acc + (Number(curr.exemplares) || 0), 0);

    document.getElementById('totalLivros').textContent = totalTitulos;
    document.getElementById('totalExemplares').textContent = totalExemplares;
}

/**
 * Filtro em tempo real no front-end
 */
function filtrarLivros() {
    const termo = document.getElementById('searchInput').value.toLowerCase().trim();

    if (!termo) {
        renderizarTabela(livrosCache);
        return;
    }

    const filtrados = livrosCache.filter(livro => {
        return (livro.titulo && livro.titulo.toLowerCase().includes(termo)) ||
               (livro.autor && livro.autor.toLowerCase().includes(termo)) ||
               (livro.isbn && livro.isbn.toLowerCase().includes(termo)) ||
               (livro.genero && livro.genero.toLowerCase().includes(termo));
    });

    renderizarTabela(filtrados);
}

/**
 * Abre o modal limpo para novo cadastro (POST)
 */
function abrirModalCadastro() {
    limparErrosFormulario();
    livroForm.reset();
    document.getElementById('livroId').value = '';
    modalTitulo.textContent = 'Cadastrar Novo Livro (POST /livros)';
    btnSalvarTexto.textContent = 'Salvar Livro';
    livroModal.style.display = 'flex';
    document.getElementById('titulo').focus();
}

/**
 * READ (Buscar por ID): GET /livros/{id} e abre para Edição (PUT)
 */
async function abrirModalEdicao(id) {
    limparErrosFormulario();
    modalTitulo.textContent = `Editar Livro #${id} (PUT /livros/${id})`;
    btnSalvarTexto.textContent = 'Atualizar Alterações';

    // 1. MODO SIMULADO
    if (modoSimulado) {
        const livro = bancoEmMemoria.find(l => l.id === Number(id));
        if (!livro) {
            mostrarAlerta('danger', `Erro 404 (Not Found): O livro #${id} não foi encontrado.`);
            carregarLivros();
            return;
        }
        preencherFormularioEdicao(livro);
        return;
    }

    // 2. MODO REAL
    try {
        const response = await fetch(`${getApiUrl()}/${id}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.status === 404) {
            mostrarAlerta('danger', `Erro 404 (Not Found): O livro #${id} não foi encontrado no banco de dados.`);
            carregarLivros();
            return;
        }

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const livro = await response.json();
        preencherFormularioEdicao(livro);

    } catch (error) {
        mostrarAlerta('danger', `Falha ao carregar livro #${id}: O servidor não respondeu.`);
    }
}

function preencherFormularioEdicao(livro) {
    document.getElementById('livroId').value = livro.id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('isbn').value = livro.isbn;
    document.getElementById('genero').value = livro.genero;
    document.getElementById('exemplares').value = livro.exemplares;

    livroModal.style.display = 'flex';
    document.getElementById('titulo').focus();
}

/**
 * Fecha o modal de formulário
 */
function fecharModal() {
    livroModal.style.display = 'none';
    limparErrosFormulario();
}

/**
 * Limpa todos os estilos e mensagens de erro do formulário
 */
function limparErrosFormulario() {
    modalErrorAlert.style.display = 'none';
    modalErrorAlert.innerHTML = '';

    const inputs = livroForm.querySelectorAll('.form-control');
    inputs.forEach(input => input.classList.remove('is-invalid'));

    const errorDivs = livroForm.querySelectorAll('.field-error');
    errorDivs.forEach(div => {
        div.textContent = '';
        div.classList.remove('show');
    });
}

/**
 * Validação de dados (espelha Bean Validation do Spring Boot)
 */
function validarPayload(payload) {
    const validacoes = [];

    if (!payload.titulo || payload.titulo.trim().length === 0) {
        validacoes.push({ campo: 'titulo', mensagem: 'O título é obrigatório.' });
    } else if (payload.titulo.trim().length < 3 || payload.titulo.trim().length > 150) {
        validacoes.push({ campo: 'titulo', mensagem: 'O título deve possuir entre 3 e 150 caracteres.' });
    }

    if (!payload.autor || payload.autor.trim().length === 0) {
        validacoes.push({ campo: 'autor', mensagem: 'O autor é obrigatório.' });
    }

    if (!payload.isbn || payload.isbn.trim().length === 0) {
        validacoes.push({ campo: 'isbn', mensagem: 'O ISBN é obrigatório.' });
    }

    if (!payload.genero || payload.genero.trim().length === 0) {
        validacoes.push({ campo: 'genero', mensagem: 'O gênero é obrigatório.' });
    }

    if (payload.exemplares === null || payload.exemplares === undefined || isNaN(payload.exemplares)) {
        validacoes.push({ campo: 'exemplares', mensagem: 'O número de exemplares é obrigatório.' });
    } else if (payload.exemplares < 0) {
        validacoes.push({ campo: 'exemplares', mensagem: 'O número de exemplares deve ser um número inteiro maior ou igual a 0.' });
    }

    return validacoes;
}

/**
 * Salvar Livro: POST (cadastrar) ou PUT (atualizar)
 */
async function salvarLivro(event) {
    event.preventDefault();
    limparErrosFormulario();

    const id = document.getElementById('livroId').value;
    const isEdicao = Boolean(id);

    const rawExemplares = document.getElementById('exemplares').value;
    const payload = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        isbn: document.getElementById('isbn').value,
        genero: document.getElementById('genero').value,
        exemplares: rawExemplares === '' ? null : Number(rawExemplares)
    };

    setLoading(true);

    // -------------------------------------------------------------
    // EXECUÇÃO EM MODO SIMULADO
    // -------------------------------------------------------------
    if (modoSimulado) {
        setTimeout(() => {
            setLoading(false);

            // Validação de entrada (HTTP 400)
            const errosValidacao = validarPayload(payload);
            if (errosValidacao.length > 0) {
                exibirErrosValidacao({
                    status: 400,
                    mensagem: errosValidacao[0].mensagem,
                    validacoes: errosValidacao
                });
                return;
            }

            const isbnNormalizado = payload.isbn.trim();

            if (isEdicao) {
                // Atualização (PUT)
                const livroExistente = bancoEmMemoria.find(l => l.id === Number(id));
                if (!livroExistente) {
                    modalErrorAlert.innerHTML = `<strong>❌ Erro 404 Not Found:</strong> Livro não localizado com ID #${id}.`;
                    modalErrorAlert.style.display = 'block';
                    return;
                }

                // Verifica unicidade de ISBN com outros IDs (HTTP 409)
                const isbnDuplicado = bancoEmMemoria.some(l => l.isbn === isbnNormalizado && l.id !== Number(id));
                if (isbnDuplicado) {
                    exibirErro409(isbnNormalizado);
                    return;
                }

                livroExistente.titulo = payload.titulo.trim();
                livroExistente.autor = payload.autor.trim();
                livroExistente.isbn = isbnNormalizado;
                livroExistente.genero = payload.genero.trim();
                livroExistente.exemplares = payload.exemplares;

                fecharModal();
                mostrarAlerta('success', `Sucesso (200 OK): Livro #${id} ("${livroExistente.titulo}") atualizado com sucesso!`);
                carregarLivros();

            } else {
                // Cadastro (POST)
                const isbnExiste = bancoEmMemoria.some(l => l.isbn === isbnNormalizado);
                if (isbnExiste) {
                    exibirErro409(isbnNormalizado);
                    return;
                }

                const novoLivro = {
                    id: proximoIdSimulado++,
                    titulo: payload.titulo.trim(),
                    autor: payload.autor.trim(),
                    isbn: isbnNormalizado,
                    genero: payload.genero.trim(),
                    exemplares: payload.exemplares
                };
                bancoEmMemoria.push(novoLivro);

                fecharModal();
                mostrarAlerta('success', `Sucesso (201 Created): Livro "${novoLivro.titulo}" cadastrado com ID #${novoLivro.id}!`);
                carregarLivros();
            }
        }, 200);
        return;
    }

    // -------------------------------------------------------------
    // EXECUÇÃO EM MODO REAL (Spring Boot)
    // -------------------------------------------------------------
    const url = isEdicao ? `${getApiUrl()}/${id}` : getApiUrl();
    const metodo = isEdicao ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 201) {
            const livroCriado = await response.json();
            fecharModal();
            mostrarAlerta('success', `Sucesso (201 Created): Livro "${livroCriado.titulo}" cadastrado com sucesso com ID #${livroCriado.id}!`);
            carregarLivros();
            return;
        }

        if (response.status === 200) {
            const livroAtualizado = await response.json();
            fecharModal();
            mostrarAlerta('success', `Sucesso (200 OK): Livro #${livroAtualizado.id} ("${livroAtualizado.titulo}") atualizado com sucesso!`);
            carregarLivros();
            return;
        }

        const errorData = await response.json().catch(() => ({
            mensagem: 'Erro retornado pelo servidor.'
        }));

        if (response.status === 400) {
            exibirErrosValidacao(errorData);
        } else if (response.status === 409) {
            exibirErro409(payload.isbn);
        } else if (response.status === 404) {
            modalErrorAlert.innerHTML = `<strong>❌ Erro 404 Not Found:</strong> ${escapeHtml(errorData.mensagem || 'Livro não localizado no banco de dados.')}`;
            modalErrorAlert.style.display = 'block';
        } else {
            modalErrorAlert.innerHTML = `<strong>Erro ${response.status}:</strong> ${escapeHtml(errorData.mensagem || 'Falha ao processar solicitação.')}`;
            modalErrorAlert.style.display = 'block';
        }

    } catch (networkError) {
        modalErrorAlert.innerHTML = `<strong>Erro de Conexão:</strong> O servidor Spring Boot não respondeu na porta 8080.`;
        modalErrorAlert.style.display = 'block';
    } finally {
        setLoading(false);
    }
}

function exibirErro409(isbn) {
    document.getElementById('isbn').classList.add('is-invalid');
    const erroIsbnDiv = document.getElementById('error_isbn');
    erroIsbnDiv.textContent = `Conflito (409): Já existe um livro com o ISBN ${isbn}.`;
    erroIsbnDiv.classList.add('show');

    modalErrorAlert.innerHTML = `<strong>⚠️ Erro 409 (Conflict):</strong> Não pode existir mais de um livro com o mesmo ISBN (${escapeHtml(isbn)}).`;
    modalErrorAlert.style.display = 'block';
}

/**
 * Exibe erros de validação (HTTP 400)
 */
function exibirErrosValidacao(errorData) {
    let mensagemGeral = errorData.mensagem || 'Dados inválidos na requisição.';
    let listaErrosHtml = '';

    if (Array.isArray(errorData.validacoes) && errorData.validacoes.length > 0) {
        listaErrosHtml = '<ul style="margin-top: 6px; padding-left: 18px;">';
        errorData.validacoes.forEach(err => {
            listaErrosHtml += `<li><strong>${escapeHtml(err.campo)}:</strong> ${escapeHtml(err.mensagem)}</li>`;

            const input = document.getElementById(err.campo);
            if (input) {
                input.classList.add('is-invalid');
            }
            const fieldError = document.getElementById(`error_${err.campo}`);
            if (fieldError) {
                fieldError.textContent = err.mensagem;
                fieldError.classList.add('show');
            }
        });
        listaErrosHtml += '</ul>';
    }

    modalErrorAlert.innerHTML = `
        <strong>⚠️ Erro 400 (Bad Request):</strong> ${escapeHtml(mensagemGeral)}
        ${listaErrosHtml}
    `;
    modalErrorAlert.style.display = 'block';
}

/**
 * Modal de confirmação de exclusão
 */
function abrirModalExclusao(id, titulo, autor) {
    idLivroExclusao = id;
    document.getElementById('deleteLivroTitulo').textContent = `"${titulo}"`;
    document.getElementById('deleteLivroDetalhes').textContent = `Autor: ${autor} | ID: #${id}`;
    deleteModal.style.display = 'flex';
}

function fecharModalExclusao() {
    deleteModal.style.display = 'none';
    idLivroExclusao = null;
}

/**
 * DELETE: DELETE /livros/{id}
 */
async function executarExclusao() {
    if (!idLivroExclusao) return;

    const id = idLivroExclusao;
    const btnExcluir = document.getElementById('btnConfirmarExclusao');
    const textoOriginal = btnExcluir.innerHTML;

    btnExcluir.disabled = true;
    btnExcluir.innerHTML = 'Excluindo...';

    // 1. MODO SIMULADO
    if (modoSimulado) {
        setTimeout(() => {
            btnExcluir.disabled = false;
            btnExcluir.innerHTML = textoOriginal;
            fecharModalExclusao();

            const idx = bancoEmMemoria.findIndex(l => l.id === Number(id));
            if (idx === -1) {
                mostrarAlerta('danger', `Erro 404 (Not Found): O livro #${id} já não existe.`);
                return;
            }

            bancoEmMemoria.splice(idx, 1);
            mostrarAlerta('success', `Sucesso (204 No Content): O livro #${id} foi removido com sucesso!`);
            carregarLivros();
        }, 150);
        return;
    }

    // 2. MODO REAL
    try {
        const response = await fetch(`${getApiUrl()}/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });

        fecharModalExclusao();

        if (response.status === 204) {
            mostrarAlerta('success', `Sucesso (204 No Content): O livro #${id} foi removido com sucesso do banco de dados!`);
            carregarLivros();
            return;
        }

        if (response.status === 404) {
            mostrarAlerta('danger', `Erro 404 Not Found: Livro #${id} não encontrado para exclusão.`);
            carregarLivros();
            return;
        }

        mostrarAlerta('danger', `Falha ao excluir livro: Código HTTP ${response.status}`);

    } catch (error) {
        fecharModalExclusao();
        mostrarAlerta('danger', `Erro de conexão ao tentar excluir: O servidor não respondeu.`);
    } finally {
        btnExcluir.disabled = false;
        btnExcluir.innerHTML = textoOriginal;
    }
}

/**
 * Notificações tipo Toast
 */
function mostrarAlerta(tipo, mensagem) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;

    let icone = 'ℹ️';
    if (tipo === 'success') icone = '✅';
    if (tipo === 'danger') icone = '❌';
    if (tipo === 'warning') icone = '⚠️';
    if (tipo === 'info') icone = '💡';

    alertDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span>${icone}</span>
            <span>${escapeHtml(mensagem)}</span>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 6000);
}

/**
 * Banner superior de conexão
 */
let callbackBanner = null;

function exibirBannerConexao(mensagem, textoBotao, callback) {
    bannerMsg.textContent = mensagem;
    bannerActionBtn.textContent = textoBotao;
    callbackBanner = callback;
    connectionBanner.style.display = 'block';
}

function fecharBanner() {
    connectionBanner.style.display = 'none';
}

function acaoBanner() {
    if (typeof callbackBanner === 'function') {
        callbackBanner();
    }
}

/**
 * Modal de ajuda
 */
function abrirModalAjuda() {
    helpModal.style.display = 'flex';
}

function fecharModalAjuda() {
    helpModal.style.display = 'none';
}

/**
 * Estado de carregamento do botão salvar
 */
function setLoading(loading) {
    const btn = document.getElementById('btnSalvar');
    if (loading) {
        btn.disabled = true;
        btnSalvarSpinner.style.display = 'inline-block';
        btnSalvarTexto.textContent = 'Enviando...';
    } else {
        btn.disabled = false;
        btnSalvarSpinner.style.display = 'none';
        btnSalvarTexto.textContent = document.getElementById('livroId').value ? 'Atualizar Alterações' : 'Salvar Livro';
    }
}

function fecharModalSeClicarFora(event) {
    if (event.target === livroModal) fecharModal();
    if (event.target === deleteModal) fecharModalExclusao();
    if (event.target === helpModal) fecharModalAjuda();
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeJs(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}
