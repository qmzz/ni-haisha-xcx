#!/usr/bin/env python3
"""
JSON 数组 → JSON Lines 转换（CloudBase 数据库导入格式）
"""
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

collections = ['herbs', 'formulas', 'acupoints', 'concepts', 'cases', 'diagnosis']

for name in collections:
    src = os.path.join(DATA_DIR, f'{name}.json')
    dst = os.path.join(DATA_DIR, f'{name}.jsonl')

    if not os.path.exists(src):
        print(f'⚠️  {name}.json 不存在，跳过')
        continue

    with open(src, 'r', encoding='utf-8') as f:
        data = json.load(f)

    with open(dst, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

    print(f'✅ {name}.jsonl ({len(data)} 条)')
