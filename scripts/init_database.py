#!/usr/bin/env python3
"""
CloudBase 数据库初始化脚本
创建倪海厦经方助手所需的云数据库集合
"""
import json
import os
import sys

# 数据目录
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

# 数据库集合定义
COLLECTIONS = {
    'herbs': {
        'name': '药材库',
        'dataFile': 'herbs.json',
        'indexes': [
            {'field': 'name', 'unique': False},
            {'field': 'category', 'unique': False},
            {'field': 'keywords', 'unique': False},
        ]
    },
    'formulas': {
        'name': '方剂库',
        'dataFile': 'formulas.json',
        'indexes': [
            {'field': 'name', 'unique': False},
            {'field': 'category', 'unique': False},
            {'field': 'source', 'unique': False},
        ]
    },
    'acupoints': {
        'name': '穴位库',
        'dataFile': 'acupoints.json',
        'indexes': [
            {'field': 'name', 'unique': False},
            {'field': 'meridian', 'unique': False},
        ]
    },
    'concepts': {
        'name': '概念库',
        'dataFile': 'concepts.json',
        'indexes': [
            {'field': 'name', 'unique': False},
            {'field': 'category', 'unique': False},
        ]
    },
    'cases': {
        'name': '医案库',
        'dataFile': 'cases.json',
        'indexes': [
            {'field': 'name', 'unique': False},
            {'field': 'category', 'unique': False},
        ]
    },
    'diagnosis': {
        'name': '诊断知识库',
        'dataFile': 'diagnosis.json',
        'indexes': [
            {'field': 'name', 'unique': False},
            {'field': 'category', 'unique': False},
        ]
    },
    'chatHistory': {
        'name': '对话历史',
        'dataFile': None,
        'indexes': [
            {'field': 'openid', 'unique': False},
            {'field': 'createdAt', 'unique': False},
        ]
    }
}


def main():
    print("=" * 60)
    print("  倪海厦经方助手 - CloudBase 数据库初始化")
    print("=" * 60)

    # 检查数据文件
    print("\n📊 检查数据文件...")
    stats = {}
    for col_name, col_def in COLLECTIONS.items():
        if col_def['dataFile']:
            filepath = os.path.join(DATA_DIR, col_def['dataFile'])
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                count = len(data) if isinstance(data, list) else 1
                stats[col_name] = count
                print(f"  ✅ {col_def['name']} ({col_name}): {count} 条记录")
            else:
                stats[col_name] = 0
                print(f"  ⚠️  {col_def['name']} ({col_name}): 数据文件不存在: {filepath}")
        else:
            stats[col_name] = '动态创建'
            print(f"  📝 {col_def['name']} ({col_name}): 无需初始数据")

    print("\n📋 数据库集合汇总:")
    print("-" * 50)
    total = 0
    for col_name, count in stats.items():
        if isinstance(count, int):
            total += count
        print(f"  {col_name:20s} → {count}")

    if total > 0:
        print("-" * 50)
        print(f"  {'总计':20s} → {total} 条记录")

    print("\n📝 导入说明:")
    print("  1. 登录 CloudBase 控制台: https://tcb.cloud.tencent.com")
    print("  2. 进入「数据库」→ 创建以下集合:")
    for col_name, col_def in COLLECTIONS.items():
        print(f"     - {col_name} ({col_def['name']})")
    print("  3. 对每个集合，点击「导入」→ 选择 data/ 目录下对应的 JSON 文件")
    print("  4. 导入格式选择「JSON Lines（推荐 .json 后缀）」（每行一个 JSON 对象）")

    # 生成 JSON Lines（推荐 .json 后缀） 格式的转换提示
    print("\n💡 提示：如果控制台要求 JSON Lines（推荐 .json 后缀） 格式，运行:")
    print("   python3 scripts/to_jsonl.py")


if __name__ == '__main__':
    main()
