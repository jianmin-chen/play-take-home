import Loader from './Loader';
import useResize from '@/hooks/useResize';
import AUDIO_OPTIONS, {type AudioOptions} from '@/utils/options';
import type {PDFDocumentProxy} from 'pdfjs-dist/types/src/display/api';
import {useEffect, useMemo, useRef, useState, type ChangeEvent} from 'react';
import {IoIosCloudUpload} from 'react-icons/io';
import {IoCall, IoPause, IoPlay} from 'react-icons/io5';
import {Document, Page, pdfjs} from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import WebSocket from 'ws';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

function Slider({
    numPages,
    currentPageIndex,
    setCurrentPageIndex
}: {
    numPages: number;
    currentPageIndex: number;
    setCurrentPageIndex: (page: number) => void;
}) {
    const [container, wrapper] = useResize<HTMLDivElement>();

    const [input, setInput] = useState<string>(
        (currentPageIndex + 1).toString()
    );

    const valid = (index: string): boolean => {
        if (!isNaN(parseInt(index))) {
            const i = parseInt(index) - 1;
            return i >= 0 && i < numPages;
        }
        return false;
    };

    useEffect(() => {
        if (valid(input)) {
            const preview = document.getElementById(`preview_${input}`);
            setTimeout(() => {
                // https://stackoverflow.com/questions/58860861/scrollintoview-not-working-on-input-change-or-blur
                preview?.scrollIntoView({behavior: 'smooth', block: 'center'});
            }, 1);
        }
    }, [input]);

    return (
        <div className='relative col-span-2 h-full overflow-auto bg-neutral-300 pb-3'>
            <div className='sticky top-0 z-50 mb-3 flex items-center gap-1 bg-neutral-300 px-3 py-3 shadow-sm'>
                <input
                    onChange={event => {
                        event.preventDefault();
                        setInput(event.target.value);
                        if (valid(event.target.value)) {
                            const page = parseInt(event.target.value) - 1;
                            setCurrentPageIndex(page);
                        }
                    }}
                    value={input}
                    type='text'
                    className='border-2 border-transparent bg-neutral-200 text-center font-mono text-xs text-neutral-600 shadow-sm outline-none transition-all focus:border-lime-600'
                />
                <p className='text-sm text-neutral-500'>/{numPages}</p>
            </div>
            <div className='px-3'>
                <div ref={container}>
                    {Array.from(new Array(numPages), (_el, index) => (
                        <div
                            key={`preview_${index + 1}`}
                            id={`preview_${index + 1}`}>
                            <Page
                                className={[
                                    'children-select-none border-2 transition-all',
                                    index === currentPageIndex
                                        ? 'cursor-default border-lime-600'
                                        : 'cursor-pointer border-transparent'
                                ].join(' ')}
                                loading={<Loader background='black' />}
                                pageIndex={index}
                                width={wrapper.width - 4}
                                onClick={() => {
                                    if (index !== currentPageIndex) {
                                        setInput((index + 1).toString());
                                        setCurrentPageIndex(index);
                                    }
                                }}
                            />
                            <p className='my-1 text-center text-xs text-neutral-400'>
                                {index + 1}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

enum PlayingState {
    playing,
    loading,
    none
}

export default function Viewer() {
    const [file, setFile] = useState<string | File>('/example.pdf');
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>(0);

    const PDF_OPTIONS = useMemo(
        () => ({
            cMapUrl: '/cmaps/',
            standardFontDataUrl: '/standard_fonts/'
        }),
        []
    );

    useEffect(() => {
        if (container.current) {
            container.current
                .querySelector('#top')!
                .scrollIntoView({behavior: 'smooth'});
        }
        ended();
        setPlaying(PlayingState.none);
    }, [currentPageIndex]);

    // Used for managing size of PDF depending on window size.
    const [container, wrapper] = useResize<HTMLDivElement>();

    // Store ref to PDFDocumentProxy for cleanup.
    const document = useRef<PDFDocumentProxy>(null);
    const audioElement = useRef<HTMLAudioElement>(null);
    const jobs = useRef<Promise<any>[]>([]);

    const documentLoad = (props: PDFDocumentProxy) => {
        setNumPages(props.numPages);
        setCurrentPageIndex(0);
        document.current = props;
    };

    // Audio options.
    const [options, setOptions] = useState<AudioOptions>({
        voice: Object.keys(AUDIO_OPTIONS)[0],
        speed: 1
    });
    const [playing, setPlaying] = useState<PlayingState>(PlayingState.none);

    const ended = () => {
        // Finished? Let's clear our audio ref.
        if (audioElement.current) {
            audioElement.current.pause();
            audioElement.current.remove();
            audioElement.current = null;
        }
    };

    const beginTts = () => new Promise((resolve, reject) => {
        fetch("/api/tts", {
            method: "POST",
            body: JSON.stringify({
                ...options,
                text: container.current!.textContent
            })
        }).then(res => res.blob()).then(blob => {
            audioElement.current = new Audio();
            audioElement.current.src = window.URL.createObjectURL(blob);
            setPlaying(PlayingState.playing);
            resolve(null);
        })
    })

    useEffect(() => {
        // `playing` just changed - update accordingly.
        if (playing === PlayingState.playing) {
            audioElement.current!.play();

            audioElement.current!.addEventListener('ended', ended);
            return () => {
                if (audioElement.current) {
                    audioElement.current.removeEventListener('ended', ended);
                }
            };
        } else if (playing === PlayingState.none) {
            if (audioElement.current) audioElement.current.pause();
        } else if (playing === PlayingState.loading) {
            jobs.current.push(beginTts());
        }
    }, [playing]);

    const upload = (event: ChangeEvent<HTMLInputElement>) => {
        const {files} = event.target;
        const opened = files?.[0];
        if (opened) setFile(opened);
    };

    useEffect(() => {
        // Add some arrow listeners.
        const keydown = (event: KeyboardEvent) => {
            if (event.code === 'ArrowRight' && currentPageIndex < numPages)
                setCurrentPageIndex(old => old + 1);
            else if (event.code === 'ArrowLeft' && currentPageIndex !== 0)
                setCurrentPageIndex(old => old - 1);
            else if (event.code === "Space") toggleTts();
        };

        window.addEventListener('keydown', keydown);

        return () => {
            if (process.env.NODE_ENV === 'production') {
                const open = document.current;
                if (open) {
                    open.cleanup();
                    open.destroy();
                }
            }
            window.removeEventListener('keydown', keydown);
            setPlaying(PlayingState.none);
        };
    }, []);

    const toggleTts = () => {
        setPlaying(playing => {
            if (playing === PlayingState.playing) return PlayingState.none;
            else if (playing === PlayingState.none) {
                const player = audioElement.current;
                if (player && player.hasAttribute('src') && player.src.length) {
                    // Seems like there's already a audio file loaded -
                    // we must be halfway through playing. Let's play that.
                    return PlayingState.playing;
                }
            }
            return PlayingState.loading;
        });
    };

    return (
        <div className='relative flex h-screen max-h-screen w-full flex-col'>
            <Document
                error={
                    <div className='flex h-screen w-screen flex-1 items-center justify-center'>
                        <h1>Failed to load PDF. Try again?</h1>
                    </div>
                }
                loading={
                    <div className='flex h-screen w-screen items-center justify-center'>
                        <Loader background='black' />
                    </div>
                }
                className='grid grid-cols-12 overflow-y-hidden'
                file={file}
                onLoadSuccess={documentLoad}
                options={PDF_OPTIONS}>
                <Slider
                    numPages={numPages}
                    currentPageIndex={currentPageIndex}
                    setCurrentPageIndex={setCurrentPageIndex}
                />
                <div className='col-span-10 overflow-auto p-3'>
                    <div ref={container}>
                        <div id='top' />
                        <Page
                            width={wrapper.width}
                            pageIndex={currentPageIndex}
                        />
                    </div>
                </div>
            </Document>
            <div className='flex w-full flex-1 items-center justify-between border-t border-neutral-200 bg-white px-6 py-2'>
                <label className='cursor-pointer text-neutral-700 transition-all ease-out hover:text-lime-600'>
                    <input
                        title='Upload PDF'
                        onChange={upload}
                        type='file'
                        className='hidden'
                    />
                    <IoIosCloudUpload className='text-xl text-inherit' />
                </label>
                <div className='flex items-center justify-center gap-4'>
                    <button
                        disabled={playing === PlayingState.loading}
                        onClick={toggleTts}
                        className={[
                            'flex h-[45px] w-[45px] items-center justify-center rounded-full bg-lime-500 transition-all',
                            playing !== PlayingState.loading
                                ? 'hover:bg-lime-600'
                                : ''
                        ].join(' ')}>
                        {playing === PlayingState.none ? (
                            <IoPlay className='text-xl text-white' />
                        ) : playing === PlayingState.playing ? (
                            <IoPause className='text-xl text-white' />
                        ) : (
                            <Loader background='white' />
                        )}
                    </button>
                </div>
                <button className='cursor-pointer text-neutral-700 transition-all ease-out hover:scale-[105%] hover:text-lime-600'>
                    <IoCall className='align-text-bottom text-xl text-inherit' />
                </button>
            </div>
        </div>
    );
}
