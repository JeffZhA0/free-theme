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
        fontSize: '14px',
        lineHeight: '1.8',
        spacing: '1em',
        borderRadius: {
            small: '4px',
            medium: '6px',
            large: '8px',
        },
        crazyMode: false,
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
                    fontSize: parsed.fontSize !== undefined ? parsed.fontSize : defaultConfig.fontSize,
                    lineHeight: parsed.lineHeight !== undefined ? parsed.lineHeight : defaultConfig.lineHeight,
                    spacing: parsed.spacing !== undefined ? parsed.spacing : defaultConfig.spacing,
                    borderRadius: { ...defaultConfig.borderRadius, ...(parsed.borderRadius || {}) },
                    crazyMode: parsed.crazyMode !== undefined ? parsed.crazyMode : defaultConfig.crazyMode,
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
        root.style.setProperty('--b3-theme-code-text', theme.textPrimary);
        
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
            root.style.setProperty('--b3-theme-font-size', config.fontSize);
        }
        
        // 应用行高
        if (config.lineHeight) {
            root.style.setProperty('--b3-theme-line-height', config.lineHeight);
        }
        
        // 应用间距
        if (config.spacing) {
            root.style.setProperty('--b3-theme-spacing', config.spacing);
        }
        
        // 应用圆角配置
        if (config.borderRadius) {
            root.style.setProperty('--b3-theme-border-radius-small', config.borderRadius.small);
            root.style.setProperty('--b3-theme-border-radius-medium', config.borderRadius.medium);
            root.style.setProperty('--b3-theme-border-radius-large', config.borderRadius.large);
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
    function generateRandomColor(isDark = false, crazyMode = false) {
        if (crazyMode) {
            // 疯狂模式：全范围随机颜色 (0-255)
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return rgbToHex(r, g, b);
        } else if (isDark) {
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
    
    // 根据主色调生成合适的悬停颜色（稍微变亮或变暗）
    function generateHoverColor(primaryHex, isDark) {
        // 将十六进制转换为 RGB
        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        
        const primaryRgb = hexToRgb(primaryHex);
        if (!primaryRgb) return primaryHex;
        
        // 悬停颜色：在明亮主题下稍微变亮，在暗黑主题下稍微变暗
        const factor = isDark ? 0.9 : 1.1; // 暗黑主题变暗10%，明亮主题变亮10%
        const hoverR = Math.min(255, Math.max(0, Math.round(primaryRgb.r * factor)));
        const hoverG = Math.min(255, Math.max(0, Math.round(primaryRgb.g * factor)));
        const hoverB = Math.min(255, Math.max(0, Math.round(primaryRgb.b * factor)));
        
        return rgbToHex(hoverR, hoverG, hoverB);
    }
    
    // 生成随机配色方案（使用 16 进制）
    async function generateRandomColors(themeMode) {
        const config = await getConfig();
        const isDark = themeMode === 'dark';
        const crazyMode = config.crazyMode || false;
        
        const primary = generateRandomColor(isDark, crazyMode);
        const primaryHover = generateHoverColor(primary, isDark);
        
        // 生成背景色（16 进制）
        let background, backgroundLight, backgroundDark, surface, surfaceHover;
        if (crazyMode) {
            // 疯狂模式：全范围随机颜色
            const r1 = Math.floor(Math.random() * 256);
            const g1 = Math.floor(Math.random() * 256);
            const b1 = Math.floor(Math.random() * 256);
            const r2 = Math.floor(Math.random() * 256);
            const g2 = Math.floor(Math.random() * 256);
            const b2 = Math.floor(Math.random() * 256);
            const r3 = Math.floor(Math.random() * 256);
            const g3 = Math.floor(Math.random() * 256);
            const b3 = Math.floor(Math.random() * 256);
            background = rgbToHex(r1, g1, b1);
            backgroundLight = rgbToHex(r2, g2, b2);
            backgroundDark = rgbToHex(r3, g3, b3);
            surface = rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
            surfaceHover = rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
        } else if (isDark) {
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
        const textPrimary = crazyMode ?
            rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)) :
            (isDark ? 
                rgbToHex(
                    200 + Math.floor(Math.random() * 55),
                    200 + Math.floor(Math.random() * 55),
                    200 + Math.floor(Math.random() * 55)
                ) :
                rgbToHex(
                    20 + Math.floor(Math.random() * 35),
                    20 + Math.floor(Math.random() * 35),
                    20 + Math.floor(Math.random() * 35)
                )
            );
        const textSecondary = crazyMode ?
            rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)) :
            (isDark ?
                rgbToHex(
                    120 + Math.floor(Math.random() * 60),
                    120 + Math.floor(Math.random() * 60),
                    120 + Math.floor(Math.random() * 60)
                ) :
                rgbToHex(
                    80 + Math.floor(Math.random() * 60),
                    80 + Math.floor(Math.random() * 60),
                    80 + Math.floor(Math.random() * 60)
                )
            );
        const textDisabled = crazyMode ?
            rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)) :
            (isDark ?
                rgbToHex(
                    70 + Math.floor(Math.random() * 30),
                    70 + Math.floor(Math.random() * 30),
                    70 + Math.floor(Math.random() * 30)
                ) :
                rgbToHex(
                    150 + Math.floor(Math.random() * 50),
                    150 + Math.floor(Math.random() * 50),
                    150 + Math.floor(Math.random() * 50)
                )
            );
        
        // 生成边框色（16 进制）
        const borderColor = crazyMode ?
            rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)) :
            (isDark ?
                rgbToHex(
                    50 + Math.floor(Math.random() * 30),
                    50 + Math.floor(Math.random() * 30),
                    50 + Math.floor(Math.random() * 30)
                ) :
                rgbToHex(
                    200 + Math.floor(Math.random() * 30),
                    200 + Math.floor(Math.random() * 30),
                    200 + Math.floor(Math.random() * 30)
                )
            );
        const borderColorHover = crazyMode ?
            rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)) :
            (isDark ?
                rgbToHex(
                    70 + Math.floor(Math.random() * 30),
                    70 + Math.floor(Math.random() * 30),
                    70 + Math.floor(Math.random() * 30)
                ) :
                rgbToHex(
                    170 + Math.floor(Math.random() * 30),
                    170 + Math.floor(Math.random() * 30),
                    170 + Math.floor(Math.random() * 30)
                )
            );
        const borderColorLight = crazyMode ?
            rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)) :
            (isDark ?
                rgbToHex(
                    40 + Math.floor(Math.random() * 20),
                    40 + Math.floor(Math.random() * 20),
                    40 + Math.floor(Math.random() * 20)
                ) :
                rgbToHex(
                    220 + Math.floor(Math.random() * 20),
                    220 + Math.floor(Math.random() * 20),
                    220 + Math.floor(Math.random() * 20)
                )
            );
        
        // 生成代码块颜色（16 进制）
        const codeBackground = crazyMode ?
            rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)) :
            (isDark ?
                rgbToHex(
                    30 + Math.floor(Math.random() * 20),
                    30 + Math.floor(Math.random() * 20),
                    30 + Math.floor(Math.random() * 20)
                ) :
                rgbToHex(
                    245 + Math.floor(Math.random() * 10),
                    245 + Math.floor(Math.random() * 10),
                    245 + Math.floor(Math.random() * 10)
                )
            );
        const codeBorder = borderColor;
        
        // 生成选中文本颜色（16 进制）
        const selectionBg = crazyMode ?
            rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)) :
            (isDark ?
                rgbToHex(
                    80 + Math.floor(Math.random() * 100),
                    80 + Math.floor(Math.random() * 100),
                    150 + Math.floor(Math.random() * 105)
                ) :
                rgbToHex(
                    150 + Math.floor(Math.random() * 105),
                    180 + Math.floor(Math.random() * 75),
                    220 + Math.floor(Math.random() * 35)
                )
            );
        const selectionText = textPrimary;
        
        // 生成阴影颜色（rgba格式）
        // 阴影通常是深色，随机生成低RGB值和合适的透明度
        const shadowR = crazyMode ? Math.floor(Math.random() * 256) : Math.floor(Math.random() * 50); // 疯狂模式：0-255，正常：0-49
        const shadowG = crazyMode ? Math.floor(Math.random() * 256) : Math.floor(Math.random() * 50);
        const shadowB = crazyMode ? Math.floor(Math.random() * 256) : Math.floor(Math.random() * 50);
        
        // 明亮主题：透明度较低 (0.05-0.15)
        // 暗黑主题：透明度较高 (0.2-0.4)
        // 疯狂模式：全范围透明度 (0-1)
        const shadowAlpha = crazyMode ?
            Math.random().toFixed(2) :
            (isDark ? 
                (0.2 + Math.random() * 0.2).toFixed(2) : // 0.2-0.4
                (0.05 + Math.random() * 0.1).toFixed(2) // 0.05-0.15
            );
        const shadowLightAlpha = crazyMode ?
            Math.random().toFixed(2) :
            (isDark ?
                (0.15 + Math.random() * 0.1).toFixed(2) : // 0.15-0.25
                (0.03 + Math.random() * 0.04).toFixed(2) // 0.03-0.07
            );
        const shadowMediumAlpha = crazyMode ?
            Math.random().toFixed(2) :
            (isDark ?
                (0.2 + Math.random() * 0.1).toFixed(2) : // 0.2-0.3
                (0.05 + Math.random() * 0.05).toFixed(2) // 0.05-0.1
            );
        
        const shadow = `rgba(${shadowR}, ${shadowG}, ${shadowB}, ${shadowAlpha})`;
        const shadowLight = `rgba(${shadowR}, ${shadowG}, ${shadowB}, ${shadowLightAlpha})`;
        const shadowMedium = `rgba(${shadowR}, ${shadowG}, ${shadowB}, ${shadowMediumAlpha})`;
        
        await updateConfig({
            [themeMode]: {
                ...config[themeMode],
                primary,
                primaryHover,
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
                selectionBg,
                selectionText,
                shadow,
                shadowLight,
                shadowMedium,
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
    
    // 检测语言（通过 HTML lang 属性）
    function getLanguage() {
        const lang = document.documentElement.lang || document.documentElement.getAttribute('lang') || '';
        // 转换为小写并标准化，支持多种中文格式：zh-CN, zh_CN, zh-Hans, zh-Hans-CN, zh 等
        const langLower = lang.toLowerCase();
        // 检查是否以 zh 开头（支持各种中文变体）
        if (langLower.startsWith('zh')) {
            return 'zh-CN';
        }
        return 'en';
    }
    
    // 文案对象
    const i18n = {
        'zh-CN': {
            title: (mode) => `FreeTheme 配置 (${mode})`,
            lightMode: '明亮模式',
            darkMode: '暗黑模式',
            randomColors: '随机配色',
            crazyMode: '疯狂模式',
            refreshConfig: '刷新配置',
            refreshing: '刷新中...',
            resetToDefault: '重置为默认',
            confirmReset: '确定要重置为默认配置吗？',
            buttonAriaLabel: 'FreeTheme 配置',
            groups: {
                primary: '🎨 主色调',
                background: '🖼️ 背景色',
                text: '📝 文本色',
                border: '🔲 边框色',
                code: '💻 代码块',
                selection: '✨ 选中文本',
                shadow: '🌑 阴影',
                font: '🔤 字体',
                fontSize: '📏 字体大小',
                lineHeight: '📐 行高',
                spacing: '📊 间距',
                borderRadius: '🔘 圆角',
            },
            labels: {
                primary: '主色调',
                primaryHover: '主色调悬停',
                background: '背景色',
                backgroundLight: '浅色背景',
                backgroundDark: '深色背景',
                surface: '表面色',
                surfaceHover: '表面悬停',
                textPrimary: '主要文本色',
                textSecondary: '次要文本色',
                textDisabled: '禁用文本色',
                onBackground: '背景上文本',
                onSurface: '表面上文本',
                onPrimary: '主色上文本',
                borderColor: '边框色',
                borderColorHover: '边框悬停',
                borderColorLight: '边框浅色',
                codeBackground: '代码块背景',
                codeBorder: '代码块边框',
                selectionBg: '选中背景',
                selectionText: '选中文本',
                shadow: '阴影',
                shadowLight: '浅阴影',
                shadowMedium: '中阴影',
                english: '英文字体',
                chinese: '中文字体',
                small: '小号',
                normal: '正常',
                medium: '中等',
                large: '大号',
                xlarge: '超大',
                tight: '紧凑',
                relaxed: '宽松',
                xs: '超小',
                sm: '小',
                md: '中',
                lg: '大',
                xl: '超大',
            },
        },
        'en': {
            title: (mode) => `FreeTheme Config (${mode})`,
            lightMode: 'Light Mode',
            darkMode: 'Dark Mode',
            randomColors: 'Random Colors',
            crazyMode: 'Crazy Mode',
            refreshConfig: 'Refresh Config',
            refreshing: 'Refreshing...',
            resetToDefault: 'Reset to Default',
            confirmReset: 'Are you sure you want to reset to default configuration?',
            buttonAriaLabel: 'FreeTheme Config',
            groups: {
                primary: '🎨 Primary Colors',
                background: '🖼️ Background Colors',
                text: '📝 Text Colors',
                border: '🔲 Border Colors',
                code: '💻 Code Blocks',
                selection: '✨ Selection',
                shadow: '🌑 Shadows',
                font: '🔤 Fonts',
                fontSize: '📏 Font Size',
                lineHeight: '📐 Line Height',
                spacing: '📊 Spacing',
                borderRadius: '🔘 Border Radius',
            },
            labels: {
                primary: 'Primary',
                primaryHover: 'Primary Hover',
                background: 'Background',
                backgroundLight: 'Light Background',
                backgroundDark: 'Dark Background',
                surface: 'Surface',
                surfaceHover: 'Surface Hover',
                textPrimary: 'Primary Text',
                textSecondary: 'Secondary Text',
                textDisabled: 'Disabled Text',
                onBackground: 'Text on Background',
                onSurface: 'Text on Surface',
                onPrimary: 'Text on Primary',
                borderColor: 'Border',
                borderColorHover: 'Border Hover',
                borderColorLight: 'Border Light',
                codeBackground: 'Code Background',
                codeBorder: 'Code Border',
                selectionBg: 'Selection Background',
                selectionText: 'Selection Text',
                shadow: 'Shadow',
                shadowLight: 'Light Shadow',
                shadowMedium: 'Medium Shadow',
                english: 'English Font',
                chinese: 'Chinese Font',
                small: 'Small',
                normal: 'Normal',
                medium: 'Medium',
                large: 'Large',
                xlarge: 'XLarge',
                tight: 'Tight',
                relaxed: 'Relaxed',
                xs: 'XS',
                sm: 'SM',
                md: 'MD',
                lg: 'LG',
                xl: 'XL',
            },
        },
    };
    
    // 获取当前语言的文案
    function t(key) {
        const lang = getLanguage();
        const keys = key.split('.');
        let value = i18n[lang];
        for (const k of keys) {
            value = value?.[k];
        }
        return value !== undefined ? value : key;
    }
    
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
        button.setAttribute('aria-label', t('buttonAriaLabel'));
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
        const modeName = themeMode === 'light' ? t('lightMode') : t('darkMode');
        
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
        title.textContent = t('title')(modeName);
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
            <span>${t('randomColors')}</span>
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
            <span>${t('refreshConfig')}</span>
        `;
        refreshBtn.addEventListener('click', async () => {
            const originalHTML = refreshBtn.innerHTML;
            refreshBtn.innerHTML = `<span>${t('refreshing')}</span>`;
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
        resetBtn.textContent = t('resetToDefault');
        resetBtn.className = 'b3-button';
        resetBtn.style.flex = '1';
        resetBtn.addEventListener('click', async () => {
            if (confirm(t('confirmReset'))) {
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
        
        // 常用英文字体列表（等宽字体栈）
        const englishFonts = [
            { value: "'Consolas', 'Monaco', 'Courier New', 'JetBrains Mono'", label: 'Consolas / Monaco (默认)' },
            { value: "'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New'", label: 'JetBrains Mono' },
            { value: "'Fira Code', 'Consolas', 'Monaco', 'Courier New'", label: 'Fira Code' },
            { value: "'Source Code Pro', 'Consolas', 'Monaco', 'Courier New'", label: 'Source Code Pro' },
            { value: "'Cascadia Code', 'Consolas', 'Monaco', 'Courier New'", label: 'Cascadia Code' },
            { value: "'Courier New', 'Courier', monospace", label: 'Courier New' },
            { value: "'Monaco', 'Menlo', 'Courier New', monospace", label: 'Monaco (macOS)' },
            { value: "'Menlo', 'Monaco', 'Courier New', monospace", label: 'Menlo (macOS)' },
            { value: "'DejaVu Sans Mono', 'Courier New', monospace", label: 'DejaVu Sans Mono' },
            { value: "'Liberation Mono', 'Courier New', monospace", label: 'Liberation Mono' },
            { value: "'Inconsolata', 'Courier New', monospace", label: 'Inconsolata' },
            { value: "monospace", label: '系统等宽字体' },
            { value: "CUSTOM", label: '自定义...' },
        ];
        
        // 常用中文字体列表（字体栈）
        const chineseFonts = [
            { value: "'Source Han Sans SC', 'Source Han Sans CN', 'Noto Sans CJK SC', 'Microsoft YaHei'", label: '思源黑体 / 微软雅黑 (默认)' },
            { value: "'Microsoft YaHei', 'SimHei', sans-serif", label: '微软雅黑' },
            { value: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei'", label: '苹方 (macOS/iOS)' },
            { value: "'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei'", label: '冬青黑体 / 微软雅黑' },
            { value: "'STHeiti', 'SimHei', sans-serif", label: '华文黑体 / 黑体' },
            { value: "'SimSun', 'NSimSun', serif", label: '宋体' },
            { value: "'KaiTi', '楷体', serif", label: '楷体' },
            { value: "'FangSong', '仿宋', serif", label: '仿宋' },
            { value: "'WenQuanYi Micro Hei', 'Microsoft YaHei', sans-serif", label: '文泉驿微米黑' },
            { value: "'Noto Sans SC', 'Microsoft YaHei', sans-serif", label: 'Noto Sans SC' },
            { value: "'Microsoft JhengHei', 'Microsoft YaHei'", label: '微软正黑体 (繁体)' },
            { value: "'STSong', 'SimSun', serif", label: '华文宋体 / 宋体' },
            { value: "sans-serif", label: '系统无衬线字体' },
            { value: "serif", label: '系统衬线字体' },
            { value: "CUSTOM", label: '自定义...' },
        ];
        
        // 创建字体选择器区域的函数
        function createFontSelectSection(label, value, options, onChange) {
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
            container.style.flexDirection = 'column';
            container.style.gap = '8px';
            
            // 下拉选择器
            const select = document.createElement('select');
            select.style.width = '100%';
            select.style.padding = '6px 8px';
            select.style.border = '1px solid var(--b3-border-color)';
            select.style.borderRadius = '4px';
            select.style.fontSize = '13px';
            select.style.fontFamily = 'inherit';
            select.style.backgroundColor = 'var(--b3-theme-background)';
            select.style.color = 'var(--b3-theme-text-primary)';
            select.style.cursor = 'pointer';
            
            // 添加选项
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                select.appendChild(optionElement);
            });
            
            // 检查当前值是否匹配某个选项
            const hasMatchingOption = options.some(opt => opt.value === value);
            let isCustom = false;
            
            if (!hasMatchingOption && value) {
                // 如果当前值不在选项中，添加一个自定义选项
                const customOption = document.createElement('option');
                customOption.value = value;
                customOption.textContent = `自定义: ${value.length > 40 ? value.substring(0, 40) + '...' : value}`;
                customOption.selected = true;
                select.insertBefore(customOption, select.lastElementChild);
                isCustom = true;
            } else {
                select.value = value || options[0].value;
                isCustom = select.value === 'CUSTOM';
            }
            
            // 自定义输入框（初始隐藏，除非选择自定义）
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = isCustom ? value : '';
            textInput.style.width = '100%';
            textInput.style.padding = '6px 8px';
            textInput.style.border = '1px solid var(--b3-border-color)';
            textInput.style.borderRadius = '4px';
            textInput.style.fontSize = '13px';
            textInput.style.fontFamily = 'monospace';
            textInput.style.display = isCustom ? 'block' : 'none';
            textInput.placeholder = '例如: \'Font Name\', \'Fallback Font\', sans-serif';
            
            // 选择器变化事件
            select.addEventListener('change', (e) => {
                if (e.target.value === 'CUSTOM') {
                    textInput.style.display = 'block';
                    textInput.focus();
                    textInput.value = value || '';
                } else {
                    textInput.style.display = 'none';
                    onChange(e.target.value);
                }
            });
            
            // 自定义输入框变化事件
            const handleTextChange = () => {
                const inputValue = textInput.value.trim();
                if (inputValue) {
                    onChange(inputValue);
                }
            };
            
            textInput.addEventListener('change', handleTextChange);
            textInput.addEventListener('blur', handleTextChange);
            
            container.appendChild(select);
            container.appendChild(textInput);
            section.appendChild(container);
            
            return section;
        }
        
        // 主色调分组
        content.appendChild(createGroup(t('groups.primary'), createColorConfigs([
            {label: t('labels.primary'), key: 'primary'},
            {label: t('labels.primaryHover'), key: 'primaryHover'},
        ])));
        
        // 背景色分组
        content.appendChild(createGroup(t('groups.background'), createColorConfigs([
            {label: t('labels.background'), key: 'background'},
            {label: t('labels.backgroundLight'), key: 'backgroundLight'},
            {label: t('labels.backgroundDark'), key: 'backgroundDark'},
            {label: t('labels.surface'), key: 'surface'},
            {label: t('labels.surfaceHover'), key: 'surfaceHover'},
        ])));
        
        // 文本色分组
        content.appendChild(createGroup(t('groups.text'), createColorConfigs([
            {label: t('labels.textPrimary'), key: 'textPrimary'},
            {label: t('labels.textSecondary'), key: 'textSecondary'},
            {label: t('labels.textDisabled'), key: 'textDisabled'},
            {label: t('labels.onBackground'), key: 'onBackground'},
            {label: t('labels.onSurface'), key: 'onSurface'},
            {label: t('labels.onPrimary'), key: 'onPrimary'},
        ])));
        
        // 边框色分组
        content.appendChild(createGroup(t('groups.border'), createColorConfigs([
            {label: t('labels.borderColor'), key: 'borderColor'},
            {label: t('labels.borderColorHover'), key: 'borderColorHover'},
            {label: t('labels.borderColorLight'), key: 'borderColorLight'},
        ])));
        
        // 代码块分组
        content.appendChild(createGroup(t('groups.code'), createColorConfigs([
            {label: t('labels.codeBackground'), key: 'codeBackground'},
            {label: t('labels.codeBorder'), key: 'codeBorder'},
        ])));
        
        // 选中文本分组
        content.appendChild(createGroup(t('groups.selection'), createColorConfigs([
            {label: t('labels.selectionBg'), key: 'selectionBg'},
            {label: t('labels.selectionText'), key: 'selectionText'},
        ])));
        
        // 阴影分组（使用文本输入，因为阴影是 rgba 格式）
        const shadowItems = [
            {label: t('labels.shadow'), key: 'shadow'},
            {label: t('labels.shadowLight'), key: 'shadowLight'},
            {label: t('labels.shadowMedium'), key: 'shadowMedium'},
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
        content.appendChild(createGroup(t('groups.shadow'), shadowItems));
        
        // 字体配置分组（使用下拉选择器）
        const englishFontValue = config.fontFamily.english || defaultConfig.fontFamily.english;
        const chineseFontValue = config.fontFamily.chinese || defaultConfig.fontFamily.chinese;
        
        const fontGroupItems = [
            createFontSelectSection(
                t('labels.english'),
                englishFontValue,
                englishFonts,
                async (value) => {
                    await updateConfig({
                        fontFamily: {
                            ...config.fontFamily,
                            english: value,
                        }
                    });
                    await refreshConfig();
                }
            ),
            createFontSelectSection(
                t('labels.chinese'),
                chineseFontValue,
                chineseFonts,
                async (value) => {
                    await updateConfig({
                        fontFamily: {
                            ...config.fontFamily,
                            chinese: value,
                        }
                    });
                    await refreshConfig();
                }
            ),
        ];
        
        content.appendChild(createGroup(t('groups.font'), fontGroupItems));
        
        // 字体大小配置
        content.appendChild(createGroup(t('groups.fontSize'), [
            createTextSection('', config.fontSize || defaultConfig.fontSize, async (value) => {
                const newConfig = await updateConfig({ fontSize: value });
                applyConfig(newConfig);
                await refreshConfig();
            })
        ]));
        
        // 行高配置
        content.appendChild(createGroup(t('groups.lineHeight'), [
            createTextSection('', config.lineHeight || defaultConfig.lineHeight, async (value) => {
                const newConfig = await updateConfig({ lineHeight: value });
                applyConfig(newConfig);
                await refreshConfig();
            })
        ]));
        
        // 间距配置
        content.appendChild(createGroup(t('groups.spacing'), [
            createTextSection('', config.spacing || defaultConfig.spacing, async (value) => {
                const newConfig = await updateConfig({ spacing: value });
                applyConfig(newConfig);
                await refreshConfig();
            })
        ]));
        
        // 圆角分组
        if (config.borderRadius) {
            content.appendChild(createGroup(t('groups.borderRadius'), createTextConfigs([
                {label: t('labels.small'), key: 'small'},
                {label: t('labels.medium'), key: 'medium'},
                {label: t('labels.large'), key: 'large'},
            ], config.borderRadius, 'borderRadius')));
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
        
        // 只有当 label 不为空时才创建标签
        if (label) {
            const labelDiv = document.createElement('div');
            labelDiv.textContent = label;
            labelDiv.style.fontSize = '13px';
            labelDiv.style.fontWeight = '500';
            labelDiv.style.marginBottom = '6px';
            labelDiv.style.color = 'var(--b3-theme-text-secondary)';
            section.appendChild(labelDiv);
        }
        
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
            // 保存当前窗口位置（使用 getBoundingClientRect 获取实际位置）
            const rect = configWindow.getBoundingClientRect();
            const savedLeft = configWindow.style.left;
            const savedTop = configWindow.style.top;
            const savedTransform = configWindow.style.transform;
            const savedRight = configWindow.style.right;
            const savedBottom = configWindow.style.bottom;
            
            // 保存内容区域的滚动位置
            const contentArea = document.getElementById('FreeThemeConfigContent');
            const savedScrollTop = contentArea ? contentArea.scrollTop : 0;
            
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
            
            // 恢复窗口位置（使用实际位置，因为 style 属性可能为空）
            // 由于窗口是 position: fixed，getBoundingClientRect 返回的是相对于视口的位置
            configWindow.style.left = savedLeft || `${rect.left}px`;
            configWindow.style.top = savedTop || `${rect.top}px`;
            if (savedTransform) {
                configWindow.style.transform = savedTransform;
            }
            if (savedRight) {
                configWindow.style.right = savedRight;
            }
            if (savedBottom) {
                configWindow.style.bottom = savedBottom;
            }
            
            // 恢复内容区域的滚动位置
            if (savedScrollTop > 0) {
                // 使用 setTimeout 确保 DOM 更新完成后再设置滚动位置
                setTimeout(() => {
                    const newContentArea = document.getElementById('FreeThemeConfigContent');
                    if (newContentArea) {
                        newContentArea.scrollTop = savedScrollTop;
                    }
                }, 0);
            }
            
            // 重新应用配置以确保 CSS 变量更新
            const config = await getConfig();
            applyConfig(config);
        }
    }
    
    // 切换疯狂模式
    async function toggleCrazyMode() {
        const config = await getConfig();
        const newCrazyMode = !config.crazyMode;
        
        await updateConfig({
            crazyMode: newCrazyMode
        });
        
        // 显示提示信息
        const message = newCrazyMode ? '🎉 疯狂模式已开启！' : '💤 疯狂模式已关闭';
        console.log(message);
        
        // 显示临时提示框
        showNotification(message);
    }
    
    // 显示通知
    function showNotification(message) {
        // 创建临时通知元素
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.backgroundColor = 'var(--b3-theme-background)';
        notification.style.border = '1px solid var(--b3-border-color)';
        notification.style.borderRadius = '6px';
        notification.style.boxShadow = '0 2px 8px var(--b3-theme-shadow)';
        notification.style.zIndex = '10000';
        notification.style.fontSize = '14px';
        notification.style.color = 'var(--b3-theme-text-primary)';
        notification.style.pointerEvents = 'none';
        
        document.body.appendChild(notification);
        
        // 2秒后自动移除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    // 科乐美代码监听器（上上下下左右左右baba）
    function initKonamiCode() {
        const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'b', 'a'];
        let currentSequence = [];
        let timeoutId = null;
        const TIMEOUT = 3000; // 3秒内必须完成序列
        
        function resetSequence() {
            currentSequence = [];
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        }
        
        function checkSequence(key) {
            // 检查是否匹配当前位置
            const expectedKey = sequence[currentSequence.length];
            
            if (key === expectedKey) {
                // 按键匹配，添加到序列
                currentSequence.push(key);
                
                // 检查是否完成整个序列
                if (currentSequence.length === sequence.length) {
                    resetSequence();
                    toggleCrazyMode();
                    return;
                }
            } else {
                // 按键不匹配，重置序列
                resetSequence();
                
                // 如果当前按键是序列的开始，则添加它
                if (key === sequence[0]) {
                    currentSequence.push(key);
                }
            }
            
            // 重置超时定时器
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(resetSequence, TIMEOUT);
        }
        
        document.addEventListener('keydown', (e) => {
            // 忽略在输入框中的按键
            const activeElement = document.activeElement;
            if (activeElement && (
                activeElement.tagName === 'INPUT' || 
                activeElement.tagName === 'TEXTAREA' || 
                activeElement.isContentEditable
            )) {
                return;
            }
            
            // 将字母键转换为小写，保持箭头键不变
            let key = e.key;
            if (key.length === 1 && /[a-zA-Z]/.test(key)) {
                key = key.toLowerCase();
            }
            checkSequence(key);
        });
    }
    
    
    // 初始化
    function initTheme() {
        // 立即尝试创建按钮
        createConfigButton();
        
        // 初始化科乐美代码监听器
        initKonamiCode();
        
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
