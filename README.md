# AuraTarot

## 起始提问页（开发中）

首页现提供自定义问题、预设问题、可选背景信息与规则选阵。自定义问题需要登录；「直接抽牌」无需登录。问题和背景保存在当前浏览器的私有 `ReadingSession` 中，不会写入现有公开的 `spread_sessions` 表。结果页仅在同一浏览器、同一登录账号下显示原始问题。

点击「开始连接」时会先检查登录状态；未登录则弹出邮箱、手机号与微信入口。邮箱默认发送一次性登录链接；需配置下文两个 `VITE_SUPABASE_*` 变量，并在 Supabase Auth 中启用 Email、将本地及部署站点 URL 加入允许的重定向地址。手机号使用短信验证码，另需启用 Phone 和配置短信供应商。微信入口目前标记为「待接入」，需要另行完成微信网站应用授权及服务端集成。提交问题后完成邮箱或短信验证，会自动进入推荐牌阵；等待验证的提问在同一浏览器中最多保留 30 分钟。

目前智能选阵使用本地规则；「直接抽牌」的免登录 AI 整体讯息已接入服务端代码，部署并配置密钥后可用。AI 路由、针对私人问题/BG 的深入解读、私有云端同步与免费次数尚未接入。

AuraTarot 是一个浏览器塔罗选牌应用。用户选择牌阵、洗牌并抽取卡牌，随后查看正逆位与结果页；配置 Supabase 后，结果链接可跨设备打开。

## 功能

- 78 张牌与三种牌阵：未来十字（5 张）、六芒星（7 张）、月度运势（9 张）。
- 三种牌阵的每个牌位都有固定含义；新结果会保存抽牌时的牌位含义，并在结果页展示。月度运势的九张牌按学业与事业、人际与感情、自我状态分为三行。
- 桌面和 iPad 使用原有星空与 3D 选牌场景；手机横屏左右滑动预览卡牌，轻点浮起的牌确认。手机竖屏显示横屏提示。
- 可选的摄像头手势和手机摇晃洗牌；两者均需在页面上主动开启，并受浏览器权限与设备支持情况影响。
- 结果页展示牌阵、牌面和正逆位；结果可立即在本机查看，只有 Supabase 确认保存后才会显示并复制分享链接。保存失败可在结果页重试。

## 技术栈

React 19、TypeScript、Vite 7、Three.js、CSS、MediaPipe Tasks Vision、Supabase。Cinzel Decorative 与 Noto Serif SC 通过本地字体包提供，页面不依赖在线字体服务；字体许可文本见 `public/fonts/`。

## 本地开发

安装与 Vite 7 兼容的 Node.js 和 npm，在项目根目录运行：

```bash
npm ci
npm run dev
```

打开终端给出的本地地址。首次启动无需 Supabase 配置；未配置云端时，结果仅保存在当前浏览器。

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm test` | 运行自动测试 |
| `npm run build` | 检查 TypeScript 并构建到 `dist/` |
| `npm run preview` | 预览生产构建 |

## 配置

复制 `.env.example` 为 `.env.local`，按需设置以下变量：

| 变量 | 用途 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_URL` | 服务端使用的 Supabase Project URL（可与 `VITE_SUPABASE_URL` 相同） |
| `SUPABASE_SECRET_KEY` | 仅服务端使用的 Supabase secret key；旧项目可改用 `SUPABASE_SERVICE_ROLE_KEY` |
| `DEEPSEEK_API_KEY` | 仅服务端使用的 DeepSeek API key；本地旧变量 `api_ds` 暂可兼容，部署时请使用标准名称 |
| `AI_DAILY_GENERATION_LIMIT` | 全站每日新解读上限，默认 200；缓存命中不计入 |
| `VITE_TAROT_CARD_ASSET_BASE` | 牌图目录，默认 `/cards/rider-waite` |
| `VITE_TAROT_CARD_MANIFEST` | 牌图清单，默认 `/cards/rider-waite/manifest.json` |
| `VITE_MEDIAPIPE_HAND_MODEL` | 手势识别模型，默认 `/models/hand_landmarker.task` |
| `VITE_MEDIAPIPE_WASM_ROOT` | MediaPipe WASM 资源地址 |

`VITE_*` 变量会写入浏览器构建产物；不要在这里放 service role key 或其他秘密。`.env.local` 不纳入 Git。修改环境变量后，重启开发服务器或重新部署。

## 项目结构

