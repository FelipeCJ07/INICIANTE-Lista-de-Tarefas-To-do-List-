// --- SELETORES DO DOM ---
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCountElement = document.getElementById('task-count');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

// --- ESTADO DA APLICAÇÃO ---
let tasks = [];
let editingTaskId = null;

// --- FUNÇÕES DE LÓGICA ---
/**
 * Salva as tarefas no localStorage.
 */
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Carrega as tarefas do localStorage.
 */
function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

/**
 * Renderiza todas as tarefas na lista.
 */
function renderTasks() {
    taskList.innerHTML = ''; // Limpa a lista atual
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden'); // Mostra a mensagem de "nenhuma tarefa"
    } else {
        emptyState.classList.add('hidden'); // Esconde a mensagem de "nenhuma tarefa"
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    updateTaskCount(); // Atualiza a contagem de tarefas pendentes
}

/**
 * Cria um elemento HTML para uma tarefa individual.
 * @param {object} task - O objeto da tarefa.
 * @returns {HTMLElement} O elemento <li> da tarefa.
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    li.className = `flex items-center justify-between p-3 rounded-lg transition-all duration-300 group fade-in ${task.completed ? 'bg-gray-200 completed' : 'bg-gray-100'}`;

    if (editingTaskId === task.id) {
        // Modo de edição: exibe um input para editar o texto da tarefa
        li.innerHTML = `
            <div class="flex-grow mr-3">
                <input type="text" value="${escapeHTML(task.text)}" class="edit-input w-full bg-transparent text-gray-800 border-b-2 border-yellow-500 focus:outline-none py-1">
            </div>
            <div class="flex items-center gap-2">
                <button class="save-btn text-green-500 hover:text-green-600 transition-colors">
                    <i class="ph-check-circle text-2xl"></i>
                </button>
            </div>
        `;
        // Foca no input de edição após renderizar
        setTimeout(() => li.querySelector('.edit-input').focus(), 0);
    } else {
        // Modo de visualização: exibe o texto da tarefa e botões de ação
        li.innerHTML = `
            <div class="flex items-center gap-3 flex-grow min-w-0">
                <input type="checkbox" ${task.completed ? 'checked' : ''} class="toggle-checkbox h-5 w-5 rounded border-gray-400 bg-gray-200 text-red-600 focus:ring-red-500 cursor-pointer flex-shrink-0">
                <span class="task-text flex-grow truncate text-gray-800" title="${escapeHTML(task.text)}">${escapeHTML(task.text)}</span>
            </div>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button class="gemini-btn text-purple-500 hover:text-purple-400 transition-colors" title="✨ Dividir tarefa com IA">
                    <i class="ph-sparkle text-2xl"></i>
                </button>
                <button class="edit-btn text-yellow-500 hover:text-yellow-400 transition-colors" title="Editar tarefa">
                    <i class="ph-pencil-simple text-2xl"></i>
                </button>
                <button class="delete-btn text-red-500 hover:text-red-400 transition-colors" title="Excluir tarefa">
                    <i class="ph-trash-simple text-2xl"></i>
                </button>
            </div>
        `;
    }
    return li;
}

/**
 * Adiciona uma nova tarefa à lista.
 * @param {string} text - O texto da tarefa.
 */
function addTask(text) {
    if (text.trim() === '') return; // Não adiciona tarefas vazias
    const newTask = { id: Date.now(), text: text, completed: false };
    tasks.unshift(newTask); // Adiciona a nova tarefa no início
    saveTasksToLocalStorage();
    renderTasks();
}

/**
 * Alterna o status de conclusão de uma tarefa.
 * @param {number} id - O ID da tarefa.
 */
function toggleTaskCompleted(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed; // Inverte o status
        saveTasksToLocalStorage();
        renderTasks();
    }
}

/**
 * Exclui uma tarefa da lista.
 * @param {number} id - O ID da tarefa.
 */
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id); // Filtra a tarefa a ser removida
    saveTasksToLocalStorage();
    renderTasks();
}

/**
 * Ativa o modo de edição para uma tarefa específica.
 * @param {number} id - O ID da tarefa a ser editada.
 */
function enableEditMode(id) {
    editingTaskId = id;
    renderTasks(); // Renderiza novamente para mostrar o input de edição
}

/**
 * Salva o texto editado de uma tarefa.
 * @param {number} id - O ID da tarefa.
 * @param {string} newText - O novo texto da tarefa.
 */
function saveEditedTask(id, newText) {
     const task = tasks.find(t => t.id === id);
     if (task && newText.trim() !== '') {
         task.text = newText.trim();
         editingTaskId = null; // Sai do modo de edição
         saveTasksToLocalStorage();
         renderTasks();
     } else {
         editingTaskId = null; // Sai do modo de edição mesmo se o texto estiver vazio
         renderTasks();
     }
}

/**
 * Atualiza a contagem de tarefas pendentes.
 */
function updateTaskCount() {
    const pendingTasks = tasks.filter(t => !t.completed).length;
    taskCountElement.textContent = pendingTasks;
}

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string} str - A string a ser escapada.
 * @returns {string} A string com caracteres HTML escapados.
 */
function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

