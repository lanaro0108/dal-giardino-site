/**
 * DAL GIARDINO — Scripts de Interatividade & Hospitalidade
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Menu Mobile Toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen);
      menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    // Fechar ao clicar em qualquer link
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menu");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menu");
        menuToggle.focus();
      }
    });

    // Fechar ao clicar fora
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menu");
      }
    });
  }

  // 2. Abas do Cardápio Interativo ("Il Menu")
  const tabButtons = document.querySelectorAll(".menu-tab-btn");
  const tabPanels = document.querySelectorAll(".menu-panel");

  tabButtons.forEach((button, buttonIndex) => {
    button.id = button.id || `menu-tab-${buttonIndex + 1}`;
    const controlledPanel = document.getElementById(button.getAttribute("aria-controls"));
    if (controlledPanel) controlledPanel.setAttribute("aria-labelledby", button.id);

    button.addEventListener("keydown", (event) => {
      const currentIndex = Array.from(tabButtons).indexOf(button);
      let nextIndex = currentIndex;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabButtons.length;
      if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabButtons.length - 1;
      if (nextIndex !== currentIndex) {
        event.preventDefault();
        tabButtons[nextIndex].focus();
        tabButtons[nextIndex].click();
      }
    });

    button.addEventListener("click", () => {
      const targetPanelId = button.getAttribute("aria-controls");

      // Atualiza botões
      tabButtons.forEach(btn => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      // Atualiza painéis
      tabPanels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.add("active");
          panel.removeAttribute("hidden");
        } else {
          panel.classList.remove("active");
          panel.setAttribute("hidden", "true");
        }
      });
    });
  });

  // 3. Status de Funcionamento em Tempo Real
  function updateRestaurantStatus() {
    const statusTextEl = document.getElementById("status-text");
    const statusBadgeEl = document.getElementById("restaurant-status");
    if (!statusTextEl || !statusBadgeEl) return;

    const saoPauloParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());
    const parts = Object.fromEntries(saoPauloParts.map(part => [part.type, part.value]));
    const dayOfWeek = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday];
    const currentMinutes = (Number(parts.hour) % 24) * 60 + Number(parts.minute);

    let isOpen = false;
    let message = "";

    // Segunda-feira (1)
    if (dayOfWeek === 1) {
      isOpen = false;
      message = "Fechado hoje (Descanso) · Reabre terça às 11h30";
    } 
    // Domingo (0)
    else if (dayOfWeek === 0) {
      const lunchStart = 11 * 60 + 30; // 11:30
      const lunchEnd = 16 * 60;        // 16:00
      if (currentMinutes >= lunchStart && currentMinutes <= lunchEnd) {
        isOpen = true;
        message = "Aberto agora para almoço (até 16h00)";
      } else if (currentMinutes < lunchStart) {
        isOpen = false;
        message = "Abre hoje para almoço às 11h30";
      } else {
        isOpen = false;
        message = "Fechado agora · Reabre terça às 11h30";
      }
    }
    // Sábado (6)
    else if (dayOfWeek === 6) {
      const lunchStart = 11 * 60 + 30; // 11:30
      const lunchEnd = 15 * 60;        // 15:00
      const dinnerStart = 18 * 60 + 30;// 18:30
      const dinnerEnd = 23 * 60;       // 23:00

      if (currentMinutes >= lunchStart && currentMinutes <= lunchEnd) {
        isOpen = true;
        message = "Aberto agora para almoço (até 15h00)";
      } else if (currentMinutes >= dinnerStart && currentMinutes <= dinnerEnd) {
        isOpen = true;
        message = "Aberto agora para jantar (até 23h00)";
      } else if (currentMinutes < lunchStart) {
        isOpen = false;
        message = "Abre hoje para almoço às 11h30";
      } else if (currentMinutes < dinnerStart) {
        isOpen = false;
        message = "Abre hoje para jantar às 18h30";
      } else {
        isOpen = false;
        message = "Fechado agora · Reabre domingo às 11h30";
      }
    }
    // Terça a Sexta (2, 3, 4, 5)
    else {
      const lunchStart = 11 * 60 + 30; // 11:30
      const lunchEnd = 14 * 60 + 30;   // 14:30
      const dinnerStart = 18 * 60 + 30;// 18:30
      const dinnerEnd = 23 * 60;       // 23:00

      if (currentMinutes >= lunchStart && currentMinutes <= lunchEnd) {
        isOpen = true;
        message = "Aberto agora para almoço (até 14h30)";
      } else if (currentMinutes >= dinnerStart && currentMinutes <= dinnerEnd) {
        isOpen = true;
        message = "Aberto agora para jantar (até 23h00)";
      } else if (currentMinutes < lunchStart) {
        isOpen = false;
        message = "Abre hoje para almoço às 11h30";
      } else if (currentMinutes < dinnerStart) {
        isOpen = false;
        message = "Abre hoje para jantar às 18h30";
      } else {
        isOpen = false;
        message = "Fechado agora · Reabre amanhã às 11h30";
      }
    }

    statusTextEl.textContent = message;
    if (isOpen) {
      statusBadgeEl.classList.remove("closed");
    } else {
      statusBadgeEl.classList.add("closed");
    }
  }

  updateRestaurantStatus();
  window.setInterval(updateRestaurantStatus, 60000);

  // 4. Widget de Reserva Rápida via WhatsApp
  const selectPessoas = document.getElementById("reserva-pessoas");
  const selectPeriodo = document.getElementById("reserva-periodo");
  const inputData = document.getElementById("reserva-data");
  const btnWhatsApp = document.getElementById("btn-whatsapp-dynamic");

  // Configurar data mínima como hoje
  if (inputData) {
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const dateValues = Object.fromEntries(dateParts.map(part => [part.type, part.value]));
    const today = `${dateValues.year}-${dateValues.month}-${dateValues.day}`;
    inputData.min = today;
  }

  function updateWhatsAppLink() {
    if (!btnWhatsApp) return;

    const pessoas = selectPessoas ? selectPessoas.value : "4 pessoas";
    const periodo = selectPeriodo ? selectPeriodo.value : "Jantar";
    let dataStr = "";

    if (inputData && inputData.value) {
      const [ano, mes, dia] = inputData.value.split("-");
      dataStr = ` para o dia ${dia}/${mes}/${ano}`;
    }

    const mensagem = `Olá! Gostaria de verificar a disponibilidade de uma reserva na Dal Giardino para ${pessoas}${dataStr}, no período do ${periodo}.`;
    const encoded = encodeURIComponent(mensagem);
    btnWhatsApp.href = `https://wa.me/5519983382030?text=${encoded}`;
  }

  if (selectPessoas) selectPessoas.addEventListener("change", updateWhatsAppLink);
  if (selectPeriodo) selectPeriodo.addEventListener("change", updateWhatsAppLink);
  if (inputData) inputData.addEventListener("change", updateWhatsAppLink);
  updateWhatsAppLink();

  const eventForm = document.querySelector(".event-form");
  if (eventForm) {
    eventForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(eventForm);
      const mensagem = [
        "Olá! Gostaria de informações sobre um evento no Dal Giardino.",
        `Nome: ${formData.get("nome") || "Não informado"}`,
        `Telefone: ${formData.get("telefone") || "Não informado"}`,
        `E-mail: ${formData.get("email") || "Não informado"}`,
        `Convidados: ${formData.get("convidados") || "Não informado"}`,
        `Detalhes: ${formData.get("text") || "Não informado"}`
      ].join("\n");
      const whatsappUrl = `https://wa.me/5519983382030?text=${encodeURIComponent(mensagem)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  }

  // 5. Ano Atual no Rodapé
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});

