# FreeTheme 配置测试文档

这是一个用于测试 FreeTheme 配置菜单所有功能的测试文档。

## 标题样式测试

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 文本样式测试

这是一个普通段落，用于测试主要文本色（textPrimary）、字体配置、行高和间距。你可以选中这段文字来测试选中文本的颜色（selectionBg 和 selectionText）。

这是第二个段落，用于测试段落之间的间距（spacing）配置。

这是第三个段落，包含一些**粗体文本**和*斜体文本*来测试文本样式。

## 链接测试

这是一个[普通链接](https://example.com)，用于测试主色调（primary）。将鼠标悬停在这个链接上可以看到主色调悬停（primaryHover）的效果，点击时可以看到主色调深色（primaryDark）的效果。

这是另一个[链接示例](https://example.com)，用于测试链接的边框和过渡动画效果。

## 列表测试

### 无序列表

- 列表项一，测试列表的间距（spacing）和文本色
- 列表项二，测试行高（lineHeight）配置
- 列表项三，测试字体大小（fontSize）
  - 嵌套列表项，测试层级间距
  - 另一个嵌套项

### 有序列表

1. 第一项，测试有序列表的样式
2. 第二项，测试列表项的间距
3. 第三项，测试文本对齐和行高

## 代码测试

### 行内代码

这是一个包含`行内代码`的段落，用于测试代码块的背景色（codeBackground）、边框色（codeBorder）、文本色（codeText）和圆角（borderRadius）。

另一个行内代码示例：`const test = 'example'`，测试代码块的字体配置。

### 代码块

```javascript
// 这是一个代码块示例
function testFunction() {
    const primary = '#d23f31';
    const primaryLight = '#f5e6e4';
    const primaryDark = '#b83226';
    const primaryHover = '#c6392b';
    console.log('测试代码块样式');
    return {
        background: '#ffffff',
        text: '#212529'
    };
}
```

```css
/* CSS 代码块测试 */
.button {
    background-color: var(--b3-theme-primary);
    color: var(--b3-theme-on-primary);
    border-radius: var(--b3-theme-border-radius-medium);
    padding: var(--b3-theme-spacing-md);
}

.button:hover {
    background-color: var(--b3-theme-primary-hover);
}
```

```python
# Python 代码块测试
def test_config():
    """测试函数"""
    config = {
        'light': {
            'primary': '#d23f31',
            'background': '#ffffff'
        }
    }
    return config
```

## 引用块测试

> 这是一个引用块示例，用于测试背景色（backgroundLight）、边框色（borderColor）和圆角（borderRadius）配置。
> 
> 引用块通常用于引用其他内容，可以包含多个段落。

> 另一个引用块，测试引用块的文本色（textSecondary）和间距。

## 表格测试

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 单元格1 | 单元格2 | 单元格3 |
| 测试边框色 | 测试背景色 | 测试文本色 |
| 鼠标悬停测试 | 悬停背景色 | 表面悬停色 |

表格用于测试：
- 边框色（borderColor）
- 表头背景色（backgroundLight）
- 行悬停效果（surfaceHover）
- 表格文本色

## 分割线测试

---

上面是一条分割线，用于测试边框色（borderColor）和间距（spacing）配置。

## 其他测试

### 文本颜色测试

主要文本色（textPrimary）、次要文本色（textSecondary）、禁用文本色（textDisabled）可以通过配置菜单中的文本色分组进行测试。

### 选中文本测试

请选中这段文字来测试选中文本的背景色（selectionBg）和文本色（selectionText）配置。选中文本的颜色会在你选择文本时显示出来。

### 阴影测试

阴影配置（shadow、shadowLight、shadowMedium）主要用于代码块、卡片、按钮等元素的阴影效果。

## 按钮测试区域

（注：在实际使用中，按钮会出现在界面的各个位置，如配置窗口中的按钮会使用主色调相关配置）

主要按钮会使用：
- 主色调（primary）作为背景色
- 主色调悬停（primaryHover）作为悬停状态
- 主色调深色（primaryDark）作为点击状态
- 圆角（borderRadius）配置
- 阴影（shadow）配置

## 输入框测试

输入框的聚焦效果会使用主色调浅色（primaryLight）作为外发光（box-shadow）的颜色。

（注：输入框在实际使用中会出现在表单、搜索框等位置）

## 配置项总结

这个测试文档涵盖了以下配置项的测试：

1. **主色调**：链接、按钮的颜色效果
2. **背景色**：页面背景、表面、卡片背景
3. **文本色**：主要文本、次要文本、禁用文本
4. **边框色**：表格、分割线、代码块边框
5. **代码块**：行内代码和代码块的样式
6. **选中文本**：文本选中时的颜色
7. **阴影**：代码块、卡片的阴影效果
8. **字体**：英文和中文字体配置
9. **字体大小**：标题、段落、列表的字体大小
10. **行高**：段落、列表的行高
11. **间距**：段落、列表项之间的间距
12. **圆角**：代码块、按钮、卡片的圆角
13. **过渡动画**：链接、按钮的过渡效果

请在配置菜单中修改这些配置项，然后查看此文档的变化来验证配置是否生效。

