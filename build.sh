#!/bin/bash
#
# Usage:
#     ./build.sh [--watch]

babel src/ --out-file dist/index.js "$@"
