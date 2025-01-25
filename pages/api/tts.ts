import AUDIO_OPTIONS, { type AudioOptions } from '@/utils/options';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

const expect = (ok: boolean, message: string) => {
    if (!ok) throw new Error(message);
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method !== 'POST') throw new Error('POST to endpoint');
        const {voice, text}: AudioOptions =
            JSON.parse(req.body);
        expect(
            Object.keys(AUDIO_OPTIONS).includes(voice ?? ""),
            `Expect audioOption to be one of ${Object.keys(AUDIO_OPTIONS).join(' | ')}, got ${voice}`
        );
        const response = await fetch('https://api.play.ai/api/v1/tts/stream', {
            method: 'POST',
            headers: {
                'AUTHORIZATION': process.env.PLAY_API_KEY,
                'X-USER-ID': process.env.PLAY_USER_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'PlayDialog',
                text,
                voice: AUDIO_OPTIONS[voice!].value,
                language: 'english',
                // TODO: Replace with appropriate values.
                speed: 1,
                temperature: null
            })
        });

        // @ts-ignore
        const stream = Readable.fromWeb(response.body!);

        res.writeHead(200, {
            "Content-Type": "audio/mpeg",
        })
        stream.pipe(res);
    } catch (err) {
        console.log(err);
        return res.status(500).json({err});
    }
}