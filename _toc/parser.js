export function slugifyHeading(value) {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
function parseBlocks(body) {
    const blocks = [];
    const lines = (body ?? "").replace(/\r\n/g, "\n").split("\n");
    let paragraph = [];
    let listItems = [];
    let listOrdered = false;
    const flushParagraph = () => {
        if (paragraph.length > 0) {
            blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
            paragraph = [];
        }
    };
    const flushList = () => {
        if (listItems.length > 0) {
            blocks.push({ kind: "list", ordered: listOrdered, items: listItems });
            listItems = [];
        }
    };
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line === "") {
            flushParagraph();
            flushList();
            continue;
        }
        const heading = /^(#{1,3})\s+(.*)$/.exec(line);
        if (heading) {
            flushParagraph();
            flushList();
            const hashes = heading[1] ?? "#";
            const headingText = (heading[2] ?? "").trim();
            const level = hashes.length;
            blocks.push({ kind: "heading", level, text: headingText, id: slugifyHeading(headingText) });
            continue;
        }
        if (/^(---|\*\*\*)\s*$/.test(line)) {
            flushParagraph();
            flushList();
            blocks.push({ kind: "rule" });
            continue;
        }
        const quote = /^>\s?(.*)$/.exec(line);
        if (quote) {
            flushParagraph();
            flushList();
            blocks.push({ kind: "quote", text: (quote[1] ?? "").trim() });
            continue;
        }
        const bullet = /^[-*]\s+(.*)$/.exec(line);
        const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
        if (bullet || numbered) {
            flushParagraph();
            const ordered = Boolean(numbered);
            if (listItems.length > 0 && listOrdered !== ordered)
                flushList();
            listOrdered = ordered;
            listItems.push((bullet?.[1] ?? numbered?.[1] ?? "").trim());
        }
        else {
            flushList();
            paragraph.push(line);
        }
    }
    flushParagraph();
    flushList();
    return blocks;
}
export function extractToc(body, minLevel = 2) {
    return parseBlocks(body)
        .filter((block) => block.kind === "heading")
        .filter((block) => block.level >= minLevel)
        .map((block) => ({ id: block.id, text: block.text, level: block.level }));
}
