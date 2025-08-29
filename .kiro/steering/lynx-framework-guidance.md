---
inclusion: always
---

# Lynx.js 框架开发指导

## 项目背景

本项目使用 Lynx.js 框架开发，这是一个相对较新的框架，不在常规大模型的训练数据中。因此在开发过程中需要频繁参考官方文档。

## 开发指导原则

### 1. 优先查阅文档

- 当遇到 Lynx.js 相关的 API、组件或配置问题时，应该首先通过 Context7 获取最新的官方文档
- 对于不确定的实现方式，建议先查询文档再编写代码

### 2. 文档资源

- 官方文档：https://lynxjs.org/react/ 和 https://lynxjs.org/index.html
- 使用 Context7 工具获取 Lynx.js 相关文档
- 在实现新功能前，先获取相关组件或 API 的文档
- 关注文档中的示例代码和最佳实践

#[[file:https://lynxjs.org/react/]]

### 3. 框架特性

- 本项目使用 `@lynx-js/react` 作为主要 UI 库
- 构建工具使用 `@lynx-js/rspeedy`
- 支持多环境构建（web 和 lynx）
- 集成了 QR 码插件用于移动端调试
- 与 React 17+ 对齐，完全支持函数组件、Hooks 和 Context

## 4. 重要文档

## 组合元件

一个 Lynx 页面中可能包含了文字、图片不同的视觉要素，通过不同的布局方式，来呈现出不同的页面样式。本节希望帮助大家了解如何构建最基本的视图。

## 元素标签：界面的基础构建单元

