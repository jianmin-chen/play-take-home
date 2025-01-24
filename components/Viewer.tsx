import { useEffect, useRef, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
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

export default function Viewer() {
    const [file, setFile] = useState<string | File>('/moonray.pdf');
    const [numPages, setNumPages] = useState<number>(0);

    const container = useRef<HTMLElement | undefined>(undefined);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    const onLoadSuccess = props => {
        setNumPages(props.numPages);
    };

    useEffect(() => {
        if (container.current) {
            setContainerWidth(container.current.offsetWidth);
        }
    }, []);

    return (
        <div className='flex h-screen w-full flex-col'>
                <div
                    className='grid grid-cols-12 h-full flex-1 overflow-auto bg-neutral-200'>
                        <div ref={container} className="mx-2 mt-2 col-span-9">
                    <Document
                        file={file}
                        onLoadSuccess={onLoadSuccess}
                        options={options}>
                        {Array.from(new Array(numPages), (_el, index) => (
                            <Page
                                className='border-slate-300 mb-2 shadow-lg'
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                width={containerWidth}
                            />
                        ))}
                    </Document>
                    </div>
            </div>
        </div>
    );
}
