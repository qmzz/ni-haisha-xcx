#!/usr/bin/env python3
"""
倪海厦中医知识库 → JSON 数据转换脚本
Convert Ni Haisha TCM knowledge base markdown files to JSON format.
For WeChat mini-program CloudBase 云数据库 import.

Usage:
    python3 scripts/convert_knowledge.py
"""

import json
import os
import re
import sys
from pathlib import Path

import yaml

# ── Paths ────────────────────────────────────────────────────────────
KNOWLEDGE_DIR = Path.home() / '.openclaw/workspace/skills/ni-haisha/knowledge'
PROJECT_DIR = Path('/home/percy/projects/ni-haisha-xcx')
OUTPUT_DIR = PROJECT_DIR / 'data'

# Files to skip (index / planning files, not actual knowledge entries)
SKIP_FILES = {
    'acupoint_index.md',
    'concept_index.md',
    'concept_expansion_plan.md',
}


# ── Helpers ──────────────────────────────────────────────────────────

def parse_yaml_front_matter(text: str) -> tuple[dict, str]:
    """Parse YAML front matter from markdown text. Returns (metadata, content)."""
    text = text.strip()
    if not text.startswith('---'):
        return {}, text

    parts = text.split('---', 2)
    if len(parts) < 3:
        return {}, text

    yaml_text = parts[1].strip()
    content = parts[2].strip()

    try:
        metadata = yaml.safe_load(yaml_text) or {}
    except yaml.YAMLError:
        metadata = {}

    return metadata, content


def extract_h1_title(content: str) -> str | None:
    """Extract H1 title from markdown content (strips trailing parenthetical like GV20)."""
    m = re.search(r'^#\s+(.+?)(?:\s*\([^)]*\))?$', content, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return None


def extract_meta(content: str, key: str) -> str:
    """Extract **key：value** metadata line from content body.
    For '分类', also tries '所属分类' pattern."""
    # Standard pattern: **key：value**
    for k in ([key] if key != '分类' else [key, '所属分类']):
        m = re.search(rf'\*\*{re.escape(k)}[：:]\s*\*?\*?\s*(.+?)\s*\*?\*?\s*\n', content)
        if m:
            val = m.group(1).strip().rstrip('*').strip()
            if val:
                return val
    return ''


def character_count(s: str) -> int:
    """Count actual characters (CJK counted as 1, ASCII as 1)."""
    return len(s)


def extract_summary(content: str, max_chars: int = 50) -> str:
    """
    Extract a short summary from the content body.
    Looks for the first meaningful, non-metadata paragraph.
    Truncates at max_chars characters.
    """
    def clean_text(s: str) -> str:
        """Strip markdown formatting from a line."""
        s = s.strip()
        # Remove leading list markers: - *, 1., etc
        s = re.sub(r'^[-*+]\s+', '', s)
        # Remove bold markers
        s = re.sub(r'\*\*(.+?)\*\*', r'\1', s)
        # Remove links
        s = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)
        # Remove other inline markers
        s = re.sub(r'[*_~`]', '', s)
        s = s.strip('：:；;，,。. 　\t')
        return s

    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        # Skip empty, headers, tables, blockquotes, horizontal rules
        if not line or line.startswith('#') or line.startswith('|') or \
           line.startswith('>') or line.startswith('---') or line.startswith('```'):
            continue
        # Skip metadata lines (even with list markers or bold prefixes)
        stripped = re.sub(r'^[-*+]\s+', '', line)
        if re.match(r'^\*\*[^*]+[：:]\*\*', stripped):
            continue
        # Clean inline markdown
        clean = clean_text(line)
        if character_count(clean) >= 8:  # skip too-short fragments
            if character_count(clean) <= max_chars:
                return clean
            return clean[:max_chars]

    # Fallback: first non-empty line truncated
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#'):
            return clean_text(line)[:max_chars]
    return ''


def extract_keywords(metadata: dict, content: str, extras: list[str] | None = None) -> list[str]:
    """
    Merge keywords from:
      1. tags in front matter
      2. category / source / extra metadata fields
      3. **归经** / **分类** / **来源** body lines
    Deduplicated, order preserved.
    """
    keywords: list[str] = []

    # From YAML tags
    tags = metadata.get('tags', [])
    if isinstance(tags, list):
        keywords.extend(tags)
    elif isinstance(tags, str):
        keywords.append(tags)

    # Short metadata fields
    for key in ('category', 'source', '性味', '归经', '功效'):
        val = metadata.get(key, '')
        if isinstance(val, str) and val and val != '待考' and len(val) < 40:
            keywords.append(val)

    # From body metadata lines (only short category/meridian values)
    for key in ('归经', '分类', '所属分类'):
        val = extract_meta(content, key)
        if val and len(val) < 20 and val not in keywords:
            keywords.append(val)

    # Extra keywords
    if extras:
        keywords.extend(extras)

    # Deduplicate preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for kw in keywords:
        if kw not in seen:
            seen.add(kw)
            unique.append(kw)

    return unique


