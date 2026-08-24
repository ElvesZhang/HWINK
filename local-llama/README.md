# 本地部署 Llama 模型指南

这套脚本帮你在自己的电脑上下载并运行 Llama 大模型，全程本地推理，不依赖任何云服务。

推荐方案是 **Ollama**：它把模型下载、量化、推理服务打包成一条命令，是目前最省事的本地部署方式（macOS / Linux / Windows 都支持）。

## 快速开始

### macOS / Linux

```bash
cd local-llama
./setup.sh              # 安装 Ollama 并下载默认模型 llama3.1:8b
./setup.sh llama3.2:3b  # 或者指定其他模型
```

### Windows (PowerShell)

```powershell
cd local-llama
.\setup.ps1               # 安装 Ollama 并下载默认模型 llama3.1:8b
.\setup.ps1 llama3.2:3b   # 或者指定其他模型
```

装好之后直接对话：

```bash
ollama run llama3.1:8b
```

## 怎么选模型

按你机器的内存（Mac 看统一内存，PC 看显存/内存）来选：

| 模型 | 下载体积 | 建议内存 | 适合场景 |
|------|---------|---------|---------|
| `llama3.2:1b` | ~1.3 GB | 4 GB+ | 老机器、快速问答 |
| `llama3.2:3b` | ~2 GB | 8 GB+ | 轻量日常使用 |
| `llama3.1:8b` | ~4.7 GB | 16 GB | **默认推荐**，质量/速度平衡最好 |
| `llama3.3:70b` | ~40 GB | 64 GB+ | 高端工作站，接近 GPT-4 级别 |

换模型只需要 `ollama pull <模型名>`，完整列表见 https://ollama.com/library

## API 调用

Ollama 启动后会在本地开一个兼容 OpenAI 格式的 API（默认 `http://localhost:11434`）：

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.1:8b",
  "messages": [{ "role": "user", "content": "你好" }]
}'
```

OpenAI SDK 也能直接用，把 `base_url` 指到 `http://localhost:11434/v1`、`api_key` 随便填即可。

## 网页聊天界面（可选）

想要一个类似 ChatGPT 的网页界面，用 Docker 起 Open WebUI：

```bash
cd local-llama
docker compose up -d
# 浏览器打开 http://localhost:3000
```

## 常用命令

```bash
ollama list            # 查看已下载的模型
ollama pull <模型名>    # 下载/更新模型
ollama rm <模型名>      # 删除模型释放磁盘
ollama ps              # 查看正在运行的模型
```

## 备选方案：llama.cpp

如果你不想装 Ollama、想要更底层的控制（自选量化精度、GGUF 文件），可以用 [llama.cpp](https://github.com/ggerganov/llama.cpp)：从 Hugging Face 下载 GGUF 格式的模型文件（如 `bartowski/Meta-Llama-3.1-8B-Instruct-GGUF`），再用 `llama-server -m 模型文件.gguf` 启动。注意从 Meta 官方仓库下载原始权重需要先在 Hugging Face 上申请接受 Llama 许可协议；Ollama 和社区 GGUF 转档则可以直接下载。
