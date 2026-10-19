import { expect, it } from "vitest";
import { shareContinuationEnd, shareSentenceEnds } from "./shareContinuation";

it.each(["This is a whole sentence. Another sentence continues here. ", "هذه جملة كاملة. وهذه جملة أخرى تستمر هنا. "])(
  "finds exact complete-sentence boundaries in %s",
  (text) => {
    const end = text.indexOf(".") + 2;
    expect(shareContinuationEnd(text, 0, end + 8, shareSentenceEnds(text), true)).toBe(end);
    expect(shareContinuationEnd(text, end, end + 8, shareSentenceEnds(text), false)).toBe(end);
  },
);

it("uses an existing clause only when a sentence alone exceeds the card", () => {
  const text = "A very long sentence, with more words continuing without a full stop until the end.";
  const limit = text.indexOf("continuing");
  expect(shareContinuationEnd(text, 0, limit, shareSentenceEnds(text), true)).toBe(text.indexOf(",") + 2);
});