| 路径 | 说明 |
| --- | --- |
| `src/App.tsx` | 首页与 `/spread/:id` 结果页入口 |
| `src/components/` | 手机牌桌、背景、按钮及共用卡牌组件 |
| `src/desktop/` | 桌面和 iPad 原有的 3D 选牌场景与样式 |
| `src/tarot/` | 78 张牌的数据、选牌状态与牌桌布局 |
| `src/config/spreads.json` | 三种牌阵与槽位定义 |
| `src/gesture/` | 摄像头手势与设备摇晃检测 |
| `src/results/` | 结果展示、本地存储与云端同步 |
| `src/styles.css` | 桌面、平板、手机共用的视觉样式和响应式布局 |
| `public/cards/rider-waite/` | 78 张桌面 JPG 牌面、`mobile/` 移动版和 `manifest.json` |
| `public/models/` | MediaPipe 手部识别模型 |
| `supabase/spread_sessions.sql` | 结果表及其访问策略 |
| `supabase/anonymous_interpretations.sql` | 免登录整体解读缓存、关联表与每日额度函数 |
| `api/interpret.ts` | Vercel 服务端解读接口；密钥不会进入浏览器包 |

桌面牌图默认使用 `卡牌 ID.jpg`，iPhone 和 iPad 使用同图的 `mobile/卡牌 ID.jpg`（约为桌面资源的四分之一）。图片加载失败时会显示占位牌面；开发时可用 `npm test` 检查牌组 ID、清单与实际文件是否对应。

## 结果保存与部署

应用先把结果写入当前浏览器，立即显示结果；同时将其保存到 Supabase。要让分享链接在其他设备打开，需在 Supabase SQL Editor 中执行 `supabase/spread_sessions.sql`，并在本地或 Vercel 配置上述两个 Supabase 变量。只有结果页出现「云端已保存，可分享」时才会显示分享链接；网络异常时会显示失败原因，并可点击「重试保存并复制链接」。

当前 SQL 策略允许匿名插入和公开读取结果记录，不适合存放私密资料。若要提供私人记录，需要重新设计认证和访问策略。

项目可由 Vercel 构建并部署。仓库的 `vercel.json` 将直接访问的 `/spread/:id` 路径交给前端处理。环境变量在构建时读取，修改后需重新部署。部署后建议验证桌面选牌、手机横屏选牌、结果牌图，以及一条已同步链接的跨设备读取。

## 免登录 AI 整体解读

这条路径不使用 Supabase Auth，也不为访客创建账号，更不能在前端内嵌一个公共账号密码。匿名抽牌仍先按上文保存到公开的 `spread_sessions` 表；保存成功后，结果页调用 Vercel `/api/interpret`。服务端根据牌阵版本、每个牌位的卡牌及正逆位、提示词版本、服务商和模型计算 SHA-256 key，先查私有缓存，未命中才调用 DeepSeek Responses API（`deepseek-flash`，非思考模式）。相同组合在并发情况下由数据库 claim 函数协调；生成完成后将 key 关联至本次结果记录。分享页只读取已生成的「整体讯息」，不把私人问题或 BG 送入这个接口。

启用顺序：

1. 在 Supabase SQL Editor 先执行 `supabase/spread_sessions.sql`，再执行 `supabase/anonymous_interpretations.sql`。
2. 在 Vercel 项目环境变量中设置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`、`SUPABASE_URL`、`SUPABASE_SECRET_KEY` 和 `DEEPSEEK_API_KEY`。不要给 secret key 或 DeepSeek key 加 `VITE_` 前缀，也不要提交到 Git。`.env.example` 只放空白模板；真实本地配置放在被 Git 忽略的 `.env.local`。
3. 重新部署，直接抽一组牌；确认结果显示「云端已保存」及「AI 整体讯息」。相同完整组合再次出现时可复用缓存，结果页「解读缓存」内可查看 key。

`npm run dev` 只运行 Vite 静态前端，不提供 `/api/interpret`。本地联调服务端接口需使用 Vercel 开发环境或部署预览。数据库脚本与接口代码已经就位，但在没有实际云端项目和密钥的环境中，无法完成真实 API 调用验证。

缓存命中依赖完整有序牌阵，78 张牌及正逆位组合非常多，不能预期多数新抽牌会命中。每日上限保护总调用量，但公开免登录接口仍可能被恶意访客耗尽额度；正式推广前建议再加边缘层按 IP 限速、监控和 DeepSeek 账户余额告警。当前只生成可公开分享的整体讯息；逐张深入解读需要另设私有访问控制，不能直接放进公开表或免登录接口。DeepSeek Flash 的高峰/低峰价格不同，原先按 GPT-4o mini 算出的每次 $0.001 预算不能直接沿用，需以实际 token 用量复核。
