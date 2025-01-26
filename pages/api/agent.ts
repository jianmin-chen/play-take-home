import expect from "@/utils/expect";
import AUDIO_OPTIONS, { type AudioOptions } from "@/utils/options";
import type { NextApiRequest, NextApiResponse } from "next";

interface Options extends AudioOptions {
    ctx: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        expect(req.method === "POST", "POST to endpoint");
        const options: Options = JSON.parse(req.body);

        expect(options.ctx != undefined, `Expect context for agent`);

        const voice = Object.keys(AUDIO_OPTIONS).includes(options.voice ?? "") ? options.voice! : Object.keys(AUDIO_OPTIONS)[0];

        const response = await fetch("https://api.play.ai/api/v1/agents", {
            method: "POST",
            headers: {
                Authorization: process.env.PLAY_API_KEY,
                "X-User-Id": process.env.PLAY_USER_ID,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                voice: AUDIO_OPTIONS[voice].value,
                voiceSpeed: options.speed ?? 1,
                displayName: voice,
                description: "",
                prompt: "You just took a look at the page of a PDF and your customer has a few questions about it. You should respond by using the information you have from the PDF, and external applicable knowledge on the main topic of the PDF.",
                criticalKnowledge: `Here's a page of the PDF you have access to: ${options.ctx}`,
                answerOnlyFromCriticalKnowledge: false,
                greeting: `Hey it's ${voice}! Just took a look at this page, let me know if there's any questions I can help answer.`
            })
        });

        return res.status(200).json(await response.json());
    } catch (err) {
        console.log(err);
        return res.status(500).json({err});
    }
}