export default class Highlighter {
    nodes: Element[]
    index: number

    constructor(parent: Element) {
        this.nodes = Array.from(parent.childNodes).filter(child => {
            if (child.textContent && child.textContent.trim().length) return true;
            return false;
        }) as Element[];
        this.index = 0
    }

    next({scroll}: {scroll: boolean}={scroll: true}): string | null {
        const selection = window.getSelection();
        const range = document.createRange();
        const node = this.nodes[this.index++];
        if (!node) return null;
        range.selectNodeContents(node);
        selection?.removeAllRanges();
        selection?.addRange(range);
        if (scroll) node.scrollIntoView({behavior: "smooth"});
        return node.textContent;
    }

    hide() {
        window.getSelection()?.removeAllRanges();
    }

    reset() {
        this.index = 0;
        this.hide();
    }
}