# ── Per-category converters ─────────────────────────────────────────

def convert_herbs() -> list[dict]:
    herbs_dir = KNOWLEDGE_DIR / 'herbs'
    results: list[dict] = []

    for md_file in sorted(herbs_dir.glob('*.md')):
        file_id = md_file.stem
        text = md_file.read_text(encoding='utf-8')
        metadata, content = parse_yaml_front_matter(text)

        name = metadata.get('title') or extract_h1_title(content) or file_id
        category = metadata.get('category', '')
        source = metadata.get('source', '')

        # Collect extra Chinese medicine attributes
        extra: dict[str, str] = {}
        for key in ('性味', '归经', '功效', '主治', '常用剂量', '炮制方法', '配伍禁忌', '鉴别要点'):
            val = metadata.get(key, '')
            if val and val != '待考':
                extra[key] = val

        keywords = extract_keywords(metadata, content)
        summary = extract_summary(content)

        results.append({
            '_id': file_id,
            'name': name,
            'category': category,
            'source': source,
            'extra': extra,
            'keywords': keywords,
            'summary': summary,
            'content': content,
        })

    return results


def convert_formulas() -> list[dict]:
    formulas_dir = KNOWLEDGE_DIR / 'formulas'
    results: list[dict] = []

    for md_file in sorted(formulas_dir.glob('*.md')):
        file_id = md_file.stem
        text = md_file.read_text(encoding='utf-8')
        metadata, content = parse_yaml_front_matter(text)

        name = metadata.get('title') or extract_h1_title(content) or file_id
        category = metadata.get('category', '')
        source = metadata.get('source', '')

        # Extract composition from markdown table
        composition: list[dict] = []
        in_table = False
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('|') and not line.startswith('|---') and not line.startswith('|:-'):
                cells = [c.strip() for c in line.split('|')[1:-1]]
                # Skip header row
                if cells and cells[0] in ('药物', '方名'):
                    continue
                if len(cells) >= 2:
                    drug_name = re.sub(r'\*+', '', cells[0]).strip()
                    dosage = re.sub(r'\*+', '', cells[1]).strip()
                    if drug_name and len(drug_name) < 20 and '---' not in drug_name:
                        entry = {'drug': drug_name, 'dosage': dosage}
                        if len(cells) >= 3:
                            entry['role'] = cells[2].strip() if len(cells) >= 3 else ''
                        if len(cells) >= 4:
                            entry['effect'] = cells[3].strip() if len(cells) >= 4 else ''
                        composition.append(entry)

        keywords = extract_keywords(metadata, content)
        summary = extract_summary(content)

        results.append({
            '_id': file_id,
            'name': name,
            'category': category,
            'source': source,
            'composition': composition,
            'keywords': keywords,
            'summary': summary,
            'content': content,
        })

    return results


def convert_acupoints() -> list[dict]:
    acupoints_dir = KNOWLEDGE_DIR / 'acupoints'
    results: list[dict] = []

    for md_file in sorted(acupoints_dir.glob('*.md')):
        file_id = md_file.stem
        if md_file.name in SKIP_FILES:
            continue

        text = md_file.read_text(encoding='utf-8')
        metadata, content = parse_yaml_front_matter(text)

        name = metadata.get('title') or extract_h1_title(content) or file_id
        meridian = metadata.get('归经', '') or extract_meta(content, '归经')
        location = metadata.get('定位', '') or extract_meta(content, '定位')

        keywords = extract_keywords(metadata, content, [meridian] if meridian else None)
        summary = extract_summary(content)

        results.append({
            '_id': file_id,
            'name': name,
            'meridian': meridian,
            'location': location,
            'keywords': keywords,
            'summary': summary,
            'content': content,
        })

    return results


