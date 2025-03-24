// URL da API - substitua pelo endpoint da sua API
const apiUrl = 'https://67e1b05058cc6bf78526cb66.mockapi.io/movies';

// Variável para armazenar o filme em edição
let editingMovieId = null;

let isFirstFetch = true; // Variável para verificar se é a primeira execução

// Função para buscar filmes e atualizar a tabela
async function fetchMovies() {
    try {
        const response = await fetch(apiUrl);
        const movies = await response.json();
        displayMovies(movies);
        if (isFirstFetch) {
            showNotification('Sucesso ao buscar filmes', 'success');
            isFirstFetch = false; // Atualiza a variável para evitar repetições
        }
    } catch (error) {
        showNotification('Erro ao buscar filmes', 'error');
    }
}



function showNotification(message, type) {
    const container = document.getElementById('notification-container');

    // Cria o elemento da notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    console.log(`notification ${type}`);
    notification.textContent = message;

    // Adiciona ao container
    container.appendChild(notification);

    // Remove a notificação após 4 segundos
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Função para converter a data para o formato brasileiro
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
// Função para escapar aspas simples e duplas
function escapeSpecialChars(str) {
    if (!str) return ''; // Caso a string seja nula ou indefinida
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Função para adicionar os dados em tabela
function displayMovies(movies) {
    const tbody = document.getElementById('moviesTable').querySelector('tbody');
    tbody.innerHTML = '';

    movies.forEach(movie => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <div class="linha">
                <td class="poster"><div class="image-container"><img src="${movie.poster}" alt="Poster"></div></td>
                <td class="info">
                    <h2 class="nome">${movie.name}</h2>
                    <div class="description">${movie.description}</div></td>
                <td class="details">
                    <div class="diretor"><strong>Dirigido por: </strong>${movie.diretor}</div>
                    <div class="data"><strong>Lançado em: </strong>${formatDate(movie.realeseDate)}</div>
                    <div class="nota">${renderStars(movie.rating)}</div></td>
                <td class="actions">
                    <button class="edit-btn" 
                        onclick="openEditPopup(
                            ${movie.id}, 
                            '${escapeSpecialChars(movie.name)}', 
                            '${escapeSpecialChars(movie.diretor)}', 
                            '${movie.realeseDate}', 
                            '${escapeSpecialChars(movie.poster)}', 
                            '${escapeSpecialChars(movie.description)}', 
                            '${movie.rating}'
                        )"><i class="material-icons-outlined">edit</i></button>
                    <button class="dlt-btn" onclick="deleteMovie(${movie.id})"><span class="material-icons">delete</span></button>
                </td>
            </div>
        `;
        tbody.appendChild(row);
    });
}
// Função para converter a data para o formato YYYY-MM-DD (ISO 8601 sem timezone)
function formatDateToInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}



function openEditPopup(id, name, diretor, realeseDate, poster, description, rating) {
    document.getElementById('popupTitle').innerText = 'Editar Filme';
    editingMovieId = id;

    // Ocultar mensagens de erro
    document.getElementById('nameError').style.display = 'none';
    document.getElementById('directorError').style.display = 'none';
    document.getElementById('dateError').style.display = 'none';
    document.getElementById('posterError').style.display = 'none';
    document.getElementById('descriptionError').style.display = 'none';
    document.getElementById('ratingError').style.display = 'none';

    // Ajustar o botão de salvar para a função de edição
    document.querySelector('.save-btn').setAttribute('onclick', 'saveChanges()');

    // Preencher os campos com os dados do filme selecionado
    document.getElementById('editName').value = name;
    document.getElementById('editDirector').value = diretor;

    // Converter a data para o formato AAAA-MM-DD antes de exibir
    document.getElementById('editRealeseDate').value = formatDateToInput(realeseDate);

    document.getElementById('editPoster').value = poster;
    document.getElementById('editDescription').value = description;
    document.getElementById('editRating').value = rating;

    // Exibir o pop-up com a animação
    const popup = document.getElementById('editPopup');
    popup.style.display = 'flex'; // Tornar o pop-up visível
    popup.offsetHeight; // Forçar o reflow para garantir que a animação inicie do estado inicial
    popup.classList.add('show'); // Adicionar a classe de animação
}

// Função para fechar o pop-up
function closeEditPopup() {
    const popup = document.getElementById('editPopup');
    popup.classList.remove('show'); // Remove a classe 'show' para fechar com animação

    // Aguarda a animação de fechamento para realmente esconder o pop-up
    setTimeout(function() {
        popup.style.display = 'none'; // Esconde o pop-up após a animação
    }, 300); // O tempo da animação de fechamento é 300ms (deve coincidir com o tempo da animação no CSS)
}

// Função para salvar as alterações
async function saveChanges() {
    // Capturar valores dos campos e remover espaços extras
    const name = document.getElementById('editName').value.trim();
    const director = document.getElementById('editDirector').value.trim();
    const realeseDate = document.getElementById('editRealeseDate').value.trim();
    const poster = document.getElementById('editPoster').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const rating = document.getElementById('editRating').value.trim();

    // Validação reutilizável
    const fields = [
        { id: 'nameError', value: name },
        { id: 'directorError', value: director },
        { id: 'dateError', value: realeseDate },
        { id: 'posterError', value: poster },
        { id: 'descriptionError', value: description },
        { id: 'ratingError', value: rating }
    ];

    let isValid = true;

    fields.forEach(field => {
        if (!field.value) {
            document.getElementById(field.id).style.display = 'block';
            isValid = false;
        } else {
            document.getElementById(field.id).style.display = 'none';
        }
    });

    // Validar intervalo do campo `rating`
    if (isValid && (rating < 0 || rating > 10)) {
        document.getElementById('ratingError').innerText = 'A nota deve estar entre 0 e 10.';
        document.getElementById('ratingError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('ratingError').innerText = 'Este campo é obrigatório.';
    }

    // Interromper a função se houver erros
    if (!isValid) return;

    // Concatenar "T07:00:00" para ajustar a data
    const formattedDate = `${realeseDate}T07:00:00`;

    const updatedMovie = {
        name: name,
        diretor: director,
        realeseDate: formattedDate, // Garantir consistência do formato
        poster: poster,
        description: description,
        rating: rating
    };

    try {
        const response = await fetch(`${apiUrl}/${editingMovieId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedMovie)
        });

        if (response.ok) {
            closeEditPopup();
            fetchMovies(); // Recarregar a lista de filmes
            showNotification('Filme editado com sucesso', 'success');
        }
    } catch (error) {
        showNotification('Erro ao editar filme', 'error');
    }
}


