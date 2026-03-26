const AI_ASSISTANT_CONFIG = {
    apiKey: 'sk-21acf61231af4461b3768d658472e31e',
    endpoint: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    systemPrompt: '你是这个网站的 AI 助手。请优先用简体中文回答，帮助用户理解菲利普·拉金、生态批评、网站页面内容与研究摘要。回答要简洁、准确、适合本科展示网站场景。'
};

document.addEventListener('DOMContentLoaded', function() {
    initBackToTop();
    initSmoothScroll();
    initGalleries();
    initAIAssistant();
});

function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');

    if (!backToTopButton) {
        return;
    }

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
}

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();

                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function initGalleries() {
    const galleryContainers = document.querySelectorAll('.gallery-container');

    galleryContainers.forEach(container => {
        const images = container.querySelectorAll('.gallery-thumbnail');
        const mainImage = container.querySelector('.gallery-main-image');

        if (!mainImage) {
            return;
        }

        images.forEach(img => {
            img.addEventListener('click', function() {
                const src = this.getAttribute('src');
                const alt = this.getAttribute('alt');

                mainImage.setAttribute('src', src);
                mainImage.setAttribute('alt', alt);
                images.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });
}

function initAIAssistant() {
    injectAssistantStyles();

    const launcher = ensureAssistantLauncher();
    const panel = ensureAssistantPanel();
    const closeButton = panel.querySelector('.ai-chat-close');
    const form = panel.querySelector('.ai-chat-form');
    const textarea = panel.querySelector('.ai-chat-input');
    const sendButton = panel.querySelector('.ai-chat-send');

    launcher.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleAssistantPanel(panel, launcher);
    }, true);

    launcher.addEventListener('touchstart', function() {
        launcher.style.transform = 'scale(0.95)';
    });

    launcher.addEventListener('touchend', function() {
        launcher.style.transform = '';
    });

    closeButton.addEventListener('click', function() {
        closeAssistantPanel(panel, launcher);
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        submitAssistantMessage(panel, textarea, sendButton);
    });

    textarea.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitAssistantMessage(panel, textarea, sendButton);
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAssistantPanel(panel, launcher);
        }
    });
}

