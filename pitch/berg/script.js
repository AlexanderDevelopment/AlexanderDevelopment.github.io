(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const railButtons = Array.from(document.querySelectorAll(".slide-rail button"));
  const progressFill = document.getElementById("progress-fill");
  const currentSlide = document.getElementById("current-slide");
  const totalSlides = document.getElementById("total-slides");
  const prevButton = document.getElementById("prev-slide");
  const nextButton = document.getElementById("next-slide");

  if (!slides.length) {
    return;
  }

  const total = slides.length;
  let activeIndex = 0;
  let wheelLocked = false;
  let touchStartX = 0;
  let touchStartY = 0;

  const hashMatch = window.location.hash.match(/^#(\d+)$/);
  if (hashMatch) {
    activeIndex = Math.min(total - 1, Math.max(0, Number(hashMatch[1]) - 1));
  }

  totalSlides.textContent = "/" + String(total).padStart(2, "0");

  function setSlide(nextIndex, updateHash) {
    activeIndex = Math.min(total - 1, Math.max(0, nextIndex));

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    railButtons.forEach((button, index) => {
      button.classList.toggle("active", index === activeIndex);
      button.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });

    currentSlide.textContent = String(activeIndex + 1).padStart(2, "0");
    progressFill.style.width = `${((activeIndex + 1) / total) * 100}%`;
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === total - 1;

    if (updateHash) {
      history.replaceState(null, "", `#${activeIndex + 1}`);
    }
  }

  function nextSlide() {
    setSlide(activeIndex + 1, true);
  }

  function prevSlide() {
    setSlide(activeIndex - 1, true);
  }

  railButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setSlide(Number(button.dataset.target), true);
    });
  });

  prevButton.addEventListener("click", prevSlide);
  nextButton.addEventListener("click", nextSlide);

  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
      return;
    }

    switch (event.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
        event.preventDefault();
        nextSlide();
        break;
      case "ArrowLeft":
      case "PageUp":
        event.preventDefault();
        prevSlide();
        break;
      case "Home":
        event.preventDefault();
        setSlide(0, true);
        break;
      case "End":
        event.preventDefault();
        setSlide(total - 1, true);
        break;
      default:
        break;
    }
  });

  window.addEventListener(
    "wheel",
    (event) => {
      if (window.matchMedia("(max-width: 900px)").matches || wheelLocked || Math.abs(event.deltaY) < 30) {
        return;
      }

      wheelLocked = true;
      if (event.deltaY > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      window.setTimeout(() => {
        wheelLocked = false;
      }, 520);
    },
    { passive: true }
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      const firstTouch = event.touches[0];
      touchStartX = firstTouch.clientX;
      touchStartY = firstTouch.clientY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (event) => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        return;
      }

      const firstTouch = event.changedTouches[0];
      const deltaX = firstTouch.clientX - touchStartX;
      const deltaY = firstTouch.clientY - touchStartY;

      if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    },
    { passive: true }
  );

  setSlide(activeIndex, false);
})();
