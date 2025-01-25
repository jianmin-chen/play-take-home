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

## Install/Usage

Clone this repo.

Fill `.env.local`:

```
PLAY_API_KEY=
PLAY_USER_ID=
```

Run `npm i && npm run dev`.

## Behind-the-scenes

Next.js, TypeScript, and Tailwind.

One of the things I decided to do was to try and break a page into "chunks" so we could see as the TTS model moved across the page and highlighted each chunk.

Unfortunately, the library I use is a wrapper around Mozilla's `PDF.js`, which separates the text and image layer into two separate `div`s. I spent a lot of time trying to get this to work before realizing it wouldn't be feasible given time constraints. Still - a fascinating problem.
