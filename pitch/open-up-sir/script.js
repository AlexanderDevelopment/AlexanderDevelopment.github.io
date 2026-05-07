(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const railButtons = Array.from(document.querySelectorAll(".slide-rail button"));
  const progressFill = document.getElementById("progress-fill");
  const currentSlide = document.getElementById("current-slide");
  const totalSlides = document.getElementById("total-slides");
  const prevButton = document.getElementById("prev-slide");
  const nextButton = document.getElementById("next-slide");
  const stage = document.getElementById("presentation-stage");
  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const stageWidth = 1920;
  const stageHeight = 1080;
  const imagePreloads = [];
  const mobileDeckQuery = window.matchMedia("(max-width: 860px), (pointer: coarse) and (max-height: 540px)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let activeIndex = getInitialSlideIndex();
  let lastWheel = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let scene = "cover";
  let animationFrame = 0;
  let lastAnimationTime = 0;

  function isMobileDeckMode() {
    return mobileDeckQuery.matches;
  }

  function addQueryChangeListener(query, handler) {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handler);
      return;
    }

    query.addListener(handler);
  }

  function preloadImages() {
    [
      "./assets/screenshots/screenshot-01.png",
      "./assets/screenshots/screenshot-02.png",
      "./assets/screenshots/screenshot-03.png",
      "./assets/screenshots/screenshot-04.png",
      "./assets/screenshots/screenshot-05.png"
    ].forEach(function (src) {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      imagePreloads.push(image);
    });
  }

  function updateStageScale() {
    const scale = Math.min(window.innerWidth / stageWidth, window.innerHeight / stageHeight);
    document.documentElement.style.setProperty("--stage-scale", String(scale));
  }

  function resizeCanvas() {
    updateStageScale();
    const dpr = 1;
    width = stage ? stageWidth : window.innerWidth;
    height = stage ? stageHeight : window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
    drawBackground();
    startBackgroundAnimation();
  }

  function seedParticles() {
    const sceneBoost = scene === "sparks" ? 48 : scene === "smoke" ? 18 : 0;
    const count = Math.max(84, Math.floor((width * height) / 18000) + sceneBoost);
    particles = Array.from({ length: count }, function (_, index) {
      return createParticle(index);
    });
  }

  function createParticle(index) {
    const typePool = scene === "sparks"
      ? ["spark", "ember", "spark", "ember", "smoke", "mist"]
      : scene === "water"
        ? ["water", "water", "mist", "spark", "ember"]
        : scene === "smoke"
          ? ["smoke", "smoke", "mist", "ember"]
          : ["ember", "water", "smoke", "spark", "mist"];

    const type = typePool[index % typePool.length];
    const isSoftParticle = type === "smoke" || type === "mist";
    const isSparkParticle = type === "spark" || type === "ember";
    return {
      index,
      type,
      x: Math.random() * width,
      y: Math.random() * height,
      speed: isSparkParticle ? 0.35 + Math.random() * 1.8 : 0.25 + Math.random() * 1.2,
      drift: scene === "sparks" ? -0.9 + Math.random() * 1.8 : -0.6 + Math.random() * 1.2,
      size: isSoftParticle ? 28 + Math.random() * 74 : type === "water" ? 2 + Math.random() * 8 : 1.5 + Math.random() * 5.8,
      length: type === "spark" ? 10 + Math.random() * 24 : 3 + Math.random() * 8,
      life: Math.random(),
      alpha: 0.16 + Math.random() * 0.55,
      turn: Math.random() * Math.PI * 2,
      twinkle: 0.55 + Math.random() * 0.55
    };
  }

  function setSlide(index) {
    const nextIndex = Math.max(0, Math.min(slides.length - 1, index));
    if (nextIndex === activeIndex) {
      return;
    }

    slides[activeIndex].classList.remove("active");
    activeIndex = nextIndex;
    slides[activeIndex].classList.add("active");
    scene = slides[activeIndex].dataset.scene || "cover";
    seedParticles();
    restartBackgroundAnimation();
    updateChrome();
    syncHash();
  }

  function updateChrome() {
    const progress = ((activeIndex + 1) / slides.length) * 100;
    progressFill.style.width = progress + "%";
    currentSlide.textContent = String(activeIndex + 1).padStart(2, "0");
    if (totalSlides) {
      totalSlides.textContent = "/" + slides.length;
    }
    railButtons.forEach(function (button, index) {
      button.classList.toggle("active", index === activeIndex);
    });
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
  }

  function getInitialSlideIndex() {
    const params = new URLSearchParams(window.location.search);
    const hashSlide = window.location.hash.replace("#slide-", "");
    const raw = hashSlide || params.get("slide");
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return Math.max(0, Math.min(slides.length - 1, parsed - 1));
  }

  function syncHash() {
    const hash = "#slide-" + (activeIndex + 1);
    if (window.location.hash !== hash && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", hash);
    }
  }

  function syncMobileDeckPosition() {
    if (!isMobileDeckMode()) {
      return;
    }

    const parsed = Number.parseInt(window.location.hash.replace("#slide-", ""), 10);
    if (!Number.isFinite(parsed)) {
      return;
    }

    const clamped = Math.min(Math.max(parsed, 1), slides.length);
    const target = document.getElementById("mobile-slide-" + clamped);
    if (target) {
      window.requestAnimationFrame(function () {
        target.scrollIntoView({ block: "start" });
      });
    }
  }

  function drawBackground(includeParticles) {
    const shouldDrawParticles = includeParticles !== false;
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#180903");
    gradient.addColorStop(0.46, scene === "water" ? "#3a1907" : "#2b1205");
    gradient.addColorStop(1, scene === "sparks" ? "#4a1e08" : "#1f0b03");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const pulse = shouldAnimateBackground() ? Math.sin(frame * 0.035) * 0.04 : 0;
    drawLight(width * 0.13, height * 0.2, scene === "sparks" ? "rgba(255, 210, 87, " + (0.34 + pulse) + ")" : "rgba(255, 210, 87, 0.22)", width * 0.34);
    drawLight(width * 0.84, height * 0.72, scene === "water" ? "rgba(255, 138, 47, " + (0.3 + pulse) + ")" : "rgba(255, 138, 47, 0.18)", width * 0.38);
    drawLight(width * 0.58, height * 0.38, scene === "smoke" ? "rgba(255, 184, 77, " + (0.18 + pulse * 0.5) + ")" : "rgba(255, 184, 77, 0.12)", width * 0.28);

    if (shouldDrawParticles) {
      particles.forEach(drawStaticParticle);
    }
  }

  function drawLight(x, y, color, radius) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function isStaticExportMode() {
    return document.documentElement.classList.contains("exporting")
      || document.body.classList.contains("exporting")
      || document.body.classList.contains("pdf-export");
  }

  function shouldAnimateBackground() {
    return !reducedMotionQuery.matches && !isStaticExportMode() && !isMobileDeckMode();
  }

  function startBackgroundAnimation() {
    if (animationFrame || !shouldAnimateBackground()) {
      return;
    }

    lastAnimationTime = performance.now();
    animationFrame = window.requestAnimationFrame(animateBackground);
  }

  function stopBackgroundAnimation() {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    lastAnimationTime = 0;
  }

  function restartBackgroundAnimation() {
    stopBackgroundAnimation();
    drawBackground();
    startBackgroundAnimation();
  }

  function animateBackground(now) {
    if (!shouldAnimateBackground()) {
      stopBackgroundAnimation();
      drawBackground();
      return;
    }

    const delta = Math.min(48, Math.max(8, now - lastAnimationTime));
    const step = delta / 16.67;
    lastAnimationTime = now;
    frame += step;

    drawAnimatedBackground(step);
    animationFrame = window.requestAnimationFrame(animateBackground);
  }

  function drawAnimatedBackground(step) {
    drawBackground(false);
    particles.forEach(function (particle) {
      updateParticle(particle, step);
    });
  }

  function updateParticle(particle, step) {
    particle.turn += 0.012 * step;
    particle.life += (0.004 + particle.speed * 0.001) * step;

    if (particle.type === "spark") {
      particle.x += (Math.cos(particle.turn) * 0.5 + particle.drift) * step;
      particle.y -= (1.2 + particle.speed * 1.8) * step;
      drawSpark(particle);
    } else if (particle.type === "ember") {
      particle.x += (Math.sin(particle.turn) * 0.55 + particle.drift * 0.44) * step;
      particle.y -= (0.62 + particle.speed * 1.25) * step;
      drawEmber(particle);
    } else if (particle.type === "water") {
      particle.x += (2.2 + particle.speed * 2.6) * step;
      particle.y += (Math.sin(frame * 0.08 + particle.turn) * 0.9 + particle.drift * 0.25) * step;
      drawWater(particle);
    } else {
      particle.x += (Math.sin(particle.turn) * 0.24 + particle.drift * 0.18) * step;
      particle.y -= (0.28 + particle.speed * 0.34) * step;
      drawSmoke(particle);
    }

    if (particle.y < -120 || particle.x > width + 120 || particle.x < -120 || particle.life > 1.7) {
      Object.assign(particle, createParticle(Math.floor(Math.random() * 1000)));
      if (particle.type === "spark" || particle.type === "ember" || particle.type === "smoke") {
        particle.y = height + Math.random() * 80;
      }
      if (particle.type === "water") {
        particle.x = -100;
        particle.y = height * (0.24 + Math.random() * 0.58);
      }
      particle.life = 0;
    }
  }

  function drawStaticParticle(particle) {
    if (particle.type === "spark") {
      drawSpark(particle);
    } else if (particle.type === "ember") {
      drawEmber(particle);
    } else if (particle.type === "water") {
      drawWater(particle);
    } else {
      drawSmoke(particle);
    }
  }

  function drawSpark(particle) {
    ctx.save();
    const flicker = 0.7 + Math.sin(frame * 0.16 + particle.turn) * 0.3;
    ctx.globalAlpha = particle.alpha * flicker * (1 - Math.min(particle.life, 1));
    ctx.strokeStyle = particle.index % 2 === 0 ? "#ffd257" : "#ff8a2f";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x + particle.drift * particle.length, particle.y + particle.length);
    ctx.stroke();
    ctx.restore();
  }

  function drawEmber(particle) {
    ctx.save();
    const fade = 1 - Math.min(particle.life, 1);
    const flicker = 0.64 + Math.sin(frame * 0.11 + particle.turn) * 0.36;
    ctx.globalAlpha = particle.alpha * particle.twinkle * flicker * fade;
    ctx.fillStyle = particle.index % 3 === 0 ? "#fff0a8" : particle.index % 2 === 0 ? "#ffd257" : "#ff8a2f";
    ctx.shadowColor = "#ff8a2f";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(particle.x, particle.y, particle.size * 0.72, particle.size * 1.2, particle.turn * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWater(particle) {
    ctx.save();
    ctx.globalAlpha = particle.alpha * 0.82;
    ctx.fillStyle = particle.index % 2 === 0 ? "#ffb84d" : "#ffd257";
    ctx.beginPath();
    ctx.ellipse(particle.x, particle.y, particle.size * 1.6, particle.size * 0.42, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSmoke(particle) {
    ctx.save();
    const fade = 1 - Math.min(particle.life, 1);
    ctx.globalAlpha = particle.alpha * 0.36 * fade;
    ctx.fillStyle = particle.type === "mist" ? "#ffb84d" : "#f0c99f";
    ctx.filter = "blur(10px)";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = "none";
    ctx.restore();
  }

  railButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setSlide(Number(button.dataset.target));
    });
  });

  prevButton.addEventListener("click", function () {
    setSlide(activeIndex - 1);
  });

  nextButton.addEventListener("click", function () {
    setSlide(activeIndex + 1);
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      setSlide(activeIndex + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") {
      event.preventDefault();
      setSlide(activeIndex - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setSlide(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setSlide(slides.length - 1);
    }
  });

  window.addEventListener("wheel", function (event) {
    if (isMobileDeckMode()) {
      return;
    }

    const now = Date.now();
    if (Math.abs(event.deltaY) < 34 || now - lastWheel < 720) {
      return;
    }
    lastWheel = now;
    setSlide(activeIndex + (event.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener("touchstart", function (event) {
    if (isMobileDeckMode()) {
      return;
    }

    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", function (event) {
    if (isMobileDeckMode()) {
      return;
    }

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      setSlide(activeIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  window.addEventListener("resize", function () {
    resizeCanvas();
    syncMobileDeckPosition();
  });
  addQueryChangeListener(mobileDeckQuery, function () {
    resizeCanvas();
    syncMobileDeckPosition();
  });
  addQueryChangeListener(reducedMotionQuery, restartBackgroundAnimation);
  window.addEventListener("hashchange", function () {
    if (isMobileDeckMode()) {
      syncMobileDeckPosition();
      return;
    }

    setSlide(getInitialSlideIndex());
  });

  slides.forEach(function (slide, index) {
    slide.classList.toggle("active", index === activeIndex);
  });
  scene = slides[activeIndex].dataset.scene || "cover";
  preloadImages();
  resizeCanvas();
  updateChrome();
  syncMobileDeckPosition();
  startBackgroundAnimation();
}());