// Função para deletar o filme
async function deleteMovie(id) {
    try {
        await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });
        showNotification('Filme excluído com sucesso', 'success');
        fetchMovies(); // Atualiza a lista de filmes após exclusão
    } catch (error) {
        showNotification('Erro ao excluir filme', 'error');
    }
}

// Inicializa a página com a lista de filmes
fetchMovies();


// Função para filtrar filmes
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#moviesTable tbody tr');
    rows.forEach(row => {
        const cells = Array.from(row.cells).map(cell => cell.textContent.toLowerCase());
        row.style.display = cells.some(cell => cell.includes(searchTerm)) ? '' : 'none';
    });
});



// Array para rastrear a direção de ordenação de cada coluna (true = crescente, false = decrescente)
const sortDirection = [true, true, true]; // Nome, Data, Nota

function sortTable(columnIndex) {
    const table = document.getElementById("moviesTable");
    const rows = Array.from(table.getElementsByTagName("tbody")[0].rows);
    const isAscending = sortDirection[columnIndex]; // Pega a direção atual

    rows.sort((a, b) => {
        let cellA, cellB;

        if (columnIndex === 1) { // Coluna de Data
            cellA = a.querySelector(".data").textContent.trim().split(": ")[1];
            cellB = b.querySelector(".data").textContent.trim().split(": ")[1];

            const dateA = parseBrazilianDate(cellA);
            const dateB = parseBrazilianDate(cellB);
            return isAscending ? dateA - dateB : dateB - dateA;
        } else if (columnIndex === 2) { // Coluna de Nota
            cellA = parseFloat(a.querySelector(".stars").getAttribute("data-rating")) || 0;
            cellB = parseFloat(b.querySelector(".stars").getAttribute("data-rating")) || 0;
            return isAscending ? cellA - cellB : cellB - cellA;
        } else { // Coluna de Nome
            cellA = a.querySelector(".nome").textContent.trim();
            cellB = b.querySelector(".nome").textContent.trim();
            return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    });

    // Atualiza a direção de ordenação para a próxima vez que a coluna for clicada
    sortDirection[columnIndex] = !isAscending;

    // Atualiza a tabela com as linhas ordenadas
    const tbody = table.getElementsByTagName("tbody")[0];
    tbody.innerHTML = ""; // Limpa as linhas atuais
    rows.forEach(row => tbody.appendChild(row)); // Adiciona as linhas ordenadas

    // Atualiza os ícones de ordenação
    updateSortArrows(columnIndex, isAscending);
}


// Função para converter datas em formato DD/MM/AAAA para objetos Date
function parseBrazilianDate(dateString) {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day); // Ajusta o mês para zero-indexado
}

// Função para atualizar os ícones de ordenação
function updateSortArrows(columnIndex, isAscending) {
    const headers = document.querySelectorAll(".options li");
    headers.forEach((header, index) => {
        header.classList.remove("ascending", "descending"); // Remove classes antigas
        if (index === columnIndex) {
            header.classList.add(isAscending ? "ascending" : "descending");
        }
    });
}




