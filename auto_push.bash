#!/bin/bash

# 检查是否在Git仓库中
if [ ! -d .git ]; then
    echo "错误：当前目录不是Git仓库"
    exit 1
fi

# 添加所有变更
echo "添加所有变更..."
git add .

# 检查是否有需要提交的内容
if git diff --cached --quiet; then
    echo "没有需要提交的变更"
    exit 0
fi

# 使用当前时间作为提交信息
commit_message="自动提交: $(date '+%Y-%m-%d %H:%M:%S')"

# 提交变更
echo "提交变更: $commit_message"
git commit -m "$commit_message"

# 推送到远程main分支
echo "推送到远程main分支..."
git push origin main

echo "操作完成"
    