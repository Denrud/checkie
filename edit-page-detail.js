let multiplyCount = 0;

// Модуль: Утилиты
(function Utilities() {
  window.Utils = {
    addClass(elements, className) {
      elements.forEach((el) => {
        if (!el.classList.contains(className)) {
          el.classList.add(className);
        }
      });
    },

    removeClass(elements, className) {
      elements.forEach((el) => {
        if (el.classList.contains(className)) {
          el.classList.remove(className);
        }
      });
    },
  };
})();

// Модуль: Очистка полей сервисных полей
(function ClearServiceFields() {
  window.ServiceFields = {
    // Метод для очистки полей скрытого блока
    clearFields(block, index) {
      const inputs = block.querySelectorAll("input, file, select");
      const removeFile = block.querySelector('[aria-label="Remove file"]');
      if (index !== 0) {
        inputs.forEach((input) => {
          if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false;
          } else {
            input.value = "";
            removeFile.click();
          }
        });
      }
    },
  };
})();

// Модуль: Логика переключения
(function SwitchLogic() {
  window.Switcher = {
    handleRadioChange(
      radio,
      subscribeFields,
      addService,
      multiplyWrapper,
      optionWrapper,
      btnAddMoreService,
      supportMessage
    ) {
      const selectedParams = Array.from(radio)
        .filter((btn) => btn.checked)
        .map((btn) => btn.id);

      this.switchLogic(
        selectedParams,
        subscribeFields,
        addService,
        multiplyWrapper,
        optionWrapper,
        btnAddMoreService,
        supportMessage
      );
    },

    switchLogic(
      selectedParams,
      subscribeFields,
      addService,
      multiplyWrapper,
      optionWrapper,
      btnAddMoreService,
      supportMessage
    ) {
      const { addClass, removeClass } = Utils;

      if (selectedParams.length === 0) {
        console.log("empty");
        return;
      }

      if (
        selectedParams.includes("one-time") &&
        selectedParams.includes("single-price")
      ) {
        addClass(subscribeFields, "hide");
        addClass([addService], "hide");
        ServiceBlocksHandler.removeServiceBlocks(
          multiplyWrapper,
          optionWrapper,
          btnAddMoreService,
          supportMessage
        );
      } else if (
        selectedParams.includes("subscription") &&
        selectedParams.includes("single-price")
      ) {
        removeClass(subscribeFields, "hide");
        addClass([addService], "hide");
        ServiceBlocksHandler.removeServiceBlocks(
          multiplyWrapper,
          optionWrapper,
          btnAddMoreService,
          supportMessage
        );
      } else if (
        selectedParams.includes("one-time") &&
        selectedParams.includes("multiple-price")
      ) {
        addClass(subscribeFields, "hide");
        removeClass([addService], "hide");
        // OptionsHandler.initMenu({ multiplyWrapper, optionWrapper })
      } else if (
        selectedParams.includes("subscription") &&
        selectedParams.includes("multiple-price")
      ) {
        removeClass(subscribeFields, "hide");
        removeClass([addService], "hide");
      } else {
        console.log("no match");
      }
    },
  };
})();

