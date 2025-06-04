// Dados em memória
let posts = [];
let users = [];
let currentUser = {
    id: 1,
    name: 'João Teixeira',
    avatar: 'JT',
    followers: 1200,
    following: 892,
    posts: 145
};

// Variáveis de controle
let isLoading = false;
let lastPostCount = 0;

// Funções principais
function createPost() {
    const textarea = document.querySelector('.composer-input');
    const content = textarea.value.trim();
    
    if (!content) {
        showNotification('Por favor, digite algo para publicar!');
        return;
    }

    // Array de imagens aleatórias para posts
    const sampleImages = [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&crop=center'
    ];

    const newPost = {
        id: Date.now(),
        author: currentUser.name,
        avatar: currentUser.avatar,
        content: content,
        time: 'Agora',
        likes: 0,
        comments: [],
        shares: 0,
        liked: false,
        image: Math.random() > 0.5 ? sampleImages[Math.floor(Math.random() * sampleImages.length)] : null
    };

    posts.unshift(newPost);
    textarea.value = '';
    renderNewPost(newPost);
    showNotification('Post publicado com sucesso!');
    
    // Atualizar contador de posts do usuário
    currentUser.posts++;
    updateUserStats();
}

function renderNewPost(post) {
    const container = document.getElementById('posts-container');
    const postElement = createPostElement(post);
    
    // Inserir no topo do container
    container.insertAdjacentHTML('afterbegin', postElement);
}

function createPostElement(post) {
    return `
        <article class="post" data-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${post.avatar}</div>
                <div>
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${post.time}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
            <div class="post-actions">
                <button class="action-btn ${post.liked ? 'active' : ''}" onclick="toggleLike(this)">
                    <span><i class="${post.liked ? 'fa-solid' : 'fa-regular'} fa-heart" ${post.liked ? 'style="color: #fa0000;"' : ''}></i></span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="action-btn" onclick="toggleComments(this)">
                    <span>💬</span>
                    <span>${post.comments.length}</span>
                </button>
                <button class="action-btn" onclick="sharePost(this)">
                    <span>🔄</span>
                    <span>${post.shares}</span>
                </button>
            </div>
            <div class="comments" style="display: none;">
                ${post.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-avatar">${comment.avatar}</div>
                        <div class="comment-content">
                            <div class="comment-author">${comment.author}</div>
                            <div class="comment-text">${comment.text}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </article>
    `;
}

function updateUserStats() {
    // Atualizar estatísticas do usuário na sidebar e modal
    const statElements = document.querySelectorAll('.stat:nth-child(3) .stat-number');
    statElements.forEach(el => {
        el.textContent = currentUser.posts;
    });
}

