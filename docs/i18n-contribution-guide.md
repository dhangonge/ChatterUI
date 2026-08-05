# i18n 改造规范（ChatterUI zh-CN）

## 目标
把硬编码英文 UI 文案替换为 `t('...')` 调用，并把英文原文收集到 `lib/i18n/locales/en.json`。

## Key 规范（重要）
本项目 i18next 配置为 `keySeparator: false` / `nsSeparator: false`，
**key 就是英文原文本身**，不是 `settings.title` 这种点号路径。

正确：
```tsx
t('Change Theme')
t('Are you sure you want to delete this background? This cannot be undone!')
```
错误：
```tsx
t('settings.style.changeTheme')   // 不要用点号路径
```

en.json 形如：
```json
{
    "Change Theme": "Change Theme",
    "Cancel": "Cancel"
}
```
即 key 与 value 完全相同。zh-CN.json 用同样的 key，value 为中文译文。

## 代码改法

### 1. 引入 hook
函数组件内加：
```tsx
import { useTranslation } from 'react-i18next'
// ...
const { t } = useTranslation()
```
import 顺序：`react-i18next` 排在 `react-native` **之前**（eslint import/order 要求）。

### 2. 各种形态
```tsx
// JSX 裸文本
<SectionTitle>Style</SectionTitle>
<SectionTitle>{t('Style')}</SectionTitle>

// props 字符串
label="Change Theme"
label={t('Change Theme')}

// 三元
label={cond ? 'A' : 'B'}
label={cond ? t('A') : t('B')}

// 对象字面量
Alert.alert({ title: 'Delete', description: '...', buttons: [{ label: 'Cancel' }] })
Alert.alert({ title: t('Delete'), description: t('...'), buttons: [{ label: t('Cancel') }] })
```

### 3. 带变量的字符串
用 i18next 插值，不要用模板拼接：
```tsx
// 原来
`Deleted ${count} chats`
// 改为
t('Deleted {{count}} chats', { count })
```
en.json: `"Deleted {{count}} chats": "Deleted {{count}} chats"`

### 4. 非组件文件（.ts，无法用 hook）
`lib/` 下的非组件文件（如 `lib/state/*.ts`）用：
```ts
import i18n from '@lib/i18n'
i18n.t('Some message')
```
注意：模块顶层的常量初始化不要调用 `t()`，否则语言切换后不刷新。
若是模块级常量，改成函数或在使用处调用。

## 不要翻译的内容
- 日志文本（`Logger.info/error` 等调试信息）
- 技术标识符：模型名、API endpoint、字段名、sampler 参数名（如 `top_p`、`min_p`）
- 文件路径、URL
- `console.*` 内容
- 测试屏幕：`ComponentTestScreen.tsx`、`ColorTestScreen.tsx`、`MarkdownTestScreen.tsx`（开发用，跳过）

## 翻译风格（zh-CN）
- 简体中文，术语贴近常见 AI 聊天应用习惯
- 保留英文的专有名词：token、prompt、sampler、GGUF、API、URL、Markdown、TTS
- 按钮文案简短：Cancel→取消，Delete→删除，Confirm→确认，Save→保存，Import→导入，Export→导出
- 说明性文字可稍长，但不啰嗦
- 不要用感叹号堆砌，保留原文语气

## 验证（每个文件改完必须跑）
```bash
cd /home/zhangtung/项目/AIcode/ChatterUI
npx eslint --fix <改过的文件>
npx tsc --noEmit 2>&1 | grep -v "^npm notice"
```
`tsc` 基线是 **3 个预先存在的错误**（DatabaseSettings.tsx 1 个 + Notifications.ts 2 个），
你的改动不能让错误数超过 3。

## 参考样板
`app/screens/AppSettingsScreen/StyleSettings.tsx` 已改完，照它的风格做。
