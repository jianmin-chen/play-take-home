import Controls from './Controls';
import Dropdown from './Dropdown';
import Loader from './Loader';
import useResize from '@/hooks/useResize';
import AUDIO_OPTIONS from '@/utils/options';
import type {PDFDocumentProxy} from 'pdfjs-dist';
import {
    type ChangeEvent,
    ChangeEventHandler,
    EventHandler,
    useEffect,
    useRef,
    useState
} from 'react';
import {FaPlay} from 'react-icons/fa';
import {IoIosCloudUpload} from 'react-icons/io';
import {IoPlay} from 'react-icons/io5';
import {PiHighlighterDuotone} from 'react-icons/pi';
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
    currentPage,
    setCurrentPage
    // setPages
}: {
    numPages: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}) {
    const [ref, wrapper] = useResize<HTMLDivElement>();

    const [input, setInput] = useState<string>((currentPage + 1).toString());

    useEffect(() => {
        if (!isNaN(parseInt(input))) {
            const page = parseInt(input) - 1;
            if (page >= 0 && page <= numPages) setCurrentPage(page);
        }
    }, [input]);

    useEffect(() => {
        setInput((currentPage + 1).toString());
    }, [currentPage]);

    return (
        <div className='relative h-screen max-h-screen overflow-auto border-r bg-neutral-300 pb-3'>
            <div className='sticky top-0 z-50 mb-3 flex items-center justify-center gap-1 bg-neutral-300 px-3 py-3 shadow-sm'>
                <input
                    onChange={event => setInput(event.target.value)}
                    value={input}
                    type='text'
                    className='rounded-md border-2 border-transparent bg-neutral-200 text-center font-mono text-xs text-neutral-500 shadow-sm outline-none transition-all focus:border-lime-600'
                />
                <p className='text-sm text-neutral-500'>/{numPages}</p>
            </div>
            <div className='mx-3 mb-1' ref={ref}>
                {Array.from(new Array(numPages), (_el, index) => (
                    <div className='mb-1'>
                        <Page
                            onClick={() => setCurrentPage(index)}
                            key={`page_${index + 1}`}
                            width={wrapper.width - 4}
                            pageIndex={index}
                            className={[
                                'children-select-none border-2 transition-all',
                                index === currentPage
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
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [numPages, setNumPages] = useState<number>(0);

    const document = useRef<PDFDocumentProxy>(null);

    const [audioOption, setAudioOption] = useState<number>(0);

    const [ref, wrapper] = useResize<HTMLDivElement>();

    const onLoadSuccess = (props: PDFDocumentProxy): void => {
        setNumPages(props.numPages);
        setCurrentPage(0);
        document.current = props;
    };

    const upload = (event: ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;

        const opened = files?.[0];
        if (opened) setFile(opened);
    }

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

    const tts = async (ctx: string) => {
        // Convert `ctx` to speech.
    };

    return (
        <div className='relative flex h-screen max-h-screen w-full flex-col'>
            <Document
                className='grid max-h-full flex-1 grid-cols-12 overflow-y-hidden'
                file={file}
                onLoadSuccess={onLoadSuccess}
                options={options}>
                <div className='col-span-2 max-h-full'>
                    <Slider
                        numPages={numPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
                <div className='col-span-10 overflow-auto'>
                    <div
                        className='mx-3 max-h-full overflow-auto bg-neutral-200 pb-5 pt-3'
                        ref={ref}>
                        <Page
                            className=''
                            width={wrapper.width}
                            pageIndex={currentPage}
                        />
                    </div>
                </div>
            </Document>
            <div className='flex items-center justify-between border-t border-neutral-200 bg-white p-2'>
                <label className="cursor-pointer">
                    <input onChange={upload} type='file' className="hidden" />
                    <IoIosCloudUpload />
                </label>
                <button className='flex h-[45px] w-[45px] items-center justify-center rounded-full bg-lime-500 p-3 transition-all hover:bg-lime-600'>
                    <IoPlay className='m-0 p-0 text-xl text-white' />
                </button>
                <div></div>
            </div>
        </div>
    );
}