function injectAssistantStyles() {
    if (document.getElementById('ai-assistant-inline-style')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'ai-assistant-inline-style';
    style.textContent = `
        .ai-assistant-generated,
        .ai-assistant {
            position: fixed;
            right: 24px;
            bottom: 24px;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #3a6351, #6d9773);
            color: #fff;
            box-shadow: 0 14px 35px rgba(44, 62, 80, 0.28);
            cursor: pointer;
            z-index: 1000;
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ai-assistant-generated:hover,
        .ai-assistant:hover {
            transform: translateY(-3px);
            box-shadow: 0 18px 40px rgba(44, 62, 80, 0.34);
        }

        .ai-assistant-icon {
            width: 28px;
            height: 28px;
            fill: currentColor;
            pointer-events: none;
        }

        .ai-assistant-pulse {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: rgba(109, 151, 115, 0.28);
            animation: aiPulse 2s infinite;
            pointer-events: none;
        }

        .ai-chat-panel {
            position: fixed;
            right: 24px;
            bottom: 100px;
            width: min(380px, calc(100vw - 32px));
            height: min(560px, calc(100vh - 140px));
            background: #ffffff;
            border-radius: 18px;
            box-shadow: 0 28px 60px rgba(33, 37, 41, 0.22);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 1001;
            opacity: 0;
            transform: translateY(16px) scale(0.98);
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .ai-chat-panel.is-open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        .ai-chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 18px;
            background: #2c3e50;
            color: #f8f9fa;
        }

        .ai-chat-title {
            margin: 0;
            font-size: 18px;
            font-family: 'Noto Sans SC', sans-serif;
        }

        .ai-chat-subtitle {
            margin-top: 4px;
            font-size: 12px;
            opacity: 0.82;
        }

        .ai-chat-close {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.12);
            color: #fff;
            cursor: pointer;
            font-size: 20px;
        }

        .ai-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f5f7f6;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .ai-chat-message {
            max-width: 85%;
            padding: 12px 14px;
            border-radius: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
            font-size: 14px;
        }

        .ai-chat-message.user {
            align-self: flex-end;
            background: #6d9773;
            color: #fff;
            border-bottom-right-radius: 4px;
        }

        .ai-chat-message.assistant {
            align-self: flex-start;
            background: #fff;
            color: #212529;
            border: 1px solid #dde5df;
            border-bottom-left-radius: 4px;
        }

        .ai-chat-message.system {
            align-self: center;
            max-width: 100%;
            background: transparent;
            color: #5f6b66;
            padding: 0;
            text-align: center;
            font-size: 12px;
        }

        .ai-chat-form {
            padding: 14px;
            border-top: 1px solid #e8eeea;
            background: #fff;
        }

        .ai-chat-input {
            width: 100%;
            min-height: 88px;
            resize: none;
            padding: 12px 14px;
            border: 1px solid #c9d8cf;
            border-radius: 12px;
            font: inherit;
            line-height: 1.5;
            outline: none;
        }

        .ai-chat-input:focus {
            border-color: #6d9773;
            box-shadow: 0 0 0 3px rgba(109, 151, 115, 0.16);
        }

        .ai-chat-actions {
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .ai-chat-hint {
            color: #6a756f;
            font-size: 12px;
        }

        .ai-chat-send {
            min-width: 88px;
            border: none;
            border-radius: 10px;
            background: #3a6351;
            color: #fff;
            padding: 10px 14px;
            cursor: pointer;
            font-weight: 600;
        }

        .ai-chat-send[disabled] {
            opacity: 0.65;
            cursor: wait;
        }

        @keyframes aiPulse {
            0% {
                transform: scale(1);
                opacity: 0.75;
            }
            70% {
                transform: scale(1.28);
                opacity: 0;
            }
            100% {
                transform: scale(1.28);
                opacity: 0;
            }
        }

        @media (max-width: 640px) {
            .ai-chat-panel {
                right: 12px;
                bottom: 88px;
                width: calc(100vw - 24px);
                height: min(72vh, calc(100vh - 108px));
            }

            .ai-assistant-generated,
            .ai-assistant {
                right: 12px;
                bottom: 12px;
                width: 58px;
                height: 58px;
            }
        }
    `;

    document.head.appendChild(style);
}

function ensureAssistantLauncher() {
    let launcher = document.querySelector('.ai-assistant');

    if (launcher) {
        launcher.setAttribute('title', 'AI 助手');
        launcher.setAttribute('aria-label', '打开 AI 助手');
        return launcher;
    }

    launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'ai-assistant ai-assistant-generated';
    launcher.setAttribute('title', 'AI 助手');
    launcher.setAttribute('aria-label', '打开 AI 助手');
    launcher.innerHTML = `
        <div class="ai-assistant-pulse"></div>
        <svg class="ai-assistant-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm2 9h-4v-1h4v1zm0-3H8v-1h6v1zm0-3h-2V7h2v2z"></path>
        </svg>
    `;
    document.body.appendChild(launcher);
    return launcher;
}

function ensureAssistantPanel() {
    let panel = document.querySelector('.ai-chat-panel');

    if (panel) {
        return panel;
    }

    panel = document.createElement('section');
    panel.className = 'ai-chat-panel';
    panel.setAttribute('aria-label', 'AI 对话窗');
    panel.innerHTML = `
        <div class="ai-chat-header">
            <div>
                <h2 class="ai-chat-title">AI 助手</h2>
                <div class="ai-chat-subtitle">可直接提问网站内容、拉金诗歌与生态批评</div>
            </div>
            <button type="button" class="ai-chat-close" aria-label="关闭">×</button>
        </div>
        <div class="ai-chat-messages">
            <div class="ai-chat-message system">请输入问题，按 Enter 发送，Shift + Enter 换行。</div>
            <div class="ai-chat-message assistant">你好，我可以帮你梳理这个网站中的诗歌分析、理论部分和研究摘要。你可以直接提问。</div>
        </div>
        <form class="ai-chat-form">
            <textarea class="ai-chat-input" placeholder="例如：请概括《The Whitsun Weddings》的生态批评视角"></textarea>
            <div class="ai-chat-actions">
                <div class="ai-chat-hint">当前为前端直连模式，密钥存放在本地脚本中。</div>
                <button type="submit" class="ai-chat-send">发送</button>
            </div>
        </form>
    `;

    document.body.appendChild(panel);
    return panel;
}

function toggleAssistantPanel(panel, launcher) {
    const isOpen = panel.classList.contains('is-open');

    if (isOpen) {
        closeAssistantPanel(panel, launcher);
        return;
    }

    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    const input = panel.querySelector('.ai-chat-input');
    input.focus();
}

function closeAssistantPanel(panel, launcher) {
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
}

async function submitAssistantMessage(panel, textarea, sendButton) {
    const content = textarea.value.trim();
    if (!content) {
        return;
    }

    const messagesWrap = panel.querySelector('.ai-chat-messages');
    const history = panel._history || [];
    appendAssistantMessage(messagesWrap, 'user', content);
    history.push({ role: 'user', content: content });
    panel._history = history;
    textarea.value = '';
    sendButton.disabled = true;
    sendButton.textContent = '发送中...';

    const typingNode = appendAssistantMessage(messagesWrap, 'assistant', '正在思考中...');

    try {
        const response = await fetch(AI_ASSISTANT_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AI_ASSISTANT_CONFIG.apiKey
            },
            body: JSON.stringify({
                model: AI_ASSISTANT_CONFIG.model,
                stream: false,
                messages: [
                    { role: 'system', content: AI_ASSISTANT_CONFIG.systemPrompt }
                ].concat(history)
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('接口请求失败：' + response.status + ' ' + errorText);
        }

        const data = await response.json();
        const answer = data && data.choices && data.choices[0] && data.choices[0].message
            ? data.choices[0].message.content
            : '没有收到有效回复。';

        typingNode.textContent = answer;
        history.push({ role: 'assistant', content: answer });
        panel._history = history;
    } catch (error) {
        typingNode.textContent = '请求失败：' + error.message;
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = '发送';
        scrollMessagesToBottom(messagesWrap);
    }
}

function appendAssistantMessage(container, role, content) {
    const node = document.createElement('div');
    node.className = 'ai-chat-message ' + role;
    node.textContent = content;
    container.appendChild(node);
    scrollMessagesToBottom(container);
    return node;
}

function scrollMessagesToBottom(container) {
    container.scrollTop = container.scrollHeight;
}
