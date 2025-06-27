/**
 * SISTEMA DE FICHAS DE LEITURA
 * 
 * Funcionalidades:
 * - Adicionar novas fichas
 * - Visualizar todas as fichas
 * - Editar fichas existentes
 * - Excluir fichas
 * - Filtrar por tags
 * - Persistência com localStorage
 */

// Constantes para elementos da DOM
const DOM = {
    FORM: document.getElementById('form-ficha'),
    LISTA: document.getElementById('lista-fichas'),
    INPUT_TITULO: document.getElementById('input-titulo'),
    INPUT_CONTEUDO: document.getElementById('input-conteudo'),
    INPUT_TAGS: document.getElementById('input-tags'),
    FILTRO_TAGS: document.getElementById('filtro-tags'),
    BTN_CANCELAR: document.getElementById('btn-cancelar'),
    BTN_LIMPAR: document.getElementById('limpar-filtro'),
    INPUT_ID: document.getElementById('ficha-id')
};

// Chave para armazenamento no localStorage
const STORAGE_KEY = 'fichasDeLeituraApp';

// Modo de edição (null = não está editando, ID = está editando)
let modoEdicao = null;

// Array para armazenar as fichas em memória
let fichas = [];

/**
 * Inicializa o aplicativo quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    carregarFichas();
    renderizarFichas();
    atualizarFiltroTags();
    configurarEventListeners();
});

/**
 * Carrega as fichas do localStorage
 */
function carregarFichas() {
    const dados = localStorage.getItem(STORAGE_KEY);
    fichas = dados ? JSON.parse(dados) : [];
}

/**
 * Salva as fichas no localStorage
 */
function salvarFichas() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fichas));
}

/**
 * Renderiza todas as fichas na tela
 * @param {string} filtroTag - Tag para filtrar (opcional)
 */
function renderizarFichas(filtroTag = '') {
    DOM.LISTA.innerHTML = '';
    
    const fichasParaExibir = filtroTag 
        ? fichas.filter(ficha => ficha.tags.includes(filtroTag))
        : fichas;
    
    if (fichasParaExibir.length === 0) {
        DOM.LISTA.innerHTML = `
            <div class="col">
                <div class="alert alert-info">Nenhuma ficha encontrada.</div>
            </div>
        `;
        return;
    }
    
    fichasParaExibir.forEach(ficha => {
        DOM.LISTA.appendChild(criarCardFicha(ficha));
    });
}

/**
 * Cria um elemento card para uma ficha
 * @param {object} ficha - Objeto contendo os dados da ficha
 */
function criarCardFicha(ficha) {
    const card = document.createElement('div');
    card.className = 'col';
    card.innerHTML = `
        <div class="card h-100 ficha-card shadow-sm">
            <div class="card-body">
                <h5 class="card-title">${ficha.titulo}</h5>
                <p class="card-text">${ficha.conteudo}</p>
                
                <div class="mb-3">
                    ${ficha.tags.map(tag => `<span class="badge tag-badge bg-primary">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="card-footer bg-transparent">
                <small class="text-muted">Criado em: ${new Date(ficha.id).toLocaleDateString()}</small>
                <div class="float-end">
                    <button class="btn btn-sm btn-outline-primary btn-editar" data-id="${ficha.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${ficha.id}">Excluir</button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Atualiza o dropdown de filtro com as tags disponíveis
 */
function atualizarFiltroTags() {
    // Coletar todas as tags únicas
    const todasTags = [];
    fichas.forEach(ficha => {
        ficha.tags.forEach(tag => {
            if (!todasTags.includes(tag)) {
                todasTags.push(tag);
            }
        });
    });
    
    // Limpar e adicionar opções
    DOM.FILTRO_TAGS.innerHTML = '<option value="">Todas as tags</option>';
    todasTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        DOM.FILTRO_TAGS.appendChild(option);
    });
}

/**
 * Configura todos os event listeners
 */
function configurarEventListeners() {
    // Formulário: submit (adicionar/editar)
    DOM.FORM.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const titulo = DOM.INPUT_TITULO.value.trim();
        const conteudo = DOM.INPUT_CONTEUDO.value.trim();
        const tags = DOM.INPUT_TAGS.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (modoEdicao) {
            // Editar ficha existente
            const index = fichas.findIndex(f => f.id === modoEdicao);
            if (index !== -1) {
                fichas[index] = {
                    ...fichas[index],
                    titulo,
                    conteudo,
                    tags
                };
            }
            modoEdicao = null;
            DOM.BTN_CANCELAR.classList.add('d-none');
        } else {
            // Adicionar nova ficha
            const novaFicha = {
                id: Date.now(),
                titulo,
                conteudo,
                tags,
                dataCriacao: new Date().toISOString()
            };
            fichas.push(novaFicha);
        }
        
        salvarFichas();
        renderizarFichas();
        atualizarFiltroTags();
        DOM.FORM.reset();
    });
    
    // Botão cancelar edição
    DOM.BTN_CANCELAR.addEventListener('click', function() {
        modoEdicao = null;
        DOM.FORM.reset();
        DOM.BTN_CANCELAR.classList.add('d-none');
        DOM.INPUT_ID.value = '';
    });
    
    // Filtro por tags
    DOM.FILTRO_TAGS.addEventListener('change', function() {
        renderizarFichas(this.value);
    });
    
    // Botão limpar filtro
    DOM.BTN_LIMPAR.addEventListener('click', function() {
        DOM.FILTRO_TAGS.value = '';
        renderizarFichas();
    });
    
    // Delegation para botões editar/excluir (já que são dinâmicos)
    DOM.LISTA.addEventListener('click', function(e) {
        // Editar
        if (e.target.classList.contains('btn-editar')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const ficha = fichas.find(f => f.id === id);
            
            if (ficha) {
                modoEdicao = id;
                DOM.INPUT_ID.value = id;
                DOM.INPUT_TITULO.value = ficha.titulo;
                DOM.INPUT_CONTEUDO.value = ficha.conteudo;
                DOM.INPUT_TAGS.value = ficha.tags.join(', ');
                DOM.BTN_CANCELAR.classList.remove('d-none');
                DOM.INPUT_TITULO.focus();
            }
        }
        
        // Excluir
        if (e.target.classList.contains('btn-excluir')) {
            if (confirm('Tem certeza que deseja excluir esta ficha?')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                fichas = fichas.filter(f => f.id !== id);
                salvarFichas();
                renderizarFichas();
                atualizarFiltroTags();
                
                // Se estava editando a ficha excluída, cancela a edição
                if (modoEdicao === id) {
                    modoEdicao = null;
                    DOM.FORM.reset();
                    DOM.BTN_CANCELAR.classList.add('d-none');
                }
            }
        }
    });
}