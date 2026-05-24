.PHONY: dev dev-server dev-client dev-ai install install-js install-py db-setup db-reset train

# ── Run all three services (in separate terminals) ──
dev: dev-server dev-client dev-ai

# ── Individual services ──
dev-server:
	cd server && npm run dev

dev-client:
	cd client && npm run dev

dev-ai:
	cd agriAI && ~/venvwsl/bin/python -m uvicorn api.main:app --reload --port 8000

# ── Install everything ──
install: install-js install-py

install-js:
	cd server && npm install
	cd client && npm install

install-py:
	cd agriAI && python -m venv venv && venv/bin/pip install -r requirements.txt

# ── Database ──
db-setup:
	cd server && npx prisma migrate dev

db-reset:
	cd server && npx prisma migrate reset

# ── ML model training ──
train:
	cd agriAI && venv/bin/python scripts/train_all.py