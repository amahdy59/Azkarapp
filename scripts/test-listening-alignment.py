"""Standard-library checks for offline authoring; no model download is needed."""

import importlib.util
import pathlib
import sys
import unittest

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("alignment", pathlib.Path(__file__).with_name("align-listening-audio.py"))
alignment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(alignment)


class Frames:
    def __init__(self, values):
        self.values = values

    def argmax(self, axis):
        assert axis == -1
        return self

    def tolist(self):
        return self.values


class AlignmentSpellingTests(unittest.TestCase):
    def test_arabic_recognition_anchors_match_supplied_spelling(self):
        self.assertEqual(alignment.alignment_spelling("ٱلْحَمْـدُ", "ar"), "الحمد")
        self.assertEqual(alignment.alignment_spelling("اللَّهِ", "ar"), "الله")

    def test_english_apostrophe_and_hyphen_preserve_display_identity(self):
        self.assertEqual(alignment.alignment_spelling("Allah’s well-being", "en"), "ALLAH'S WELLBEING")

    def test_ctc_repeated_frames_and_blank_separated_letters(self):
        words = alignment.greedy_words(Frames([1, 1, 0, 1, 2, 2, 3]), {"<pad>": 0, "ا": 1, "َ": 2, "|": 3}, 0, "|", "ar")
        self.assertEqual(words, [{"text": "ااَ", "alignmentText": "اا", "start": 0, "end": 6}])


if __name__ == "__main__":
    unittest.main()