// --- FUNÇÕES DO MODAL ---
/**
 * Exibe o modal com o conteúdo especificado.
 * @param {string} content - O HTML a ser inserido no modal.
 */
function showModal(content) {
    modalContent.innerHTML = content;
    modal.classList.remove('hidden');
}

/**
 * Esconde o modal.
 */
function hideModal() {
    modal.classList.add('hidden');
    modalContent.innerHTML = '';
}

/**
 * Exibe um modal de carregamento.
 * @param {string} text - A mensagem de carregamento.
 */
function showLoadingModal(text) {
    showModal(`
        <div class="flex flex-col items-center justify-center gap-4">
           <div class="spinner"></div>
           <p class="text-lg font-medium text-gray-800">${text}</p>
        </div>
    `);
}

/**
 * Exibe um modal de erro.
 * @param {string} message - A mensagem de erro.
 */
function showErrorModal(message) {
     showModal(`
         <div class="flex flex-col items-center justify-center gap-4">
            <i class="ph-x-circle text-5xl text-red-500"></i>
            <p class="text-lg font-medium text-gray-800">Ocorreu um Erro</p>
            <p class="text-sm text-gray-600">${message}</p>
            <button onclick="hideModal()" class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Fechar</button>
         </div>
     `);
}

// --- INTEGRAÇÃO COM GEMINI API ---
/**
 * Chama a API Gemini para gerar subtarefas a partir de uma tarefa principal.
 * @param {string} taskText - O texto da tarefa principal.
 */
async function generateSubtasks(taskText) {
    showLoadingModal('✨ Analisando e dividindo a tarefa...');
    const prompt = `Você é um assistente de produtividade especialista. Sua função é quebrar uma tarefa principal em uma lista de 3 a 5 subtarefas acionáveis e concisas. Responda APENAS com um objeto JSON contendo uma única chave "subtarefas" que é um array de strings. Tarefa principal: "${taskText}"`;
    
    // Payload para a chamada da API Gemini com schema para JSON
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: { "subtarefas": { "type": "ARRAY", "items": { "type": "STRING" } } },
                required: ["subtarefas"]
            }
        }
    };
    
    const apiKey = ""; // Deixado em branco para ser gerenciado pelo ambiente Canvas
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Lança um erro se a resposta da API não for bem-sucedida
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        
        // Verifica a estrutura da resposta e extrai as subtarefas
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0].text) {
            const jsonResponse = JSON.parse(result.candidates[0].content.parts[0].text);
            const subtasks = jsonResponse.subtarefas;

            if (subtasks && subtasks.length > 0) {
                // Adiciona cada subtarefa à lista de tarefas, prefixando com um hífen
                subtasks.reverse().forEach(subtask => addTask(`- ${subtask}`));
            } else {
                // Erro se a IA não retornar subtarefas válidas
                throw new Error("A IA não retornou subtarefas.");
            }
            hideModal(); // Esconde o modal de carregamento
        } else {
            // Erro se a estrutura da resposta for inválida
            throw new Error("Resposta da API inválida ou vazia.");
        }
    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        // Mostra um modal de erro com a mensagem apropriada
        showErrorModal(error.message || "Não foi possível gerar as subtarefas. Tente novamente.");
    }
}

// --- EVENT LISTENERS ---
// Listener para o envio do formulário (adicionar tarefa)
taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    addTask(taskInput.value); // Adiciona a tarefa
    taskInput.value = ''; // Limpa o input
    taskInput.focus(); // Retorna o foco ao input
});

// Listener para cliques na lista de tarefas (toggle, delete, edit, gemini)
taskList.addEventListener('click', (e) => {
    const target = e.target;
    const taskElement = target.closest('li'); // Encontra o elemento <li> da tarefa
    if (!taskElement) return; // Se não clicou em uma tarefa, ignora

    const taskId = Number(taskElement.dataset.id); // Obtém o ID da tarefa

    if (target.classList.contains('toggle-checkbox')) {
        toggleTaskCompleted(taskId); // Marca/desmarca a tarefa como concluída
    } else if (target.closest('.delete-btn')) {
        deleteTask(taskId); // Exclui a tarefa
    } else if (target.closest('.edit-btn')) {
        enableEditMode(taskId); // Entra no modo de edição
    } else if (target.closest('.save-btn')) {
        const input = taskElement.querySelector('.edit-input');
        saveEditedTask(taskId, input.value); // Salva a tarefa editada
    } else if (target.closest('.gemini-btn')) {
        const taskText = taskElement.querySelector('.task-text').textContent;
        generateSubtasks(taskText); // Gera subtarefas com IA
    }
});

// Listener para eventos de teclado na lista (salvar edição com Enter, cancelar com Escape)
taskList.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
        const taskElement = e.target.closest('li');
        const taskId = Number(taskElement.dataset.id);
        saveEditedTask(taskId, e.target.value);
    } else if (e.key === 'Escape' && e.target.classList.contains('edit-input')) {
        editingTaskId = null; // Cancela o modo de edição
        renderTasks(); // Renderiza novamente para sair do modo de edição
    }
});

// Listener para fechar o modal clicando fora do conteúdo
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// Inicializa a aplicação quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage(); // Carrega tarefas salvas
    renderTasks(); // Renderiza as tarefas
});
