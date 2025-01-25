import Controls from './Controls';
import Highlighter from './Highlighter';
import Loader from './Loader';
import VoiceDropdown from './VoiceDropdown';
import useResize from '@/hooks/useResize';
import AUDIO_OPTIONS from '@/utils/options';
import {PDFDocumentProxy} from 'pdfjs-dist/types/src/display/api';
import {
    type ChangeEvent,
    type ChangeEventHandler,
    type EventHandler,
    useEffect,
    useRef,
    useState
} from 'react';
import {IoIosCloudUpload} from 'react-icons/io';
import {IoPlay, IoPause, IoCall, IoSettings} from 'react-icons/io5';
import {pdfjs, Document, Page} from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

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
    setCurrentPageIndex
    // setPages
}: {
    numPages: number;
    currentPageIndex: number;
    setCurrentPageIndex: (page: number) => void;
}) {
    const [ref, wrapper] = useResize<HTMLDivElement>();

    const [input, setInput] = useState<string>(
        (currentPageIndex + 1).toString()
    );

    useEffect(() => {
        if (!isNaN(parseInt(input))) {
            const page = parseInt(input) - 1;
            if (page >= 0 && page <= numPages) {
                setCurrentPageIndex(page);
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
                            onClick={() => setCurrentPageIndex(index)}
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

enum PlayingState {
    playing,
    notPlaying,
    loading
}

export default function Viewer() {
    const [file, setFile] = useState<string | File>('/example.pdf');
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>(0);

    // Store ref to PDFDocumentProxy for cleanup in `useEffect`.
    const document = useRef<PDFDocumentProxy>(null);
    const jobs = useRef<Promise<any>[]>([]);

    // Used for managing size of PDF depending on window size.
    // Uses custom hook `useResize`.
    const [ref, wrapper] = useResize<HTMLDivElement>();

    const audioElement = useRef<HTMLAudioElement>(null);

    // Audio options.
    const [voice, setVoice] = useState<string>(Object.keys(AUDIO_OPTIONS)[0]);

    const [playing, setPlaying] = useState<PlayingState>(
        PlayingState.notPlaying
    );
    useEffect(() => {
        if (playing === PlayingState.playing) {
            audioElement.current!.play();
        } else {
            audioElement.current!.pause();
        }
    }, [playing]);

    useEffect(() => {
        setPlaying(PlayingState.notPlaying);
        // Empty out jobs queue for past page.
        // This is janky but I'm a bit over my time allotment.
        Promise.all(jobs.current).then(() => {
            setPlaying(PlayingState.notPlaying);
        });
    }, [currentPageIndex]);

    const onLoadSuccess = (props: PDFDocumentProxy): void => {
        setNumPages(props.numPages);
        setCurrentPageIndex(0);
        document.current = props;
    };

    const upload = (event: ChangeEvent<HTMLInputElement>) => {
        const {files} = event.target;

        const opened = files?.[0];
        if (opened) setFile(opened);
    };

    const toggleTts = () => {
        setPlaying(playing => {
            if (playing === PlayingState.playing)
                return PlayingState.notPlaying;
            jobs.current.push(fetch('/api/tts', {
                method: 'POST',
                body: JSON.stringify({
                    voice,
                    text: ref.current!.textContent
                })
            })
                .then(res => res.blob())
                .then(blob => {
                    audioElement.current!.src =
                        window.URL.createObjectURL(blob);
                    setPlaying(PlayingState.playing);
                }));
            return PlayingState.loading;
        });
    };

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            const open = document.current;
            if (open) {
                open.cleanup();
                open.destroy();
            }
        }
    }, []);

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
                        setCurrentPageIndex={setCurrentPageIndex}
                    />
                </div>
                <div className='col-span-10 overflow-auto'>
                    <div
                        className='mx-3 max-h-full overflow-auto bg-neutral-200 pb-5 pt-3'
                        ref={ref}>
                        <Page
                            width={wrapper.width}
                            pageIndex={currentPageIndex}></Page>
                        {playing === PlayingState.loading && (
                            <div className='absolute z-50 h-full w-full bg-neutral-100 bg-opacity-50'>
                                <Loader />
                            </div>
                        )}
                    </div>
                </div>
            </Document>
            <div className='flex items-center justify-between border-t border-neutral-200 bg-white p-2 px-6'>
                <label className='cursor-pointer'>
                    <input onChange={upload} type='file' className='hidden' />
                    <IoIosCloudUpload className='text-xl text-neutral-700 transition-colors' />
                </label>
                <div className='flex items-center justify-center gap-4'>
                    <VoiceDropdown
                        voice={voice}
                        setVoice={setVoice}
                        options={AUDIO_OPTIONS}
                    />
                    <button
                        onClick={toggleTts}
                        disabled={playing === PlayingState.loading}
                        className='flex h-[45px] w-[45px] items-center justify-center rounded-full bg-lime-500 p-3 transition-all hover:bg-lime-600'>
                        {playing === PlayingState.notPlaying ? (
                            <IoPlay className='m-0 p-0 text-xl text-white' />
                        ) : playing === PlayingState.playing ? (
                            <IoPause className='m-0 p-0 text-xl text-white' />
                        ) : (
                            <Loader />
                        )}
                    </button>
                </div>
                <div>
                    {/* <button className='text-neutral-700 transition-colors hover:text-lime-500'>
                        <IoCall className='text-xl text-inherit' />
                    </button> */}
                </div>
            </div>
        </div>
    );
}
