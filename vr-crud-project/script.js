const API_URL = 'http://localhost:3000/items';
const scene = document.querySelector('a-scene');
const container = document.querySelector('#items-container');
const rig = document.getElementById('camera-rig') || document.querySelector('[camera]').parentNode; // Tenta pegar rig ou pai da camera
const camera = document.querySelector('[camera]');

// Estado para controle
let selectedItemId = null;
let isMovingItem = false; // Flag para saber se estamos movendo algo
let moveInterval = null; // Intervalo para atualizar posição

// ===============================================================
// Inicialização
// ===============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Carregar itens ao iniciar (Read)
    fetchItems();
    setupButtons();
    setupCameraMovement();
    loadCameraPosition(); // Restaura posição salva
    setupDropKey(); // Configura tecla Q
});

// Tecla Q para soltar objeto
function setupDropKey() {
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'q') {
            stopMovingItem();
        }
    });
}


// Salvar posição ao sair/atualizar a página
window.addEventListener('beforeunload', saveCameraPosition);

function saveCameraPosition() {
    const rig = document.getElementById('camera-rig');
    if (rig) {
        const currentPos = rig.getAttribute('position');
        localStorage.setItem('vr_camera_pos', JSON.stringify(currentPos));
    }
}

function loadCameraPosition() {
    const savedPos = localStorage.getItem('vr_camera_pos');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            const rig = document.getElementById('camera-rig');
            if (rig) {
                rig.setAttribute('position', pos);
                console.log('Posição da câmera restaurada:', pos);
            }
        } catch (e) {
            console.error('Erro ao restaurar posição:', e);
        }
    }
}

// Configure button listeners
function setupButtons() {
    const buttons = document.querySelectorAll('.crud-button');
    buttons.forEach(btn => {
        // O evento 'click' é disparado após (fuseTimeout) ms de olhar fixo
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleAction(action);
            
            // Feedback visual simples no botão
            btn.setAttribute('animation', 'property: scale; to: 1.1 1.1 1.1; dur: 200; yoyo: true');
        });
    });
}

function selectItem(id) {
    // Remove destaque do anterior
    if (selectedItemId) {
        const prevEl = document.getElementById(`item-${selectedItemId}`);
        if (prevEl) {
            // Restaura material original (remove emissive e wireframe)
            prevEl.removeAttribute('animation__glow');
            prevEl.removeAttribute('animation__scale');
            prevEl.setAttribute('scale', '1 1 1');
            prevEl.setAttribute('material', 'emissive', '#000');
            
            // Remove o "wireframe" de seleção se existir
            const wireframe = prevEl.querySelector('.selection-wireframe');
            if (wireframe) prevEl.removeChild(wireframe);
        }
    }

    selectedItemId = id;
    const el = document.getElementById(`item-${id}`);
    
    if (el) {
        // Adiciona um "wireframe" externo para destacar melhor
        const wireframe = document.createElement('a-box');
        wireframe.setAttribute('class', 'selection-wireframe');
        wireframe.setAttribute('material', 'wireframe: true; color: white');
        wireframe.setAttribute('scale', '1.1 1.1 1.1'); // Ligeiramente maior
        el.appendChild(wireframe);

        // Adiciona brilho (Glow) e leve pulsação de escala
        el.setAttribute('material', 'emissive', '#555');
        el.setAttribute('animation__glow', 'property: material.emissiveIntensity; from: 0.2; to: 0.8; dur: 800; dir: alternate; loop: true');
        // Pequena animação de escala no objeto principal
        el.setAttribute('animation__scale', 'property: scale; from: 1 1 1; to: 1.05 1.05 1.05; dur: 800; dir: alternate; loop: true');
        
        console.log(`Item ${id} selecionado.`);
    }
}

// ===============================================================
// Camera Vertical Movement
// ===============================================================
function setupCameraMovement() {
    const rig = document.getElementById('camera-rig');
    if (!rig) return;

    const keys = {
        Shift: false,
        Space: false
    };

    const speed = 0.05;
    const minHeight = 0.5; // Limite mínimo
    const maxHeight = 10.0; // Limite máximo

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') keys.Shift = true;
        if (e.code === 'Space') keys.Space = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') keys.Shift = false;
        if (e.code === 'Space') keys.Space = false;
    });

    function updatePosition() {
        if (keys.Shift || keys.Space) {
            const currentPosition = rig.getAttribute('position');
            let newY = currentPosition.y;

            if (keys.Space) {
                newY += speed;
            }
            if (keys.Shift) {
                newY -= speed;
            }

            // Aplicar limites
            if (newY < minHeight) newY = minHeight;
            if (newY > maxHeight) newY = maxHeight;

            if (newY !== currentPosition.y) {
                rig.setAttribute('position', {
                    x: currentPosition.x,
                    y: newY,
                    z: currentPosition.z
                });
            }
        }
        requestAnimationFrame(updatePosition);
    }
    
    // Inicia loop
    updatePosition();
}

