/**
 * Application constants
 */

// Default server port
export const DEFAULT_PORT = 3000;

// Environment variable keys
export const ENV = {
  FIGMA_ACCESS_TOKEN: 'FIGMA_ACCESS_TOKEN',
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
  CORS_ALLOWED_ORIGINS: 'CORS_ALLOWED_ORIGINS',
  ALLOW_LOCALHOST: 'ALLOW_LOCALHOST',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FIGMA_TOKEN_MISSING: 'FIGMA_ACCESS_TOKEN environment variable is not set',
  INVALID_FIGMA_URL: 'Invalid Figma URL',
  INVALID_LIVE_URL: 'figmaUrl and liveUrl are required',
} as const;

// URL validation constants
export const ALLOWED_URL_SCHEMES = ['http:', 'https:'] as const;
export const FORBIDDEN_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1'] as const;

/**
 * Device scale factor for Playwright screenshot capture.
 *
 * Matches Figma's default 2x export scale for Retina/high-density displays.
 * Ensures visual comparisons are pixel-perfect for high-DPI screens.
 *
 * WHY 2x?
 * - Figma exports at 2x by default via /images endpoint
 * - Playwright screenshot at 1x would result in only top-left quarter
 *   being visible during comparison (misaligned coordinate systems)
 * - Modern displays are 2x-3x, so 1x comparisons miss actual pixel differences
 *
 * @constant
 */
export const DEVICE_SCALE_FACTOR = 2;

/**
 * Multiplier for viewport dimensions to match deviceScaleFactor.
 *
 * WHY width × 2?
 * - Viewport in Playwright is CSS pixels by default
 * - deviceScaleFactor: 2 scales rendering internally
 * - Setting viewport to width × 2 ensures layout remains stable
 * - Prevents layout shifts when capturing large components on small screens
 *
 * @constant
 */
export const VIEWPORT_SCALE_MULTIPLIER = 2;

/**
 * Minimum viewport width for screenshot capture.
 *
 * WHY 1280?
 * - Laptop/desktop standard resolution (16:9 aspect ratio base)
 * - Prevents layout compression when capturing small components
 * - Ensures flex/grid layouts don't wrap unexpectedly
 * - Common breakpoint for responsive designs (mobile vs desktop)
 *
 * @constant
 */
export const MIN_VIEWPORT_WIDTH = 1280;

/**
 * Minimum viewport height for screenshot capture.
 *
 * WHY 720?
 * - Laptop/desktop standard height (16:9 aspect ratio base)
 * - Matches typical 720p minimum resolution
 * - Prevents layout compression when capturing tall components
 *
 * @constant
 */
export const MIN_VIEWPORT_HEIGHT = 720;

/**
 * Maximum confidence score possible in component matching algorithm.
 *
 * WHY 6.0?
 * - Maximum possible score breakdown:
 *   - Size match (perfect): 3.0 points
 *   - Background color match: 1.0 point
 *   - Text color match: 1.0 point
 *   - Text presence check: 1.0 point
 * - Used to normalize confidence to 0-1 range: confidence = score / 6.0
 *
 * @see docs/algorithms.md for detailed scoring algorithm
 * @constant
 */
export const MAX_MATCH_SCORE = 6.0;

/**
 * Minimum confidence threshold for accepting a component match.
 *
 * WHY 0.3?
 * - 30% match is the floor for "plausible" component identification
 * - Lower threshold would risk matching random elements
 * - Higher threshold would miss valid matches with styling variations
 * - Practical: A 2.0/6.0 score (perfect size + one color match)
 *
 * Used in:
 * - screenshot.ts line 65: Confidence check before applying clip
 *
 * @constant
 */
export const MIN_CONFIDENCE_THRESHOLD = 0.3;

/**
 * Timeout for page navigation and screenshot capture.
 *
 * WHY 30 seconds?
 * - Allows time for slow networks to load resources
 * - Accounts for delayed render (lazy-loaded content, animations)
 * - Timeout on page.goto() prevents hanging indefinitely
 * - 30s is generous without being excessive
 *
 * @constant
 */
export const SCREENSHOT_TIMEOUT_MS = 30000;

