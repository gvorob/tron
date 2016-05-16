#!/usr/bin/python
"""
testing interface to SQLite DB
"""

import os
import json
import sqlite3

db_path = "test.db";
conn = sqlite3.connect(db_path);
curs = conn.cursor();

def cleanup_db():
    conn.commit();
    conn.close();


def get_data_for_id(id_):
    curs.execute("select data from patterns where id=?;", "1");   
    data = curs.fetchone();
    return data[0];

print json.dumps(get_data_for_id(1));
cleanup_db();
