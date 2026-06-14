#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# 智遇 Recruiting Platform — 一键部署脚本
# 用法: bash deploy.sh [选项]
#   bash deploy.sh           # 构建 + 部署到本地
#   bash deploy.sh --remote  # 构建 + 部署到远程服务器
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

# ─── 配置 ───
REMOTE_HOST="${DEPLOY_HOST:-}"           # 远程服务器地址 (IP或域名)
REMOTE_USER="${DEPLOY_USER:-root}"        # SSH 用户名
REMOTE_PATH="${DEPLOY_PATH:-/opt/zhiyu-recruiting}"  # 服务器部署路径

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[智遇 Deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[警告]${NC} $1"; }
err()  { echo -e "${RED}[错误]${NC} $1"; exit 1; }

# ─── Step 1: 构建 ───
log "Step 1/5: 安装依赖..."
npm ci --production=false 2>/dev/null || npm install

log "Step 2/5: TypeScript 检查 + Vite 构建..."
npm run build

if [ ! -d "dist" ]; then
    err "构建失败: dist/ 目录不存在"
fi
log "构建成功 → dist/ ($(du -sh dist | cut -f1))"

# ─── Step 3: 准备部署包 ───
log "Step 3/5: 准备部署文件..."

# 需要部署的文件清单
FILES_TO_DEPLOY=(
    "dist"
    "server"
    "package.json"
    "package-lock.json"
    "ecosystem.config.js"
    ".env.server"
)

# ─── Step 4: 部署 ───
if [ "$1" = "--remote" ] || [ -n "$REMOTE_HOST" ]; then
    if [ -z "$REMOTE_HOST" ]; then
        err "请设置 DEPLOY_HOST 环境变量或使用 --remote 参数并确保 REMOTE_HOST 已配置"
    fi

    log "Step 4/5: 部署到远程服务器 ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}..."

    # 创建远程目录
    ssh "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}"

    # 同步文件 (rsync 更高效，如不可用则使用 scp)
    if command -v rsync &> /dev/null; then
        rsync -avz --progress \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='src' \
            --exclude='*.log' \
            "${FILES_TO_DEPLOY[@]}" \
            "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
    else
        warn "rsync 未安装，使用 scp (较慢)..."
        for f in "${FILES_TO_DEPLOY[@]}"; do
            scp -r "$f" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
        done
    fi

    log "Step 5/5: 远程安装依赖 + 重启服务..."
    ssh "${REMOTE_USER}@${REMOTE_HOST}" << 'ENDSSH'
        cd /opt/zhiyu-recruiting
        npm ci --production 2>/dev/null || npm install --production

        # 重启 PM2 或启动
        if command -v pm2 &> /dev/null; then
            pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
            pm2 save
            echo "PM2 状态:"
            pm2 status
        else
            echo "⚠ PM2 未安装。手动启动: node --experimental-strip-types --env-file=.env.server server/index.ts"
            echo "建议安装 PM2: npm install -g pm2 && pm2 start ecosystem.config.js && pm2 save && pm2 startup"
        fi
ENDSSH

else
    # ─── 本地部署 ───
    log "Step 4/5: 本地部署到 ${REMOTE_PATH}..."
    sudo mkdir -p "${REMOTE_PATH}"
    for f in "${FILES_TO_DEPLOY[@]}"; do
        sudo cp -r "$f" "${REMOTE_PATH}/"
    done

    log "Step 5/5: 安装依赖 + 重启服务..."
    cd "${REMOTE_PATH}" && npm ci --production 2>/dev/null || npm install --production
    if command -v pm2 &> /dev/null; then
        pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
        pm2 save
    fi
fi

# ─── Nginx 提示 ───
echo ""
echo "════════════════════════════════════════════════"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "📋 后续步骤:"
echo "  1. 配置 Nginx: sudo cp nginx.conf /etc/nginx/sites-available/zhiyu"
echo "     sudo ln -s /etc/nginx/sites-available/zhiyu /etc/nginx/sites-enabled/"
echo "     sudo sed -i 's/your-domain.com/你的域名或IP/g' /etc/nginx/sites-available/zhiyu"
echo "     sudo nginx -t && sudo nginx -s reload"
echo ""
echo "  2. 检查服务: curl http://localhost:8787/api/ai/analyze-job (应返回JSON)"
echo "              curl http://localhost/ (应返回智遇首页HTML)"
echo ""
echo "  3. 查看日志: pm2 logs zhiyu-api"
echo "              tail -f /var/log/nginx/access.log"
echo ""
echo "  4. PM2开机自启: pm2 startup && pm2 save"
echo "════════════════════════════════════════════════"
