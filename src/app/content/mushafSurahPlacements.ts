/**
 * Canonical Surah header and Bismillah line placements for all 114 Surahs
 * based on the 15-line Madani / King Fahd Complex Mushaf geometry (DEC-089).
 */
export interface SurahPlacement {
  page: number;
  line: number;
  bismillahLine?: number;
  openingBand?: boolean;
}

export const SURAH_PLACEMENTS: Record<number, SurahPlacement> = {
  "1": {
    page: 1,
    line: 1,
    openingBand: true,
  },
  "2": {
    page: 2,
    line: 1,
    bismillahLine: 2,
  },
  "3": {
    page: 50,
    line: 1,
    bismillahLine: 2,
  },
  "4": {
    page: 76,
    line: 15,
  },
  "5": {
    page: 106,
    line: 6,
    bismillahLine: 7,
  },
  "6": {
    page: 128,
    line: 1,
    bismillahLine: 2,
  },
  "7": {
    page: 151,
    line: 1,
    bismillahLine: 2,
  },
  "8": {
    page: 177,
    line: 1,
    bismillahLine: 2,
  },
  "9": {
    page: 187,
    line: 1,
    openingBand: true,
  },
  "10": {
    page: 207,
    line: 15,
  },
  "11": {
    page: 221,
    line: 7,
    bismillahLine: 8,
  },
  "12": {
    page: 235,
    line: 9,
    bismillahLine: 10,
  },
  "13": {
    page: 249,
    line: 1,
    bismillahLine: 2,
  },
  "14": {
    page: 255,
    line: 3,
    bismillahLine: 4,
  },
  "15": {
    page: 262,
    line: 1,
    bismillahLine: 2,
  },
  "16": {
    page: 267,
    line: 7,
    bismillahLine: 8,
  },
  "17": {
    page: 282,
    line: 1,
    bismillahLine: 2,
  },
  "18": {
    page: 293,
    line: 10,
    bismillahLine: 11,
  },
  "19": {
    page: 305,
    line: 1,
    bismillahLine: 2,
  },
  "20": {
    page: 312,
    line: 5,
    bismillahLine: 6,
  },
  "21": {
    page: 322,
    line: 1,
    bismillahLine: 2,
  },
  "22": {
    page: 331,
    line: 15,
  },
  "23": {
    page: 341,
    line: 15,
  },
  "24": {
    page: 349,
    line: 15,
  },
  "25": {
    page: 359,
    line: 11,
    bismillahLine: 12,
  },
  "26": {
    page: 366,
    line: 15,
  },
  "27": {
    page: 376,
    line: 15,
  },
  "28": {
    page: 385,
    line: 8,
    bismillahLine: 9,
  },
  "29": {
    page: 396,
    line: 8,
    bismillahLine: 9,
  },
  "30": {
    page: 404,
    line: 10,
    bismillahLine: 11,
  },
  "31": {
    page: 411,
    line: 1,
    bismillahLine: 2,
  },
  "32": {
    page: 414,
    line: 15,
  },
  "33": {
    page: 417,
    line: 15,
  },
  "34": {
    page: 428,
    line: 1,
    bismillahLine: 2,
  },
  "35": {
    page: 434,
    line: 8,
    bismillahLine: 9,
  },
  "36": {
    page: 440,
    line: 4,
    bismillahLine: 5,
  },
  "37": {
    page: 445,
    line: 15,
  },
  "38": {
    page: 452,
    line: 15,
  },
  "39": {
    page: 458,
    line: 4,
    bismillahLine: 5,
  },
  "40": {
    page: 467,
    line: 3,
    bismillahLine: 4,
  },
  "41": {
    page: 477,
    line: 1,
    bismillahLine: 2,
  },
  "42": {
    page: 483,
    line: 1,
    bismillahLine: 2,
  },
  "43": {
    page: 489,
    line: 5,
    bismillahLine: 6,
  },
  "44": {
    page: 496,
    line: 1,
    bismillahLine: 2,
  },
  "45": {
    page: 498,
    line: 15,
  },
  "46": {
    page: 502,
    line: 7,
    bismillahLine: 8,
  },
  "47": {
    page: 506,
    line: 15,
  },
  "48": {
    page: 511,
    line: 1,
    bismillahLine: 2,
  },
  "49": {
    page: 515,
    line: 7,
    bismillahLine: 8,
  },
  "50": {
    page: 518,
    line: 1,
    bismillahLine: 2,
  },
  "51": {
    page: 520,
    line: 12,
    bismillahLine: 13,
  },
  "52": {
    page: 523,
    line: 8,
    bismillahLine: 9,
  },
  "53": {
    page: 525,
    line: 15,
  },
  "54": {
    page: 528,
    line: 10,
    bismillahLine: 11,
  },
  "55": {
    page: 531,
    line: 5,
    bismillahLine: 6,
  },
  "56": {
    page: 534,
    line: 7,
    bismillahLine: 8,
  },
  "57": {
    page: 537,
    line: 11,
    bismillahLine: 12,
  },
  "58": {
    page: 542,
    line: 1,
    bismillahLine: 2,
  },
  "59": {
    page: 545,
    line: 7,
    bismillahLine: 8,
  },
  "60": {
    page: 548,
    line: 15,
  },
  "61": {
    page: 551,
    line: 7,
    bismillahLine: 8,
  },
  "62": {
    page: 553,
    line: 1,
    bismillahLine: 2,
  },
  "63": {
    page: 554,
    line: 7,
    bismillahLine: 8,
  },
  "64": {
    page: 555,
    line: 15,
  },
  "65": {
    page: 557,
    line: 15,
  },
  "66": {
    page: 560,
    line: 1,
    bismillahLine: 2,
  },
  "67": {
    page: 562,
    line: 1,
    bismillahLine: 2,
  },
  "68": {
    page: 564,
    line: 6,
    bismillahLine: 7,
  },
  "69": {
    page: 566,
    line: 10,
    bismillahLine: 11,
  },
  "70": {
    page: 568,
    line: 9,
    bismillahLine: 10,
  },
  "71": {
    page: 570,
    line: 5,
    bismillahLine: 6,
  },
  "72": {
    page: 572,
    line: 1,
    bismillahLine: 2,
  },
  "73": {
    page: 574,
    line: 1,
    bismillahLine: 2,
  },
  "74": {
    page: 575,
    line: 8,
    bismillahLine: 9,
  },
  "75": {
    page: 577,
    line: 6,
    bismillahLine: 7,
  },
  "76": {
    page: 578,
    line: 10,
    bismillahLine: 11,
  },
  "77": {
    page: 580,
    line: 7,
    bismillahLine: 8,
  },
  "78": {
    page: 582,
    line: 1,
    bismillahLine: 2,
  },
  "79": {
    page: 583,
    line: 8,
    bismillahLine: 9,
  },
  "80": {
    page: 584,
    line: 15,
  },
  "81": {
    page: 586,
    line: 2,
    bismillahLine: 3,
  },
  "82": {
    page: 587,
    line: 1,
    bismillahLine: 2,
  },
  "83": {
    page: 587,
    line: 12,
    bismillahLine: 13,
  },
  "84": {
    page: 589,
    line: 3,
    bismillahLine: 4,
  },
  "85": {
    page: 590,
    line: 2,
    bismillahLine: 3,
  },
  "86": {
    page: 591,
    line: 1,
    bismillahLine: 2,
  },
  "87": {
    page: 591,
    line: 10,
    bismillahLine: 11,
  },
  "88": {
    page: 592,
    line: 5,
    bismillahLine: 6,
  },
  "89": {
    page: 593,
    line: 3,
    bismillahLine: 4,
  },
  "90": {
    page: 594,
    line: 6,
    bismillahLine: 7,
  },
  "91": {
    page: 595,
    line: 2,
    bismillahLine: 3,
  },
  "92": {
    page: 595,
    line: 11,
    bismillahLine: 12,
  },
  "93": {
    page: 596,
    line: 6,
    bismillahLine: 7,
  },
  "94": {
    page: 596,
    line: 13,
    bismillahLine: 14,
  },
  "95": {
    page: 597,
    line: 3,
    bismillahLine: 4,
  },
  "96": {
    page: 597,
    line: 9,
    bismillahLine: 10,
  },
  "97": {
    page: 598,
    line: 4,
    bismillahLine: 5,
  },
  "98": {
    page: 598,
    line: 9,
    bismillahLine: 10,
  },
  "99": {
    page: 599,
    line: 6,
    bismillahLine: 7,
  },
  "100": {
    page: 599,
    line: 12,
    bismillahLine: 13,
  },
  "101": {
    page: 600,
    line: 4,
    bismillahLine: 5,
  },
  "102": {
    page: 600,
    line: 11,
    bismillahLine: 12,
  },
  "103": {
    page: 601,
    line: 1,
    bismillahLine: 2,
  },
  "104": {
    page: 601,
    line: 5,
    bismillahLine: 6,
  },
  "105": {
    page: 601,
    line: 11,
    bismillahLine: 12,
  },
  "106": {
    page: 602,
    line: 1,
    bismillahLine: 2,
  },
  "107": {
    page: 602,
    line: 6,
    bismillahLine: 7,
  },
  "108": {
    page: 602,
    line: 12,
    bismillahLine: 13,
  },
  "109": {
    page: 603,
    line: 1,
    bismillahLine: 2,
  },
  "110": {
    page: 603,
    line: 6,
    bismillahLine: 7,
  },
  "111": {
    page: 603,
    line: 11,
    bismillahLine: 12,
  },
  "112": {
    page: 604,
    line: 1,
    bismillahLine: 2,
  },
  "113": {
    page: 604,
    line: 5,
    bismillahLine: 6,
  },
  "114": {
    page: 604,
    line: 10,
    bismillahLine: 11,
  },
};
