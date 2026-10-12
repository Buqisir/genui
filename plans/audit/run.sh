#!/bin/sh
# Runs the machine screening and the screenshots side by side for the acceptance set.
cd "$(dirname "$0")/../.." || exit 2
{
  for f in lessons/*.md; do basename "$f" .md; done
  for f in generated-grok/bank/*.md; do echo "grok-bank-$(basename "$f" .md)"; done
} > plans/audit/ids.txt
rm -f plans/audit/screen.done plans/audit/shoot.done
(sh plans/audit/screen.sh > plans/audit/screen.jsonl 2>&1; echo done > plans/audit/screen.done) &
(node plans/audit/shoot.mjs $(cat plans/audit/ids.txt) > plans/audit/shoot.jsonl 2>&1; echo done > plans/audit/shoot.done) &
wait