// Função para converter datas em formato DD/MM/AAAA para objetos Date
function parseBrazilianDate(dateString) {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day); // Ajusta o mês para zero-indexado
}

// Função para atualizar os ícones de ordenação
function updateSortArrows(columnIndex, isAscending) {
    const headers = document.querySelectorAll(".options li");
    headers.forEach((header, index) => {
        header.classList.remove("ascending", "descending"); // Remove classes antigas
        if (index === columnIndex) {
            header.classList.add(isAscending ? "ascending" : "descending");
        }
    });
}





// Função para abrir o pop-up de adição
function openAddPopup() {
    // Redefine o título para "Adicionar Filme"
    document.getElementById('popupTitle').innerText = 'Adicionar Filme';

    // Limpar os campos de entrada
    document.getElementById('editName').value = '';
    document.getElementById('editDirector').value = '';
    document.getElementById('editRealeseDate').value = '';
    document.getElementById('editPoster').value = '';
    document.getElementById('editDescription').value = ''; // Limpa o campo de descrição
    document.getElementById('editRating').value = '';

    // Atribuir a função correta ao botão de salvar
    document.querySelector('.save-btn').setAttribute('onclick', 'salvarNovoFilme()');

    // Ocultar mensagens de erro
    document.getElementById('nameError').style.display = 'none';
    document.getElementById('directorError').style.display = 'none';
    document.getElementById('dateError').style.display = 'none';
    document.getElementById('posterError').style.display = 'none';
    document.getElementById('descriptionError').style.display = 'none';
    document.getElementById('ratingError').style.display = 'none';

    // Exibir o pop-up com a animação de abertura
    const popup = document.getElementById('editPopup');
    popup.style.display = 'flex';
    popup.offsetHeight; // Força um reflow para garantir que a animação inicie do zero
    popup.classList.add('show');
}



function closeAddPopup() {
    const popup = document.getElementById('editPopup');
    popup.classList.remove('show');
    setTimeout(function() {
        popup.style.display = 'none';
    }, 300);
}





async function salvarNovoFilme() {
    const nome = document.getElementById('editName').value.trim();
    const diretor = document.getElementById('editDirector').value.trim();
    const dataLancamento = document.getElementById('editRealeseDate').value.trim();
    const posterUrl = document.getElementById('editPoster').value.trim();
    const descricao = document.getElementById('editDescription').value.trim();
    const nota = document.getElementById('editRating').value.trim();

    // Adiciona a parte da hora ao formato de data inserido pelo usuário
    const formattedDate = `${dataLancamento}T07:00:00`;

    // Verificar e exibir mensagens de erro para campos vazios
    document.getElementById('nameError').style.display = nome ? 'none' : 'block';
    document.getElementById('directorError').style.display = diretor ? 'none' : 'block';
    document.getElementById('dateError').style.display = dataLancamento ? 'none' : 'block';
    document.getElementById('posterError').style.display = posterUrl ? 'none' : 'block';
    document.getElementById('descriptionError').style.display = descricao ? 'none' : 'block';
    document.getElementById('ratingError').style.display = nota ? 'none' : 'block';

    // Validação do limite de caracteres para descrição
    if (descricao.length > 400) {
        document.getElementById('descriptionError').innerText = 'A descrição deve ter no máximo 400 caracteres.';
        document.getElementById('descriptionError').style.display = 'block';
        return; // Parar a função se a descrição exceder o limite
    } else {
        document.getElementById('descriptionError').innerText = 'Por favor, insira descrição do filme.';
    }

    // Verificar todos os campos obrigatórios antes de prosseguir
    if (!nome || !diretor || !dataLancamento || !posterUrl || !descricao || !nota) {
        return; // Parar a função se algum campo estiver vazio
    }

    const novoFilme = {
        name: nome,
        diretor: diretor,
        realeseDate: formattedDate,  // Agora a data inclui a parte da hora
        poster: posterUrl,
        description: descricao,
        rating: nota
    };

    try {
        const resposta = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoFilme)
        });

        if (resposta.ok) {
            closeEditPopup(); // Fechar o popup após editar o filme
            showNotification('Filme adicionado com sucesso', 'success');
            fetchMovies(); // Atualizar a lista de filmes
        }
    } catch (erro) {
        showNotification('Erro ao adicionar o filme', 'error');
    }
}

function renderStars(rating) {
    let starsHtml = `<div class="stars" data-rating="${rating}">`;

    // Adiciona estrelas preenchidas até a nota
    for (let i = 0; i < rating; i++) {
        starsHtml += '<img src="icons/star-1.png" alt="estrela preenchida" class="star">';
    }

    // Adiciona estrelas com contorno para completar 5 estrelas
    for (let i = rating; i < 5; i++) {
        starsHtml += '<img src="icons/star-2.png" alt="estrela contornada" class="star">';
    }

    starsHtml += '</div>';
    return starsHtml;
}


