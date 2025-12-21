/**
 * Bespoke.js Speaker View Plugin
 * Enables dual-window speaker view with slide sync, timer, and notes
 */

const CHANNEL_NAME = 'bespoke-speaker-view';
const KEY_S = 's';
const MESSAGE_TYPES = {
    SLIDE_CHANGE: 'SLIDE_CHANGE',
    SYNC_REQUEST: 'SYNC_REQUEST',
    SYNC_RESPONSE: 'SYNC_RESPONSE',
    TIMER_START: 'TIMER_START',
    TIMER_PAUSE: 'TIMER_PAUSE',
    WINDOW_READY: 'WINDOW_READY',
    KEYDOWN: 'KEYDOWN',
    NAVIGATE_TO_SLIDE: 'NAVIGATE_TO_SLIDE',
};

export function speakerView(config = {}) {
    const {
        notes = 'aside.speaker-notes',
    } = config;

    return (deck) => {
        // Check if we're in speaker view mode
        const urlParams = new URLSearchParams(window.location.search);
        const isSpeakerView = urlParams.has('speaker-view');

        if (isSpeakerView) {
            initializeSpeakerWindow(deck, { notes });
        } else {
            initializeMainWindow(deck, { notes });
        }
    };
}

/**
 * Initialize main window (presentation view)
 */
function initializeMainWindow(deck, config) {
    const { notes: notesSelector } = config;

    // Set up communication channel
    let channel;
    try {
        channel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
        console.warn('BroadcastChannel not available, using postMessage fallback');
        channel = createPostMessageChannel();
    }

    let speakerWindow = null;
    let timerStartTime = null;
    let timerPaused = false;
    let timerPauseTime = null;

    // Open speaker window
    function openSpeakerWindow() {
        if (speakerWindow && !speakerWindow.closed) {
            speakerWindow.focus();
            return;
        }

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('speaker-view', '');
        const speakerUrl = currentUrl.toString();

        speakerWindow = window.open(
            speakerUrl,
            'bespoke-speaker-view',
            'width=1280,height=800,menubar=no,toolbar=no,location=no,status=no'
        );

        if (!speakerWindow) {
            console.error('Failed to open speaker window. Please allow popups.');
            return;
        }

        // Clean up on window close
        const checkClosed = setInterval(() => {
            if (speakerWindow && speakerWindow.closed) {
                clearInterval(checkClosed);
                speakerWindow = null;
            }
        }, 1000);
    }

    // Broadcast slide change
    function broadcastSlideChange() {
        const index = deck.slide();
        const currentSlide = deck.slides[index];
        const notes = currentSlide ? currentSlide.querySelectorAll(notesSelector) : [];
        const notesContent = Array.from(notes).map(n => n.outerHTML).join('');

        const message = {
            type: MESSAGE_TYPES.SLIDE_CHANGE,
            index,
            totalSlides: deck.slides.length,
            notes: notesContent,
        };

        sendMessage(channel, message);
    }

    // Broadcast timer start
    function startTimer() {
        timerStartTime = Date.now();
        timerPaused = false;
        timerPauseTime = null;
        sendMessage(channel, {
            type: MESSAGE_TYPES.TIMER_START,
            startTime: timerStartTime,
        });
    }

    // Broadcast timer pause
    function pauseTimer() {
        if (timerStartTime && !timerPaused) {
            timerPaused = true;
            timerPauseTime = Date.now();
            sendMessage(channel, {
                type: MESSAGE_TYPES.TIMER_PAUSE,
                pauseTime: timerPauseTime,
            });
        }
    }

    // Handle incoming messages
    function handleMessage(event) {
        const message = event.data || event;

        switch (message.type) {
            case MESSAGE_TYPES.SYNC_REQUEST:
                // Send current state
                const index = deck.slide();
                const currentSlide = deck.slides[index];
                const notes = currentSlide ? currentSlide.querySelectorAll(notesSelector) : [];

                sendMessage(channel, {
                    type: MESSAGE_TYPES.SYNC_RESPONSE,
                    index,
                    totalSlides: deck.slides.length,
                    notes: Array.from(notes).map(n => n.outerHTML).join(''),
                    timerStartTime,
                    timerPaused,
                });
                break;

            case MESSAGE_TYPES.WINDOW_READY:
                // Speaker window is ready, send initial sync
                broadcastSlideChange();
                if (timerStartTime) {
                    sendMessage(channel, {
                        type: MESSAGE_TYPES.TIMER_START,
                        startTime: timerStartTime,
                    });
                }
                break;

            case MESSAGE_TYPES.KEYDOWN:
                // Forward key events from speaker window
                if (message.key) {
                    document.dispatchEvent(new KeyboardEvent('keydown', {
                        key: message.key,
                        code: message.code,
                        keyCode: message.keyCode,
                        which: message.keyCode,
                        bubbles: true,
                        cancelable: true,
                    }));
                }
                break;

            case MESSAGE_TYPES.NAVIGATE_TO_SLIDE:
                // Navigate to specific slide
                if (typeof message.index === 'number' && message.index >= 0 && message.index < deck.slides.length) {
                    deck.slide(message.index);
                }
                break;
        }
    }

    // Set up message listener
    if (channel.addEventListener) {
        channel.addEventListener('message', handleMessage);
    } else if (channel.onmessage !== undefined) {
        channel.onmessage = handleMessage;
    } else {
        // Fallback to window postMessage
        window.addEventListener('message', (event) => {
            if (event.data && event.data.channel === CHANNEL_NAME) {
                handleMessage(event);
            }
        });
    }

    // Listen to slide changes
    deck.on('activate', () => {
        broadcastSlideChange();
    });

    // Start timer on first slide activation
    let firstActivation = true;
    deck.on('activate', () => {
        if (firstActivation) {
            firstActivation = false;
            startTimer();
        }
    });

    // Add 's' key handler to open speaker view
    deck.addKeyHandler(KEY_S, () => {
        openSpeakerWindow();
        return true;
    });

    // Expose functions for manual control
    window.bespokeSpeakerView = {
        openWindow: openSpeakerWindow,
        startTimer,
        pauseTimer,
    };
}

