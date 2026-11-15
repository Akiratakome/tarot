# AuraTarot 登录邮件

在 Supabase 项目的 **Authentication → Emails → Templates** 中使用以下标题和 HTML 正文：

| 模板 | Subject | HTML 正文 |
| --- | --- | --- |
| Confirm signup | 欢迎来到 AuraTarot，请确认你的邮箱 | `confirm-signup.html` |
| Magic Link | 你的 AuraTarot 登录链接 | `magic-link.html` |

复制对应 HTML 文件的完整内容到模板正文。标题需要单独填写到 Subject；HTML 中的 `<title>` 不会代替邮件标题。

主按钮和备用链接中的 `{{ .ConfirmationURL }}` 由 Supabase 在发信时生成，必须保留。当前项目使用链接登录，不要将它替换为 `{{ .Token }}`、`{{ .SiteURL }}` 或固定网站地址。Resend 的 Click tracking 保持关闭。

这两份模板采用深蓝背景、金色按钮、单列 table 布局和行内样式，无外链图片、脚本或字体。浏览器预览不能覆盖所有邮件客户端，更新后需分别验证新用户确认邮件与已有用户登录邮件的显示及跳转。

2026-11-15 已将这两个标题和正文保存到 Supabase 项目 `cpblygihlkrpibxfawja`，并重新读取核对。修改本地文件或部署网站不会自动更新云端邮件模板，后续修改仍需同步到 Supabase。

`previews/` 中的 HTML 和截图用于查看电脑、手机排版；其中链接替换为 `example.invalid` 演示地址，不能用作线上模板。正式模板的登录按钮和备用链接均保留 Supabase 的验证变量。已检查 375px 手机宽度没有横向溢出；未发送测试邮件，实际邮箱客户端显示与登录跳转尚需实测。

更新前的两个标题和正文保存在 `original-templates.json`，可按字段恢复到对应模板。

参考：[Supabase 邮件模板说明](https://supabase.com/docs/guides/auth/auth-email-templates)。
