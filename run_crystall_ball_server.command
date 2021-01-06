#!/bin/bash
cd "$(dirname "$0")"
open "loader.html"
python3 -m http.server
