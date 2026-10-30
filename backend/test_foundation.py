import sys
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

print("--- 1. Testing Health Check Route ---")
res = client.get('/health')
print("Status Code:", res.status_code)
print("Payload:", res.json())
assert res.status_code == 200
assert res.json()['status'] == 'healthy'
assert res.json()['database'] == 'connected'

print("\n--- 2. Testing Structured Logging & Request IDs ---")
custom_id = "test-req-id-7890"
res_with_id = client.get('/health', headers={'X-Request-ID': custom_id})
print("X-Request-ID sent:", custom_id)
print("X-Request-ID returned:", res_with_id.headers.get("X-Request-ID"))
assert res_with_id.headers.get("X-Request-ID") == custom_id

print("\n--- 3. Testing JWT Auth with Refresh Tokens ---")
login_res = client.post('/api/v1/auth/login', json={
    'email': 'dr.nazim@niet.ac.in',
    'password': 'Doctor@123'
})
print("Login status:", login_res.status_code)
tokens = login_res.json()
print("Access Token present:", bool(tokens.get('access_token')))
print("Refresh Token present:", bool(tokens.get('refresh_token')))
assert 'access_token' in tokens
assert 'refresh_token' in tokens

print("\n--- 4. Testing Refresh Token Exchange ---")
refresh_res = client.post('/api/v1/auth/refresh', json={
    'refresh_token': tokens['refresh_token']
})
print("Refresh status:", refresh_res.status_code)
new_tokens = refresh_res.json()
print("New Access Token present:", bool(new_tokens.get('access_token')))
print("New Refresh Token present:", bool(new_tokens.get('refresh_token')))
assert refresh_res.status_code == 200
assert 'access_token' in new_tokens

print("\n--- 5. Testing Rate Limiting on Auth Endpoints ---")
hit_429 = False
for i in range(25):
    attempt = client.post('/api/v1/auth/login', json={
        'email': 'dr.nazim@niet.ac.in',
        'password': 'Doctor@123'
    })
    if attempt.status_code == 429:
        hit_429 = True
        print(f"Rate limit triggered successfully on attempt {i+1} with HTTP 429 Too Many Requests!")
        break
assert hit_429, "Expected rate limit (429) to trigger"
from app.routers.auth import _auth_request_history
_auth_request_history.clear()

print("\n>>> ALL PHASE ONE FOUNDATION REQUIREMENTS VERIFIED 100%! <<<")
