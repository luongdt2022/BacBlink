#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Proxy loader for import_elearning_courses.py
References scripts/etl_lms_30_courses.py (PO-DEC-20261110-02)
"""
import os
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))
target_script = os.path.join(script_dir, "etl_lms_30_courses.py")
if __name__ == "__main__":
    with open(target_script, "r", encoding="utf-8") as f:
        code = f.read()
    exec(compile(code, target_script, "exec"), globals(), locals())
