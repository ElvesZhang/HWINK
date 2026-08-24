# 一键安装 Ollama 并下载 Llama 模型（Windows PowerShell）
# 用法: .\setup.ps1 [模型名]   默认模型: llama3.1:8b
param(
    [string]$Model = "llama3.1:8b"
)

$ErrorActionPreference = "Stop"
Write-Host "==> 目标模型: $Model"

# 1. 安装 Ollama（已安装则跳过）
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "==> Ollama 已安装: $(ollama --version)"
}
elseif (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "==> 正在通过 winget 安装 Ollama ..."
    winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements
    # 让当前会话能找到新装的 ollama
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [Environment]::GetEnvironmentVariable("Path", "User")
}
else {
    Write-Host "未检测到 winget。请到 https://ollama.com/download 下载 Windows 安装包后重新运行本脚本。"
    exit 1
}

# 2. 确保 Ollama 服务在运行（Windows 版安装后通常自动常驻）
try {
    Invoke-RestMethod -Uri "http://localhost:11434/api/version" -TimeoutSec 2 | Out-Null
}
catch {
    Write-Host "==> 启动 Ollama 服务 ..."
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

# 3. 下载模型（体积几 GB，取决于网速可能需要几分钟到几十分钟）
Write-Host "==> 正在下载模型 $Model ..."
ollama pull $Model

Write-Host ""
Write-Host "✅ 部署完成！开始对话:"
Write-Host "   ollama run $Model"
Write-Host "本地 API 地址: http://localhost:11434"
