(() => {
  const desktop = () => window.matchMedia("(min-width: 60rem)").matches;

  function bindCards(root = document) {
    root.querySelectorAll("[data-card]").forEach((card) => {
      const row = card.querySelector(".acard-row");
      const body = card.querySelector(".acard-body");
      const icon = card.querySelector(".acard-icon");
      if (!row || !body || !icon) return;
      const href = card.getAttribute("data-href");

      const setClosed = (el) => {
        el.classList.remove("is-open");
        const b = el.querySelector(".acard-body");
        const i = el.querySelector(".acard-icon");
        if (b) b.hidden = true;
        if (i) {
          i.textContent = "+";
          i.setAttribute("aria-expanded", "false");
          i.setAttribute("aria-label", "詳細を開く");
        }
      };

      const openCard = () => {
        root.querySelectorAll("[data-card].is-open").forEach((other) => {
          if (other !== card) setClosed(other);
        });
        card.classList.add("is-open");
        body.hidden = false;
        icon.textContent = "−";
        icon.setAttribute("aria-expanded", "true");
        icon.setAttribute("aria-label", "詳細を閉じる");
      };

      icon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (card.classList.contains("is-open")) setClosed(card);
        else openCard();
      });

      const activate = () => {
        if (card.classList.contains("is-open")) {
          if (href) {
            window.location.href = href;
            return;
          }
          setClosed(card);
          return;
        }
        openCard();
      };

      card.addEventListener("click", (e) => {
        if (e.target.closest(".acard-icon")) return;
        if (e.target.closest("a")) return;
        if (!href && e.target.closest(".acard-body")) return;
        activate();
      });
      row.addEventListener("keydown", (e) => {
        if (e.target.closest(".acard-icon")) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function bindHomeCats() {
    const block = document.querySelector("[data-home-cats]");
    if (!block) return;
    const pills = [...block.querySelectorAll("[data-cat]")];
    const cards = [...block.querySelectorAll("[data-card]")];
    const more = block.querySelector("[data-cat-more]");

    const apply = (name) => {
      let shown = 0;
      cards.forEach((card) => {
        const match = card.getAttribute("data-category") === name;
        if (!match) {
          card.classList.add("is-filtered-out");
          return;
        }
        shown += 1;
        if (shown <= 5) card.classList.remove("is-filtered-out");
        else card.classList.add("is-filtered-out");
      });
      const active = pills.find((p) => p.getAttribute("data-cat") === name);
      if (more && active) more.setAttribute("href", active.getAttribute("data-list") || more.getAttribute("href"));
    };

    const first = pills[0]?.getAttribute("data-cat");
    if (first) apply(first);

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => {
          p.classList.toggle("is-active", p === pill);
          p.setAttribute("aria-selected", p === pill ? "true" : "false");
        });
        apply(pill.getAttribute("data-cat"));
      });
    });
  }

  function bindListPage() {
    const page = document.querySelector("[data-list-page]");
    if (!page) return;
    const select = page.querySelector("[data-cat-select]");
    const toggle = page.querySelector("[data-tag-toggle]");
    const panel = page.querySelector("[data-tag-panel]");
    const cardsWrap = page.querySelector("[data-list-cards]");
    const cards = [...page.querySelectorAll("[data-card]")];
    const count = page.querySelector("[data-list-count], .list-count-num");
    const sortSelect = page.querySelector("[data-list-sort]");

    const applyList = () => {
      const cat = select ? select.value : page.getAttribute("data-current-cat") || "";
      const selected = [...page.querySelectorAll("[data-tag-filter]:checked")].map(
        (el) => el.value
      );
      let visible = 0;
      cards.forEach((card) => {
        const cardCat = card.getAttribute("data-category") || "";
        const tags = (card.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);
        const catOk = !cat || cardCat === cat;
        const tagOk = selected.length === 0 || selected.every((t) => tags.includes(t));
        const ok = catOk && tagOk;
        card.classList.toggle("is-filtered-out", !ok);
        if (ok) visible += 1;
      });
      if (count) count.textContent = String(visible);
    };

    const sortCards = () => {
      if (!cardsWrap) return;
      const dir = sortSelect ? sortSelect.value : "new";
      const list = [...cardsWrap.querySelectorAll("[data-card]")];
      list.sort((a, b) => {
        const da = a.getAttribute("data-date") || "";
        const db = b.getAttribute("data-date") || "";
        return dir === "old" ? da.localeCompare(db) : db.localeCompare(da);
      });
      list.forEach((el) => cardsWrap.appendChild(el));
    };

    const params = new URLSearchParams(window.location.search);
    const resolvePresetTag = () => {
      const fromData = page.getAttribute("data-current-tag");
      if (fromData) return fromData;

      const fromQuery = params.get("tag");
      if (fromQuery) return fromQuery;

      const m = window.location.pathname.match(/\/tags\/([^/]+)\/?$/);
      if (!m) return "";

      const slug = decodeURIComponent(m[1]);
      const boxes = [...page.querySelectorAll("[data-tag-filter]")];
      const hit = boxes.find((el) => el.value === slug);
      return hit ? hit.value : slug;
    };

    const presetTag = resolvePresetTag();
    if (presetTag) {
      page.querySelectorAll("[data-tag-filter]").forEach((el) => {
        el.checked = el.value === presetTag;
      });
      if (toggle && panel) {
        toggle.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        const mark = toggle.querySelector("span[aria-hidden]");
        if (mark) mark.textContent = "−";
      }
    }

    if (select) {
      const q = params.get("cat");
      if (q) select.value = q;
      select.addEventListener("change", () => {
        const url = new URL(window.location.href);
        if (select.value) url.searchParams.set("cat", select.value);
        else url.searchParams.delete("cat");
        history.replaceState({}, "", url);
        applyList();
      });
    }
    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
        const mark = toggle.querySelector("span[aria-hidden]");
        if (mark) mark.textContent = open ? "+" : "−";
      });
    }

    page.querySelectorAll("[data-tag-filter]").forEach((el) => {
      el.addEventListener("change", applyList);
    });
    if (sortSelect) sortSelect.addEventListener("change", sortCards);
    sortCards();
    applyList();
  }

  function wrapQuote(root, quote, comment) {
    if (!quote || !root) return null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const i = node.nodeValue.indexOf(quote);
      if (i === -1) continue;
      const parent = node.parentNode;
      if (parent.closest(".review-mark, .review-panel, .review-popup")) continue;
      const before = node.nodeValue.slice(0, i);
      const after = node.nodeValue.slice(i + quote.length);
      const mark = document.createElement("button");
      mark.type = "button";
      mark.className = "review-mark";
      const label = document.createElement("span");
      label.className = "link-text";
      label.textContent = quote;
      mark.append(label);
      mark.dataset.reviewId = comment.id || "";
      parent.insertBefore(document.createTextNode(before), node);
      parent.insertBefore(mark, node);
      parent.insertBefore(document.createTextNode(after), node);
      parent.removeChild(node);
      return mark;
    }
    return null;
  }

  function bindArticleLinks() {
    const body = document.querySelector("[data-article-body]");
    if (!body) return;
    body.querySelectorAll("a[href]").forEach((a) => {
      if (a.querySelector(".link-text")) return;
      const href = a.getAttribute("href") || "";
      const label = document.createElement("span");
      label.className = "link-text";
      while (a.firstChild) label.appendChild(a.firstChild);
      a.appendChild(label);
      if (/^https?:/i.test(href)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        const ext = document.createElement("span");
        ext.className = "link-ext";
        ext.setAttribute("aria-hidden", "true");
        a.appendChild(ext);
      }
    });
  }

  function repairSplitReviewParagraphs(root) {
    root.querySelectorAll(".review-panel-slot").forEach((slot) => {
      const head = slot.previousElementSibling;
      const tail = slot.nextElementSibling;
      if (head && head.tagName === "P" && tail && tail.tagName === "P") {
        while (tail.firstChild) head.appendChild(tail.firstChild);
        tail.remove();
      }
      slot.remove();
    });
  }

  function bindReviews() {
    const dataEl = document.getElementById("reviews-data");
    const body = document.querySelector("[data-article-body]");
    if (!dataEl || !body) return;
    repairSplitReviewParagraphs(body);
    let data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch {
      return;
    }
    const comments = (data && data.comments) || [];
    if (!comments.length) return;

    const popup = document.createElement("div");
    popup.className = "review-popup";
    popup.setAttribute("role", "dialog");
    document.body.appendChild(popup);

    const panel = document.createElement("div");
    panel.className = "review-panel";
    document.body.appendChild(panel);

    let activeMark = null;

    const clearPanelPos = () => {
      panel.classList.remove("is-mobile-fixed");
      panel.style.top = "";
      panel.style.left = "";
      panel.style.width = "";
    };

    const closeReview = () => {
      popup.classList.remove("is-open");
      panel.classList.remove("is-open");
      popup.style.top = "";
      popup.style.left = "";
      clearPanelPos();
      if (panel.parentNode !== document.body) {
        panel.remove();
        document.body.appendChild(panel);
      }
      if (activeMark) activeMark.classList.remove("is-active");
      activeMark = null;
    };

    const reviewDate = (iso) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    };

    const fill = (el, comment, onClose) => {
      el.replaceChildren();
      const bodyEl = document.createElement("p");
      bodyEl.className = "review-body";
      bodyEl.textContent = comment.content || "";
      el.append(bodyEl);

      const rule = document.createElement("hr");
      rule.className = "review-rule";
      el.append(rule);

      if (comment.created_time) {
        const dateLabel = document.createElement("p");
        dateLabel.className = "review-kicker";
        dateLabel.textContent = "Date Commented";
        const dateEl = document.createElement("time");
        dateEl.className = "review-value";
        dateEl.dateTime = comment.created_time.slice(0, 10);
        dateEl.textContent = reviewDate(comment.created_time);
        el.append(dateLabel, dateEl);
      }

      const name = (comment.author && comment.author.display_name) || "";
      if (name) {
        const byLabel = document.createElement("p");
        byLabel.className = "review-kicker";
        byLabel.textContent = "Commented by";
        const authorEl = document.createElement("p");
        authorEl.className = "review-value";
        authorEl.textContent = name;
        el.append(byLabel, authorEl);
      }

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "review-close";
      closeBtn.setAttribute("aria-label", "コメントを閉じる");
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      });
      el.append(closeBtn);
    };

    const openPopup = (comment, mark) => {
      fill(popup, comment, closeReview);
      popup.classList.add("is-open");
      const col = mark.closest(".col-center") || document.body;
      const colRect = col.getBoundingClientRect();
      const w = Math.round(Math.min(colRect.width * 0.74, 22 * 16));
      popup.style.width = `${w}px`;
      const h = popup.offsetHeight;
      const rect = mark.getBoundingClientRect();
      let left = colRect.left + (colRect.width - w) / 2;
      let top = rect.bottom - 10;
      const margin = 12;
      left = Math.max(margin, Math.min(left, window.innerWidth - w - margin));
      top = Math.max(margin, Math.min(top, window.innerHeight - h - 22));
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
    };

    const openReview = (comment, mark) => {
      const isSame =
        activeMark === mark &&
        (popup.classList.contains("is-open") || panel.classList.contains("is-open"));
      if (isSame) {
        closeReview();
        return;
      }
      closeReview();
      activeMark = mark;
      mark.classList.add("is-active");
      openPopup(comment, mark);
    };

    comments.forEach((c) => {
      const mark = wrapQuote(body, c.quoted_text, c);
      if (!mark) return;
      mark.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openReview(c, mark);
      });
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest(".review-mark, .review-popup, .review-panel, .review-close")) return;
      closeReview();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeReview();
    });
  }

  function bindArticleNav() {
    const bar = document.querySelector(".col-center > .site-bar .site-bar-title[data-article-nav]");
    const titleEl = document.querySelector("[data-article] .scard-title");
    if (!bar || !titleEl) return;
    const enLabel = bar.querySelector(".site-bar-title-label--en");
    const artLabel = bar.querySelector(".site-bar-title-label--article");
    const track = bar.querySelector(".site-bar-title-track");
    const text = bar.querySelector(".site-bar-title-text");
    const endEl = document.querySelector(".article-history-block");
    const barEl = bar.closest(".site-bar");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let showing = false;

    const refreshTrunc = () => {
      if (!track || !text) return;
      track.classList.remove("is-scrolling");
      text.style.transition = "";
      text.style.transform = "";
      void track.offsetWidth;
      track.classList.toggle("is-truncated", text.scrollWidth > track.clientWidth + 1);
    };

    const update = () => {
      const barBottom = barEl.getBoundingClientRect().bottom;
      const titleBottom = titleEl.getBoundingClientRect().bottom;
      const start = window.scrollY + titleBottom - barBottom;
      let end = start;
      if (endEl) end = window.scrollY + endEl.getBoundingClientRect().top - barBottom;
      const span = end - start;
      const progress = span > 1 ? Math.min(1, Math.max(0, (window.scrollY - start) / span)) : 0;
      bar.style.setProperty("--read-progress", `${progress * 100}%`);

      const next = titleBottom <= barBottom + 0.5;
      if (next === showing) return;
      showing = next;
      bar.classList.toggle("is-article-title", showing);
      if (enLabel) enLabel.setAttribute("aria-hidden", showing ? "true" : "false");
      if (artLabel) artLabel.setAttribute("aria-hidden", showing ? "false" : "true");
      if (showing) refreshTrunc();
      else if (track && text) {
        track.classList.remove("is-scrolling", "is-truncated");
        text.style.transition = "";
        text.style.transform = "";
      }
    };

    if (track && text) {
      const startScroll = () => {
        if (!showing || reduced || !track.classList.contains("is-truncated")) return;
        const dist = text.scrollWidth - track.clientWidth;
        if (dist <= 0) return;
        track.classList.add("is-scrolling");
        requestAnimationFrame(() => {
          const ms = Math.min(12000, Math.max(2800, dist * 40));
          text.style.transition = `transform ${ms}ms linear`;
          text.style.transform = `translateX(-${dist}px)`;
        });
      };
      const stopScroll = () => {
        track.classList.remove("is-scrolling");
        text.style.transition = "transform 180ms ease";
        text.style.transform = "";
        text.addEventListener("transitionend", () => {
          text.style.transition = "";
        }, { once: true });
      };
      bar.addEventListener("mouseenter", startScroll);
      bar.addEventListener("mouseleave", stopScroll);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", () => {
      update();
      if (showing) refreshTrunc();
    });
  }

  function bindHistoryTitles() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".history-item").forEach((item) => {
      const wrap = item.querySelector(".history-item-title-wrap");
      const title = wrap?.querySelector(".history-item-title");
      const link = item.querySelector("a");
      if (!wrap || !title || !link) return;

      const refresh = () => {
        wrap.classList.remove("is-scrolling");
        title.style.transition = "";
        title.style.transform = "";
        wrap.classList.toggle("is-truncated", title.scrollWidth > wrap.clientWidth + 1);
      };
      refresh();
      window.addEventListener("resize", refresh);

      const startScroll = () => {
        if (reduced || !wrap.classList.contains("is-truncated")) return;
        const dist = title.scrollWidth - wrap.clientWidth;
        if (dist <= 0) return;
        wrap.classList.add("is-scrolling");
        requestAnimationFrame(() => {
          const ms = Math.min(12000, Math.max(2800, dist * 40));
          title.style.transition = `transform ${ms}ms linear`;
          title.style.transform = `translateX(-${dist}px)`;
        });
      };

      const stopScroll = () => {
        wrap.classList.remove("is-scrolling");
        title.style.transition = "transform 180ms ease";
        title.style.transform = "";
        title.addEventListener(
          "transitionend",
          () => {
            title.style.transition = "";
          },
          { once: true }
        );
      };

      link.addEventListener("mouseenter", startScroll);
      link.addEventListener("mouseleave", stopScroll);
    });
  }

  function snapApplyMeta(root, slide) {
    if (!slide) return;
    const cap = slide.getAttribute("data-snap-caption") || "";
    const cred = slide.getAttribute("data-snap-credit") || "";
    const date = slide.getAttribute("data-snap-date") || "";
    const lines = { caption: cap, credit: cred, date };
    root.querySelectorAll("[data-snap-line]").forEach((el) => {
      const key = el.getAttribute("data-snap-line");
      const val = lines[key] || "";
      if (val) {
        el.textContent = val;
        el.hidden = false;
      } else {
        el.textContent = "";
        el.hidden = true;
      }
    });
  }

  function snapShowAt(slides, idx, captionRoot, sideMeta) {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    if (captionRoot) snapApplyMeta(captionRoot, slides[idx]);
    if (sideMeta) snapApplyMeta(sideMeta, slides[idx]);
  }

  function bindSnapSlideshow() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("[data-snap-slideshow]").forEach((root) => {
      const slides = [...root.querySelectorAll(".site-bg-slide")];
      if (slides.length < 2) return;

      const sideMeta = document.querySelector("[data-snap-side-meta]");
      let idx = slides.findIndex((s) => s.classList.contains("is-active"));
      if (idx < 0) idx = 0;

      const interval = Math.max(3000, parseInt(root.getAttribute("data-snap-interval") || "8000", 10));

      const advance = () => {
        idx = (idx + 1) % slides.length;
        snapShowAt(slides, idx, null, sideMeta);
      };

      if (reduced) return;

      window.setInterval(advance, interval);
    });
  }

  function bindSnapCarousel() {
    document.querySelectorAll("[data-snap-carousel]").forEach((carouselRoot) => {
      const track = carouselRoot.querySelector(".snap-slides");
      const slides = [...track.querySelectorAll(".snap-slide:not(.snap-slide--clone)")];
      if (!track || slides.length < 2) return;

      const captionRoot = carouselRoot.querySelector("[data-snap-meta]");
      const count = slides.length;

      const yamlIndex = (slide) => parseInt(slide.getAttribute("data-snap-index") || "0", 10);
      const slideByYaml = (idx) => slides.find((s) => yamlIndex(s) === idx);

      let activeIdx = yamlIndex(slides.find((s) => s.classList.contains("is-active")) || slides[0]);
      if (Number.isNaN(activeIdx)) activeIdx = 0;

      const cloneNode = (node) => {
        const c = node.cloneNode(true);
        c.classList.add("snap-slide--clone");
        c.classList.remove("is-active");
        c.setAttribute("aria-hidden", "true");
        return c;
      };
      track.insertBefore(cloneNode(slides[count - 1]), slides[0]);
      track.appendChild(cloneNode(slides[0]));

      const frame = carouselRoot.querySelector(".snap-frame");
      const frameW = () => {
        const raw = frame ? frame.getBoundingClientRect().width : carouselRoot.clientWidth;
        const w = Math.ceil(raw) + 1;
        track.querySelectorAll(".snap-slide").forEach((slide) => {
          slide.style.flexBasis = `${w}px`;
          slide.style.width = `${w}px`;
        });
        return w > 1 ? w : 1;
      };
      /** 0=末尾クローン, 1..count=本物, count+1=先頭クローン */
      let posIndex = activeIdx + 1;

      const yamlFromPos = (pos) => {
        if (pos <= 0) return count - 1;
        if (pos >= count + 1) return 0;
        return pos - 1;
      };

      const applyMeta = () => {
        slides.forEach((s) => s.classList.toggle("is-active", yamlIndex(s) === activeIdx));
        const current = slideByYaml(activeIdx);
        if (captionRoot && current) snapApplyMeta(captionRoot, current);
      };

      let offsetPx = 0;

      const setOffset = (px, animate) => {
        offsetPx = px;
        track.classList.toggle("is-dragging", !animate);
        track.style.transform = `translate3d(${px}px, 0, 0)`;
      };

      const readOffsetPx = () => {
        const m = track.style.transform.match(/translate3d\(([-\d.]+)px/);
        if (m) return parseFloat(m[1]);
        return offsetPx;
      };

      const normalizePosition = () => {
        const w = frameW();
        if (posIndex <= 0) {
          posIndex = count;
          setOffset(-posIndex * w, false);
        } else if (posIndex >= count + 1) {
          posIndex = 1;
          setOffset(-posIndex * w, false);
        }
        activeIdx = yamlFromPos(posIndex);
        applyMeta();
      };

      const snapToPos = (pos, animate) => {
        posIndex = Math.max(0, Math.min(count + 1, pos));
        activeIdx = yamlFromPos(posIndex);
        applyMeta();
        const target = -posIndex * frameW();
        if (!animate) {
          setOffset(target, false);
          normalizePosition();
          return;
        }
        const current = readOffsetPx();
        setOffset(current, false);
        void track.offsetHeight;
        requestAnimationFrame(() => setOffset(target, true));
      };

      track.addEventListener("transitionend", (ev) => {
        if (ev.propertyName !== "transform") return;
        if (track.classList.contains("is-dragging")) return;
        normalizePosition();
      });

      snapToPos(activeIdx + 1, false);

      const step = (delta) => {
        if (!delta) return;
        snapToPos(posIndex + delta, true);
      };

      carouselRoot.addEventListener("click", (ev) => {
        const btn = ev.target.closest(".snap-nav");
        if (!btn || !carouselRoot.contains(btn)) return;
        ev.preventDefault();
        ev.stopPropagation();
        if (btn.classList.contains("snap-nav--prev")) step(-1);
        else if (btn.classList.contains("snap-nav--next")) step(1);
      });

      let dragStartX = 0;
      let dragStartY = 0;
      let dragStartOffset = 0;
      let axisLock = null;
      let pointerId = null;

      const clampOffset = (px) => {
        const w = frameW();
        return Math.max(-(count + 1) * w, Math.min(0, px));
      };

      const resolveNextPos = (dx, dy) => {
        const w = frameW();
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        let pos = Math.round(-readOffsetPx() / w);

        if (absX < 8 && absY < 8) return posIndex;
        if (absX < absY) return posIndex;

        if (dx < -16) pos = posIndex + 1;
        else if (dx > 16) pos = posIndex - 1;

        return Math.max(0, Math.min(count + 1, pos));
      };

      const finishDrag = (clientX, clientY) => {
        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;
        const horizontal =
          axisLock === "x" || (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) >= 8);

        axisLock = null;
        pointerId = null;

        if (!horizontal) {
          snapToPos(posIndex, true);
          return;
        }

        snapToPos(resolveNextPos(dx, dy), true);
      };

      carouselRoot.addEventListener(
        "pointerdown",
        (ev) => {
          if (ev.pointerType === "mouse" && ev.button !== 0) return;
          if (ev.target.closest(".snap-nav")) return;
          axisLock = null;
          pointerId = ev.pointerId;
          dragStartX = ev.clientX;
          dragStartY = ev.clientY;
          dragStartOffset = offsetPx;
          carouselRoot.setPointerCapture(ev.pointerId);
        },
        { passive: true }
      );

      carouselRoot.addEventListener(
        "pointermove",
        (ev) => {
          if (ev.pointerId !== pointerId) return;
          const dx = ev.clientX - dragStartX;
          const dy = ev.clientY - dragStartY;

          if (!axisLock) {
            if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
            axisLock = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
          }
          if (axisLock !== "x") return;

          ev.preventDefault();
          track.classList.add("is-dragging");
          setOffset(clampOffset(dragStartOffset + dx), false);
        },
        { passive: false }
      );

      carouselRoot.addEventListener(
        "pointerup",
        (ev) => {
          if (ev.pointerId !== pointerId) return;
          if (carouselRoot.hasPointerCapture(ev.pointerId)) {
            carouselRoot.releasePointerCapture(ev.pointerId);
          }
          finishDrag(ev.clientX, ev.clientY);
        },
        { passive: true }
      );

      carouselRoot.addEventListener(
        "pointercancel",
        (ev) => {
          if (ev.pointerId !== pointerId) return;
          pointerId = null;
          axisLock = null;
          snapToPos(posIndex, true);
        },
        { passive: true }
      );

      window.addEventListener("resize", () => snapToPos(posIndex, false));
    });
  }

  function bindSiteChrome() {
    const menu = document.getElementById("site-menu");
    const openBtn = document.querySelector("[data-menu-open]");
    const search = document.querySelector("[data-home-search]");
    if (!menu || !openBtn) return;

    const closeBtns = [...menu.querySelectorAll("[data-menu-close]")];
    const panel = menu.querySelector(".site-menu-panel");
    const catInputs = [...menu.querySelectorAll("[data-menu-cat]")];
    const tagInputs = [...menu.querySelectorAll("[data-menu-tag]")];
    const cards = search ? [...search.querySelectorAll("[data-search-card]")] : [];
    const cardsWrap = search ? search.querySelector("[data-search-cards]") : null;
    const countEl = search ? search.querySelector("[data-search-count]") : null;
    const sortBtn = search ? search.querySelector("[data-search-sort]") : null;
    const sortLabel = sortBtn ? sortBtn.querySelector("[data-search-sort-label]") : null;
    const sortMark = sortBtn ? sortBtn.querySelector("[data-search-sort-mark]") : null;
    const catBox = search ? search.querySelector("[data-filter-cats]") : null;
    const tagBox = search ? search.querySelector("[data-filter-tags]") : null;
    const more = search ? search.querySelector("[data-search-more]") : null;
    const moreLink = search ? search.querySelector("[data-search-more-link]") : null;
    const state = { cats: [], tags: [], dir: "new" };
    let lastFocus = null;

    const closeMenu = () => {
      menu.hidden = true;
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-menu-open");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    };

    const openMenu = () => {
      catInputs.forEach((el) => { el.checked = state.cats.includes(el.value); });
      tagInputs.forEach((el) => { el.checked = state.tags.includes(el.value); });
      lastFocus = document.activeElement;
      menu.hidden = false;
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-menu-open");
      menu.querySelector(".site-bar--menu [data-menu-close]")?.focus();
    };

    const chip = (label, kind) => {
      const el = document.createElement("span");
      el.className = "filter-chip";
      const text = document.createElement("span");
      text.className = "filter-chip-label";
      text.textContent = label;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-chip-x";
      btn.setAttribute("aria-label", label + "を外す");
      btn.textContent = "×";
      btn.addEventListener("click", () => {
        const key = kind === "cat" ? "cats" : "tags";
        state[key] = state[key].filter((v) => v !== label);
        applySearch();
        writeParams();
      });
      el.append(text, btn);
      return el;
    };

    const applySearch = () => {
      if (!search) return;
      const list = [...cards];
      list.sort((a, b) => {
        const pin = (a.hasAttribute("data-pin") ? 0 : 1) - (b.hasAttribute("data-pin") ? 0 : 1);
        if (pin) return pin;
        const da = a.getAttribute("data-date") || "";
        const db = b.getAttribute("data-date") || "";
        return state.dir === "old" ? da.localeCompare(db) : db.localeCompare(da);
      });
      if (cardsWrap) list.forEach((el) => cardsWrap.appendChild(el));
      let visible = 0;
      cards.forEach((card) => {
        const cat = card.getAttribute("data-category") || "";
        const tags = (card.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);
        const catOk = state.cats.length === 0 || state.cats.includes(cat);
        const tagOk = state.tags.length === 0 || state.tags.every((t) => tags.includes(t));
        const ok = catOk && tagOk;
        card.classList.toggle("is-filtered-out", !ok);
        if (ok) visible += 1;
      });
      if (countEl) countEl.textContent = String(visible);
      if (sortLabel) sortLabel.textContent = state.dir === "old" ? "古い順" : "新しい順";
      if (sortMark) sortMark.textContent = state.dir === "old" ? "▲" : "▼";
      if (catBox) catBox.replaceChildren(...state.cats.map((name) => chip(name, "cat")));
      if (tagBox) tagBox.replaceChildren(...state.tags.map((name) => chip(name, "tag")));
      if (more && moreLink) {
        const one = state.cats.length === 1;
        more.hidden = !one;
        if (one) {
          const base = moreLink.getAttribute("href").split("?")[0];
          moreLink.setAttribute("href", base + "?cat=" + encodeURIComponent(state.cats[0]));
        }
      }
    };

    const writeParams = () => {
      if (!search) return;
      const url = new URL(window.location.href);
      url.searchParams.delete("cat");
      url.searchParams.delete("tag");
      url.searchParams.delete("sort");
      state.cats.forEach((name) => url.searchParams.append("cat", name));
      state.tags.forEach((name) => url.searchParams.append("tag", name));
      if (state.dir === "old") url.searchParams.set("sort", "old");
      history.replaceState({}, "", url);
    };

    if (search) {
      const params = new URLSearchParams(window.location.search);
      const hasFilter = params.has("cat") || params.has("tag");
      const presetCat = search.getAttribute("data-current-cat");
      const presetTag = search.getAttribute("data-current-tag");
      if (hasFilter) {
        state.cats = params.getAll("cat").filter(Boolean);
        state.tags = params.getAll("tag").filter(Boolean);
      } else if (presetCat || presetTag) {
        state.cats = presetCat ? [presetCat] : [];
        state.tags = presetTag ? [presetTag] : [];
      } else {
        state.cats = ["お知らせ"];
        state.tags = ["葛藤"];
      }
      if (params.get("sort") === "old") state.dir = "old";
      applySearch();
      sortBtn?.addEventListener("click", () => {
        state.dir = state.dir === "new" ? "old" : "new";
        applySearch();
        writeParams();
      });
    }

    const homeBar = document.querySelector(".is-home .col-center > .site-bar");
    const heroLogo = document.querySelector(".hero-logo");
    const barQuery = window.matchMedia("(max-width: 59.99rem)");
    const syncBar = () => {
      if (!homeBar) return;
      if (!barQuery.matches) {
        homeBar.style.removeProperty("--bar-top");
        homeBar.style.removeProperty("--bar-bottom");
        return;
      }
      const barBottom = homeBar.getBoundingClientRect().bottom;
      const range = heroLogo
        ? Math.max(1, window.scrollY + heroLogo.getBoundingClientRect().bottom - barBottom)
        : 120;
      const t = Math.min(1, Math.max(0, window.scrollY / range));
      const top = Math.min(1, t / 0.72);
      const bottom = Math.max(0, (t - 0.28) / 0.72);
      homeBar.style.setProperty("--bar-top", top.toFixed(3));
      homeBar.style.setProperty("--bar-bottom", bottom.toFixed(3));
    };
    syncBar();
    window.addEventListener("scroll", syncBar, { passive: true });
    window.addEventListener("resize", syncBar);
    barQuery.addEventListener("change", syncBar);

    openBtn.addEventListener("click", openMenu);
    closeBtns.forEach((btn) => btn.addEventListener("click", closeMenu));
    menu.querySelectorAll("[data-menu-apply]").forEach((btn) => btn.addEventListener("click", () => {
      const cats = catInputs.filter((el) => el.checked).map((el) => el.value);
      const tags = tagInputs.filter((el) => el.checked).map((el) => el.value);
      const postsHref = btn.getAttribute("data-search-url") || "/posts/";
      const url = new URL(postsHref, window.location.origin);
      url.search = "";
      cats.forEach((name) => url.searchParams.append("cat", name));
      tags.forEach((name) => url.searchParams.append("tag", name));
      window.location.href = url.toString();
    }));

    document.addEventListener("keydown", (ev) => {
      if (menu.hidden) return;
      if (ev.key === "Escape") {
        ev.preventDefault();
        closeMenu();
        return;
      }
      if (ev.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll("a, button, input")].filter((el) => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    });
  }

  function bindHistoryAccordion() {
    const btn = document.querySelector("[data-history-toggle]");
    const panel = document.getElementById("article-history-panel");
    if (!btn || !panel) return;
    const plus = btn.querySelector(".article-updated-plus");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.hidden = open;
      if (plus) plus.textContent = open ? "+" : "×";
    });
  }

  bindCards();
  bindHomeCats();
  bindSiteChrome();
  bindListPage();
  bindArticleLinks();
  bindReviews();
  bindHistoryAccordion();
  bindArticleNav();
  bindHistoryTitles();
  bindSnapSlideshow();
  bindSnapCarousel();
})();
