import {Option} from '@/utils/options';
import {useEffect, useState} from 'react';
import {RiArrowDropDownFill} from 'react-icons/ri';

export default function VoiceDropdown({
    voice,
    setVoice,
    options
}: {
    voice: string;
    setVoice: (voice: string) => void;
    options: {[key: string]: Option};
}) {
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    return (
        <div className='relative'>
            <button onClick={() => setShowDropdown(!showDropdown)} className='bg-white flex items-center justify-between gap-2 rounded-md border border-neutral-200 px-4'>
                {voice}
                <RiArrowDropDownFill />
            </button>
            {showDropdown === true && (
                <div className='absolute bottom-full flex flex-col z-50 bg-white border border-neutral-200 rounded-sm shadow-sm w-full'>
                    {Object.keys(options).map(voice => (
                        <button className='border-b p-2' key={voice} onClick={event => {
                            setVoice(voice);
                            setShowDropdown(false);
                        }}>
                            {voice}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
