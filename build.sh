#!/bin/bash
#
# Usage:
#     ./build.sh [--watch]
cd $(dirname "$0")
babel src/ --out-file dist/index.js "$@"
