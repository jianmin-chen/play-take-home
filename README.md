## About

Interact with a PDF using [play.ai]().

## Features

- [ ] PDF file upload
    - [ ] Parsed and displayed on a per-page basis
    - [ ] Navigate between pages
- [ ] Audio playback for current page
    - [ ] TTS with [play.ai]()'s TTS API, controls (play/pause) for audio playback
    - [ ] Dropdown for selecting voice
    - [ ] Progress indicator for generating audio for pages
    - [ ] Adjust speed and temp of audio input.
- [ ] [play.ai]()'s Agent API to interact with agent on PDF content
- [ ] Responsive UI

## Install/Usage

Clone this repo.

Fill `.env.local`:

```
PLAY_API_KEY=
PLAY_USER_ID=
```

Run `npm i && npm run dev`.