async function handleAction(action) {
    console.log(`Ação disparada: ${action}`);
    switch (action) {
        case 'create':
            await createItem();
            break;
        case 'read':
            await fetchItems();
            break;
        case 'update':
            await updateSelectedItem();
            break;
        case 'move':
            startMovingItem();
            break;
        case 'delete':
            await deleteSelectedItem();
            break;
        case 'list':
            stackItems();
            break;
    }
}

// ===============================================================
// LIST (Empilhar Itens)
// ===============================================================
async function stackItems() {
    const items = document.querySelectorAll('#items-container > a-box');
    if (items.length === 0) {
        console.log("Nenhum item para empilhar.");
        return;
    }

    console.log(`Empilhando ${items.length} itens...`);
    
    // Obter posição do container e da camera para calcular onde empilhar
    // Vamos empilhar na frente do container (0, 0, 0 local -> 0, 0, -4 global)
    
    let currentY = 0.5; // Altura inicial (metade da altura do box padrão 1m)
    const updatePromises = [];
    
    items.forEach((item, index) => {
        // Remove física temporariamente para mover sem conflitos
        item.removeAttribute('dynamic-body');
        item.removeAttribute('velocity'); // Remove velocidade anterior

        // Define posição na pilha (x=0, z=0 é o centro do container)
        // Y cresce conforme o index
        const newPos = `0 ${currentY.toFixed(2)} 0`;
        item.setAttribute('position', newPos);
        item.setAttribute('rotation', '0 0 0'); // Alinha rotação

        // Salvar nova posição no banco de dados
        // Precisamos extrair o ID numérico do string "item-123"
        const id = item.getAttribute('id').replace('item-', '');
        
        updatePromises.push(
            fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position: newPos })
            }).then(res => {
                if (!res.ok) console.error(`Falha ao salvar item ${id}`);
            })
        );

        // Reativa física após breve delay para estabilizar
        // Staggered activation (um após o outro) ajuda na estabilidade
        setTimeout(() => {
             item.setAttribute('dynamic-body', 'shape: box; mass: 1');
        }, 100 + (index * 100));

        // Incrementa altura para o próximo
        currentY += 1.05; // 1.0 + 0.05 margem
    });

    // Aguarda todas as atualizações terminarem
    try {
        await Promise.all(updatePromises);
        console.log('Pilha salva no banco com sucesso.');
    } catch (error) {
        console.error('Erro ao salvar estado da pilha:', error);
    }
}

// ===============================================================
// MOVE (Inicia o carregamento do objeto)
// ===============================================================
function startMovingItem() {
    if (!selectedItemId) {
        console.log('Nenhum item selecionado para mover.');
        return;
    }

    if (isMovingItem) return; // Já está movendo

    const el = document.getElementById(`item-${selectedItemId}`);
    if (!el) return;

    isMovingItem = true;
    console.log('Movendo item... Pressione Q para soltar.');

    // Muda a cor do cursor
    const cursor = document.querySelector('[cursor]');
    if (cursor) cursor.setAttribute('material', 'color', 'purple');

    // Mover objeto para dentro da câmera (virar filho da câmera)
    // Isso faz ele se mover automaticamente com o jogador
    const cameraEl = document.querySelector('[camera]');
    
    // Calcula posição local relativa à câmera (frente)
    // Se estivesse no container, position era global. Como filho da camera, position é local.
    // 0 0 -3 significa 3 metros na frente da câmera.
    
    // Remove do container antigo e anexa à câmera
    // Nota: Em A-Frame/Three.js mudar parent reseta transformações se não cuidarmos.
    // Aqui queremos forçar ele a ir para a frente da câmera.
    el.parentNode.removeChild(el);
    cameraEl.appendChild(el);
    
    // Remove física para evitar conflitos ao segurar
    el.removeAttribute('dynamic-body');
    el.removeAttribute('velocity'); // Limpa velocidade residual

    // Posiciona o objeto "na mão" (no lugar do cursor)
    // -1.2 é uma distância confortável para ver o objeto segurado
    el.setAttribute('position', '0 0 -1.2');
    el.setAttribute('rotation', '0 0 0'); // Reseta rotação para ficar alinhado
}

