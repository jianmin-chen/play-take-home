import React, {type Ref, useEffect, useRef, useState} from 'react';

interface Dimension {
    width: number;
    height: number;
}

export default function useResize<T extends HTMLElement>(): [
    React.RefObject<T | null>,
    Dimension
] {
    const ref = useRef<T>(null);
    const [size, setSize] = useState<Dimension>({width: 0, height: 0});

    useEffect(() => {
        const container = ref.current;

        if (!container) return;

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            setSize({
                width: rect.width,
                height: rect.height
            });
        };

        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });

        resizeObserver.observe(container);

        updateSize();

        return () => {
            resizeObserver.disconnect();
        };
    }, [ref.current]);

    return [ref, size];
}
