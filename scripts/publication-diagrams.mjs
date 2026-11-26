const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

/** Source-bound schematic diagrams. Physical routes never mirror with UI direction. */
export function publicationDiagram(block) {
  const id = `diagram-${block.kind}-${block.sourcePage}`;
  const marker = `<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="currentColor"/></marker></defs>`;
  let drawing;
  let viewBox;
  if (block.kind === "tawaf") {
    viewBox = "0 0 400 250";
    drawing = `${marker}<path class="diagram-route" d="M253.74 178.74 A76 76 0 1 0 238 190.82" marker-end="url(#${id}-arrow)"/><path class="diagram-house" d="M173 98h54v54h-54Z"/><path d="M173 111h54" class="diagram-detail"/><circle cx="227" cy="152" r="4" class="diagram-point"/><path d="m231 156 26 26" class="diagram-detail"/><text x="200" y="136" text-anchor="middle">Ka'bah</text><text x="200" y="23" text-anchor="middle" class="diagram-emphasis">7 anticlockwise circuits</text><text x="267" y="196">Start at the</text><text x="267" y="216">Black Stone</text>`;
  } else if (block.kind === "sai") {
    viewBox = "0 0 400 310";
    drawing = `${marker}<text x="58" y="24" text-anchor="middle" class="diagram-emphasis">al-Safa</text><text x="342" y="24" text-anchor="middle" class="diagram-emphasis">al-Marwah</text>${Array.from(
      { length: 7 },
      (_, index) => {
        const y = 52 + index * 33;
        const forward = index % 2 === 0;
        return `<path class="diagram-route" data-passage="${index + 1}" d="M${forward ? 70 : 330} ${y}H${forward ? 330 : 70}" marker-end="url(#${id}-arrow)"/><circle class="diagram-count" cx="200" cy="${y}" r="13"/><text x="200" y="${y + 5}" text-anchor="middle">${index + 1}</text>`;
      },
    ).join(
      "",
    )}<text x="58" y="301" text-anchor="middle">Start</text><text x="342" y="301" text-anchor="middle">Finish</text>`;
  } else throw new Error(`Unknown source diagram ${block.kind}`);
  return `<figure class="teaching-diagram" data-diagram="${block.kind}" data-diagram-source="${block.sourcePage}"><h4 id="${id}-title">${escape(block.title)}</h4><svg viewBox="${viewBox}" role="img" aria-labelledby="${id}-title ${id}-description" focusable="false"><desc id="${id}-description">${escape(block.description)}</desc>${drawing}</svg><figcaption>${escape(block.caption)} <a tabindex="0" href="#p-${block.sourcePage}">Arabic source p. ${block.sourcePage}</a></figcaption></figure>`;
}