// ===============================================================
// DROP (Solta o objeto e Salva nova posição)
// ===============================================================
async function stopMovingItem() {
    if (!isMovingItem || !selectedItemId) return;

    isMovingItem = false;
    
    console.log('Item solto. Salvando nova posição...');

    const el = document.getElementById(`item-${selectedItemId}`);
    const cameraEl = document.querySelector('[camera]');
    
    // Obter posição atual no MUNDO antes de desconectar da câmera
    const worldPos = new THREE.Vector3();
    el.object3D.getWorldPosition(worldPos);

    // Calcular posição relativa ao container (para corrigir offset de -4)
    const containerPos = new THREE.Vector3();
    container.object3D.getWorldPosition(containerPos);
    const localPos = worldPos.clone().sub(containerPos);

    // Reparentar de volta para o container original
    el.parentNode.removeChild(el);
    container.appendChild(el);

    // Aplicar a posição local correta
    el.setAttribute('position', `${localPos.x} ${localPos.y} ${localPos.z}`);
    
    // Reativa a física (gravidade) com pequeno delay
    setTimeout(() => {
        el.setAttribute('dynamic-body', 'shape: box; mass: 1');
    }, 50);

    // Restaura cor do cursor
    const cursor = document.querySelector('[cursor]');
    if (cursor) cursor.setAttribute('material', 'color', 'white');

    // Salva no Backend (UPDATE Parcial)
    try {
        const response = await fetch(`${API_URL}/${selectedItemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Salva a posição RELATIVA ao container, não a global
                // Assim, quando recarregar e for filho do container, estará certo.
                position: `${localPos.x.toFixed(2)} ${localPos.y.toFixed(2)} ${localPos.z.toFixed(2)}`
            })
        });

        if (response.ok) {
            console.log(`Nova posição salva (API): ${localPos.x}, ${localPos.y}, ${localPos.z}`);
            // Feedback visual
            el.setAttribute('animation__drop', 'property: scale; from: 1.2 1.2 1.2; to: 1 1 1; dur: 300; easing: easeOutElastic');

            // Recarrega todos os itens para garantir consistência visual x banco
            // Obs: Isso recria os elementos, mas garante que o que você vê é o que está no banco.
            // Se preferir não recarregar (para evitar flicker), comente a linha abaixo.
            fetchItems();
        }
    } catch (error) {
        console.error('Erro ao salvar posição:', error);
        // Em caso de erro, talvez devêssemos reverter visualmente, mas por hora mantemos onde ficou.
    }
}

// ===============================================================
// CREATE (POST)
// ===============================================================
async function createItem() {
    // Gera uma posição aleatória próxima ao centro
    const randomX = (Math.random() * 4) - 2; // -2 a 2
    const randomY = (Math.random() * 2) + 0.5; // 0.5 a 2.5
    const randomZ = (Math.random() * 2) - 1; // -1 a 1 (offset do container)

    const newItem = {
        name: `Item ${Date.now().toString().slice(-4)}`,
        color: getRandomColor(),
        position: `${randomX.toFixed(2)} ${randomY.toFixed(2)} ${randomZ.toFixed(2)}`
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            // Em vez de renderizar direto, recarregamos tudo do banco
            fetchItems();
            console.log('Item criado e banco recarregado.');
        }
    } catch (error) {
        console.error('Erro ao criar:', error);
    }
}

// ===============================================================
// READ (GET)
// ===============================================================
async function fetchItems() {
    try {
        const response = await fetch(API_URL);
        const items = await response.json();
        
        // Limpar container
        container.innerHTML = '';
        selectedItemId = null; // Reseta seleção
        
        // Renderizar todos
        items.forEach(item => {
            renderItem(item);
        });
        console.log('Itens carregados');
    } catch (error) {
        console.error('Erro ao listar:', error);
    }
}

// ===============================================================
// UPDATE (PUT/PATCH) - Modifica o item SELECIONADO
// ===============================================================
async function updateSelectedItem() {
    if (!selectedItemId) {
        console.log('Nenhum item selecionado para atualizar.');
        return;
    }

    const updatedData = {
        color: getRandomColor(),
        name: `Upd ${Date.now().toString().slice(-4)}`
    };

    try {
        const response = await fetch(`${API_URL}/${selectedItemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            // Atualiza visualmente
            const el = document.getElementById(`item-${selectedItemId}`);
            if (el) {
                el.setAttribute('material', 'color', updatedData.color);
                // Atualiza também o texto do nome
                const textEl = el.querySelector('a-text');
                if (textEl) textEl.setAttribute('value', updatedData.name);
            }
            console.log(`Item ${selectedItemId} atualizado.`);
        }
    } catch (error) {
        console.error('Erro ao atualizar:', error);
    }
}

// ===============================================================
// DELETE (DELETE) - Remove o item SELECIONADO
// ===============================================================
async function deleteSelectedItem() {
    if (!selectedItemId) {
        console.log('Nenhum item selecionado para deletar.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${selectedItemId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log(`Item ${selectedItemId} removido.`);
            selectedItemId = null;
            // Recarrega banco visual
            fetchItems();
        }
        }
        catch (error) {
            console.error('Erro ao deletar:', error);
        }
    }

// ===============================================================
// HELPERS
// ===============================================================
function renderItem(item) {
    const el = document.createElement('a-box');
    el.setAttribute('id', `item-${item.id}`);
    el.setAttribute('position', item.position);
    el.setAttribute('material', `color: ${item.color}`);
    el.setAttribute('class', 'clickable'); // Importante para o Gaze Cursor (raycaster)
    
    // Evento de seleção ao olhar/clicar
    el.addEventListener('click', () => {
        selectItem(item.id);
    });

    // Removido a-text (nome do objeto) conforme solicitado

    container.appendChild(el);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}