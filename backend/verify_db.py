import sqlite3
import json

conn = sqlite3.connect('winform_tutor.db')
c = conn.cursor()
c.execute('SELECT * FROM interaction_history ORDER BY id DESC LIMIT 5')
print("--- INTERACTION HISTORY ---")
for row in c.fetchall():
    print(row)

print("--- STUDENT PROFILE ---")
c.execute('SELECT * FROM student_profiles LIMIT 5')
for row in c.fetchall():
    print(row)

print("--- STUDENT CONCEPT STATES ---")
c.execute('SELECT * FROM student_concept_states LIMIT 5')
for row in c.fetchall():
    print(row)
