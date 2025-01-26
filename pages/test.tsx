import VoiceDropdown from "@/components/VoiceDropdown";
import { useState } from "react";
import AUDIO_OPTIONS from "@/utils/options"

export default function Test() {
    const [voice, setVoice] = useState("Angelo");

    return (
        <div className="w-screen h-screen relative flex items-center justify-center">
        <VoiceDropdown voice={voice} setVoice={setVoice} options={AUDIO_OPTIONS}/>
        </div>
    );
}