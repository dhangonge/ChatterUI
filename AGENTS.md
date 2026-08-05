# ChatterUI — 项目约定

## 项目概览

- React Native 0.83 + Expo SDK 55（expo-router）+ TypeScript（strict）
- 关键依赖：`cui-llama.rn`（llama.cpp native 推理）、react-native-mmkv（KV 存储）、zustand（状态管理）、drizzle-orm + expo-sqlite（数据库）
- 路由在 `app/`，业务逻辑在 `lib/`，共享组件在 `app/components/`
- 路径别名：`@components/*` → `app/components/*`，`@screens/*` → `app/screens/*`，`@lib/*` → `lib/*`

## i18n（重要）

本项目已完整接入 i18next + react-i18next，中英双语（en / zh-CN）。

- 初始化：`lib/i18n/index.ts`（在 `app/_layout.tsx` 顶部 import）
- 语言偏好：`lib/i18n/LanguageState.ts`（zustand persist + MMKV），`lib/i18n/languages.ts`（语言解析）
- 翻译文件：`lib/i18n/locales/en.json` 和 `zh-CN.json`
- **Key 规范：key 就是英文原文**，不是点号路径。因为 i18next 配置了 `keySeparator: false`
- 组件内用 `const { t } = useTranslation()`；非组件 .ts 文件用 `import i18n from '@lib/i18n'` + `i18n.t()`
- 动态插值：`t('Deleted {{count}} chats', { count })`，JSON 里保留 `{{count}}` 占位符
- 新增文案必须同时加 en.json 和 zh-CN.json 两个 key（集合必须一致）
- 翻译范围约定：
  - 翻译：UI 文案、Alert/Toast、按钮、placeholder、下拉菜单项
  - 不翻译：日志（Logger.error/info 调试输出）、技术标识符（token/prompt/sampler/GGUF/API/URL/Markdown/TTS）、测试屏（ComponentTest/ColorTest/MarkdownTest）
- 语言切换 UI 在设置页 `app/screens/AppSettingsScreen/LanguageSettings.tsx`
- 设备语言映射注意：`zh-Hans-CN` → `zh-CN`；`zh-TW/HK/MO/Hant` 不映射（繁体未支持）

## 构建与运行

- debug 构建：`cd android && ./gradlew :app:assembleDebug`（**依赖 Metro**，`npx expo start` 必须跑着）
- release 构建：`cd android && ./gradlew :app:assembleRelease`（bundle 内置，可独立运行；当前用 Expo 默认 debug keystore 签名）
- release 首次全量构建约 1.5 小时（native 模块 + R8），增量快很多
- 必须先 `npx expo prebuild -p android` 生成 android/（已被 .gitignore 排除）
- 需要 Android SDK + NDK 27.0.12077973（RN 0.83 要求，缺失时用 sdkmanager 安装）
- 模拟器验证：`~/Android/Sdk/emulator/emulator -avd <name> -no-window -gpu swiftshader_indirect`，UI 验证用 `uiautomator dump` + adb shell 解析

## 验证命令

```bash
npx tsc --noEmit        # 基线 3 个错误（DatabaseSettings.tsx 1 个 + Notifications.ts 2 个），改动不能新增
npx eslint app/ lib/    # 必须 0 error 0 warning
```

tsc 的 3 个基线错误来自 upstream，与本项目改动无关，不要"顺手修掉"除非单独提交。

## Git 约定

- 身份：`dhangonge` / `87345721+dhangonge@users.noreply.github.com`（仓库级配置）
- `origin` → `dhangonge/ChatterUI`（fork），`upstream` → `Vali-98/ChatterUI`（上游）
- 开发分支 `feat/i18n-zh-cn`；`master` 保持干净便于同步上游
- 上游主开发在 `dev` 分支，同步用 `git fetch upstream && git merge upstream/dev`
- 提交粒度：每个功能批次一个 commit，先验证再提交
- 发布：打 tag（如 `v0.9.0-zh-cn`）+ `gh release create` 上传 APK

## 已知坑

- zustand `persist` 写入 MMKV 的是 `{"state":{...},"version":1}` JSON 信封，不是裸值——`lib/i18n/index.ts` 的 `getStoredLanguageSetting` 已按此解析，新增持久化读取时注意
- Android 模拟器软件渲染（swiftshader）慢，systemui 可能 ANR 弹窗，点「等待」即可，与 app 无关
- debug APK 脱离 Metro 会报 `Unable to load script`，不是崩溃
- expo-build-properties 配置了 R8 混淆 + `-keep class com.rnllama.**`，改 native 相关配置时留意
