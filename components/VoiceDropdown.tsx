import {Option} from '@/utils/options';
import {useEffect, useRef, useState} from 'react';
import {IoChevronDown, IoChevronUp} from 'react-icons/io5';

export default function VoiceDropdown({
    voice,
    setVoice,
    options
}: {
    voice: string;
    setVoice: (voice: string) => void;
    options: {[key: string]: Option};
}) {
    const [show, setShow] = useState<boolean>(false);

    const dropdown = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unfocus = (event: MouseEvent) => {
            const node = event.target as Element;
            if (
                !dropdown.current?.contains(node) &&
                node.id !== 'dropdown-toggle'
            ) {
                setShow(false);
            }
        };

        window.addEventListener('click', unfocus);
        return () => window.removeEventListener('click', unfocus);
    }, []);

    return (
        <div className='relative' ref={dropdown}>
            <button
                className={[
                    'flex items-center justify-between gap-4 rounded-md border border-neutral-200 bg-white py-1 pl-3 pr-2 transition-all hover:shadow-sm',
                    show
                        ? 'outline outline-lime-500'
                        : 'outline outline-transparent'
                ].join(' ')}
                onClick={() => setShow(old => !old)}>
                {voice}
                {show ? (
                    <IoChevronUp
                        id='dropdown-toggle'
                        className='text-neutral-500'
                    />
                ) : (
                    <IoChevronDown
                        id='dropdown-toggle'
                        className='text-neutral-500'
                    />
                )}
            </button>
            {show === true && (
                <div className='absolute bottom-full left-[-50%] z-50 min-w-full py-2'>
                    <div className='flex min-w-full flex-col rounded-md border border-neutral-300 bg-white shadow-md'>
                        {Object.keys(options).map((voice, index) => (
                            <button
                                className={[
                                    'flex flex-col px-3 py-2 text-left hover:bg-neutral-50',
                                    index !== Object.keys(options).length - 1
                                        ? 'border-b'
                                        : '',
                                    index === 0
                                        ? 'rounded-tl-md rounded-tr-md'
                                        : index ===
                                            Object.keys(options).length - 1
                                          ? 'rounded-bl-md rounded-br-md'
                                          : ''
                                ].join(' ')}
                                key={voice}
                                onClick={event => {
                                    setVoice(voice);
                                    setShow(false);
                                }}>
                                <span className='text-lime-600'>{voice}</span>
                                <span className='text-nowrap'>
                                    {options[voice].gender} &middot;{' '}
                                    {options[voice].style}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
