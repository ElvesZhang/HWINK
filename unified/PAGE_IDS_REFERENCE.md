# Page Debug IDs Reference

快速参考：所有页面的数字ID，方便在讨论时快速定位。

## 主页面 (Main)
- **#1** - Home (首页)
- **#21** - Sign History (签名历史)
  - **#21-1** - History list (历史列表)
  - **#21-2** - Transaction detail (交易详情)
- **#22** - Sign Request (签名请求)
  - **#22-1** - Transfer request (转账请求)
  - **#22-2** - Message signing (消息签名)
  - **#22-3** - EIP-712 typed data (结构化数据)
  - **#22-4** - Blind signing (盲签)
  - **#22-5** - Contract call / Swap (合约调用/交易)

## 设置菜单 (Settings)
- **#2** - Settings Menu (设置菜单主页)
- **#3** - Security Settings (安全设置)
- **#4** - Connectivity Settings (连接设置)
- **#5** - General Settings (通用设置)
- **#6** - About Settings (关于设置)

## 安全功能 (Security)
- **#7** - Change PIN (修改PIN码)
  - **#7-1** - Enter current PIN (输入当前PIN)
  - **#7-2** - Enter new PIN (输入新PIN)
  - **#7-3** - Confirm new PIN (确认新PIN)
  - **#7-4** - Success message (成功提示)
- **#8** - Passphrase (助记词密语)
  - **#8-1** - Main passphrase menu (主菜单)
  - **#8-2** - Enable passphrase (启用密语)
  - **#8-3** - Verify PIN before setting (验证PIN)
  - **#8-4** - Set passphrase (设置密语)
  - **#8-5** - Confirm passphrase (确认密语)
  - **#8-6** - Success message (成功提示)
- **#9** - Verify Recovery (验证恢复短语)
  - **#9-1** - Choose verification method (选择验证方式)
  - **#9-2** - Verify PIN first (先验证PIN)
  - **#9-3** - Full phrase verification (完整短语验证)
  - **#9-4** - Random word verification (随机单词验证)
  - **#9-5** - Verification success (验证成功)
- **#10** - Fingerprint (指纹管理)
  - **#10-1** - Fingerprint list (指纹列表)
  - **#10-2** - Verify PIN before adding (验证PIN)
  - **#10-3** - Scanning fingerprint (扫描指纹)
  - **#10-4** - Fingerprint added (添加成功)

## 通用设置 (General)
- **#11** - Language (语言设置)
- **#12** - Lock Screen (锁屏图片)
- **#13** - Auto Lock (自动锁定)
- **#14** - Storage (存储管理)

## 连接功能 (Connectivity)
- **#15** - Bluetooth (蓝牙)
  - **#15-1** - Main bluetooth toggle (主开关页面)
  - **#15-2** - Pairing in progress (配对中)
  - **#15-3** - Successfully paired (配对成功)
- **#16** - NFC (NFC备份)
  - **#16-1** - Main NFC menu (主菜单)
  - **#16-2** - Security warning before backup (安全警告)
  - **#16-3** - Scanning NFC card (扫描卡片)
  - **#16-4** - Writing to card (写入中)
  - **#16-5** - Backup success (备份成功)
  - **#16-6** - Backup error (备份错误)

## 关于/系统 (About)
- **#17** - Firmware Info (固件信息)
- **#18** - Firmware Update (固件更新)
  - **#18-1** - Checking for updates (检查更新)
  - **#18-2** - Update available (发现更新)
  - **#18-3** - Downloading update (下载中)
  - **#18-4** - Installing update (安装中)
  - **#18-5** - Update complete (更新完成)
  - **#18-6** - Already latest version (已是最新)
- **#19** - Download App (下载App)
- **#20** - Reset Device (重置设备)
  - **#20-1** - Main reset options (重置选项)
  - **#20-2** - Warning before reset (重置警告)
  - **#20-3** - Verify PIN (验证PIN)
  - **#20-4** - Reset in progress (重置中)
  - **#20-5** - Reset complete (重置完成)

## 使用示例

在讨论时可以这样说：
- "页面14的存储空间显示有问题" → Storage Management Page
- "页面16-2的安全警告文字间距需要调整" → NFC Page - Security Warning
- "页面16-4写入进度条的高度不对" → NFC Page - Writing to Card
- "页面7-3确认PIN时键盘布局有问题" → Change PIN - Confirm Step
- "页面22-5的Swap详情显示需要优化" → Sign Request - Contract Call

## 开关Debug ID显示

1. 点击右下角 🐛 按钮打开Debug Panel
2. 切换到 "Status Bar Controls" 标签
3. 找到紫色的 "Show Debug ID" 开关
4. 点击切换显示/隐藏
5. Debug ID会以小字号灰色显示在页面右上角，格式为 `#数字` 或 `#数字-子页面号`

## 在Debug Panel中查看

在Debug Panel的 "Pages Navigation" 标签中，每个页面按钮前都会显示对应的ID，格式为 `#数字 页面名称`，方便快速查找和跳转。

## 子页面ID说明

带有多个状态或步骤的页面会显示子页面ID，格式为 `#主页面ID-子页面序号`。例如：
- **#16-1**: NFC主菜单
- **#16-2**: NFC备份安全警告
- **#16-3**: NFC扫描卡片中
- **#16-4**: NFC写入数据中
- **#16-5**: NFC备份成功

这样可以更精确地定位到页面的具体状态，方便讨论和调试。