function toggleLike(button) {
    const post = button.closest('.post');
    const postId = parseInt(post.dataset.id);
    const likeCount = button.querySelector('.like-count');
    const heartIcon = button.querySelector('span:first-child i'); // Seleciona o ícone
    
    // Se é um post dinâmico criado pelo usuário
    if (postId && !isNaN(postId)) {
        const postData = posts.find(p => p.id === postId);
        if (postData) {
            postData.liked = !postData.liked;
            postData.likes += postData.liked ? 1 : -1;
            likeCount.textContent = Math.max(0, postData.likes); // Garantir que não seja negativo
            
            // Atualizar o ícone
            if (postData.liked) {
                heartIcon.className = 'fa-solid fa-heart';
                heartIcon.style.color = '#fa0000';
            } else {
                heartIcon.className = 'fa-regular fa-heart';
                heartIcon.style.color = '';
            }
            
            button.classList.toggle('active', postData.liked);
        }
    } else {
        // Para posts estáticos
        let currentLikes = parseInt(likeCount.textContent) || 0;
        if (button.classList.contains('active')) {
            button.classList.remove('active');
            likeCount.textContent = Math.max(0, currentLikes - 1);
            // Atualizar o ícone para o vazio
            if (heartIcon) {
                heartIcon.className = 'fa-regular fa-heart';
                heartIcon.style.color = '';
            }
        } else {
            button.classList.add('active');
            likeCount.textContent = currentLikes + 1;
            // Atualizar o ícone para o preenchido
            if (heartIcon) {
                heartIcon.className = 'fa-solid fa-heart';
                heartIcon.style.color = '#fa0000';
            }
        }
    }
    
    // Animação de like
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

function toggleComments(button) {
    const post = button.closest('.post');
    const comments = post.querySelector('.comments');
    
    if (comments.style.display === 'none' || !comments.style.display) {
        comments.style.display = 'block';
        comments.style.animation = 'fadeIn 0.3s ease';
    } else {
        comments.style.display = 'none';
    }
}

function sharePost(button) {
    const post = button.closest('.post');
    const postId = parseInt(post.dataset.id);
    const shareCount = button.querySelector('span:last-child');
    
    // Atualizar dados do post se for dinâmico
    if (postId && !isNaN(postId)) {
        const postData = posts.find(p => p.id === postId);
        if (postData) {
            postData.shares++;
            shareCount.textContent = postData.shares;
        }
    } else {
        // Para posts estáticos
        let currentShares = parseInt(shareCount.textContent) || 0;
        shareCount.textContent = currentShares + 1;
    }
    
    showNotification('Post compartilhado!');
    
    // Animação de share
    button.style.transform = 'rotate(360deg)';
    button.style.transition = 'transform 0.5s ease';
    setTimeout(() => {
        button.style.transform = 'rotate(0deg)';
    }, 500);
}

function followUser(button) {
    const userName = button.closest('.suggestion-item').querySelector('.suggestion-name').textContent;
    button.textContent = 'Seguindo';
    button.style.background = '#28a745';
    button.disabled = true;
    showNotification(`Você agora está seguindo ${userName}!`);
    
    // Atualizar contador de seguindo
    currentUser.following++;
    const followingElements = document.querySelectorAll('.stat:nth-child(2) .stat-number');
    followingElements.forEach(el => {
        el.textContent = formatNumber(currentUser.following);
    });
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.style.animation = 'fadeIn 0.3s ease';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Função para simular carregamento de mais posts
function loadMorePosts() {
    if (isLoading) return;
    
    isLoading = true;
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
    
    setTimeout(() => {
        const morePosts = [
            {
                id: Date.now() + Math.random(),
                author: 'Roberto Silva',
                avatar: 'RS',
                content: 'Acabei de terminar um curso de Machine Learning! A área de IA está cada vez mais fascinante 🤖',
                time: '12 horas atrás',
                likes: 67,
                comments: [],
                shares: 5,
                liked: false,
                image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop&crop=center'
            },
            {
                id: Date.now() + Math.random() + 1,
                author: 'Isabela Costa',
                avatar: 'IC',
                content: 'Networking é fundamental! Conheci pessoas incríveis no evento de ontem. Novas parcerias surgindo! 🤝',
                time: '14 horas atrás',
                likes: 123,
                comments: [],
                shares: 18,
                liked: false,
                image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop&crop=center'
            }
        ];
        
        // Adicionar novos posts ao array
        posts.push(...morePosts);
        
        // Renderizar apenas os novos posts
        const container = document.getElementById('posts-container');
        morePosts.forEach(post => {
            container.insertAdjacentHTML('beforeend', createPostElement(post));
        });
        
        if (loading) {
            loading.style.display = 'none';
        }
        isLoading = false;
    }, 2000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Simular scroll infinito com throttling
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
                loadMorePosts();
            }
        }, 100);
    });
    
    // Fechar modais clicando fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Enter para criar post
    const composerInput = document.querySelector('.composer-input');
    if (composerInput) {
        composerInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                createPost();
            }
        });
    }
    
    // Simular atividade em tempo real com menor frequência
    setInterval(() => {
        const randomPosts = document.querySelectorAll('.post:not([data-id])'); // Apenas posts estáticos
        if (randomPosts.length > 0 && Math.random() > 0.8) { // 20% chance
            const randomPost = randomPosts[Math.floor(Math.random() * randomPosts.length)];
            const likeButton = randomPost.querySelector('.action-btn .like-count');
            
            if (likeButton) {
                const currentLikes = parseInt(likeButton.textContent) || 0;
                likeButton.textContent = currentLikes + 1;
                
                // Animação sutil
                const button = likeButton.closest('.action-btn');
                button.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    button.style.animation = '';
                }, 500);
            }
        }
    }, 8000); // Reduzido de 5s para 8s
});

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .post {
        animation: fadeIn 0.5s ease;
    }
    
    .composer-input:focus {
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        outline: none;
    }
    
    .action-btn {
        transition: transform 0.2s ease;
    }
    
    .action-btn:active {
        transform: scale(0.95);
    }
    
    .action-btn:hover {
        opacity: 0.8;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Verificar se o estilo já foi adicionado para evitar duplicação
if (!document.querySelector('#social-network-styles')) {
    style.id = 'social-network-styles';
    document.head.appendChild(style);
}
