// FreeTheme 配置系统
(function() {
    'use strict';
    
    const CONFIG_PATH = '/conf/free-theme-config.json';
    let configCache = null;
    let cacheTimestamp = 0;
    const CACHE_DURATION = 5000;
    let pendingRequest = null;
    
    // 默认配置
    const defaultConfig = {
        light: {
            // 主色调
            primary: '#d23f31',
            primaryLight: '#f5e6e4',
            primaryDark: '#b83226',
            primaryHover: '#c6392b',
            // 背景色
            background: '#ffffff',
            backgroundLight: '#f8f9fa',
            backgroundDark: '#f0f1f2',
            surface: '#ffffff',
            surfaceHover: '#f8f9fa',
            // 文本色
            onBackground: '#212529',
            onSurface: '#343a40',
            onPrimary: '#ffffff',
            textPrimary: '#212529',
            textSecondary: '#6c757d',
            textDisabled: '#adb5bd',
            // 边框色
            borderColor: '#dee2e6',
            borderColorHover: '#adb5bd',
            borderColorLight: '#e9ecef',
            // 代码块
            codeBackground: '#f8f9fa',
            codeBorder: '#e9ecef',
            codeText: '#212529',
            // 选中文本
            selectionBg: '#b3d4fc',
            selectionText: '#212529',
            // 阴影
            shadow: 'rgba(0, 0, 0, 0.1)',
            shadowLight: 'rgba(0, 0, 0, 0.05)',
            shadowMedium: 'rgba(0, 0, 0, 0.08)',
        },
        dark: {
            // 主色调
            primary: '#ff6b6b',
            primaryLight: '#4a2c2c',
            primaryDark: '#ff5252',
            primaryHover: '#ff7a7a',
            // 背景色
            background: '#1e1e1e',
            backgroundLight: '#252526',
            backgroundDark: '#2d2d30',
            surface: '#252526',
            surfaceHover: '#2d2d30',
            // 文本色
            onBackground: '#d4d4d4',
            onSurface: '#cccccc',
            onPrimary: '#ffffff',
            textPrimary: '#d4d4d4',
            textSecondary: '#858585',
            textDisabled: '#505050',
            // 边框色
            borderColor: '#3e3e42',
            borderColorHover: '#505050',
            borderColorLight: '#2d2d30',
            // 代码块
            codeBackground: '#252526',
            codeBorder: '#3e3e42',
            codeText: '#d4d4d4',
            // 选中文本
            selectionBg: '#264f78',
            selectionText: '#d4d4d4',
            // 阴影
            shadow: 'rgba(0, 0, 0, 0.3)',
            shadowLight: 'rgba(0, 0, 0, 0.2)',
            shadowMedium: 'rgba(0, 0, 0, 0.25)',
        },
        fontFamily: {
            english: "'Consolas', 'Monaco', 'Courier New', 'JetBrains Mono'",
            chinese: "'Source Han Sans SC', 'Source Han Sans CN', 'Noto Sans CJK SC', 'Microsoft YaHei'",
        },
        fontSize: {
            small: '12px',
            normal: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '20px',
        },
        lineHeight: {
            tight: '1.4',
            normal: '1.6',
            relaxed: '1.8',
        },
        spacing: {
            xs: '4px',
            sm: '8px',
            md: '12px',
            lg: '16px',
            xl: '24px',
        },
        borderRadius: {
            small: '4px',
            medium: '6px',
            large: '8px',
        },
        transition: {
            default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fast: 'all 0.15s ease',
        },
    };
    
    // API 工具
    async function putFile(path, content = '', isDir = false) {
        const formData = new FormData();
        formData.append("path", path);
        formData.append("isDir", isDir);
        formData.append("file", new Blob([content]));
        const result = await fetch("/api/file/putFile", {
            method: "POST",
            body: formData,
        });
        return await result.json();
    }
    
    async function getFile(path) {
        try {
            const response = await fetch("/api/file/getFile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ path }),
            });
            if (response.ok) {
                return await response.text();
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    
    // 获取配置
    async function getConfig() {
        const now = Date.now();
        
        if (configCache && (now - cacheTimestamp) < CACHE_DURATION) {
            return configCache;
        }
        
        if (pendingRequest) {
            return pendingRequest;
        }
        
        pendingRequest = (async () => {
            try {
                const content = await getFile(CONFIG_PATH);
                if (!content) {
                    configCache = JSON.parse(JSON.stringify(defaultConfig));
                    cacheTimestamp = now;
                    return configCache;
                }
                
                const parsed = JSON.parse(content);
                configCache = {
                    light: { ...defaultConfig.light, ...(parsed.light || {}) },
                    dark: { ...defaultConfig.dark, ...(parsed.dark || {}) },
                    fontFamily: { ...defaultConfig.fontFamily, ...(parsed.fontFamily || {}) },
                    borderRadius: { ...defaultConfig.borderRadius, ...(parsed.borderRadius || {}) },
                    transition: { ...defaultConfig.transition, ...(parsed.transition || {}) },
                };
                cacheTimestamp = now;
                return configCache;
            } catch (error) {
                configCache = JSON.parse(JSON.stringify(defaultConfig));
                cacheTimestamp = now;
                return configCache;
            } finally {
                pendingRequest = null;
            }
        })();
        
        return pendingRequest;
    }
    
    // 保存配置
    async function saveConfig(config) {
        try {
            await putFile(CONFIG_PATH, JSON.stringify(config, null, 2));
            configCache = null;
            cacheTimestamp = 0;
            return true;
        } catch (error) {
            console.error('保存配置失败:', error);
            return false;
        }
    }
    
    // 更新配置
    async function updateConfig(updates) {
        const config = await getConfig();
        const newConfig = {
            ...config,
            ...updates,
        };
        await saveConfig(newConfig);
        return newConfig;
    }
    
    // 应用配置到 CSS 变量
    function applyConfig(config) {
        const root = document.documentElement;
        const themeMode = root.getAttribute('data-theme-mode') || 'light';
        const theme = config[themeMode] || config.light;
        
        // 应用主色调
        root.style.setProperty('--b3-theme-primary', theme.primary);
        root.style.setProperty('--b3-theme-primary-light', theme.primaryLight);
        root.style.setProperty('--b3-theme-primary-dark', theme.primaryDark);
        root.style.setProperty('--b3-theme-primary-hover', theme.primaryHover || theme.primary);
        
        // 应用背景色
        root.style.setProperty('--b3-theme-background', theme.background);
        root.style.setProperty('--b3-theme-background-light', theme.backgroundLight);
        root.style.setProperty('--b3-theme-background-dark', theme.backgroundDark);
        root.style.setProperty('--b3-theme-surface', theme.surface || theme.background);
        root.style.setProperty('--b3-theme-surface-hover', theme.surfaceHover || theme.backgroundLight);
        
        // 应用文本色
        root.style.setProperty('--b3-theme-on-background', theme.onBackground || theme.textPrimary);
        root.style.setProperty('--b3-theme-on-surface', theme.onSurface || theme.textPrimary);
        root.style.setProperty('--b3-theme-on-primary', theme.onPrimary || '#ffffff');
        root.style.setProperty('--b3-theme-text-primary', theme.textPrimary);
        root.style.setProperty('--b3-theme-text-secondary', theme.textSecondary);
        root.style.setProperty('--b3-theme-text-disabled', theme.textDisabled || theme.textSecondary);
        
        // 应用边框色
        root.style.setProperty('--b3-border-color', theme.borderColor);
        root.style.setProperty('--b3-border-color-hover', theme.borderColorHover);
        root.style.setProperty('--b3-border-color-light', theme.borderColorLight || theme.borderColor);
        
        // 应用代码块
        root.style.setProperty('--b3-theme-code-background', theme.codeBackground);
        root.style.setProperty('--b3-theme-code-border', theme.codeBorder);
        root.style.setProperty('--b3-theme-code-text', theme.codeText || theme.textPrimary);
        
        // 应用选中文本
        root.style.setProperty('--b3-theme-selection-bg', theme.selectionBg);
        root.style.setProperty('--b3-theme-selection-text', theme.selectionText);
        
        // 应用阴影
        root.style.setProperty('--b3-theme-shadow', theme.shadow);
        root.style.setProperty('--b3-theme-shadow-light', theme.shadowLight);
        root.style.setProperty('--b3-theme-shadow-medium', theme.shadowMedium);
        
        // 应用字体配置
        const fontFamily = `${config.fontFamily.english}, ${config.fontFamily.chinese}, monospace, sans-serif`;
        root.style.setProperty('--b3-theme-font-family', fontFamily);
        if (document.body) {
            document.body.style.fontFamily = fontFamily;
        }
        
        // 应用字体大小
        if (config.fontSize) {
            root.style.setProperty('--b3-theme-font-size-small', config.fontSize.small);
            root.style.setProperty('--b3-theme-font-size-normal', config.fontSize.normal);
            root.style.setProperty('--b3-theme-font-size-medium', config.fontSize.medium);
            root.style.setProperty('--b3-theme-font-size-large', config.fontSize.large);
            root.style.setProperty('--b3-theme-font-size-xlarge', config.fontSize.xlarge);
        }
        
        // 应用行高
        if (config.lineHeight) {
            root.style.setProperty('--b3-theme-line-height-tight', config.lineHeight.tight);
            root.style.setProperty('--b3-theme-line-height-normal', config.lineHeight.normal);
            root.style.setProperty('--b3-theme-line-height-relaxed', config.lineHeight.relaxed);
        }
        
        // 应用间距
        if (config.spacing) {
            root.style.setProperty('--b3-theme-spacing-xs', config.spacing.xs);
            root.style.setProperty('--b3-theme-spacing-sm', config.spacing.sm);
            root.style.setProperty('--b3-theme-spacing-md', config.spacing.md);
            root.style.setProperty('--b3-theme-spacing-lg', config.spacing.lg);
            root.style.setProperty('--b3-theme-spacing-xl', config.spacing.xl);
        }
        
        // 应用圆角配置
        if (config.borderRadius) {
            root.style.setProperty('--b3-theme-border-radius-small', config.borderRadius.small);
            root.style.setProperty('--b3-theme-border-radius-medium', config.borderRadius.medium);
            root.style.setProperty('--b3-theme-border-radius-large', config.borderRadius.large);
        }
        
        // 应用过渡动画配置
        if (config.transition) {
            root.style.setProperty('--b3-transition', config.transition.default);
            root.style.setProperty('--b3-transition-fast', config.transition.fast);
        }
    }
    
    // 初始化配置
    async function initConfig() {
        try {
            const config = await getConfig();
            applyConfig(config);
            
            // 监听主题模式变化
            const observer = new MutationObserver(async () => {
                const newConfig = await getConfig();
                applyConfig(newConfig);
            });
            
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme-mode']
            });
            
            return config;
        } catch (error) {
            console.error('初始化配置失败:', error);
            return null;
        }
    }
    
    // 重置配置
    async function resetConfig() {
        await saveConfig(JSON.parse(JSON.stringify(defaultConfig)));
        configCache = null;
        cacheTimestamp = 0;
        const config = await getConfig();
        applyConfig(config);
        return config;
    }
    
    // 清除缓存
    function clearCache() {
        configCache = null;
        cacheTimestamp = 0;
        pendingRequest = null;
    }
    
    // RGB 转 16 进制辅助函数
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    // 生成随机 16 进制颜色
    function generateRandomColor(isDark = false) {
        if (isDark) {
            // 暗黑主题：生成较亮的颜色
            const r = 100 + Math.floor(Math.random() * 155);
            const g = 100 + Math.floor(Math.random() * 155);
            const b = 100 + Math.floor(Math.random() * 155);
            return rgbToHex(r, g, b);
        } else {
            // 明亮主题：生成较暗的颜色
            const r = 30 + Math.floor(Math.random() * 200);
            const g = 30 + Math.floor(Math.random() * 200);
            const b = 30 + Math.floor(Math.random() * 200);
            return rgbToHex(r, g, b);
        }
    }
    
    // 生成随机浅色（16 进制）
    function generateRandomLightColor(isDark = false) {
        if (isDark) {
            // 暗黑主题的浅色：深色背景上的浅色
            const r = 30 + Math.floor(Math.random() * 50);
            const g = 30 + Math.floor(Math.random() * 50);
            const b = 30 + Math.floor(Math.random() * 50);
            return rgbToHex(r, g, b);
        } else {
            // 明亮主题的浅色：浅色背景
            const r = 240 + Math.floor(Math.random() * 15);
            const g = 240 + Math.floor(Math.random() * 15);
            const b = 240 + Math.floor(Math.random() * 15);
            return rgbToHex(r, g, b);
        }
    }
    
    // 生成随机深色（16 进制）
    function generateRandomDarkColor(isDark = false) {
        if (isDark) {
            // 暗黑主题的深色：更深的颜色
            const r = 60 + Math.floor(Math.random() * 80);
            const g = 60 + Math.floor(Math.random() * 80);
            const b = 60 + Math.floor(Math.random() * 80);
            return rgbToHex(r, g, b);
        } else {
            // 明亮主题的深色：深色
            const r = 20 + Math.floor(Math.random() * 100);
            const g = 20 + Math.floor(Math.random() * 100);
            const b = 20 + Math.floor(Math.random() * 100);
            return rgbToHex(r, g, b);
        }
    }
    
    // 生成随机配色方案（使用 16 进制）
    async function generateRandomColors(themeMode) {
        const config = await getConfig();
        const isDark = themeMode === 'dark';
        
        const primary = generateRandomColor(isDark);
        const primaryLight = generateRandomLightColor(isDark);
        const primaryDark = generateRandomDarkColor(isDark);
        
        // 生成背景色（16 进制）
        let background, backgroundLight, backgroundDark, surface, surfaceHover;
        if (isDark) {
            const bgBase = 20 + Math.floor(Math.random() * 30);
            background = rgbToHex(bgBase, bgBase, bgBase);
            backgroundLight = rgbToHex(bgBase + 10, bgBase + 10, bgBase + 10);
            backgroundDark = rgbToHex(bgBase + 15, bgBase + 15, bgBase + 15);
            surface = backgroundLight;
            surfaceHover = backgroundDark;
        } else {
            const bgBase = 240 + Math.floor(Math.random() * 15);
            background = rgbToHex(bgBase, bgBase, bgBase);
            backgroundLight = rgbToHex(bgBase - 5, bgBase - 5, bgBase - 5);
            backgroundDark = rgbToHex(bgBase - 10, bgBase - 10, bgBase - 10);
            surface = background;
            surfaceHover = backgroundLight;
        }
        
        // 生成文本色（16 进制）
        const textPrimary = isDark ? 
            rgbToHex(
                200 + Math.floor(Math.random() * 55),
                200 + Math.floor(Math.random() * 55),
                200 + Math.floor(Math.random() * 55)
            ) :
            rgbToHex(
                20 + Math.floor(Math.random() * 35),
                20 + Math.floor(Math.random() * 35),
                20 + Math.floor(Math.random() * 35)
            );
        const textSecondary = isDark ?
            rgbToHex(
                120 + Math.floor(Math.random() * 60),
                120 + Math.floor(Math.random() * 60),
                120 + Math.floor(Math.random() * 60)
            ) :
            rgbToHex(
                80 + Math.floor(Math.random() * 60),
                80 + Math.floor(Math.random() * 60),
                80 + Math.floor(Math.random() * 60)
            );
        const textDisabled = isDark ?
            rgbToHex(
                70 + Math.floor(Math.random() * 30),
                70 + Math.floor(Math.random() * 30),
                70 + Math.floor(Math.random() * 30)
            ) :
            rgbToHex(
                150 + Math.floor(Math.random() * 50),
                150 + Math.floor(Math.random() * 50),
                150 + Math.floor(Math.random() * 50)
            );
        
        // 生成边框色（16 进制）
        const borderColor = isDark ?
            rgbToHex(
                50 + Math.floor(Math.random() * 30),
                50 + Math.floor(Math.random() * 30),
                50 + Math.floor(Math.random() * 30)
            ) :
            rgbToHex(
                200 + Math.floor(Math.random() * 30),
                200 + Math.floor(Math.random() * 30),
                200 + Math.floor(Math.random() * 30)
            );
        const borderColorHover = isDark ?
            rgbToHex(
                70 + Math.floor(Math.random() * 30),
                70 + Math.floor(Math.random() * 30),
                70 + Math.floor(Math.random() * 30)
            ) :
            rgbToHex(
                170 + Math.floor(Math.random() * 30),
                170 + Math.floor(Math.random() * 30),
                170 + Math.floor(Math.random() * 30)
            );
        const borderColorLight = isDark ?
            rgbToHex(
                40 + Math.floor(Math.random() * 20),
                40 + Math.floor(Math.random() * 20),
                40 + Math.floor(Math.random() * 20)
            ) :
            rgbToHex(
                220 + Math.floor(Math.random() * 20),
                220 + Math.floor(Math.random() * 20),
                220 + Math.floor(Math.random() * 20)
            );
        
        // 生成代码块颜色（16 进制）
        const codeBackground = isDark ?
            rgbToHex(
                30 + Math.floor(Math.random() * 20),
                30 + Math.floor(Math.random() * 20),
                30 + Math.floor(Math.random() * 20)
            ) :
            rgbToHex(
                245 + Math.floor(Math.random() * 10),
                245 + Math.floor(Math.random() * 10),
                245 + Math.floor(Math.random() * 10)
            );
        const codeBorder = borderColor;
        const codeText = textPrimary;
        
        // 生成选中文本颜色（16 进制，带透明度使用 rgba）
        const selectionR = Math.floor(Math.random() * 255);
        const selectionG = Math.floor(Math.random() * 255);
        const selectionB = Math.floor(Math.random() * 255);
        const selectionBg = isDark ?
            `rgba(${selectionR}, ${selectionG}, ${selectionB}, 0.5)` :
            `rgba(${selectionR}, ${selectionG}, ${selectionB}, 0.4)`;
        const selectionText = textPrimary;
        
        await updateConfig({
            [themeMode]: {
                ...config[themeMode],
                primary,
                primaryLight,
                primaryDark,
                primaryHover: primary,
                background,
                backgroundLight,
                backgroundDark,
                surface,
                surfaceHover,
                textPrimary,
                textSecondary,
                textDisabled,
                onBackground: textPrimary,
                onSurface: textPrimary,
                onPrimary: '#ffffff',
                borderColor,
                borderColorHover,
                borderColorLight,
                codeBackground,
                codeBorder,
                codeText,
                selectionBg,
                selectionText,
            }
        });
    }
    
    // 导出全局 API
    window.FreeThemeConfig = {
        getConfig,
        updateConfig: async (updates) => {
            const newConfig = await updateConfig(updates);
            applyConfig(newConfig);
            return newConfig;
        },
        resetConfig,
        clearCache,
        // 手动创建配置按钮（用于调试）
        createButton: () => {
            retryCount = 0;
            createConfigButton();
        },
        // 生成随机配色
        generateRandomColors,
    };
    
    // 保存观察器引用（需要在函数之前声明）
    let toolbarObserver = null;
    
    // 创建配置按钮
    let retryCount = 0;
    const maxRetries = 20;
    
    function createConfigButton() {
        // 检查是否已存在按钮
        if (document.getElementById('FreeThemeConfigButton')) {
            return;
        }
        
        // 检查 id 为 toolbar 的 div 标签的 class 中是否包含 "toolbar--browser"
        const toolbar = document.getElementById('toolbar');
        if (toolbar && toolbar.classList.contains('toolbar--browser')) {
            return;
        }
        
        // 查找工具栏位置（参考 QYL 主题的方式）
        const targetElement = document.querySelector('#toolbarVIP');
        
        if (!targetElement) {
            retryCount++;
            if (retryCount < maxRetries) {
                // 如果找不到工具栏，延迟重试
                setTimeout(createConfigButton, 300);
            } else {
                console.warn('FreeTheme: 无法找到工具栏，配置按钮未创建');
            }
            return;
        }
        
        // 重置重试计数
        retryCount = 0;
        
        const button = document.createElement('div');
        button.id = 'FreeThemeConfigButton';
        button.className = 'toolbar__item ariaLabel';
        button.setAttribute('aria-label', 'FreeTheme 配置');
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
            </svg>
        `;
        
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            toggleConfigWindow();
        });
        
        // 参考 QYL 主题的插入方式
        try {
            if (targetElement.parentNode) {
                targetElement.parentNode.insertBefore(button, targetElement);
            } else {
                targetElement.appendChild(button);
            }
        } catch (error) {
            console.error('FreeTheme: 创建配置按钮失败:', error);
        }
    }
    
    // 监听 DOM 变化，确保按钮始终存在
    function watchForToolbar() {
        if (toolbarObserver) {
            toolbarObserver.disconnect();
        }
        
        toolbarObserver = new MutationObserver(() => {
            // 检查 id 为 toolbar 的 div 标签的 class 中是否包含 "toolbar--browser"
            const toolbarDiv = document.getElementById('toolbar');
            if (toolbarDiv && toolbarDiv.classList.contains('toolbar--browser')) {
                return;
            }
            
            const button = document.getElementById('FreeThemeConfigButton');
            const toolbar = document.querySelector('#toolbarVIP');
            // 如果工具栏存在但按钮不存在，创建按钮
            if (toolbar && (!button || !document.body.contains(button))) {
                createConfigButton();
            }
        });
        
        // 延迟启动观察器，避免频繁触发
        setTimeout(() => {
            if (toolbarObserver) {
                toolbarObserver.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        }, 1000);
        
        return toolbarObserver;
    }
    
    // 创建配置窗口
    async function createConfigWindow() {
        const existingWindow = document.getElementById('FreeThemeConfigWindow');
        if (existingWindow) {
            return existingWindow;
        }
        
        const window = document.createElement('div');
        window.id = 'FreeThemeConfigWindow';
        window.className = 'b3-menu';
        window.style.position = 'fixed';
        window.style.zIndex = '12';
        window.style.minWidth = '360px';
        window.style.maxWidth = '400px';
        window.style.maxHeight = '80vh';
        window.style.display = 'flex';
        window.style.flexDirection = 'column';
        
        const button = document.getElementById('FreeThemeConfigButton');
        if (button) {
            const buttonRect = button.getBoundingClientRect();
            window.style.left = `${buttonRect.right}px`;
            window.style.top = `${buttonRect.bottom + 5}px`;
            window.style.transform = 'translateX(-100%)';
        }
        
        // 创建配置内容（异步）
        const content = await createConfigContent();
        window.appendChild(content);
        
        // 点击外部关闭
        const handleClickOutside = (e) => {
            if (!window.contains(e.target) && e.target !== button) {
                removeConfigWindow();
            }
        };
        
        // ESC 键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                removeConfigWindow();
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEsc);
        }, 100);
        
        window._clickHandler = handleClickOutside;
        window._escHandler = handleEsc;
        
        document.body.appendChild(window);
        return window;
    }
    
    // 创建配置内容
    async function createConfigContent() {
        const config = await getConfig();
        const themeMode = document.documentElement.getAttribute('data-theme-mode') || 'light';
        const theme = config[themeMode];
        const modeName = themeMode === 'light' ? '明亮模式' : '暗黑模式';
        
        // 创建外层容器
        const wrapper = document.createElement('div');
        wrapper.id = 'FreeThemeConfigWrapper';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.height = '100%';
        
        // 创建固定头部区域
        const header = document.createElement('div');
        header.style.position = 'sticky';
        header.style.top = '0';
        header.style.zIndex = '1';
        header.style.backgroundColor = 'var(--b3-theme-background)';
        header.style.padding = '12px';
        header.style.borderBottom = '1px solid var(--b3-border-color)';
        header.style.marginBottom = '0';
        
        // 标题（显示当前主题模式）
        const title = document.createElement('div');
        title.textContent = `FreeTheme 配置 (${modeName})`;
        title.style.fontSize = '16px';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '12px';
        header.appendChild(title);
        
        // 按钮容器（固定在顶部）
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '8px';
        buttonContainer.style.marginBottom = '0';
        
        // 随机配色按钮
        const randomBtn = document.createElement('button');
        randomBtn.className = 'b3-button';
        randomBtn.style.flex = '1';
        randomBtn.style.display = 'flex';
        randomBtn.style.alignItems = 'center';
        randomBtn.style.justifyContent = 'center';
        randomBtn.style.gap = '4px';
        randomBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6M23 20v-6h-6"></path>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
            <span>随机配色</span>
        `;
        randomBtn.addEventListener('click', async () => {
            await generateRandomColors(themeMode);
            await refreshConfig();
        });
        buttonContainer.appendChild(randomBtn);
        
        // 刷新按钮
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'b3-button';
        refreshBtn.style.flex = '1';
        refreshBtn.style.display = 'flex';
        refreshBtn.style.alignItems = 'center';
        refreshBtn.style.justifyContent = 'center';
        refreshBtn.style.gap = '4px';
        refreshBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>刷新配置</span>
        `;
        refreshBtn.addEventListener('click', async () => {
            const originalHTML = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<span>刷新中...</span>';
            refreshBtn.disabled = true;
            
            try {
                clearCache();
                const newConfig = await getConfig();
                applyConfig(newConfig);
                await refreshConfig();
            } catch (error) {
                console.error('刷新配置失败:', error);
            } finally {
                refreshBtn.innerHTML = originalHTML;
                refreshBtn.disabled = false;
            }
        });
        buttonContainer.appendChild(refreshBtn);
        
        // 重置按钮
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '重置为默认';
        resetBtn.className = 'b3-button';
        resetBtn.style.flex = '1';
        resetBtn.addEventListener('click', async () => {
            if (confirm('确定要重置为默认配置吗？')) {
                await resetConfig();
                removeConfigWindow();
                setTimeout(() => toggleConfigWindow(), 300);
            }
        });
        buttonContainer.appendChild(resetBtn);
        
        header.appendChild(buttonContainer);
        wrapper.appendChild(header);
        
        // 创建可滚动内容区域
        const content = document.createElement('div');
        content.id = 'FreeThemeConfigContent';
        content.style.padding = '12px';
        content.style.overflowY = 'auto';
        content.style.flex = '1';
        
        // 创建分组函数
        function createGroup(titleText, items) {
            const group = document.createElement('div');
            group.style.marginBottom = '16px';
            
            const groupTitle = document.createElement('div');
            groupTitle.textContent = titleText;
            groupTitle.style.fontSize = '14px';
            groupTitle.style.fontWeight = '600';
            groupTitle.style.marginBottom = '8px';
            groupTitle.style.color = 'var(--b3-theme-primary)';
            groupTitle.style.paddingBottom = '4px';
            groupTitle.style.borderBottom = '1px solid var(--b3-border-color-light)';
            group.appendChild(groupTitle);
            
            items.forEach(item => group.appendChild(item));
            
            return group;
        }
        
        // 批量创建颜色配置的辅助函数
        function createColorConfigs(items) {
            return items.map(({label, key}) => 
                createColorSection(label, theme[key] || '', async (color) => {
                    await updateConfig({
                        [themeMode]: {
                            ...config[themeMode],
                            [key]: color,
                        }
                    });
                    await refreshConfig();
                })
            );
        }
        
        // 批量创建文本配置的辅助函数
        function createTextConfigs(items, configObj, configKey) {
            return items.map(({label, key}) => 
                createTextSection(label, configObj[key] || '', async (value) => {
                    const update = {
                        [configKey]: {
                            ...configObj,
                            [key]: value,
                        }
                    };
                    await updateConfig(update);
                    await refreshConfig();
                })
            );
        }
        
        // 主色调分组
        content.appendChild(createGroup('🎨 主色调', createColorConfigs([
            {label: '主色调', key: 'primary'},
            {label: '主色调浅色', key: 'primaryLight'},
            {label: '主色调深色', key: 'primaryDark'},
            {label: '主色调悬停', key: 'primaryHover'},
        ])));
        
        // 背景色分组
        content.appendChild(createGroup('🖼️ 背景色', createColorConfigs([
            {label: '背景色', key: 'background'},
            {label: '浅色背景', key: 'backgroundLight'},
            {label: '深色背景', key: 'backgroundDark'},
            {label: '表面色', key: 'surface'},
            {label: '表面悬停', key: 'surfaceHover'},
        ])));
        
        // 文本色分组
        content.appendChild(createGroup('📝 文本色', createColorConfigs([
            {label: '主要文本色', key: 'textPrimary'},
            {label: '次要文本色', key: 'textSecondary'},
            {label: '禁用文本色', key: 'textDisabled'},
            {label: '背景上文本', key: 'onBackground'},
            {label: '表面上文本', key: 'onSurface'},
            {label: '主色上文本', key: 'onPrimary'},
        ])));
        
        // 边框色分组
        content.appendChild(createGroup('🔲 边框色', createColorConfigs([
            {label: '边框色', key: 'borderColor'},
            {label: '边框悬停', key: 'borderColorHover'},
            {label: '边框浅色', key: 'borderColorLight'},
        ])));
        
        // 代码块分组
        content.appendChild(createGroup('💻 代码块', createColorConfigs([
            {label: '代码块背景', key: 'codeBackground'},
            {label: '代码块边框', key: 'codeBorder'},
            {label: '代码块文本', key: 'codeText'},
        ])));
        
        // 选中文本分组
        content.appendChild(createGroup('✨ 选中文本', createColorConfigs([
            {label: '选中背景', key: 'selectionBg'},
            {label: '选中文本', key: 'selectionText'},
        ])));
        
        // 阴影分组（使用文本输入，因为阴影是 rgba 格式）
        const shadowItems = [
            {label: '阴影', key: 'shadow'},
            {label: '浅阴影', key: 'shadowLight'},
            {label: '中阴影', key: 'shadowMedium'},
        ].map(({label, key}) => 
            createTextSection(label, theme[key] || '', async (value) => {
                await updateConfig({
                    [themeMode]: {
                        ...config[themeMode],
                        [key]: value,
                    }
                });
                await refreshConfig();
            })
        );
        shadowItems.forEach(section => {
            const input = section.querySelector('input');
            if (input) {
                input.placeholder = 'rgba(0, 0, 0, 0.1)';
            }
        });
        content.appendChild(createGroup('🌑 阴影', shadowItems));
        
        // 字体配置分组
        content.appendChild(createGroup('🔤 字体', createTextConfigs([
            {label: '英文字体', key: 'english'},
            {label: '中文字体', key: 'chinese'},
        ], config.fontFamily, 'fontFamily')));
        
        // 字体大小分组
        if (config.fontSize) {
            content.appendChild(createGroup('📏 字体大小', createTextConfigs([
                {label: '小号', key: 'small'},
                {label: '正常', key: 'normal'},
                {label: '中等', key: 'medium'},
                {label: '大号', key: 'large'},
                {label: '超大', key: 'xlarge'},
            ], config.fontSize, 'fontSize')));
        }
        
        // 行高分组
        if (config.lineHeight) {
            content.appendChild(createGroup('📐 行高', createTextConfigs([
                {label: '紧凑', key: 'tight'},
                {label: '正常', key: 'normal'},
                {label: '宽松', key: 'relaxed'},
            ], config.lineHeight, 'lineHeight')));
        }
        
        // 间距分组
        if (config.spacing) {
            content.appendChild(createGroup('📊 间距', createTextConfigs([
                {label: '超小', key: 'xs'},
                {label: '小', key: 'sm'},
                {label: '中', key: 'md'},
                {label: '大', key: 'lg'},
                {label: '超大', key: 'xl'},
            ], config.spacing, 'spacing')));
        }
        
        // 圆角分组
        if (config.borderRadius) {
            content.appendChild(createGroup('🔘 圆角', createTextConfigs([
                {label: '小圆角', key: 'small'},
                {label: '中圆角', key: 'medium'},
                {label: '大圆角', key: 'large'},
            ], config.borderRadius, 'borderRadius')));
        }
        
        // 过渡动画分组（带说明）
        if (config.transition) {
            const transitionGroup = createGroup('⚡ 过渡动画', createTextConfigs([
                {label: '默认过渡', key: 'default'},
                {label: '快速过渡', key: 'fast'},
            ], config.transition, 'transition'));
            
            // 添加说明
            const transitionDesc = document.createElement('div');
            transitionDesc.style.fontSize = '12px';
            transitionDesc.style.color = 'var(--b3-theme-text-secondary)';
            transitionDesc.style.marginTop = '4px';
            transitionDesc.style.padding = '8px';
            transitionDesc.style.backgroundColor = 'var(--b3-theme-background-light)';
            transitionDesc.style.borderRadius = '4px';
            transitionDesc.style.lineHeight = '1.5';
            transitionDesc.innerHTML = `
                <strong>说明：</strong><br>
                • <strong>默认过渡</strong>：用于大多数元素的过渡效果，如背景色、颜色变化等<br>
                • <strong>快速过渡</strong>：用于需要快速响应的交互，如按钮悬停、输入框聚焦等<br>
                <br>
                格式示例：<code>all 0.2s cubic-bezier(0.4, 0, 0.2, 1)</code>
            `;
            transitionGroup.appendChild(transitionDesc);
            content.appendChild(transitionGroup);
        }
        
        wrapper.appendChild(content);
        return wrapper;
    }
    
    // 创建区域
    function createSection(title, children) {
        const section = document.createElement('div');
        section.style.marginBottom = '16px';
        
        const label = document.createElement('div');
        label.textContent = title;
        label.style.fontSize = '13px';
        label.style.fontWeight = '500';
        label.style.marginBottom = '8px';
        label.style.color = 'var(--b3-theme-text-secondary)';
        section.appendChild(label);
        
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '8px';
        children.forEach(child => container.appendChild(child));
        section.appendChild(container);
        
        return section;
    }
    
    // 创建按钮
    function createButton(text, active, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = 'b3-button';
        btn.style.flex = '1';
        if (active) {
            btn.style.backgroundColor = 'var(--b3-theme-primary)';
            btn.style.color = 'var(--b3-theme-on-primary)';
        }
        btn.addEventListener('click', onClick);
        return btn;
    }
    
    // 创建颜色选择区域
    function createColorSection(label, value, onChange) {
        const section = document.createElement('div');
        section.style.marginBottom = '12px';
        
        const labelDiv = document.createElement('div');
        labelDiv.textContent = label;
        labelDiv.style.fontSize = '13px';
        labelDiv.style.fontWeight = '500';
        labelDiv.style.marginBottom = '6px';
        labelDiv.style.color = 'var(--b3-theme-text-secondary)';
        section.appendChild(labelDiv);
        
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '8px';
        container.style.alignItems = 'center';
        
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = value;
        colorInput.style.width = '50px';
        colorInput.style.height = '32px';
        colorInput.style.border = '1px solid var(--b3-border-color)';
        colorInput.style.borderRadius = '4px';
        colorInput.style.cursor = 'pointer';
        colorInput.addEventListener('change', (e) => {
            textInput.value = e.target.value;
            onChange(e.target.value);
        });
        container.appendChild(colorInput);
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = value;
        textInput.style.flex = '1';
        textInput.style.padding = '6px 8px';
        textInput.style.border = '1px solid var(--b3-border-color)';
        textInput.style.borderRadius = '4px';
        textInput.style.fontSize = '13px';
        textInput.style.fontFamily = 'monospace';
        textInput.addEventListener('change', (e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                colorInput.value = e.target.value;
                onChange(e.target.value);
            } else {
                e.target.value = value;
            }
        });
        container.appendChild(textInput);
        
        section.appendChild(container);
        return section;
    }
    
    // 创建文本输入区域
    function createTextSection(label, value, onChange) {
        const section = document.createElement('div');
        section.style.marginBottom = '12px';
        
        const labelDiv = document.createElement('div');
        labelDiv.textContent = label;
        labelDiv.style.fontSize = '13px';
        labelDiv.style.fontWeight = '500';
        labelDiv.style.marginBottom = '6px';
        labelDiv.style.color = 'var(--b3-theme-text-secondary)';
        section.appendChild(labelDiv);
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = value;
        textInput.style.width = '100%';
        textInput.style.padding = '6px 8px';
        textInput.style.border = '1px solid var(--b3-border-color)';
        textInput.style.borderRadius = '4px';
        textInput.style.fontSize = '13px';
        textInput.style.fontFamily = 'monospace';
        textInput.addEventListener('change', (e) => {
            onChange(e.target.value);
        });
        section.appendChild(textInput);
        
        return section;
    }
    
    // 切换配置窗口
    async function toggleConfigWindow() {
        const window = document.getElementById('FreeThemeConfigWindow');
        if (window) {
            removeConfigWindow();
        } else {
            await createConfigWindow();
        }
    }
    
    // 移除配置窗口
    function removeConfigWindow() {
        const window = document.getElementById('FreeThemeConfigWindow');
        if (window) {
            if (window._clickHandler) {
                document.removeEventListener('click', window._clickHandler);
            }
            if (window._escHandler) {
                document.removeEventListener('keydown', window._escHandler);
            }
            window.remove();
        }
    }
    
    // 刷新配置显示
    async function refreshConfig() {
        const configWindow = document.getElementById('FreeThemeConfigWindow');
        if (configWindow) {
            // 找到 wrapper（最外层容器）
            const oldWrapper = document.getElementById('FreeThemeConfigWrapper');
            if (oldWrapper) {
                const newWrapper = await createConfigContent();
                oldWrapper.replaceWith(newWrapper);
            } else {
                // 如果没有找到 wrapper，尝试替换整个内容
                const newWrapper = await createConfigContent();
                configWindow.innerHTML = '';
                configWindow.appendChild(newWrapper);
            }
        }
    }
    
    // 初始化
    function initTheme() {
        // 立即尝试创建按钮
        createConfigButton();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initConfig();
                createConfigButton();
                watchForToolbar();
                // 延迟再次尝试，确保工具栏已加载
                setTimeout(createConfigButton, 500);
                setTimeout(createConfigButton, 1500);
            });
        } else {
            initConfig();
            createConfigButton();
            watchForToolbar();
            // 延迟再次尝试，确保工具栏已加载
            setTimeout(createConfigButton, 500);
            setTimeout(createConfigButton, 1500);
        }
        
        // 窗口加载完成后再次尝试
        window.addEventListener('load', () => {
            setTimeout(createConfigButton, 500);
        });
    }
    
    initTheme();
    
    // 主题销毁
    window.destroyTheme = () => {
        clearCache();
        removeConfigWindow();
        const button = document.getElementById('FreeThemeConfigButton');
        if (button) {
            button.remove();
        }
        if (toolbarObserver) {
            toolbarObserver.disconnect();
            toolbarObserver = null;
        }
    };
})();
