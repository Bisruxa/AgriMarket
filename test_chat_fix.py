import requests
BASE = 'http://localhost:5000/api'

s = requests.Session()

# Try register first
r = s.post(f'{BASE}/auth/register', json={
    'name':'Test','email':'test_chat_fix@test.com','password':'Test1234!','role':'FARMER'
}, timeout=15)
print(f'Register: {r.status_code}')
if r.status_code == 201:
    print(f'Created: {r.json().get("user",{}).get("id")}')

# Login with kal
r = s.post(f'{BASE}/auth/login', json={'email':'kal@gmail.com','password':'12345678'}, timeout=15)
print(f'Login kal: {r.status_code}')
if r.status_code == 200:
    print(f'OK: {r.json().get("user",{}).get("role")}')
else:
    print(f'Body: {r.text[:200]}')

# If kal doesn't exist, use the registered user
if r.status_code != 200:
    r = s.post(f'{BASE}/auth/login', json={'email':'test_chat_fix@test.com','password':'Test1234!'}, timeout=15)
    print(f'Login new: {r.status_code}')

if r.status_code == 200:
    r = s.post(f'{BASE}/chat', json={'title': 'Price Test'}, timeout=15)
    chat_id = r.json().get('data', {}).get('id')
    print(f'Chat: {chat_id}')

    if chat_id:
        r = s.post(f'{BASE}/chat/{chat_id}/messages', json={
            'content': 'What is the price of teff in Addis Ababa?',
            'language': 'en'
        }, timeout=90)
        print(f'Status: {r.status_code}')
        if r.status_code == 200:
            d = r.json()
            reply = d.get('data', {}).get('assistantMessage', {}).get('content', '')
            funcs = d.get('data', {}).get('functionCalls', [])
            print(f'Function calls: {len(funcs)}')
            print(f'Reply: {reply[:600]}')
        else:
            print(f'Error: {r.text[:500]}')
