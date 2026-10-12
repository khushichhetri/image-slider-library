
/* Image Slider Library */

document.querySelectorAll(".slider").forEach((slider) => {
    const track = slider.querySelector(".slider-track");
    const previousButton = slider.querySelector(".previous");
    const nextButton = slider.querySelector(".next");
    const dotsContainer = slider.querySelector(".slider-dots");
    const status = slider.querySelector(".slide-status");

    if (!track || !previousButton || !nextButton || !dotsContainer || !status) {
        return;
    }

    const originalSlides = Array.from(
        track.querySelectorAll(".slide")
    );

    const totalSlides = originalSlides.length;

    if (totalSlides === 0) {
        return;
    }

    // A single slide does not need navigation or cloning.
    if (totalSlides === 1) {
        dotsContainer.replaceChildren();
        status.textContent = "Image 1 of 1";
        previousButton.hidden = true;
        nextButton.hidden = true;
        return;
    }

    let currentIndex = 0;
    let isMoving = false;
    let unlockTimer = null;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    // Clone the first and last slides for seamless looping.
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[totalSlides - 1].cloneNode(true);

    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");

    // Prevent cloned images from being announced by screen readers.
    firstClone.querySelector("img")?.setAttribute("alt", "");
    lastClone.querySelector("img")?.setAttribute("alt", "");

    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalSlides[0]);

    // Create one dot for each original slide.
    const dots = originalSlides.map((slide, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "slider-dot";
        dot.setAttribute("aria-label", `Show image ${index + 1}`);

        dot.addEventListener("click", () => {
            if (isMoving || index === currentIndex) {
                return;
            }

            moveToSlide(index);
        });

        dotsContainer.appendChild(dot);

        return dot;
    });

    // Position the track.
    function setPosition(animate = true) {
        track.style.transition =
            animate && !reducedMotion.matches
                ? ""
                : "none";

        track.style.transform =
            `translateX(-${(currentIndex + 1) * 100}%)`;
    }

    // Update dots and the image counter.
    function updateControls() {
        dots.forEach((dot, index) => {
            const isActive = index === currentIndex;

            dot.classList.toggle("active", isActive);

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });

        status.textContent =
            `Image ${currentIndex + 1} of ${totalSlides}`;
    }

    // Release the navigation lock.
    function unlockSlider() {
        window.clearTimeout(unlockTimer);
        unlockTimer = null;
        isMoving = false;
    }

    // Move to a specific slide.
    function moveToSlide(index) {
        if (isMoving) {
            return;
        }

        isMoving = true;
        currentIndex = index;

        setPosition(true);
        updateControls();

        // Reduced motion removes CSS transitions, so unlock directly.
        if (reducedMotion.matches) {
            unlockSlider();
        } else {
            // Fallback in case transitionend never fires.
            unlockTimer = window.setTimeout(() => {
                if (currentIndex >= totalSlides) {
                    currentIndex = 0;
                    setPosition(false);
                    updateControls();
                } else if (currentIndex < 0) {
                    currentIndex = totalSlides - 1;
                    setPosition(false);
                    updateControls();
                }

                unlockSlider();
            }, 700);
        }
    }

    // Next slide.
    nextButton.addEventListener("click", () => {
        if (isMoving) {
            return;
        }

        moveToSlide(currentIndex + 1);
    });

    // Previous slide.
    previousButton.addEventListener("click", () => {
        if (isMoving) {
            return;
        }

        moveToSlide(currentIndex - 1);
    });

    // Handle the end of the sliding animation.
    track.addEventListener("transitionend", (event) => {
        if (
            event.target !== track ||
            event.propertyName !== "transform"
        ) {
            return;
        }

        if (currentIndex >= totalSlides) {
            currentIndex = 0;
            setPosition(false);
        } else if (currentIndex < 0) {
            currentIndex = totalSlides - 1;
            setPosition(false);
        }

        updateControls();
        unlockSlider();
    });

    // Keep the position correct after resizing.
    window.addEventListener("resize", () => {
        window.clearTimeout(unlockTimer);
        unlockTimer = null;
        isMoving = false;

        setPosition(false);
        updateControls();
    });

    // Respond if the user changes their motion preference.
    reducedMotion.addEventListener("change", () => {
        window.clearTimeout(unlockTimer);
        unlockTimer = null;
        isMoving = false;

        setPosition(false);
        updateControls();
    });

    // Initial setup.
    setPosition(false);
    updateControls();
});