// модуль: Управление блоками с услугами (options menu)
(function () {
  const optionUp = Array.from(document.querySelectorAll("[option=up]"));
  const optionDown = Array.from(document.querySelectorAll("[option=down]"));
  const optionDelete = Array.from(document.querySelectorAll("[option=delete]"));

  window.OptionsHandler = {
    initMenu(arr) {
      arr.forEach((item) => {
        item.addEventListener("click", (e) => {
          const target = e.target;
          const parent = target.closest(".data-wrapper");
          const mainWrapper = parent.closest(".multiply-wrapper");
          console.log(e.target);
          console.log(parent); 
          OptionsHandler.eventHandler({target, parent, mainWrapper});
        });
      });
    },
    

    eventHandler({target, parent, mainWrapper}) {
      const parentIndex = Array.from(mainWrapper.children).indexOf(parent); 
      const visibleBlocks = Array.from(mainWrapper.children).filter(
        (block) => !block.classList.contains("hide")
      );
      
      if (target.getAttribute("option") === "up" && parentIndex > 0) {
        parent.parentNode.insertBefore(
          parent,
          parent.parentNode.children[parentIndex - 1]
        );
        OptionsHandler.updateMenu()
      } else if (
        target.getAttribute("option") === "down" &&
        parentIndex < parent.parentNode.children.length - 1 &&
        !parent.parentNode.children[parentIndex + 1].classList.contains(
          "hide"
        )
      ) {
        parent.parentNode.insertBefore(
          parent,
          parent.parentNode.children[parentIndex + 2]
        );
        OptionsHandler.updateMenu()
      } else if (target.getAttribute("option") === "delete") {
        parent.classList.add("hide");
        multiplyCount--;
        OptionsHandler.updateMenu()
      }
      if (multiplyCount === 0) {
        mainWrapper.children[multiplyCount].classList.add("hide");
      } else {
        console.log("set hide for btn");
        // btnAddMoreService.classList.remove("hide");
        // supportMessage.classList.add("hide");
      }
    },
    updateMenu() {
      const optionWrapper = document.querySelectorAll(".option-wrapper");
      OptionsHandler.resetMenu({optionWrapper});
      if (multiplyCount > 0) {
        
        optionWrapper.forEach((item, index) => {
          console.log(item);
          if (index === 0) {
            optionUp[index].closest(".btn-opt").classList.add("hide");
            optionDown[index].closest(".btn-opt").classList.remove("hide");
            optionDelete[index].closest(".btn-opt").classList.add("hide");
          } else if (index === 1) {
            optionUp[index].closest(".btn-opt").classList.remove("hide");
            optionDown[index].closest(".btn-opt").classList.remove("hide");
            optionDelete[index].closest(".btn-opt").classList.remove("hide");
          } else if (index === 2) {
            optionUp[index].closest(".btn-opt").classList.remove("hide");
            optionDown[index].closest(".btn-opt").classList.add("hide");
            optionDelete[index].closest(".btn-opt").classList.remove("hide");
          } else {
            console.log("no match");
          }
        });
      }
    },
    resetMenu({optionWrapper}) {
      console.log('resetMenu');
      optionWrapper.forEach((item, index) => {
        const upButton = item
          .querySelector('[option="up"]')
          .closest(".btn-opt");
        const downButton = item
          .querySelector('[option="down"]')
          .closest(".btn-opt");
        const deleteButton = item
          .querySelector('[option="delete"]')
          .closest(".btn-opt");
        upButton.classList.remove("hide");
        downButton.classList.remove("hide");
        deleteButton.classList.remove("hide");
      });
    },
  };
  //инициализация кнопок в меню при загрузке страницы
  OptionsHandler.initMenu(optionUp);
  OptionsHandler.initMenu(optionDown);
  OptionsHandler.initMenu(optionDelete);
})();

// Модуль: создания новых блоков с услугами
(function AddServiceBlock() {
  window.ServiceBlocksHandler = {
    addServiceBlock({
      btnAddMoreService,
      addServiceBtn,
      optionWrapper,
      multiplyWrapper,
      supportMessage,
    }) {
      addServiceBtn.addEventListener("click", () => {
        optionWrapper[multiplyCount].classList.remove("hide");

        if (multiplyCount < 2) {
          multiplyCount++;
          optionWrapper[multiplyCount].classList.remove("hide");
          multiplyWrapper.childNodes[multiplyCount].classList.remove("hide");
          OptionsHandler.updateMenu();
        } else {
          console.log("set hide for btn");
          btnAddMoreService.classList.add("hide");
          supportMessage.classList.remove("hide");
        }
        // // init состояние интерфейса
        // OptionsHandler.initMenu({
        //   optionWrapper,
        //   multiplyWrapper,
        // });
      });
    },
    
    // метод для удаления блоков с услугами и сброса полей
    removeServiceBlocks(
      multiplyWrapper,
      optionWrapper,
      btnAddMoreService,
      supportMessage
    ) {
      const serviceBlocks = Array.from(multiplyWrapper.children);
      serviceBlocks.forEach((block, index) => {
        ServiceFields.clearFields(block, index);

        if (multiplyCount > 0 && index !== 0) {
          optionWrapper[0].classList.add("hide");
          optionWrapper[index].classList.add("hide");
          block.classList.add("hide");

          if (
            serviceBlocks.filter((item) => item.classList.contains("hide"))
              .length === 2
          ) {
            multiplyCount = 0;
          }
        }
      });
      btnAddMoreService.classList.remove("hide");
      supportMessage.classList.add("hide");
    },
  };
})();

