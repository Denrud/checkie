window.addEventListener("DOMContentLoaded", () => {
  // Элементы
  const tabButtons = document.querySelectorAll("a[data-w-tab]"); // Скрытые табы
  const dropdownTabs = document.querySelectorAll("[tab]"); // Триггеры в подменю
  const menuItems = document.querySelectorAll("[menu-name]"); // Триггеры верхнего уровня

  // Связь tabButtons и dropdownTabs через атрибут
  function syncDropdownWithTabs() {
    dropdownTabs.forEach((dropdownTab) => {
      dropdownTab.addEventListener("click", () => {
        const tabAttr = dropdownTab.getAttribute("tab"); // Атрибут для синхронизации
        const targetTabButton = Array.from(tabButtons).find(
          (btn) => btn.getAttribute("data-w-tab") === tabAttr
        );

        if (targetTabButton) {
          targetTabButton.click(); // Имитируем клик на соответствующий tabButton

          // Обновляем классы активности для обёртки и иконки
          const dropdownWrapper = dropdownTab.closest(".navigation-item-link");
          if (dropdownWrapper) {
            resetActiveDropdowns(); // Сбрасываем активные состояния других подменю
            dropdownWrapper.classList.add("active");
            const icon = dropdownWrapper.querySelector(".navigation-item-list-elment");
            if (icon) icon.classList.add("active");
          }
        }
      });
    });
  }

  // Сброс активных состояний всех подменю
  function resetActiveDropdowns() {
    dropdownTabs.forEach((dropdownTab) => {
      const dropdownWrapper = dropdownTab.closest(".navigation-item-link");
      if (dropdownWrapper) {
        dropdownWrapper.classList.remove("active");
        const icon = dropdownWrapper.querySelector(".navigation-item-list-elment");
        if (icon) icon.classList.remove("active");
      }
    });
  }

  // Обработчик для верхнего меню
  function setupMenuItems() {
    menuItems.forEach((menuItem) => {
      menuItem.addEventListener("click", (e) => {
        resetMenuState(); // Сброс всех меню
        const menuWrapper = e.target.closest(".navmenu-block"); // Ищем обёртку текущего меню
        if (menuWrapper) {
          toggleMenu(menuWrapper, true); // Активируем текущую обёртку
        }
      });
    });
  }

  // Сброс состояния всех меню
  function resetMenuState() {
    menuItems.forEach((menuItem) => {
      const menuWrapper = menuItem.closest(".navmenu-block");
      if (menuWrapper) {
        toggleMenu(menuWrapper, false); // Скрываем каждую обёртку
      }
    });
  }

  // Управление состоянием меню
  function toggleMenu(menuWrapper, isActive) {
    const navbarDw = menuWrapper.querySelector(".navbar-dw");
    const activeIcon = menuWrapper.querySelector(".icon-active");
    const dropdownMenu = menuWrapper.querySelector(".dw-menu");

    if (isActive) {
      navbarDw?.classList.add("active");
      activeIcon?.classList.remove("hide");
      activeIcon?.classList.add("active");
      dropdownMenu?.classList.remove("hide");
    } else {
      navbarDw?.classList.remove("active");
      activeIcon?.classList.remove("active");
      activeIcon?.classList.add("hide");
      dropdownMenu?.classList.add("hide");
    }
  }

  // Инициализация
  syncDropdownWithTabs();
  setupMenuItems();
});


