import requests

BASE = 'http://localhost:5000/api'
AI = 'http://localhost:8000'

s = requests.Session()

r = s.post(f'{BASE}/auth/login', json={'email':'kal@gmail.com','password':'12345678'}, timeout=15)
print(f'Login: {r.status_code}')

print()
print('--- PAGE: POST /api/agriai/recommend/crop ---')
r = s.post(f'{BASE}/agriai/recommend/crop', json={
    'nitrogen':65,'phosphorus':20,'potassium':30,
    'temperature':24,'humidity':65,'ph':6.5,'rainfall':150,'soil_color':'brown'
}, timeout=30)
print(f'Status: {r.status_code}')
try:
    d = r.json()
    crops = [c['crop'] for c in d['data']['recommendations'][:3]]
    print(f'Top recommendations: {crops}')
except Exception as e:
    print(f'Error: {e}')
    print(f'Body: {r.text[:300]}')

print()
print('--- PAGE: POST /api/agriai/predict/price ---')
r = s.post(f'{BASE}/agriai/predict/price', json={
    'crop_name':'Teff (white)','region':'Oromia','year':2026,'month':6
}, timeout=30)
print(f'Status: {r.status_code}')
try:
    d = r.json()
    dd = d['data']
    print(f'Price: {dd["predicted_price"]} ETB, Trend: {dd["trend"]}, CI: {dd["confidence_interval"]}')
except Exception as e:
    print(f'Error: {e}')
    print(f'Body: {r.text[:300]}')

print()
print('--- PAGE: GET /api/agriai/price-forecaster/metadata ---')
r = s.get(f'{BASE}/agriai/price-forecaster/metadata', timeout=30)
print(f'Status: {r.status_code}')
try:
    d = r.json()
    dd = d['data']
    print(f'Crops: {len(dd["crops"])}, Regions: {len(dd["regions"])}')
    print(f'First 5 crops: {dd["crops"][:5]}')
except Exception as e:
    print(f'Error: {e}')

print()
print('--- FASTAPI: GET /health ---')
r = requests.get(f'{AI}/health', timeout=15)
print(f'Status: {r.status_code}, Body: {r.json()}')

print()
print('--- FASTAPI: GET /tools/definitions ---')
r = requests.get(f'{AI}/tools/definitions', timeout=15)
print(f'Status: {r.status_code}')
try:
    d = r.json()
    tools = d.get('tools', [])
    print(f'Tools ({len(tools)}): {[t["name"] for t in tools]}')
except Exception as e:
    print(f'Error: {e}')

print()
print('--- CHAT: send message with real history ---')
r = s.post(f'{BASE}/chat', json={'title': 'Test Refactoring'}, timeout=15)
chat_id = r.json().get('data', {}).get('id')
print(f'Chat created: {chat_id}')
if chat_id:
    r = s.post(f'{BASE}/chat/{chat_id}/messages', json={'content': 'Hello, what crops grow well in Oromia?'}, timeout=60)
    print(f'Send message: {r.status_code}')
    try:
        d = r.json()
        reply = d.get('data', {}).get('assistantMessage', {}).get('content', '')
        print(f'Reply (first 200 chars): {reply[:200]}')
    except Exception as e:
        print(f'Error: {e}')
        print(f'Body: {r.text[:500]}')

print()
print('=== ALL TESTS COMPLETE ===')