// Модуль: Инициализация
(function Init() {
  if (window.self !== window.top) {
    console.warn("Script running in iframe, skipping execution");
    return;
  }

  const subscribeFields = Array.from(
    document.querySelectorAll(".subscribe-field")
  );
  const addService = document.querySelector("#addServiceBlock");
  const addServiceBtn = document.querySelector("#addServiceBtn");
  const btnAddMoreService = document.querySelector(".btn-add-more-service");
  const optionWrapper = document.querySelectorAll(".option-wrapper");
  const radio = document.querySelectorAll("[type=radio]");
  const multiplyWrapper = document.querySelector(".multiply-wrapper");
  const supportMessage = document.querySelector(".support-message");

  // Handlers.attachOptionHandlers(
  //   optionUp,
  //   optionDown,
  //   optionDelete,
  //   multiplyWrapper,
  //   btnAddMoreService,
  //   supportMessage,
  //   optionWrapper
  // );

  ServiceBlocksHandler.addServiceBlock({
    btnAddMoreService,
    addServiceBtn,
    optionWrapper,
    multiplyWrapper,
    supportMessage,
  });

  if (radio.length === 0) {
    console.warn("No radio buttons found on the page");
    return;
  }

  radio.forEach((btn) => {
    btn.addEventListener("change", () => {
      try {
        Switcher.handleRadioChange(
          radio,
          subscribeFields,
          addService,
          multiplyWrapper,
          optionWrapper,
          btnAddMoreService,
          supportMessage
        );
      } catch (error) {
        console.error("Error in handleRadioChange:", error);
      }
    });
  });

  try {
    Switcher.handleRadioChange(
      radio,
      subscribeFields,
      addService,
      multiplyWrapper,
      optionWrapper,
      btnAddMoreService,
      supportMessage
    );
  } catch (error) {
    console.error("Error during initialization:", error);
  }
})();

// Модуль: Обработчики событий
/*(function EventHandlers() {
  window.Handlers = {
    attachOptionHandlers(
      optionUp,
      optionDown,
      optionDelete,
      multiplyWrapper,
      btnAddMoreService,
      supportMessage,
      optionWrapper
    ) {
      const arr = [optionUp, optionDown, optionDelete];
      function updateControls() {
        const visibleBlocks = Array.from(multiplyWrapper.children).filter(
          (block) => !block.classList.contains("hide")
        );
       
          // Обновляем кнопки управления для видимых блоков
          visibleBlocks.forEach((block, index) => {
            const upButton = block
              .querySelector('[option="up"]')
              .closest(".btn-opt");
            const downButton = block
              .querySelector('[option="down"]')
              .closest(".btn-opt");
            const deleteButton = block
              .querySelector('[option="delete"]')
              .closest(".btn-opt");

            // Управление кнопкой "Вверх"
            if (index === 0 && !optionWrapper[index].classList.contains("hide")) {
              upButton.classList.add("hide"); // Первый блок нельзя перемещать вверх
            } else {
              upButton.classList.remove("hide");
            }
            // Управление кнопкой "Вниз"
            if (index === visibleBlocks.length - 1 && !optionWrapper[index].classList.contains("hide")) {
              downButton.classList.add("hide"); // Последний блок нельзя перемещать вниз
            } else {
              downButton.classList.remove("hide");
            }

            // Управление кнопкой "Удалить"
            if (index === 0 && !optionWrapper[index].classList.contains("hide")) {
              deleteButton.classList.add("hide"); // Первый блок нельзя удалять
            } else {
              deleteButton.classList.remove("hide");
            }
          });

          // Перемещаем скрытые блоки в конец списка
          const hiddenBlocks = Array.from(multiplyWrapper.children).filter(
            (block) => block.classList.contains("hide")
          );
          hiddenBlocks.forEach((block) => {
            multiplyWrapper.appendChild(block); // Переместить скрытый блок в конец
            resetBlock(block); // Очистить поля скрытого блока
          });
        
      }
      // Обновляем UI при загрузке
      updateControls();

      // Функция для очистки полей скрытого блока
      function resetBlock(block) {
        const inputs = block.querySelectorAll("input, textarea, select");
        inputs.forEach((input) => {
          if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false;
          } else {
            input.value = "";
          }
        });
      }

      arr.forEach((item) =>
        item.forEach((option) => {
          option.addEventListener("click", (e) => {
            const target = e.target;
            const parent = target.closest(".data-wrapper");
            const parentIndex = Array.from(multiplyWrapper.children).indexOf(
              parent
            );
            const visibleBlocks = Array.from(multiplyWrapper.children).filter(
              (block) => !block.classList.contains("hide")
            );

            if (target.getAttribute("option") === "up" && parentIndex > 0) {
              parent.parentNode.insertBefore(
                parent,
                parent.parentNode.children[parentIndex - 1]
              );
            } else if (
              target.getAttribute("option") === "down" &&
              parentIndex < parent.parentNode.children.length - 1 &&
              !parent.parentNode.children[parentIndex + 1].classList.contains(
                "hide"
              )
            ) {
              parent.parentNode.insertBefore(
                parent,
                parent.parentNode.children[parentIndex + 1]
              );
            } else if (target.getAttribute("option") === "delete") {
              parent.classList.add("hide");
              multiplyCount--;
            }
            if (multiplyCount === 0) {
              optionWrapper[multiplyCount].classList.add("hide");
            } else {
              btnAddMoreService.classList.remove("hide");
              supportMessage.classList.add("hide");
            }
            // Обновляем состояние интерфейса
            updateControls();
          });
        })
      );
    },
  };
})();*/
