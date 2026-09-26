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

    if (select) {
      const params = new URLSearchParams(window.location.search);
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
      mark.textContent = quote;
      mark.dataset.reviewId = comment.id || "";
      parent.insertBefore(document.createTextNode(before), node);
      parent.insertBefore(mark, node);
      parent.insertBefore(document.createTextNode(after), node);
      parent.removeChild(node);
      return mark;
    }
    return null;
  }

  function bindReviews() {
    const dataEl = document.getElementById("reviews-data");
    const body = document.querySelector("[data-article-body]");
    if (!dataEl || !body) return;
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

    const fill = (el, comment) => {
      el.replaceChildren();
      const meta = document.createElement("p");
      meta.className = "review-panel-author";
      const author = (comment.author && comment.author.display_name) || "";
      const when = comment.created_time ? comment.created_time.slice(0, 10) : "";
      meta.textContent = when ? `${author} · ${when}` : author;
      const bodyEl = document.createElement("p");
      bodyEl.className = "review-panel-body";
      bodyEl.textContent = comment.content || "";
      el.append(meta, bodyEl);
    };

    const render = (comment, target) => {
      if (desktop()) {
        fill(popup, comment);
        const rect = target.getBoundingClientRect();
        popup.style.top = `${rect.bottom + 8}px`;
        popup.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 328))}px`;
        popup.classList.add("is-open");
        panel.classList.remove("is-open");
      } else {
        fill(panel, comment);
        const block = target.closest("p, h1, h2, h3, h4, li, blockquote") || target;
        block.after(panel);
        panel.classList.add("is-open");
        popup.classList.remove("is-open");
        panel.scrollIntoView({ block: "nearest" });
      }
    };

    comments.forEach((c) => {
      const mark = wrapQuote(body, c.quoted_text, c);
      if (!mark) return;
      mark.addEventListener("click", (e) => {
        e.preventDefault();
        render(c, mark);
      });
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest(".review-mark, .review-popup, .review-panel")) return;
      popup.classList.remove("is-open");
      panel.classList.remove("is-open");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      popup.classList.remove("is-open");
      panel.classList.remove("is-open");
    });
  }

  bindCards();
  bindHomeCats();
  bindListPage();
  bindReviews();
})();
