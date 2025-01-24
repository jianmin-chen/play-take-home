import Controls from './Controls';
import Dropdown from './Dropdown';
import Highlighter from './Highlighter';
import Loader from './Loader';
import useResize from '@/hooks/useResize';
import AUDIO_OPTIONS from '@/utils/options';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { type ChangeEvent, ChangeEventHandler, EventHandler, useEffect, useRef, useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { IoIosCloudUpload } from 'react-icons/io';
import { IoPlay, IoPause, IoCall } from 'react-icons/io5';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';


const CHUNK_SIZE = 50000;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/'
};

function Slider({
    numPages,
    currentPageIndex,
    setcurrentPageIndex
    // setPages
}: {
    numPages: number;
    currentPageIndex: number;
    setcurrentPageIndex: (page: number) => void;
}) {
    const [ref, wrapper] = useResize<HTMLDivElement>();

    const [input, setInput] = useState<string>(
        (currentPageIndex + 1).toString()
    );

    useEffect(() => {
        if (!isNaN(parseInt(input))) {
            const page = parseInt(input) - 1;
            if (page >= 0 && page <= numPages) {
                setcurrentPageIndex(page);
                document
                    .getElementById(`page_${page}`)
                    ?.scrollIntoView({behavior: 'smooth'});
            }
        }
    }, [input]);

    useEffect(() => {
        setInput((currentPageIndex + 1).toString());
    }, [currentPageIndex]);

    return (
        <div className='relative h-screen max-h-screen overflow-auto border-r bg-neutral-300 pb-3'>
            <div className='sticky top-0 z-50 mb-3 flex items-center justify-center gap-1 bg-neutral-300 px-3 py-3 shadow-sm'>
                <input
                    onChange={event => {
                        setInput(event.target.value);
                    }}
                    value={input}
                    type='text'
                    className='rounded-md border-2 border-transparent bg-neutral-200 text-center font-mono text-xs text-neutral-500 shadow-sm outline-none transition-all focus:border-lime-600'
                />
                <p className='text-sm text-neutral-500'>/{numPages}</p>
            </div>
            <div className='mx-3 mb-1' ref={ref}>
                {Array.from(new Array(numPages), (_el, index) => (
                    <div
                        className='mb-1'
                        id={`page_${index + 1}`}
                        key={`page_${index + 1}`}>
                        <Page
                            loading={Loader}
                            onClick={() => setcurrentPageIndex(index)}
                            key={`page_${index + 1}`}
                            width={wrapper.width - 4}
                            pageIndex={index}
                            className={[
                                'children-select-none border-2 transition-all',
                                index === currentPageIndex
                                    ? 'cursor-default border-lime-600'
                                    : 'cursor-pointer border-transparent'
                            ].join(' ')}
                        />
                        <p className='mt-1 text-center text-xs text-neutral-400'>
                            {index + 1}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Viewer() {
    const [file, setFile] = useState<string | File>('/moonray.pdf');
    const [currentPageIndex, setcurrentPageIndex] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>(0);

    // Store ref to PDFDocumentProxy for cleanup in `useEffect`.
    const document = useRef<PDFDocumentProxy>(null);

    // Used for managing size of PDF depending on window size.
    // Uses custom hook `useResize`.
    const [ref, wrapper] = useResize<HTMLDivElement>();

    // Store ref to audio component,
    // rather than creating a new Audio() evertytime.
    const audioElement = useRef<HTMLAudioElement>(null);

    // Store ref to `Highlighter` instance for moving selection ranges
    // through page. Useful for cleaning up, resetting, etc.
    const highlighter = useRef<Highlighter>(null);

    // Audio options.
    const [audioOption, setAudioOption] = useState<string>(
        Object.keys(AUDIO_OPTIONS)[0]
    );

    const [playing, setPlaying] = useState<boolean>(false);
    useEffect(() => {
        if (playing) {
            chunk();
            audioElement.current!.addEventListener('ended', event => {
                chunk();
            });
        } else highlighter.current?.hide();
    }, [playing]);

    const chunk = () => {
        if (highlighter.current) {
            const text = highlighter.current.next();
            if (text)
                fetch('/api/tts', {
                    method: 'POST',
                    body: JSON.stringify({
                        audioOption,
                        text
                    })
                }).then(res => res.blob()).then(blob => {
                    const src = window.URL.createObjectURL(blob);
                    const audio = audioElement.current!;
                    audio.src = src;
                    audio.play();
                })
            else highlighter.current.reset();
        }
    };

    const onLoadSuccess = (props: PDFDocumentProxy): void => {
        setNumPages(props.numPages);
        setcurrentPageIndex(0);
        highlighter.current = null;
        document.current = props;
    };

    const upload = (event: ChangeEvent<HTMLInputElement>) => {
        const {files} = event.target;

        const opened = files?.[0];
        if (opened) setFile(opened);
    };

    useEffect(() => {
        return () => {
            if (document.current) {
                document.current.cleanup();
                document.current.destroy();
            }
        };
    }, []);

    const createAgent = async (ctx: string) => {
        // Create an agent with context.
    };

    const toggleTts = () => {
        setPlaying(playing => {
            if (playing) return false;

            if (!highlighter.current) {
                const page = ref.current!.querySelector('.textLayer');
                if (page === null) return false;
                highlighter.current = new Highlighter(page);
            }

            return true;
        });
    };

    return (
        <div className='relative flex h-screen max-h-screen w-full flex-col'>
            <audio className='hidden' ref={audioElement} />
            <Document
                loading={
                    <div className='flex h-screen w-screen items-center justify-center'>
                        <Loader />
                    </div>
                }
                className='grid max-h-full flex-1 grid-cols-12 overflow-y-hidden'
                file={file}
                onLoadSuccess={onLoadSuccess}
                options={options}>
                <div className='col-span-2 max-h-full'>
                    <Slider
                        numPages={numPages}
                        currentPageIndex={currentPageIndex}
                        setcurrentPageIndex={setcurrentPageIndex}
                    />
                </div>
                <div className='col-span-10 overflow-auto'>
                    <div
                        className='mx-3 max-h-full overflow-auto bg-neutral-200 pb-5 pt-3'
                        ref={ref}>
                        <Page
                            className=''
                            width={wrapper.width}
                            pageIndex={currentPageIndex}
                        />
                    </div>
                </div>
            </Document>
            <div className='flex items-center justify-between border-t border-neutral-200 bg-white p-2'>
                <label className='cursor-pointer'>
                    <input onChange={upload} type='file' className='hidden' />
                    <IoIosCloudUpload />
                </label>
                <button
                    onClick={toggleTts}
                    disabled={!ref.current}
                    className='flex h-[45px] w-[45px] items-center justify-center rounded-full bg-lime-500 p-3 transition-all hover:bg-lime-600'>
                    {!playing ? (
                        <IoPlay className='m-0 p-0 text-xl text-white' />
                    ) : (
                        <IoPause className='m-0 p-0 text-xl text-white' />
                    )}
                </button>
                <div>
                    <IoCall />
                </div>
            </div>
        </div>
    );
}