Lynx 通过标记语言来定义内容和结构，其最基础的单元是一个[元素标签](https://lynxjs.org/zh/guide/spec.html#element-tag)。元素标签的概念类似 [HTML 元素](https://developer.mozilla.org/en-US/docs/Glossary/Element)，元素标签可以用来包围不同部分的内容，使其以某种方式呈现或者工作。

与 HTML 不同的是，Lynx 中使用一些其独有的元素标签，如 [`<view>`](https://lynxjs.org/zh/api/elements/built-in/view.html)、[`<text>`](https://lynxjs.org/zh/api/elements/built-in/text.html) 和 [`<image>`](https://lynxjs.org/zh/api/elements/built-in/image.html)，来展示不同的内容。 例如，在 Lynx 中，下面的源代码可以用于展示一段文字：

### 元素标签的构成

元素标签的基本用法与 [HTML 元素](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content#anatomy_of_an_html_element)非常类似：

![](https://lf-lynx.tiktok-cdns.com/obj/lynx-artifacts-oss-sg/lynx-website/assets/doc/elements_tags.png)

每一个元素标签都由以下几个部分组成：

1.  **开始标签**：包含元素标签的名称（本例为 text），及一对包围名称的尖括号。表示元素标签从这里开始。
2.  **结束标签**：与开始标签相似，只是其在元素名之前包含了一个正斜杠。这表示元素标签到这里结束。
3.  **内容**：元素标签的内容，对于 `<text>` 元素标签来说就是所输入的文本本身。

开始标签、结束标签与内容相结合，便是一个完整的元素标签。

### 属性

每个元素标签都有自己的属性（Attribute），可以通过在元素标签标签中添加属性名和属性值来设置，用于描述其行为和外观。

例如，每个元素标签上可以使用 [`style`](https://lynxjs.org/zh/api/elements/built-in/view.html#style)、[`class`](https://lynxjs.org/zh/api/elements/built-in/view.html#class) 等属性来设置背景、圆角、阴影样式，支持部分 CSS 语法。下面的代码可以设置一个元素的背景色为红色：

```php-template
<text style="background:red;">Hello Lynx</text>
```

本例中，`style` 是属性名，`background:red` 是属性值。

更多属性可以查看 [API 参考](https://lynxjs.org/zh/api/elements/built-in/view.html)。

### 空元素标签

有些元素标签没有内容，例如 `<image>` 元素标签：

```php-template
<image src="assets/logo.png" />
```

它没有使用 `</image>` 结束标签，元素标签里也没有内容。这是因为 `<image>` 元素标签使用属性 `src` 而非通过内容来达到展示图片的目的。

### 嵌套元素标签

元素标签可以被嵌套在其他元素标签中。例如，多个 `<text>` 元素标签可以被嵌套在一个 `<view>` 元素标签中：

```php-template
<view>
  <text>Hello</text>
  <text>Lynx</text>
</view>
```

### 元件树

在源代码中的元素标签会在运行时被 Lynx 引擎解析，翻译成用于渲染的[元件](https://lynxjs.org/zh/guide/spec.html#element)。 嵌套的元素标签会形成由元件组成的一棵树，我们称之为[元件树](https://lynxjs.org/zh/guide/spec.html#element-tree)，我们依赖这种树结构来构建和管理更加复杂的界面。

![](https://lf-lynx.tiktok-cdns.com/obj/lynx-artifacts-oss-sg/lynx-website/assets/doc/elements_tree.png)

## 内置元件

Lynx Engine 默认内置一些最基础的元件来帮你快速构建页面。

### 视图

`<view>` 是一个最基础的元件，常用于包裹其他元件并承载一些绘制能力。例如，下面的代码将整个视图的背景色为灰色，并为其内部的文本留出一定的间距：

```php-template
<view style="padding:10px;background:gray;">
  <text>Hello Lynx</text>
</view>
```

![](https://lf-lynx.tiktok-cdns.com/obj/lynx-artifacts-oss-sg/lynx-website/assets/doc/elements_hello_lynx_gray.png)

### 文本

刚才已经提到 `<text>` 元件用于展示文本内容。例如，下面的代码可以用于展示一段文字：

![](https://lf-lynx.tiktok-cdns.com/obj/lynx-artifacts-oss-sg/lynx-website/assets/doc/elements_hello_lynx.png)

### 图片

`<image>` 元件用于展示图片。例如，下面的代码可以用于展示一张图片：

```cpp
<image auto-size style="width:100px;" src="assets/logo.png" />
```

![](https://lf-lynx.tiktok-cdns.com/obj/lynx-artifacts-oss-sg/lynx-website/assets/doc/elements_lynx_logo.png)

### 更多内置元件

更多内置元件可以参考[元件 API 参考](https://lynxjs.org/zh/api/elements/built-in/view.html)。

## 元件的背后：原生渲染

![](https://lf-lynx.tiktok-cdns.com/obj/lynx-artifacts-oss-sg/lynx-website/assets/doc/elements_2_na.png)

Lynx 元件是与平台无关的统一抽象。它们将被 Lynx 引擎原生渲染为平台各自的 UI 原语，比如 iOS 与 Android 中的原生视图，或 Web 中的 HTML 元素（包括[自定义元素](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)）。以下是 Lynx 一些内置元件和它们在不同的平台上的对应或类比：

| 元件            | Android                  | iOS                               | HarmonyOS                | Web 类比                          | 说明                                                               |
| --------------- | ------------------------ | --------------------------------- | ------------------------ | --------------------------------- | ------------------------------------------------------------------ |
| `<view>`        | `ViewGroup`              | `UIView`                          | `Stack`                  | 不可滚动的 `<div>`                | 基础视图容器，多用于承载布局能力、进行样式绘制以及包裹其他元素     |
| `<text>`        | `TextView`               | `UITextView`                      | `Text`                   | `<p>`                             | 用于显示文本内容。可以对齐指定特定的文字样式                       |
| `<image>`       | `ImageView`              | `UIImageView`                     | `Image`                  | `<img>`                           | 用于显示不同类型的图，包括网络图片、静态资源、和来自本地磁盘的图片 |
| `<scroll-view>` | `ScrollView`             | `UIScrollView`                    | `Scroll`                 | 指定 `overflow:scroll` 的 `<div>` | 基础的可滚动元件，支持横向和竖向。允许用户滚动以展示更多内容       |
| `<list>`        | `RecyclerView`           | `UICollectionView`                | `List`                   | 无                                | 高性能的可滚动元件，能通过自动懒加载和复用视图减轻内存压力         |
| `<page>`        | 一个页面的`ViewRootImpl` | 一个页面的`UIViewController.view` | `@Entry`装饰的自定义组件 | 无法修改尺寸的 `<body>`           | 一个页面的根节点，大多数情况下无需手动添加                         |

## 通过自定义元件拓展

如果内置元件无法满足你的需求，你可以通过自定义实现原生元件来扩展 Lynx 的能力。这是 Lynx 强大的特性之一。

具体内容请[参考扩展自定义元件文档](https://lynxjs.org/zh/guide/custom-native-component.html)。

## 组件：将元件进行组合

在更复杂的 Lynx 视图结构中，各类不同种类的元件常常通过分层嵌套组合形成更加丰富多彩的界面单元。这正是前端框架中组件化开发的核心思想：通过可复用的封装单元实现界面的模块化构建。

在 ReactLynx 中，我们遵循 React 的开发范式，通过一个函数和 JSX 来对元件进行组装，并定义一个组件，其设计思路和基本原理都遵循了 [React 组件设计文档](https://react.dev/learn/describing-the-ui)，例如:

```typescript
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

export const App = ({ src }: { src: string }) => {
  return (
    <view>
      <image auto-size style="width:100px" src={src} />
      <text>Hello Lynx</text>
    </view>
  );
};
```

[

![logo](https://lf-lynx.tiktok-cdns.com/obj/lynx-artifacts-oss-sg/lynx-website/assets/lynx-light-logo.svg)

](https://lynxjs.org/zh/)

## 应用样式

层叠样式表（Cascading Style Sheet，CSS）用于为 Lynx 页面设置样式和进行布局。例如更改内容的字体、颜色、大小和位置，将内容拆分为多列，或者添加动画及其他装饰性元件，通过这些来使你的页面更生动有趣。此外，Lynx 中还提供了众多以 `-x-` 开头的特有属性来辅助你更轻松地实现样式设计。 下面的教程将会展示如何通过 CSS 将样式添加到元件上。

TIP

如果你之前没接触过 CSS，可以通过该[教程](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics)对 CSS 有一个初步了解。

## 选择器和内联样式

你可以通过选择器来将样式属性的集合应用到对应元件上。

比如通过类选择器和 `class` 属性的组合：

```cpp
import { root } from "@lynx-js/react";

import "./index.css";

function App() {
  return (
    <view
      style={{
        flexDirection: "column",
        marginTop: "50%",
        transform: "translate(-50%, -50%)",
        marginLeft: "50%",
        width: "150px",
        height: "150px",
      }}
      className="bg-gradient"
    >
    </view>
  );
}

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
```

预览

Web

二维码

![](https://lf-lynx.tiktok-cdns.com/obj/lynx-artifacts-oss-sg/lynx-website/assets/doc/class-guide.png)

也可以通过 `style` 内联样式属性直接定义元件的样式，例如上面的例子中的 8 ~ 15 行通过内联样式定义了元件的宽、高、和位置等。

- [学习更多属性相关内容](https://lynxjs.org/zh/guide/styling/appearance.html)
- 查看[属性 API 参考](https://lynxjs.org/zh/api/css/properties.html)
- 查看[选择器 API 参考](https://lynxjs.org/zh/api/css/selectors.html)

### 嵌套

使用嵌套语法，很多时候可以简化对 CSS 类的定义，使用 [Sass](https://lynxjs.org/zh/rspeedy/styling.html#%E4%BD%BF%E7%94%A8-sass) 或者是通过其他 [PostCSS](https://lynxjs.org/zh/rspeedy/styling.html#using-postcss) 插件如 [postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting) 处理。

```css
.a {
  background: red;
  &-b {
    border-radius: 30px;
  }
}

/* 等效于 */

.a {
  background: red;
}

.a-b {
  border-radius: 30px;
}
```

## CSS 层叠

当多个选择器同时选中了同一个元件时，如果其中含有相同的属性，[CSS 层叠规范](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade)定义了它们生效的优先级。 比如，通过元件上的样式属性（`style`）设置的样式会覆盖通过样式规则（style rule, 比如类选择器）匹配到的样式; [权重（specificity）](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity)高的选择器中的样式覆盖权重低的；在文档中后出现的样式规则覆盖先出现的等。

```css
.bg-gradient {
  background: radial-gradient(
    circle at top left,
    rgb(255, 53, 26),
    rgb(0, 235, 235)
  );
}

.bg-color {
  background: rgb(255, 53, 26);
}
```

### 5. 常用命令

- 开发：`pnpm dev`
- 构建：`pnpm build`
- 测试：`pnpm test`
- 代码检查：`pnpm check`
- 格式化：`pnpm format`
- 预览：`pnpm preview`

## 注意事项

- Lynx.js 可能有自己独特的组件生命周期和状态管理方式
- 某些 React 的常规做法在 Lynx.js 中可能不适用
- 始终以官方文档为准，避免基于假设进行开发
- 使用 pnpm 作为包管理器进行依赖管理和脚本执行
