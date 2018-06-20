
/**
 * ranges
 *
 * Utilities for working with TimeRanges.
 *
 */

import videojs from 'video.js';
// Fudge factor to account for TimeRanges rounding
const TIME_FUDGE_FACTOR = 1 / 30;

// Comparisons between time values such as current time and the end of the buffered range
// can be misleading because of precision differences or when the current media has poorly
// aligned audio and video, which can cause values to be slightly off from what you would
// expect. This value is what we consider to be safe to use in such comparisons to account
// for these scenarios.
const SAFE_TIME_DELTA = TIME_FUDGE_FACTOR * 3;

/**
 * Clamps a value to within a range
 * @param {Number} num - the value to clamp
 * @param {Number} start - the start of the range to clamp within, inclusive
 * @param {Number} end - the end of the range to clamp within, inclusive
 * @return {Number}
 */




