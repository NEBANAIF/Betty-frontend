import common from './common.js';
import pages1 from './pages1.js';
import pages2 from './pages2.js';
import pages3 from './pages3.js';
import patterns from './patterns.js';
import backend from './backend.js';

// Later files win when the same English text appears twice.
export const EXACT = { ...common, ...pages1, ...pages2, ...pages3, ...backend.exact };
export const PATTERNS = { ...patterns, ...backend.patterns };
