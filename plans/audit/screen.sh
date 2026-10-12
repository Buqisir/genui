#!/bin/sh
# Machine screening for the acceptance pass: validate + layout per lesson, one JSON line each.
# Usage: sh plans/audit/screen.sh > plans/audit/screen.jsonl
cd "$(dirname "$0")/../.." || exit 2
for f in lessons/*.md generated-grok/bank/*.md; do
  v=$(bin/genui validate "$f" --json 2>&1 | tr -d '\n')
  l=$(bin/genui layout "$f" --json 2>&1 | tr -d '\n')
  printf '{"file":"%s","validate":%s,"layout":%s}\n' "$f" "${v:-null}" "${l:-null}"
done
