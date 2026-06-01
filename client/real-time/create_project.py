import os
from pathlib import Path

# Project structure definition
structure = {
    "index.html": "<!doctype html>\n<html lang='en'>\n<head><meta charset='UTF-8'><title>Bilingual Talk</title></head>\n<body><div id='root'></div><script type='module' src='/src/main.tsx'></script></body>\n</html>",
    "metadata.json": '{\n  "name": "bilingual-talk",\n  "version": "1.0.0",\n  "description": "Bilingual Talk App"\n}',
    "src": {
        "main.tsx": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);\n",
        "App.tsx": "import React from 'react';\n\nconst App: React.FC = () => {\n  return <div>Bilingual Talk App</div>;\n};\n\nexport default App;\n",
        "types.ts": "// Define shared TypeScript types here\nexport type Message = { text: string; sender: 'user' | 'bot' };\n",
        "constants.ts": "// Shared constants\nexport const APP_NAME = 'Bilingual Talk';\n",
        "components": {
            "ChatBubble.tsx": "import React from 'react';\nimport { Message } from '../types';\n\nconst ChatBubble: React.FC<{ message: Message }> = ({ message }) => (\n  <div className={`p-2 m-1 rounded-lg ${message.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>\n    {message.text}\n  </div>\n);\n\nexport default ChatBubble;\n",
            "ControlButton.tsx": "import React from 'react';\n\nconst ControlButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (\n  <button onClick={onClick} className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'>\n    {label}\n  </button>\n);\n\nexport default ControlButton;\n",
            "LanguageSwitcher.tsx": "import React from 'react';\n\nconst LanguageSwitcher: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => (\n  <button onClick={onSwitch} className='px-3 py-1 border rounded-md'>Switch Language</button>\n);\n\nexport default LanguageSwitcher;\n",
            "icons": {
                "Icons.tsx": "import React from 'react';\n\nexport const MicIcon = () => <span role='img' aria-label='mic'>🎤</span>;\nexport const SendIcon = () => <span role='img' aria-label='send'>📨</span>;\n"
            }
        },
        "hooks": {
            "useGeminiLive.ts": "// Custom hook placeholder\nexport const useGeminiLive = () => {\n  return { start: () => {}, stop: () => {} };\n};\n"
        },
        "utils": {
            "audioUtils.ts": "// Audio utility placeholder\nexport const recordAudio = async () => {\n  console.log('Recording audio...');\n};\n"
        }
    }
}

def create_structure(base_path, structure_dict):
    for name, content in structure_dict.items():
        path = Path(base_path) / name
        if isinstance(content, dict):
            path.mkdir(parents=True, exist_ok=True)
            create_structure(path, content)
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ Created: {path}")

if __name__ == "__main__":
    base_dir = Path(".")
    create_structure(base_dir, structure)
    print("\n🎉 Project structure created successfully!")
