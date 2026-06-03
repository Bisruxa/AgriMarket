
# Kalkie-talkie

Kalkie-talkie is a responsive, real-time bilingual voice chat application built with React and TypeScript. It demonstrates low-latency browser audio capture, live transcription, and streamed assistant audio playback with a clean, mobile-first UI.

Live demo: https://kalkie-talkie.vercel.app

## Highlights

- Real-time microphone streaming using the Web Audio API with an AudioWorklet for low-latency capture
- Live transcription for both user input and assistant responses
- Smooth, gap-free assistant audio playback via scheduled AudioBufferSourceNodes
- Microphone mute/unmute (pauses sending audio without closing the session)
- Voice selection (male/female presets) persisted to localStorage
- Responsive, accessible UI built with Tailwind CSS

## Tech stack

- React + TypeScript
- Vite (dev server + build)
- Tailwind CSS
- Web Audio API (AudioWorklet)

## Getting started

Prerequisites:

- Node.js (16+ recommended)
- npm (or yarn)

1. Clone the repository

```bash
git clone https://github.com/AlexKalll/kalkie-talkie.git
cd bilingual-talk
```

2. Install dependencies

```bash
npm install
# or
# yarn
```

3. Run the dev server

```bash
npm run dev
```

Open the address printed by Vite (usually http://localhost:5173). The app will request microphone permission when you start a session.

## Environment & credentials

The app connects to an AI streaming backend for live conversation. Use environment variables as required by your chosen provider.
Adjust variable names and values to match your backend's requirements.

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — run TypeScript build and produce optimized assets with Vite
- `npm run preview` — serve the production build locally

## Production & deployment

This project is compatible with static hosting platforms such as Vercel, Netlify, and Cloudflare Pages. The demo is deployed at the URL above.

To deploy to Vercel, connect your repository and set any provider environment variables in the Vercel dashboard.

## Troubleshooting

- Microphone permission denied: enable mic permission for the site in your browser and ensure no other app is blocking the device.
- No assistant audio: verify your audio output device and check that playback is not blocked by autoplay policies (user interaction required).
- Backend connection errors: confirm environment variables and backend availability — the app surfaces descriptive error messages in the UI status area.

## Contributing

Contributions are welcome. Consider improving the audio resampling, adding tests for the worklet, or making the backend provider adapter pluggable.

Please open issues or PRs with clear descriptions and test cases when appropriate.
