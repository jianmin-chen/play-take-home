// See README.md.

type Highlight = Element & {
    // createObjectUrl returns appropriate result.
    audioElement: HTMLAudioElement
};

export default class Highlighter {
    nodes: Highlight[];
    index: number;

    constructor(parent: Element) {
        this.nodes = Array.from(parent.childNodes).filter(child => {
            if (child.textContent && child.textContent.trim().length)
                return true;
            return false;
        }) as Highlight[];
        this.index = 0;
    }

    async load({voice}: {voice: string}, callback: () => any): Promise<void> {
        await Promise.all(
            this.nodes.map(async (node, index) => {
                if (!node.audioElement) {
                    const blob = await (
                        await fetch('/api/tts', {
                            method: 'POST',
                            body: JSON.stringify({
                                voice,
                                text: node.textContent
                            })
                        })
                    ).blob();
                    node.audioElement = new Audio();
                    node.audioElement.src = window.URL.createObjectURL(blob);
                    console.log(node.audioElement.src, index, this.nodes.length);
                }
            })
        );
        callback();
    }

    next({scroll}: {scroll: boolean} = {scroll: true}): HTMLAudioElement | null {
        const selection = window.getSelection();
        const range = document.createRange();
        const node = this.nodes[this.index++];
        if (!node) return null;
        range.selectNodeContents(node);
        selection?.removeAllRanges();
        selection?.addRange(range);
        if (scroll)
            node.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            });
        return node.audioElement!;
    }

    hide() {
        window.getSelection()?.removeAllRanges();
    }

    pause() {
        this.hide();
    }

    reset() {
        this.index = 0;
        this.hide();
    }
}
