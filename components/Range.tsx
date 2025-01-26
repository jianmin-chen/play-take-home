import {useEffect, useRef, useState, type JSX} from 'react';

interface Options {
    min: number;
    max: number;
    value: number;
    setValue: (value: number) => void;
    icon: JSX.Element;
    title: string;
}

export default function Range(props: Options) {
    const [show, setShow] = useState<boolean>(false);

    const range = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unfocus = (event: MouseEvent) => {
            const node = event.target as Element;
            if (!range.current?.contains(node)) setShow(false);
        };

        window.addEventListener('click', unfocus);
        return () => window.removeEventListener('click', unfocus);
    }, []);

    return (
        <div className='relative' ref={range}>
            <button
                title={props.title}
                onClick={() => setShow(old => !old)}
                className='flex items-center justify-center text-neutral-700 transition-all hover:text-lime-600'>
                {props.icon}
            </button>
            {show === true && (
                <div className='absolute bottom-full left-[-50%] z-50 py-2'>
                    <div className='flex min-w-[40px] flex-col items-center rounded-md border border-neutral-300 bg-white pb-3 pt-4 shadow-md'>
                        <input
                            value={props.value}
                            onChange={event =>
                                props.setValue(parseFloat(event.target.value))
                            }
                            min={props.min}
                            max={props.max}
                            step='0.1'
                            type='range'
                            className='vertical'
                        />
                        <span className='text-mono !m-0 !p-0'>
                            {props.value}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