def convert_concepts() -> list[dict]:
    concepts_dir = KNOWLEDGE_DIR / 'concepts'
    results: list[dict] = []

    for md_file in sorted(concepts_dir.glob('*.md')):
        file_id = md_file.stem
        if md_file.name in SKIP_FILES:
            continue

        text = md_file.read_text(encoding='utf-8')
        metadata, content = parse_yaml_front_matter(text)

        name = metadata.get('title') or extract_h1_title(content) or file_id
        category = metadata.get('category', '') or extract_meta(content, '分类')

        keywords = extract_keywords(metadata, content)
        summary = extract_summary(content)

        results.append({
            '_id': file_id,
            'name': name,
            'category': category,
            'keywords': keywords,
            'summary': summary,
            'content': content,
        })

    return results


def convert_cases() -> list[dict]:
    cases_dir = KNOWLEDGE_DIR / 'cases'
    results: list[dict] = []

    for md_file in sorted(cases_dir.glob('*.md')):
        file_id = md_file.stem
        text = md_file.read_text(encoding='utf-8')
        metadata, content = parse_yaml_front_matter(text)

        name = metadata.get('title') or extract_h1_title(content) or file_id
        category = metadata.get('category', '')
        difficulty = metadata.get('difficulty', '')

        keywords = extract_keywords(metadata, content)
        summary = extract_summary(content)

        results.append({
            '_id': file_id,
            'name': name,
            'category': category,
            'difficulty': difficulty,
            'keywords': keywords,
            'summary': summary,
            'content': content,
        })

    return results


def convert_diagnosis() -> list[dict]:
    diagnosis_dir = KNOWLEDGE_DIR / 'diagnosis'
    results: list[dict] = []

    for md_file in sorted(diagnosis_dir.glob('*.md')):
        file_id = md_file.stem
        text = md_file.read_text(encoding='utf-8')
        metadata, content = parse_yaml_front_matter(text)

        name = metadata.get('title') or extract_h1_title(content) or file_id
        category = metadata.get('category', '') or extract_meta(content, '分类')

        keywords = extract_keywords(metadata, content)
        summary = extract_summary(content)

        results.append({
            '_id': file_id,
            'name': name,
            'category': category,
            'keywords': keywords,
            'summary': summary,
            'content': content,
        })

    return results


# ── Main ─────────────────────────────────────────────────────────────

CONVERTERS: dict[str, tuple[callable, str]] = {
    'herbs':     (convert_herbs,     '药材'),
    'formulas':  (convert_formulas,  '方剂'),
    'acupoints': (convert_acupoints, '穴位'),
    'concepts':  (convert_concepts,  '概念'),
    'cases':     (convert_cases,     '医案'),
    'diagnosis': (convert_diagnosis, '诊断'),
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    counts: dict[str, int] = {}
    grand_total = 0

    for key, (converter, label) in CONVERTERS.items():
        print(f'📂 转换 {label} ({key})...', end=' ', flush=True)
        try:
            data = converter()
            output_file = OUTPUT_DIR / f'{key}.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            counts[key] = len(data)
            grand_total += len(data)
            file_size_kb = output_file.stat().st_size / 1024
            print(f'✓ {len(data):>4} 条 → {output_file.name} ({file_size_kb:.1f} KB)')
        except Exception as e:
            print(f'✗ 失败: {e}')
            import traceback
            traceback.print_exc()

    # ── Manifest ──
    manifest = {
        'description': '倪海厦经方助手 - CloudBase 数据库导入清单',
        'generated': '2026-07-08T10:37:00+08:00',
        'collections': [
            {
                'name': key,
                'label': label,
                'file': f'{key}.json',
                'count': counts.get(key, 0),
                'collection_name': f'ni_{key}',
            }
            for key, (_, label) in CONVERTERS.items()
        ],
        'total': grand_total,
    }

    manifest_file = OUTPUT_DIR / 'manifest.json'
    with open(manifest_file, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f'\n{"─" * 50}')
    print(f'✅ 转换完成！总计 {grand_total} 条记录')
    print(f'📁 输出目录: {OUTPUT_DIR}')
    print(f'📋 清单文件: {manifest_file.name}')

    # ── Quick sanity check ──
    print(f'\n{"─" * 50}')
    print('🔍 抽样检查:')
    for key in ['herbs', 'formulas', 'acupoints', 'concepts', 'cases', 'diagnosis']:
        path = OUTPUT_DIR / f'{key}.json'
        if path.exists():
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if data:
                sample = data[0]
                print(f'\n  {key}[0]:')
                for k, v in sample.items():
                    if k != 'content':
                        val_str = str(v)
                        if len(val_str) > 80:
                            val_str = val_str[:77] + '...'
                        print(f'    {k}: {val_str}')


if __name__ == '__main__':
    main()
