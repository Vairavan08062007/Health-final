import codecs
import os

req_path = 'd:\\Final\\backend\\requirements.txt'
with open(req_path, 'rb') as f:
    text = f.read()

content = ""
for e in ['utf-8', 'utf-16', 'utf-16-le', 'cp1252', 'latin1']:
    try:
        temp = text.decode(e)
        if 'fastapi' in temp.lower() or 'sqlalchemy' in temp.lower():
            content = temp
            break
    except Exception:
        pass

if not content:
    content = text.decode('utf-8', errors='ignore')

lines = content.split('\n')
new_lines = []
for line in lines:
    clean_line = line.strip().replace('\x00', '')
    if not clean_line:
        continue
    if clean_line.lower().startswith('bcrypt'):
        continue
    if clean_line.lower().startswith('passlib'):
        continue
    new_lines.append(clean_line)

new_lines.append('bcrypt==4.0.1')
new_lines.append('passlib[bcrypt]==1.7.4')

with open(req_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines) + '\n')

print('Successfully updated requirements.txt!')
