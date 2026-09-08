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
    });

    // Fechar ao clicar em qualquer link
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Fechar ao clicar fora
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 2. Abas do Cardápio Interativo ("Il Menu")
  const tabButtons = document.querySelectorAll(".menu-tab-btn");
  const tabPanels = document.querySelectorAll(".menu-panel");

  tabButtons.forEach(button => {
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

    const now = new Date();
    // Considerar fuso de São Paulo (UTC-3)
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    
    // Horário local de São Paulo
    let spHours = utcHours - 3;
    if (spHours < 0) spHours += 24;
    const currentMinutes = spHours * 60 + utcMinutes;
    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

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

  // 4. Widget de Reserva Rápida via WhatsApp
  const selectPessoas = document.getElementById("reserva-pessoas");
  const selectPeriodo = document.getElementById("reserva-periodo");
  const inputData = document.getElementById("reserva-data");
  const btnWhatsApp = document.getElementById("btn-whatsapp-dynamic");

  // Configurar data mínima como hoje
  if (inputData) {
    const today = new Date().toISOString().split("T")[0];
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

  // 5. Ano Atual no Rodapé
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 6. Interatividade e Filtros da Carta de Vinhos (SOLID: Funções curtas e com responsabilidade única)

  // Determina se um item individual de vinho deve ser exibido
  function filtrarVinho(item, categoriaSelecionada) {
    const categoriaItem = item.getAttribute("data-category");
    const deveExibir = categoriaSelecionada === "todos" || categoriaItem === categoriaSelecionada;
    
    if (deveExibir) {
      item.classList.remove("wine-hidden");
    } else {
      item.classList.add("wine-hidden");
    }
  }

  // Atualiza o estado visual e semântico dos botões da carta
  function atualizarBotoesFiltro(botoes, botaoAtivo) {
    botoes.forEach(btn => {
      btn.classList.toggle("active", btn === botaoAtivo);
    });
  }

  // Aplica o filtro selecionado a todos os rótulos
  function aplicarFiltroVinhos(categoria, itens) {
    itens.forEach(item => filtrarVinho(item, categoria));
  }

  // Inicializa a filtragem por categoria na carta de vinhos
  function inicializarFiltroCartela() {
    const filterButtons = document.querySelectorAll(".cartela-filter-btn");
    const wineItems = document.querySelectorAll(".wine-item");

    if (!filterButtons.length || !wineItems.length) return;

    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const categoria = btn.getAttribute("data-filter");
        atualizarBotoesFiltro(filterButtons, btn);
        aplicarFiltroVinhos(categoria, wineItems);
      });
    });
  }

  // 7. Redirecionamento Suave para a Carta de Vinhos

  // Executa a rolagem suave com compensação para o cabeçalho fixo
  function rolarParaCartela(secao) {
    const cabecalhoAltura = document.querySelector(".site-header")?.offsetHeight || 80;
    const topbarAltura = document.querySelector(".topbar")?.offsetHeight || 40;
    const offsetTotal = cabecalhoAltura + topbarAltura + 10;
    
    const posicaoAlvo = secao.getBoundingClientRect().top + window.pageYOffset - offsetTotal;
    window.scrollTo({
      top: Math.max(0, posicaoAlvo),
      behavior: "smooth"
    });
  }

  // Configura os links que direcionam para a carta de vinhos
  function inicializarRedirecionamentoVinhos() {
    const gatilhosVinho = document.querySelectorAll('a[href="#cartela-vinhos"]');
    const secaoCartela = document.getElementById("cartela-vinhos");

    if (!secaoCartela || !gatilhosVinho.length) return;

    gatilhosVinho.forEach(link => {
      link.addEventListener("click", (evento) => {
        evento.preventDefault();
        rolarParaCartela(secaoCartela);

        // Atualiza a URL sem recarregar a página
        if (history.pushState) {
          history.pushState(null, null, "#cartela-vinhos");
        }
      });
    });
  }

  inicializarFiltroCartela();
  inicializarRedirecionamentoVinhos();
});

