#!/usr/bin/env bash
# 一键安装 Ollama 并下载 Llama 模型（macOS / Linux）
# 用法: ./setup.sh [模型名]   默认模型: llama3.1:8b
set -euo pipefail

MODEL="${1:-llama3.1:8b}"

echo "==> 目标模型: $MODEL"

# 1. 安装 Ollama（已安装则跳过）
if command -v ollama >/dev/null 2>&1; then
  echo "==> Ollama 已安装: $(ollama --version)"
else
  echo "==> 正在安装 Ollama ..."
  if [[ "$(uname)" == "Darwin" ]]; then
    if command -v brew >/dev/null 2>&1; then
      brew install ollama
    else
      echo "未检测到 Homebrew。请到 https://ollama.com/download 下载 macOS 安装包后重新运行本脚本。"
      exit 1
    fi
  else
    curl -fsSL https://ollama.com/install.sh | sh
  fi
fi

# 2. 确保 Ollama 服务在运行
if ! curl -sf http://localhost:11434/api/version >/dev/null 2>&1; then
  echo "==> 启动 Ollama 服务 ..."
  if [[ "$(uname)" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
    brew services start ollama || (nohup ollama serve >/dev/null 2>&1 &)
  else
    (nohup ollama serve >/dev/null 2>&1 &)
  fi
  # 等服务就绪
  for _ in $(seq 1 30); do
    curl -sf http://localhost:11434/api/version >/dev/null 2>&1 && break
    sleep 1
  done
fi

# 3. 下载模型（体积几 GB，取决于网速可能需要几分钟到几十分钟）
echo "==> 正在下载模型 $MODEL ..."
ollama pull "$MODEL"

echo ""
echo "✅ 部署完成！开始对话:"
echo "   ollama run $MODEL"
echo "本地 API 地址: http://localhost:11434"
