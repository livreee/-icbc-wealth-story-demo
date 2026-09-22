(function () {
  "use strict";

  const STORAGE_KEY = "icbc-fun-wealth-demo-v1";
  const initialState = Object.freeze({
    selectedAmount: 18,
    completedDays: 7,
    taskDone: false,
    streak: 7,
    beans: 420,
    balance: 126.4,
    monthlyCost: 3500,
    currentReserve: 2000,
    activeView: "today"
  });

  const journey = [
    { day: 1, title: "看见毛坯房", concept: "认识收支" },
    { day: 2, title: "铺下第一块地板", concept: "开始行动" },
    { day: 3, title: "凑整添一张床", concept: "小钱积累" },
    { day: 4, title: "盲盒添冰箱", concept: "低门槛存钱" },
    { day: 5, title: "退掉闲置订阅", concept: "隐性成本" },
    { day: 6, title: "猜猜昨日开支", concept: "预算意识" },
    { day: 7, title: "小家可以住了", concept: "阶段复盘" },
    { day: 8, title: "水管突然爆了", concept: "备用金" },
    { day: 9, title: "看看钱的雪球", concept: "复利启蒙" },
    { day: 10, title: "一天理性消费", concept: "冲动管理" },
    { day: 11, title: "每月留下一小笔", concept: "长期积累" },
    { day: 12, title: "看清分期价格", concept: "真实成本" },
    { day: 13, title: "气温存钱挑战", concept: "存钱仪式" },
    { day: 14, title: "小家像个家了", concept: "阶段复盘" },
    { day: 15, title: "门口的神奇理财", concept: "识别诈骗" },
    { day: 16, title: "认识经济名片", concept: "个人信用" },
    { day: 17, title: "搬开负债石头", concept: "负债成本" },
    { day: 18, title: "先保障再理财", concept: "保险作用" },
    { day: 19, title: "骰子存钱挑战", concept: "趣味坚持" },
    { day: 20, title: "我的小家故事", concept: "综合复盘" },
    { day: 21, title: "小家正式完工", concept: "习惯养成" }
  ];

  const chapters = [
    { name: "第一幕 觉醒", range: "第 1-7 天", start: 1, end: 7 },
    { name: "第二幕 积累", range: "第 8-14 天", start: 8, end: 14 },
    { name: "第三幕 守护", range: "第 15-21 天", start: 15, end: 21 }
  ];

  const teammates = [
    { name: "你", initial: "我", days: 7, note: "连续 7 天" },
    { name: "林晓", initial: "林", days: 8, note: "今天已完成" },
    { name: "陈然", initial: "陈", days: 7, note: "连续 5 天" },
    { name: "周周", initial: "周", days: 6, note: "昨天已完成" }
  ];

  let state = loadState();
  let toastTimer = 0;

  const elements = {
    monthlyCost: document.getElementById("monthly-cost"),
    currentReserve: document.getElementById("current-reserve"),
    coverageOutput: document.getElementById("coverage-output"),
    coverageMessage: document.getElementById("coverage-message"),
    amountOptions: document.getElementById("amount-options"),
    completeTask: document.getElementById("complete-task"),
    resetDemo: document.getElementById("reset-demo"),
    roomImage: document.getElementById("room-image"),
    sceneFrame: document.getElementById("scene-frame"),
    sceneStatus: document.getElementById("scene-status"),
    roomPercent: document.getElementById("room-percent"),
    roomProgressBar: document.getElementById("room-progress-bar"),
    furnitureCount: document.getElementById("furniture-count"),
    streakCount: document.getElementById("streak-count"),
    vaultBalance: document.getElementById("vault-balance"),
    beanCount: document.getElementById("bean-count"),
    weeklyCount: document.getElementById("weekly-count"),
    sideProgressBar: document.getElementById("side-progress-bar"),
    sideProgressText: document.getElementById("side-progress-text"),
    sideProgressPercent: document.getElementById("side-progress-percent"),
    journeyMap: document.getElementById("journey-map"),
    mapDays: document.getElementById("map-days"),
    memberList: document.getElementById("member-list"),
    copyCode: document.getElementById("copy-code"),
    successDialog: document.getElementById("success-dialog"),
    resultAmount: document.getElementById("result-amount"),
    closeResult: document.getElementById("close-result"),
    toast: document.getElementById("toast")
  };

  function loadState() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return { ...initialState };
      return { ...initialState, ...JSON.parse(saved) };
    } catch (error) {
      return { ...initialState };
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      showToast("当前浏览器未保存进度，但不影响本次演示。 ");
    }
  }

  function formatMoney(value) {
    return Number(value).toLocaleString("zh-CN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function clampNumber(value, minimum, maximum) {
    const number = Number(value);
    if (!Number.isFinite(number)) return minimum;
    return Math.min(maximum, Math.max(minimum, number));
  }

  function updateCalculator() {
    const monthly = clampNumber(elements.monthlyCost.value, 0, 999999);
    const reserve = clampNumber(elements.currentReserve.value, 0, 999999);
    state.monthlyCost = monthly;
    state.currentReserve = reserve;

    if (monthly <= 0) {
      elements.coverageOutput.textContent = "等待填写";
      elements.coverageMessage.textContent = "先填写每月必须支付的生活开支。";
      return;
    }

    const months = reserve / monthly;
    elements.coverageOutput.textContent = `约 ${Math.min(months, 99.9).toFixed(1)} 个月`;

    if (months >= 6) {
      elements.coverageMessage.textContent = "安全垫已经比较充足，可以定期复盘是否仍适合你。";
    } else if (months >= 3) {
      elements.coverageMessage.textContent = "已经有不错的缓冲，下一步是保持而不是冒进。";
    } else if (months >= 1) {
      elements.coverageMessage.textContent = "已经覆盖 1 个月开支，可以继续小步积累。";
    } else {
      elements.coverageMessage.textContent = "先攒到 1 个月必要开支，就是很稳的一步。";
    }

    saveState();
  }

  function selectAmount(amount) {
    state.selectedAmount = amount;
    elements.amountOptions.querySelectorAll("button").forEach((button) => {
      const selected = Number(button.dataset.amount) === amount;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    elements.completeTask.textContent = state.taskDone
      ? "第 8 天任务已完成"
      : `存入模拟小金库 ${amount} 元`;
    saveState();
  }

  function completeTask() {
    if (state.taskDone) {
      showToast("第 8 天已经完成，可用右上角按钮重置演示。 ");
      return;
    }

    state.taskDone = true;
    state.completedDays = 8;
    state.streak = 8;
    state.beans += 50;
    state.balance = Number((state.balance + state.selectedAmount).toFixed(2));
    saveState();
    renderAll();

    elements.resultAmount.textContent = `${state.selectedAmount} 元`;
    const resultStats = elements.successDialog.querySelectorAll(".result-stats strong");
    resultStats[0].textContent = String(state.streak);
    resultStats[1].textContent = String(state.beans);

    if (typeof elements.successDialog.showModal === "function") {
      elements.successDialog.showModal();
    } else {
      showToast(`第 8 天完成，小金库增加 ${state.selectedAmount} 元。`);
    }
  }

  function renderScene() {
    const percent = state.taskDone ? 44 : 36;
    const furniture = state.taskDone ? 8 : 6;
    const image = state.taskDone ? "room-day-8-after.svg" : "room-day-8-before.svg";
    const alt = state.taskDone
      ? "修好水管并增加暖灯和维修箱的小房间"
      : "刚完成基础布置但水管漏水的小房间";

    if (!elements.roomImage.src.endsWith(image.replaceAll("/", "\\")) && !elements.roomImage.src.endsWith(image)) {
      elements.sceneFrame.classList.add("is-updating");
      window.setTimeout(() => {
        elements.roomImage.src = image;
        elements.roomImage.alt = alt;
        elements.sceneFrame.classList.remove("is-updating");
      }, 140);
    } else {
      elements.roomImage.alt = alt;
    }

    elements.sceneStatus.textContent = state.taskDone
      ? "水管修好了，小家多了一层安心"
      : "水管漏了，需要一笔以防万一的钱";
    elements.roomPercent.textContent = `${percent}%`;
    elements.roomProgressBar.style.width = `${percent}%`;
    elements.furnitureCount.textContent = String(furniture);
  }

  function renderProgress() {
    const percent = Math.round((state.completedDays / 21) * 100);
    elements.sideProgressBar.style.width = `${percent}%`;
    elements.sideProgressText.textContent = `${state.completedDays} / 21 天`;
    elements.sideProgressPercent.textContent = `${percent}%`;
    elements.streakCount.textContent = String(state.streak);
    elements.vaultBalance.textContent = formatMoney(state.balance);
    elements.beanCount.textContent = String(state.beans);
    elements.weeklyCount.textContent = `${state.taskDone ? 2 : 1} / 7`;
    elements.mapDays.textContent = String(state.completedDays);
    elements.completeTask.disabled = state.taskDone;
    selectAmount(state.selectedAmount);
  }

  function dayStatus(day) {
    if (day <= state.completedDays) return "complete";
    if (!state.taskDone && day === 8) return "current";
    return "locked";
  }

  function renderJourney() {
    elements.journeyMap.textContent = "";

    chapters.forEach((chapter) => {
      const section = document.createElement("section");
      section.className = "chapter-section";

      const heading = document.createElement("div");
      heading.className = "chapter-heading";
      heading.innerHTML = `<h2>${chapter.name}</h2><span>${chapter.range}</span>`;

      const grid = document.createElement("div");
      grid.className = "day-grid";

      journey
        .filter((item) => item.day >= chapter.start && item.day <= chapter.end)
        .forEach((item) => {
          const status = dayStatus(item.day);
          const tile = document.createElement("article");
          tile.className = `day-tile is-${status}`;
          const statusLabel = status === "complete" ? "已完成" : status === "current" ? "进行中" : "未解锁";
          tile.innerHTML = `
            <span class="day-number">DAY ${item.day}</span>
            <strong>${item.title}</strong>
            <small>${statusLabel} · ${item.concept}</small>
          `;
          grid.appendChild(tile);
        });

      section.append(heading, grid);
      elements.journeyMap.appendChild(section);
    });
  }

  function renderTeam() {
    elements.memberList.textContent = "";
    teammates.forEach((member, index) => {
      const days = index === 0 && state.taskDone ? 8 : member.days;
      const note = index === 0 && state.taskDone ? "今天已完成" : member.note;
      const item = document.createElement("article");
      item.className = "member-item";
      item.innerHTML = `
        <span class="member-avatar" aria-hidden="true">${member.initial}</span>
        <div class="member-main">
          <div><strong>${member.name}</strong><span>${note}</span></div>
          <div class="member-progress" aria-label="${member.name}已完成${days}天"><span style="width:${Math.round((days / 21) * 100)}%"></span></div>
        </div>
        <span class="member-day">第 ${days} 天</span>
      `;
      elements.memberList.appendChild(item);
    });
  }

  function switchView(view, focusPanel) {
    const target = document.querySelector(`[data-view-panel="${view}"]`);
    if (!target) return;
    state.activeView = view;

    document.querySelectorAll("[data-view-panel]").forEach((panel) => {
      const active = panel.dataset.viewPanel === view;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });

    document.querySelectorAll("button[data-view]").forEach((button) => {
      const active = button.dataset.view === view;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    if (focusPanel) target.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    saveState();
  }

  function copyInviteCode() {
    const code = "JINDOU21";
    const success = () => showToast("邀请码 JINDOU21 已复制。 ");
    const fallback = () => showToast("邀请码：JINDOU21");

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(success).catch(fallback);
    } else {
      fallback();
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message.trim();
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
  }

  function resetDemo() {
    const shouldReset = window.confirm("将任务、金豆和模拟余额恢复到第 8 天开始前，继续吗？");
    if (!shouldReset) return;
    state = { ...initialState };
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // The in-memory reset still works when local storage is unavailable.
    }
    elements.monthlyCost.value = String(state.monthlyCost);
    elements.currentReserve.value = String(state.currentReserve);
    renderAll();
    switchView("today", false);
    showToast("演示已重置到第 8 天。 ");
  }

  function renderAll() {
    renderScene();
    renderProgress();
    renderJourney();
    renderTeam();
    updateCalculator();
  }

  elements.amountOptions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-amount]");
    if (button) selectAmount(Number(button.dataset.amount));
  });

  elements.monthlyCost.addEventListener("input", updateCalculator);
  elements.currentReserve.addEventListener("input", updateCalculator);
  elements.completeTask.addEventListener("click", completeTask);
  elements.resetDemo.addEventListener("click", resetDemo);
  elements.copyCode.addEventListener("click", copyInviteCode);
  elements.closeResult.addEventListener("click", () => elements.successDialog.close());
  elements.successDialog.addEventListener("click", (event) => {
    if (event.target === elements.successDialog) elements.successDialog.close();
  });

  document.querySelectorAll("button[data-view]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view, true));
  });

  elements.monthlyCost.value = String(state.monthlyCost);
  elements.currentReserve.value = String(state.currentReserve);
  renderAll();
  switchView(state.activeView, false);

  window.__wealthDemo = {
    getState: () => ({ ...state }),
    reset: () => {
      state = { ...initialState };
      renderAll();
    }
  };
})();