/**
 * Initialize speaker window
 */
function initializeSpeakerWindow(deck, config) {
    const { notes: notesSelector } = config;

    // Set up communication channel
    let channel;
    try {
        channel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
        console.warn('BroadcastChannel not available, using postMessage fallback');
        channel = createPostMessageChannel();
    }

    let currentIndex = 0;
    let totalSlides = 0;
    let timerStartTime = null;
    let timerPaused = false;
    let timerPauseTime = null;
    let timerInterval = null;
    let slideWidth = null;
    let slideHeight = null;

    // Calculate slide scales
    function calculateScales() {
        const currentSlideContent = document.getElementById('speaker-current-slide');
        const nextSlideContent = document.getElementById('speaker-next-slide');
        const container = document.querySelector('.speaker-view-container');

        if (!currentSlideContent || !nextSlideContent || !container) return;

        const mainColumn = container.querySelector('.speaker-view-main-column');
        const currentContainer = currentSlideContent.parentElement;
        const nextContainer = nextSlideContent.parentElement;

        if (mainColumn && currentContainer && nextContainer && mainColumn.offsetWidth > 0) {
            // Get main column dimensions
            const mainColumnWidth = mainColumn.offsetWidth - 32; // Account for padding
            const mainColumnHeight = mainColumn.offsetHeight - 16; // Account for gap between sections

            if (mainColumnWidth > 0 && mainColumnHeight > 0) {
                // Calculate current slide scale to fit available width
                // Current section gets 2/3 of height (grid-template-rows: 2fr 1fr)
                const currentSectionHeight = (mainColumnHeight * 2) / 3;
                const currentScaleX = mainColumnWidth / slideWidth;
                const currentScaleY = (currentSectionHeight - 32) / slideHeight; // Account for padding
                const currentScale = Math.min(currentScaleX, currentScaleY, 1);

                currentContainer.style.setProperty('--current-slide-scale', currentScale);

                // Calculate next slide container dimensions
                // Next section gets 1/3 of height
                const nextSectionHeight = mainColumnHeight / 3;
                const nextContainerWidth = nextContainer.offsetWidth - 32; // Account for padding
                const nextContainerHeight = nextSectionHeight - 32; // Account for padding

                if (nextContainerWidth > 0 && nextContainerHeight > 0) {
                    // Calculate next slide scale to fit its container
                    const nextScaleX = nextContainerWidth / slideWidth;
                    const nextScaleY = nextContainerHeight / slideHeight;
                    const nextScale = Math.min(nextScaleX, nextScaleY, 1); // Allow full scale if space allows

                    nextContainer.style.setProperty('--next-slide-scale', nextScale);
                }
            }
        }
    }

    // Calculate thumbnail scale
    function calculateThumbnailScale() {
        const slidesList = document.getElementById('speaker-slides-list');
        if (!slidesList) return;

        const slidesColumn = slidesList.parentElement;
        if (slidesColumn && slidesColumn.offsetWidth > 0 && slidesList.offsetWidth > 0) {
            const thumbScale = slidesList.offsetWidth / slideWidth;
            slidesList.style.setProperty('--thumb-slide-scale', thumbScale);
        }
    }

    // Initialize scales and set up resize handler
    function initializeScales() {
        calculateScales();
        calculateThumbnailScale();
    }

    // Create speaker view UI
    function createSpeakerViewUI() {
        const html = `
            <div class="speaker-view-container">
                <div class="speaker-view-slides-column">
                    <div class="speaker-view-slides-list" id="speaker-slides-list"></div>
                </div>
                <div class="speaker-view-main-column">
                    <div class="speaker-view-current-section">
                        <div class="speaker-view-slide-content" id="speaker-current-slide"></div>
                    </div>
                    <div class="speaker-view-next-section">
                        <div class="speaker-view-slide-content" id="speaker-next-slide"></div>
                    </div>
                </div>
                <div class="speaker-view-info-column">
                    <div class="speaker-view-timer-section">
                        <div class="speaker-view-timer-display" id="speaker-timer">00:00</div>
                        <div class="speaker-view-time-display" id="speaker-time"></div>
                        <div class="speaker-view-page-indicator" id="speaker-counter">1 / 1</div>
                        <div class="speaker-view-timer-controls">
                            <button id="speaker-timer-start" class="speaker-view-btn">Start</button>
                            <button id="speaker-timer-stop" class="speaker-view-btn">Stop</button>
                            <button id="speaker-timer-reset" class="speaker-view-btn">Reset</button>
                        </div>
                    </div>
                    <div class="speaker-view-notes-section">
                        <div class="speaker-view-label">Speaker Notes</div>
                        <div class="speaker-view-notes-content" id="speaker-notes">No notes available</div>
                    </div>
                </div>
            </div>
        `;

        document.body.innerHTML = html;
        document.body.className = 'speaker-view-body';
    }

    // Update slide displays
    function updateSlides() {
        if (!deck.slides || deck.slides.length === 0) {
            // Slides not ready yet, retry
            setTimeout(updateSlides, 100);
            return;
        }

        totalSlides = deck.slides.length;

        // Ensure index is within bounds
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex >= totalSlides) currentIndex = totalSlides - 1;

        // Get slide dimensions from CSS variables (only once)
        const parentEl = document.querySelector('.bespoke-parent');
        const slideWidthStr = parentEl ? getComputedStyle(parentEl).getPropertyValue('--slide-width') || '1280px' : '1280px';
        const slideRatio = parentEl ? getComputedStyle(parentEl).getPropertyValue('--slide-ratio') || 'calc(16 / 9)' : 'calc(16 / 9)';

        // Parse slide width (remove 'px')
        slideWidth = parseInt(slideWidthStr);
        // Calculate height from ratio (handle calc() expressions)
        if (slideRatio.includes('16 / 9')) {
            slideHeight = slideWidth / (16 / 9);
        } else if (slideRatio.includes('4 / 3')) {
            slideHeight = slideWidth / (4 / 3);
        } else {
            // Default to 16:9
            slideHeight = slideWidth / (16 / 9);
        }

        // Get container elements
        const currentSlideContent = document.getElementById('speaker-current-slide');
        const nextSlideContent = document.getElementById('speaker-next-slide');
        const container = document.querySelector('.speaker-view-container');

        if (!currentSlideContent || !nextSlideContent) {
            // Elements not ready yet, retry
            setTimeout(updateSlides, 100);
            return;
        }

        // Update current slide
        const currentSlide = deck.slides[currentIndex];
        if (currentSlide) {
            // Create wrapper for scaling
            const wrapper = document.createElement('div');
            wrapper.className = 'speaker-view-slide-wrapper speaker-view-slide-current-wrapper';

            // Clone slide and remove notes
            const clone = currentSlide.cloneNode(true);
            clone.classList.remove('bespoke-active', 'bespoke-inactive');
            clone.classList.add('speaker-view-slide-clone');

            const notes = clone.querySelectorAll(notesSelector);
            notes.forEach(n => n.remove());

            wrapper.appendChild(clone);
            currentSlideContent.innerHTML = '';
            currentSlideContent.appendChild(wrapper);
        }

        // Update next slide
        const nextSlide = deck.slides[currentIndex + 1];
        if (nextSlideContent) {
            nextSlideContent.innerHTML = '';
            if (nextSlide) {
                // Create wrapper for scaling
                const wrapper = document.createElement('div');
                wrapper.className = 'speaker-view-slide-wrapper speaker-view-slide-next-wrapper';

                // Clone slide and remove notes
                const clone = nextSlide.cloneNode(true);
                clone.classList.remove('bespoke-active', 'bespoke-inactive');
                clone.classList.add('speaker-view-slide-clone');

                const notes = clone.querySelectorAll(notesSelector);
                notes.forEach(n => n.remove());

                wrapper.appendChild(clone);
                nextSlideContent.appendChild(wrapper);
            } else {
                nextSlideContent.innerHTML = '<div class="speaker-view-no-next">End of presentation</div>';
            }
        }

        // Update page indicator
        const counter = document.getElementById('speaker-counter');
        if (counter) {
            counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
        }

        // Update slides list in footer
        updateSlidesList();

        // Recalculate scales after slides are updated
        initializeScales();
    }

    // Update slides list in footer
    function updateSlidesList() {
        const slidesList = document.getElementById('speaker-slides-list');
        if (!slidesList || !deck.slides) return;

        slidesList.innerHTML = '';

        deck.slides.forEach((slide, index) => {
            const slideThumb = document.createElement('div');
            slideThumb.className = 'speaker-view-slide-thumb';
            if (index === currentIndex) {
                slideThumb.classList.add('speaker-view-slide-thumb-active');
            }

            // Add click handler to navigate to slide
            slideThumb.addEventListener('click', () => {
                sendMessage(channel, {
                    type: MESSAGE_TYPES.NAVIGATE_TO_SLIDE,
                    index: index,
                });
            });

            // Create wrapper for scaling
            const scaleWrapper = document.createElement('div');
            scaleWrapper.className = 'speaker-view-slide-wrapper speaker-view-slide-thumb-wrapper';

            // Create thumbnail
            const clone = slide.cloneNode(true);
            clone.classList.remove('bespoke-active', 'bespoke-inactive');
            clone.classList.add('speaker-view-slide-clone');

            // Remove notes from thumbnail
            const notes = clone.querySelectorAll(notesSelector);
            notes.forEach(n => n.remove());

            scaleWrapper.appendChild(clone);
            slideThumb.appendChild(scaleWrapper);
            slidesList.appendChild(slideThumb);
        });

        // Calculate thumbnail scale will be done by calculateThumbnailScale function
    }

    // Scroll to current slide in the list
    function scrollToCurrentSlide() {
        const slidesList = document.getElementById('speaker-slides-list');
        if (!slidesList) return;

        const activeThumb = slidesList.querySelector('.speaker-view-slide-thumb-active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Update notes
    function updateNotes(notesHtml) {
        const notesContent = document.getElementById('speaker-notes');
        if (notesContent) {
            if (notesHtml && notesHtml.trim()) {
                notesContent.innerHTML = notesHtml;
            } else {
                notesContent.innerHTML = '<em>No notes for this slide</em>';
            }
        }
    }

    // Update timer display
    function updateTimer() {
        const timerDisplay = document.getElementById('speaker-timer');
        if (!timerDisplay) return;

        if (!timerStartTime) {
            timerDisplay.textContent = '00:00';
            return;
        }

        let elapsed;
        if (timerPaused && timerPauseTime) {
            elapsed = timerPauseTime - timerStartTime;
        } else {
            elapsed = Date.now() - timerStartTime;
        }

        const totalSeconds = Math.floor(elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let timeString;
        if (hours > 0) {
            timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        timerDisplay.textContent = timeString;
    }

    // Update current time display
    function updateCurrentTime() {
        const timeDisplay = document.getElementById('speaker-time');
        if (!timeDisplay) return;

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}`;
    }

    // Timer control functions
    function startTimerLocal() {
        if (!timerStartTime) {
            timerStartTime = Date.now();
        } else if (timerPaused && timerPauseTime) {
            // Resume: adjust start time to account for paused duration
            timerStartTime = Date.now() - (timerPauseTime - timerStartTime);
            timerPauseTime = null;
        }
        timerPaused = false;
        startTimerUpdates();
        sendMessage(channel, {
            type: MESSAGE_TYPES.TIMER_START,
            startTime: timerStartTime,
        });
    }

    function stopTimerLocal() {
        if (timerStartTime && !timerPaused) {
            timerPaused = true;
            timerPauseTime = Date.now();
            updateTimer();
            sendMessage(channel, {
                type: MESSAGE_TYPES.TIMER_PAUSE,
                pauseTime: timerPauseTime,
            });
        }
    }

    function resetTimerLocal() {
        timerStartTime = null;
        timerPaused = false;
        timerPauseTime = null;
        updateTimer();
        stopTimerUpdates();
    }

    // Start timer updates
    function startTimerUpdates() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        timerInterval = setInterval(updateTimer, 1000);
        updateTimer();
    }

    // Stop timer updates
    function stopTimerUpdates() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // Handle incoming messages
    function handleMessage(event) {
        const message = event.data || event;

        switch (message.type) {
            case MESSAGE_TYPES.SLIDE_CHANGE:
                currentIndex = message.index || 0;
                totalSlides = message.totalSlides || 0;
                updateSlides();
                updateNotes(message.notes || '');
                scrollToCurrentSlide();
                break;

            case MESSAGE_TYPES.SYNC_RESPONSE:
                currentIndex = message.index || 0;
                totalSlides = message.totalSlides || 0;
                updateSlides();
                updateNotes(message.notes || '');
                scrollToCurrentSlide();

                if (message.timerStartTime) {
                    timerStartTime = message.timerStartTime;
                    timerPaused = message.timerPaused || false;
                    timerPauseTime = message.timerPauseTime || null;
                    startTimerUpdates();
                }
                break;

            case MESSAGE_TYPES.TIMER_START:
                timerStartTime = message.startTime || Date.now();
                timerPaused = false;
                timerPauseTime = null;
                startTimerUpdates();
                break;

            case MESSAGE_TYPES.TIMER_PAUSE:
                timerPaused = true;
                timerPauseTime = message.pauseTime || Date.now();
                updateTimer();
                break;
        }
    }

    // Set up message listener
    if (channel.addEventListener) {
        channel.addEventListener('message', handleMessage);
    } else if (channel.onmessage !== undefined) {
        channel.onmessage = handleMessage;
    } else {
        // Fallback to window postMessage
        window.addEventListener('message', (event) => {
            if (event.data && event.data.channel === CHANNEL_NAME) {
                handleMessage(event);
            }
        });
    }

    // Request sync when ready
    function requestSync() {
        sendMessage(channel, { type: MESSAGE_TYPES.SYNC_REQUEST });
        sendMessage(channel, { type: MESSAGE_TYPES.WINDOW_READY });
    }

    // Initialize UI
    createSpeakerViewUI();

    // Set up timer button handlers
    setTimeout(() => {
        const startBtn = document.getElementById('speaker-timer-start');
        const stopBtn = document.getElementById('speaker-timer-stop');
        const resetBtn = document.getElementById('speaker-timer-reset');

        if (startBtn) {
            startBtn.addEventListener('click', startTimerLocal);
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', stopTimerLocal);
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', resetTimerLocal);
        }

        // Update current time immediately and every minute
        updateCurrentTime();
        setInterval(updateCurrentTime, 60000);
    }, 100);

    // Set up resize handler with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initializeScales();
        }, 150);
    });

    // Listen to slide changes to update speaker view
    deck.on('activate', () => {
        const index = deck.slide();
        if (index !== currentIndex) {
            currentIndex = index;
            updateSlides();
            scrollToCurrentSlide();
        }
    });

    // Wait for DOM to be ready, then request sync and calculate scales
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                updateSlides();
                initializeScales();
                requestSync();
            }, 100);
        });
    } else {
        setTimeout(() => {
            updateSlides();
            initializeScales();
            requestSync();
        }, 100);
    }

    // Forward arrow keys and other navigation keys to main window
    window.addEventListener('keydown', (event) => {
        // Arrow keys, space, page up/down, home, end
        const navigationKeys = [
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            ' ', 'Space', 'PageUp', 'PageDown', 'Home', 'End'
        ];

        if (navigationKeys.includes(event.key) || event.keyCode === 32) {
            // Send key event to main window
            sendMessage(channel, {
                type: MESSAGE_TYPES.KEYDOWN,
                key: event.key,
                code: event.code,
                keyCode: event.keyCode,
            });
        }
    });

    // Clean up on window close
    window.addEventListener('beforeunload', () => {
        stopTimerUpdates();
    });
}

/**
 * Helper function to send messages
 */
function sendMessage(channel, message) {
    if (channel.postMessage) {
        channel.postMessage(message);
    } else if (channel.target && channel.target.postMessage) {
        channel.target.postMessage(message, '*');
    }
}

/**
 * Fallback postMessage channel implementation
 */
function createPostMessageChannel() {
    const target = window.opener || window.parent;
    return {
        postMessage: (message) => {
            if (target && target !== window) {
                target.postMessage({ channel: CHANNEL_NAME, ...message }, '*');
            }
            // Also broadcast to all windows (for same-origin)
            if (window.parent !== window) {
                window.parent.postMessage({ channel: CHANNEL_NAME, ...message }, '*');
            }
        },
        target,
        addEventListener: null, // Mark as not BroadcastChannel
    };
}
