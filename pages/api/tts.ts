import AUDIO_OPTIONS from "@/utils/options";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await (
            await fetch('https://api.play.ai/api/v1/tts/stream', {
                method: 'POST',
                headers: {
                    'AUTHORIZATION': process.env.PLAY_API_KEY,
                    'X-USER-ID': process.env.PLAY_USER_ID,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'PlayDialog',
                    text: 'Hello, world',
                    voice: AUDIO_OPTIONS.Angelo.value,
                    ...AUDIO_OPTIONS.Angelo,
                    language: 'english'
                })
            })
        ).json();
        return res.status(200).json({
            value: response
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            err: err
        })
    }
}