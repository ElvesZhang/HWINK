# Passkey — 签名设备端可用信息清单（标准实现）

> 目的：为设备端 Passkey 界面（`PasskeyPage.tsx`）划定"哪些字段是真的"。
> 范围：**只看标准**——WebAuthn (L2/L3) 数据模型 + CTAP 2.1/2.2 认证器协议。
> 本设备角色 = 外置 FIDO2 认证器（BLE/NFC/USB 被访问）。设备自身 UI 能展示的信息
> = 标准要求认证器为 discoverable credential 必须/可选存储的内容，别无其他来源。
>
> 校验依据：CTAP 2.1 `authenticatorCredentialManagement` (0x0A) 的子命令与响应键，
> 已对照 Yubico python-fido2 `credman.py` 实现逐键核实（子命令 0x01–0x07；
> 响应键 0x01–0x0C，见 § 3）。

---

## 1. 大前提：设备只认识"住在自己身上的"凭据

- 设备上可列出的只有 **discoverable credentials**（即 passkey）。
  非发现型凭据（server-side credential，私钥包裹在 credentialId 里发回服务器）
  **不占设备存储、设备无法枚举**——列表页天然只有 passkey。
- 设备**永远不知道**：同一账号在其他手机/钥匙/云上是否还有 passkey、
  RP 服务器是否已废除某凭据、凭据在哪里被使用过。这些只有 RP 服务器知道。

## 2. 每条 passkey，设备端拥有的字段

| 字段 | 标准地位 | 说明 / UI 可用性 |
|---|---|---|
| `rp.id`（域名，如 `github.com`）| **必存** | 凭据归属，Service 字段的事实来源 |
| `rp.name`（站点名，如 "GitHub"）| 可选存，可被截断 | 展示名；缺失时回退 rp.id |
| `user.name`（账号名，如 `elves@gmail.com`）| 必存，≤64 字节可截断 | Username 字段 |
| `user.displayName`（人名，如 "Elves Zhang"）| 必存，同上 | 可与 user.name 双行展示 |
| `user.id`（user handle，≤64 字节不透明字节串）| 必存 | 协议匹配用；规范明确不应含 PII，**不建议展示** |
| `credentialId`（不透明字节串）| 必存 | 技术字段，hex 展示（现有 Credential ID）|
| 公钥 / 算法（COSE，如 ES256/EdDSA）| 必存 | 可作技术字段展示算法名 |
| `credProtect` 保护等级（1/2/3）| CTAP2.1 扩展，常见 | 3=必须用户验证。可做"UV Required"徽章 |
| `largeBlobKey` / large blob 数据 | 可选扩展 | RP 存的不透明数据（如证书），一般不展示 |
| `thirdPartyPayment` 标记 | CTAP2.2 扩展 | 支付类凭据标记，可做徽章 |

## 3. 对外枚举面（credMgmt 0x0A —— 平台能看到的 = 上表的子集）

子命令：`getCredsMetadata(0x01)` / `enumerateRPs(0x02/03)` /
`enumerateCredentials(0x04/05)` / `deleteCredential(0x06)` / `updateUserInformation(0x07)`

响应键（已核实）：`existingResidentCredentialsCount(0x01)`,
`maxPossibleRemainingResidentCredentialsCount(0x02)`, `rp(0x03)`, `rpIDHash(0x04)`,
`totalRPs(0x05)`, `user(0x06)`, `credentialID(0x07)`, `publicKey(0x08)`,
`totalCredentials(0x09)`, `credProtect(0x0A)`, `largeBlobKey(0x0B)`,
`thirdPartyPayment(0x0C)`。**没有任何时间戳或签名计数键。**

## 4. 设备全局信息（authenticatorGetInfo + 管理命令）

| 信息 | 来源 | UI 用途 |
|---|---|---|
| 已存 passkey 数 / 还能存多少 | getCredsMetadata；getInfo `remainingDiscoverableCredentials` | 列表页容量行（"N passkeys · 还可存 M"）|
| 站点数（totalRPs）| enumerateRPs | 可按站点分组列表 |
| AAGUID（设备型号标识）| getInfo | 关于页，非逐凭据信息 |
| 固件版本 | getInfo `firmwareVersion` | 已有 Firmware Info 页 |
| 支持能力（rk/uv/credMgmt/bioEnroll/largeBlobs/alwaysUv）| getInfo options | 状态行（如 "FIDO2"）|
| 传输方式（USB/NFC/BLE/hybrid）| getInfo transports | 状态展示 |
| PIN 已设/剩余重试次数；UV（指纹）剩余重试 | clientPIN getPinRetries / getUVRetries | 安全状态提示 |
| 指纹模板列表（templateId + friendlyName）| authenticatorBioEnrollment | 已有指纹管理页 |
| minPINLength、forcePINChange | getInfo | 设置页约束 |

## 5. 标准里**没有**的（界面上出现即为编造）

| 不存在的信息 | 原因 |
|---|---|
| 创建时间 / 最后使用时间 | 协议无此字段；认证器无 RTC 要求。**本设备已确认无 RTC → 必删** |
| credMgmt 里的签名计数 | 枚举响应无此键（§ 3）。计数器存在于每次 assertion 的 authData `signCount`：存储粒度（全局/逐凭据）实现自定，且规范允许恒为 0（同步 passkey 平台已普遍归零）。设备厂商*可以*选择逐凭据计数并在本机 UI 展示——属"标准允许、实现自定"，非标准保证 |
| 站点/用户头像 icon | WebAuthn L2 起已从 rp/user entity 移除 |
| "此账号还有几处 passkey" | 跨认证器不可知，只有 RP 服务器知道（§ 1）|
| 凭据是否仍被 RP 承认 | 服务器侧状态，设备不可知 |
| 使用地点/浏览器等上下文 | 协议不传递 |

## 6. 标准定义的操作动词（界面动作面）

| 动作 | 标准来源 | 现有 UI |
|---|---|---|
| 枚举/查看 | credMgmt enumerate* | 列表/详情页 ✓ |
| 删除单条凭据 | `deleteCredential` | Delete 流程 ✓ |
| 更新 user.name/displayName | `updateUserInformation`（平台发起）| 无（设备端自发改名 = 非标准，勿做"改备注"）|
| 创建凭据（含 UV）| makeCredential | Register 流程 ✓ |
| 断言/登录（含 UV）| getAssertion | Sign-In 流程 ✓ |
| 全部清除 | authenticatorReset | Reset Device 页已有工厂重置 |
| PIN / 指纹管理 | clientPIN / bioEnrollment | 已有对应设置页 |

## 7. 对现有 `PasskeyPage` 的映射结论

- **删**：`created` / `lastUsed`（§ 5，本设备无 RTC）。
- **Sign Count**：非标准保证（§ 5）。可选：删除，或保留并接受"厂商自定实现"的定位。
- **保留**：Service(rp.id) / Username(user.name) / Credential ID —— 全部有据。
- **可增**（全部有据）：rp.name 与 rp.id 分行；user.displayName；算法名；
  credProtect 徽章；列表页容量行（已存 N / 剩余 M）；按 RP 分组。

---
*核实途径备注：FIDO 官网规范正文在当前网络代理下 403，字段核实采用 Yubico
官方 python-fido2 `fido2/ctap2/credman.py`（与 CTAP2.1/2.2 数字键一一对应）。*
