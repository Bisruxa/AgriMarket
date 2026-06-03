import requests

print("=== TEST 1: FastAPI /chat direct ===")
r = requests.post('http://localhost:8000/chat', json={
    'message': 'hi, what can you help me with?',
    'conversation_history': [],
    'language': 'en'
}, timeout=60)
print(f'Status: {r.status_code}')
if r.status_code == 200:
    d = r.json()
    print(f'Text: {d.get("text","")[:300]}')
    print(f'FC: {len(d.get("functionCalls",[]))}')
elif r.status_code == 500:
    print(f'500 Error: {r.text[:1000]}')
else:
    print(f'Error: {r.text[:500]}')

print()
print("=== TEST 2: Express chat flow ===")
s = requests.Session()
r = s.post('http://localhost:5000/api/auth/login', json={
    'email':'test_chat_fix@test.com','password':'Test1234!'
}, timeout=15)
print(f'Login: {r.status_code}')

r = s.post('http://localhost:5000/api/chat', json={'title': 'Debug'}, timeout=15)
chat_id = r.json().get('data', {}).get('id')
print(f'Chat: {chat_id}')

if chat_id:
    r = s.post(f'http://localhost:5000/api/chat/{chat_id}/messages', json={
        'content': 'hi there',
        'language': 'en'
    }, timeout=90)
    print(f'Status: {r.status_code}')
    d = r.json()
    print(f'Success: {d.get("success")}')
    if d.get('success') and d.get('data'):
        msg = d['data'].get('assistantMessage', {}).get('content', '')
        print(f'Reply: {msg[:400]}')
    else:
        print(f'Full response: {str(d)[:500]}')