/**
 * Perfect size match tolerance threshold (percentage).
 *
 * WHY 10%?
 * - Accounts for rounding errors in Figma-to-DOM translation
 * - Accepts minor rendering differences (sub-pixel anti-aliasing)
 * - Filters out clearly mismatched elements
 * - Example: 300px vs 330px is <10% and considered perfect
 *
 * Awards SIZE_MATCH_PERFECT_SCORE (3.0 points)
 *
 * @constant
 */
export const SIZE_TOLERANCE_PERFECT = 0.1;

/**
 * Close size match tolerance threshold (percentage).
 *
 * WHY 30%?
 * - Captures responsive layout variations
 * - Accepts slight sizing differences from theming or spacing
 * - Filters elements that are clearly wrong size
 * - Example: 300px vs 400px is 33% (close), 300px vs 500px is 67% (no match)
 *
 * Awards SIZE_MATCH_CLOSE_SCORE (1.5 points)
 *
 * @constant
 */
export const SIZE_TOLERANCE_CLOSE = 0.3;

/**
 * Tolerable size match threshold (percentage).
 *
 * WHY 50%?
 * - Upper bound for any plausible component match
 * - Allows for significant responsive scaling
 * - Still filters obviously wrong elements
 * - Example: 200px vs 300px is <50%, 150px vs 400px is >50%
 *
 * Awards SIZE_MATCH_TOLERABLE_SCORE (0.5 points)
 *
 * @constant
 */
export const SIZE_TOLERANCE_TOLERABLE = 0.5;

/**
 * Points awarded for perfect size match (<10% deviation).
 *
 * WHY 3.0?
 * - Size is primary identity signal (most weight in scoring)
 * - Geometry is less mutable than styling (colors/fonts can change)
 * - 3.0 points is 50% of MAX_MATCH_SCORE, reflecting priority
 *
 * @constant
 */
export const SIZE_MATCH_PERFECT_SCORE = 3.0;

/**
 * Points awarded for close size match (<30% deviation).
 *
 * WHY 1.5?
 * - Half of perfect score, still rewards geometry alignment
 * - Accepts responsive variations while prioritizing exact matches
 * - 1.5 points is 25% of MAX_MATCH_SCORE
 *
 * @constant
 */
export const SIZE_MATCH_CLOSE_SCORE = 1.5;

/**
 * Points awarded for tolerable size match (<50% deviation).
 *
 * WHY 0.5?
 * - Minor reward for "in the ballpark" size match
 * - Helps differentiate from clearly wrong sizes (0 points)
 * - 0.5 points is ~8% of MAX_MATCH_SCORE
 *
 * @constant
 */
export const SIZE_MATCH_TOLERABLE_SCORE = 0.5;

/**
 * Points awarded for background color match.
 *
 * WHY 1.0?
 * - Secondary signal after geometry (color is mutable)
 * - Theming can change background color while element remains identical
 * - 1.0 point = ~17% of MAX_MATCH_SCORE
 *
 * @constant
 */
export const BACKGROUND_COLOR_MATCH_SCORE = 1.0;

/**
 * Points awarded for text color match.
 *
 * WHY 1.0?
 * - Secondary signal after geometry (text color is mutable)
 * - Theming can change text color while element remains identical
 * - 1.0 point = ~17% of MAX_MATCH_SCORE
 *
 * @constant
 */
export const TEXT_COLOR_MATCH_SCORE = 1.0;

/**
 * Points awarded for text presence match.
 *
 * WHY 1.0?
 * - Validates semantic structure (has text vs no text)
 * - Not content matching (actual text comparison is harder)
 * - 1.0 point = ~17% of MAX_MATCH_SCORE
 *
 * @constant
 */
export const TEXT_PRESENCE_SCORE = 1.0;

/**
 * Default threshold for pixel-level visual comparison (pixelmatch).
 *
 * WHY 0.1?
 * - Standard threshold for pixelmatch to ignore sub-pixel anti-aliasing.
 * - Values between 0 (strict) and 1 (permissive).
 * - 0.1 is the industry standard for "visibly identical" but technically different pixels.
 * - Used to differentiate between compression artifacts and actual design drift.
 *
 * @constant
 */
export const PIXELMATCH_THRESHOLD = 0.1;

