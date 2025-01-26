## About

Interact with a PDF using [play.ai](https://play.ai/)'s audio features.

## Features

- [X] PDF file upload
    - [X] Parsed and displayed on a per-page basis
    - [X] Navigate between pages
- [ ] Audio playback for current page
    - [X] TTS with [play.ai](https://play.ai/)'s TTS API, controls (play/pause) for audio playback
    - [X] Dropdown for selecting voice
    - [X] Progress indicator for generating audio for pages
    - [ ] Adjust speed and temp of audio input.
- [ ] [play.ai]()'s Agent API to interact with agent on PDF content
- [ ] Responsive UI

* Arrows for back/forward

## Install/Usage

Clone this repo.

Fill `.env.local`:

```
PLAY_API_KEY=
PLAY_USER_ID=
```

Run `yarn i && yarn run dev`, or with your package manager of choice.

## Behind-the-scenes

Next.js, TypeScript, and Tailwind.
