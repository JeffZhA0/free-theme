[English](README.md)

# 自由主题 (Free Theme)

一个支持完全自定义配置的思源笔记主题，提供明亮和暗黑两种模式，让你自由定制属于自己的笔记风格。

## ✨ 特性

- 🎨 **双模式支持**：完美支持明亮和暗黑两种主题模式
- 🎯 **可视化配置**：通过图形界面轻松配置所有颜色和样式
- 🎲 **随机配色**：一键生成随机配色方案，发现更多可能
- 🔧 **丰富配置项**：支持配置主色调、背景色、文本色、边框色、代码块、选中文本、阴影等
- 🔤 **字体配置**：英文使用等宽字体，中文使用思源黑体
- 💾 **配置持久化**：配置自动保存，刷新后依然有效
- 🔄 **实时预览**：修改配置立即生效，所见即所得

## 🚀 快速开始

### 安装

1. 在思源笔记中打开 `设置` → `外观` → `主题`
2. 点击 `从集市安装` 或直接下载主题文件
3. 将主题文件夹放置在 `{workspace}/conf/appearance/themes/` 目录下
4. 在主题列表中选择 `自由主题`

### 配置入口

安装主题后，在思源笔记的工具栏上会出现一个配置按钮（齿轮图标），点击即可打开配置窗口。

## 📖 配置说明

### 配置窗口

配置窗口分为以下几个部分：

#### 1. 固定操作栏（顶部）
- **随机配色**：一键生成随机配色方案
- **刷新配置**：重新加载配置文件
- **重置为默认**：恢复为默认配置

#### 2. 颜色配置（按分组）

**🎨 主色调**
- 主色调
- 主色调浅色
- 主色调深色
- 主色调悬停

**🖼️ 背景色**
- 背景色
- 浅色背景
- 深色背景
- 表面色
- 表面悬停

**📝 文本色**
- 主要文本色
- 次要文本色
- 禁用文本色
- 背景上文本
- 表面上文本
- 主色上文本

**🔲 边框色**
- 边框色
- 边框悬停
- 边框浅色

**💻 代码块**
- 代码块背景
- 代码块边框
- 代码块文本

**✨ 选中文本**
- 选中背景
- 选中文本

**🌑 阴影**
- 阴影
- 浅阴影
- 中阴影

#### 3. 其他配置

**🔤 字体**
- 英文字体：等宽字体配置
- 中文字体：中文字体配置

**📏 字体大小**
- 小号、正常、中等、大号、超大

**📐 行高**
- 紧凑、正常、宽松

**📊 间距**
- 超小、小、中、大、超大

**🔘 圆角**
- 小圆角、中圆角、大圆角

**⚡ 过渡动画**
- 默认过渡：用于大多数元素的过渡效果
- 快速过渡：用于需要快速响应的交互

## 🎨 使用技巧

### 随机配色

点击"随机配色"按钮可以快速生成一套随机配色方案，如果不满意可以继续点击生成新的配色。

### 颜色格式

- **颜色值**：支持 16 进制格式，如 `#ff6b6b`、`#1e1e1e`
- **阴影值**：支持 rgba 格式，如 `rgba(0, 0, 0, 0.1)`

### 配置同步

配置会自动保存到 `/conf/free-theme-config.json` 文件中，你可以：
- 手动编辑配置文件
- 在不同设备间同步配置文件
- 备份和恢复配置

## 💻 编程接口

主题提供了 JavaScript API，可以在浏览器控制台中使用：

```javascript
// 获取当前配置
const config = await window.FreeThemeConfig.getConfig();

// 更新配置
await window.FreeThemeConfig.updateConfig({
    light: {
        primary: '#007bff',
        background: '#ffffff',
    }
});

// 重置为默认配置
await window.FreeThemeConfig.resetConfig();

// 生成随机配色
await window.FreeThemeConfig.generateRandomColors('light');
```

## 📁 配置文件

配置文件位置：`/conf/free-theme-config.json`

配置文件结构：

```json
{
  "light": {
    "primary": "#d23f31",
    "background": "#ffffff",
    "textPrimary": "#212529",
    ...
  },
  "dark": {
    "primary": "#ff6b6b",
    "background": "#1e1e1e",
    "textPrimary": "#d4d4d4",
    ...
  },
  "fontFamily": {
    "english": "'Consolas', 'Monaco', 'Courier New', 'JetBrains Mono'",
    "chinese": "'Source Han Sans SC', 'Source Han Sans CN', 'Noto Sans CJK SC', 'Microsoft YaHei'"
  },
  "fontSize": {
    "small": "12px",
    "normal": "14px",
    ...
  }
}
```

## 🔧 开发

### 文件结构

```
free-theme/
├── theme.json          # 主题配置文件
├── theme.css          # 主题样式文件
├── theme.js           # 主题脚本文件
├── icon.png           # 主题图标
├── preview.png        # 主题预览图
├── README.md          # 英文说明文档
└── README_zh_CN.md    # 中文说明文档
```

### 本地开发

1. 将主题文件夹放置在 `{workspace}/conf/appearance/themes/` 目录下
2. 修改 `theme.css` 或 `theme.js` 文件
3. 在思源笔记中刷新主题或重启应用

## 📝 更新日志

### v0.0.1
- ✨ 初始版本
- 🎨 支持明亮和暗黑两种模式
- 🔧 完整的可视化配置系统
- 🎲 随机配色功能
- 🔤 字体配置（英文等宽，中文思源黑体）

## 📄 许可证

查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 反馈

如有问题或建议，请通过以下方式反馈：
- GitHub Issues: [提交问题](https://github.com/JeffZhA0/free-theme/issues)
- 作者：JeffZhA0

---

**享受你的个性化笔记体验！** 🎉
