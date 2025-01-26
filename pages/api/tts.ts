import expect from '@/utils/expect';
import AUDIO_OPTIONS, {type AudioOptions} from '@/utils/options';
import type {NextApiRequest, NextApiResponse} from 'next';
import {Readable} from 'stream';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        expect(req.method === 'POST', 'POST to endpoint');
        const options: AudioOptions = JSON.parse(req.body);

        expect(options.text != undefined, 'Expect text');

        const voice = Object.keys(AUDIO_OPTIONS).includes(options.voice ?? '')
            ? options.voice!
            : Object.keys(AUDIO_OPTIONS)[0];

        const response = await fetch('https://api.play.ai/api/v1/tts/stream', {
            method: 'POST',
            headers: {
                'Authorization': process.env.PLAY_API_KEY,
                'X-User-Id': process.env.PLAY_USER_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'PlayDialog',
                text: options.text,
                voice: AUDIO_OPTIONS[voice].value,
                language: 'english',
                speed: options.speed ?? 1,
                temperature: options.temperature ?? null
            })
        });

        expect(
            response.body != null,
            `Error running text-to-speech. Try again?`
        );

        // @ts-expect-error
        const stream = Readable.fromWeb(response.body!);

        res.writeHead(200, {'Content-Type': 'audio/mpeg'});
        stream.pipe(res);
    } catch (err) {
        console.log(err);
        return res.status(500).json({err});
    }
}
