let multiplyCount = 0;
let widgetReady = false;

// Модуль: изменения полей услуги в виджете (режим предпросмотра)
(function () {
  // инициализация всех доступных полей input
  window.InputHandler = {
    inputs: document.querySelectorAll("input, select, file"),
    removeFileBtn: document.querySelectorAll('[aria-label="Remove file"]'),
    initInputsEvent() {
      this.inputs.forEach((input) => {
        input.addEventListener("input", (e) => {
          const inputValue = e.target.value;
          const element = e.target;
          if (element.tagName === "INPUT") {
            WidgetFields.changeData(inputValue, element);
          }
          if (element.tagName === "SELECT") {
            let selectDataName = element.dataset.name;
            const dataName = selectDataName.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, "");
            if (dataName === "currency") {
              WidgetFields.changeCurrency(inputValue, element);
            }
            if (dataName === "repeats") {
              WidgetFields.changeData(inputValue, element);
            }
          }
          // console.log(element.tagName, element);
        });
      });
      this.removeFileBtn.forEach((item) => {
        item.addEventListener("click", () => {
          const dataName = item.dataset.name;
          const elements = Array.from(this.inputs);
          const targetInput =
            elements.find((e) => e.dataset.name === dataName) || null;
          WidgetFields.changeData(null, targetInput);
        });
      });
    },
  };

  // воркеры для виджета
  window.WidgetFields = {
    iFrame: function () {
      return document.querySelector("iframe") || null;
    },
    iframeDoc: function () {
      const iframe = this.iFrame();
      return iframe
        ? iframe.contentDocument || iframe.contentWindow.document
        : null;
    },
    docData: function () {
      return document.querySelectorAll("[widget-data-id]") || null;
    },
    widgetData: function () {
      const doc = this.iframeDoc();
      return doc ? doc.querySelectorAll("[widget-data-id]") : [];
    },
    currency: function () {
      const doc = this.iframeDoc();
      return doc ? doc.querySelectorAll(".currency-wrapper") : null;
    },
    state: {},
    // метод записи состаяния при инициализации виджета
    setState: function () {
      this.widgetData().forEach((title) => {
        const key = title.getAttribute("widget-data-id");
        const tilteVisibles = title.classList.contains("w-condition-invisible");
        const value = title.textContent;
        if (!tilteVisibles) {
          this.state[key] = value;
        }
      });
      this.docData().forEach((element) => {
        const key = element.getAttribute("widget-data-id");
        const elementVisible = !element.classList.contains(
          "w-condition-invisible"
        );
        const value = element.textContent;
        if (elementVisible) {
          this.state[key] = value;
        }
      });
      console.log("state is set", this.state);

      return this; // Allow chaining
    },
    changeData: function (inputValue, inputElement) {
      const inputDataName = inputElement.dataset.name;
      const inputType = inputElement.type === "file";

      // Обработка widgetData
      this.widgetData().forEach((item) => {
        const isInvisible = item.classList.contains("w-condition-invisible");
        const isTargetElement =
          item.getAttribute("widget-data-id") === inputDataName;
        if (isTargetElement && !isInvisible && !inputType) {
          item.textContent =
            inputValue.length > 0 ? inputValue : this.state[inputDataName];
        }

        if (isTargetElement && inputType && inputValue !== null) {
          const file = inputElement.files[0]; // Получаем первый файл из списка
          let img = item.querySelector("img");
          if (file) {
            const reader = new FileReader();
            // Когда файл загружен
            reader.onload = function (e) {
              const imageUrl = e.target.result; // Ссылка на изображение (data URL)
              img.src = imageUrl; // Устанавливаем ссылку как src для изображения
            };
            reader.readAsDataURL(file); // Читаем файл как data URL
          }
        }

        if (isTargetElement && inputType && inputValue === null) {
          let img = item.querySelector("img");
          img.src = "";
        }
      });

      // Обработка docData
      this.docData().forEach((element) => {
        const isInvisible = element.classList.contains("w-condition-invisible");
        const isTargetElement =
          element.getAttribute("widget-data-id") === inputDataName;
        if (isTargetElement && !isInvisible) {
          element.textContent =
            inputValue.length > 0 ? inputValue : this.state[inputDataName];
        }
      });
    },

    changeCurrency: async (inputValue, inputElement) => {
      const { default: currencySymbols } = await import(
        "https://esm.run/currency-symbols"
      );

      const inputDataName = inputElement.dataset.name;

      // Проверяем наличие символа валюты заранее
      const newCurrencySymbol = currencySymbols[inputValue];
      if (!newCurrencySymbol) {
        console.warn(`Currency symbol for "${inputValue}" not found.`);
        return;
      }

      WidgetFields.currency().forEach((currency) => {
        const currencyDataName = currency.getAttribute("widget-data-id");
        if (currencyDataName === inputDataName) {
          currency.textContent = newCurrencySymbol;
        }
      });
    },
  };
})();

// Модуль: синхронизация отображения  полей виджета и пользовательского интерфейса
(function () {
  window.SyncFields = {
    subscribeFields: Array.from(document.querySelectorAll(".subscribe-field")),
    // управление отображением полей подписки
    subscribeVisibility: function () {
      if (widgetReady) {
        const iframeDoc = WidgetFields.iframeDoc();
        const subscribeWigetFields = Array.from(
          iframeDoc.querySelectorAll(".subscribe-type")
        );

        this.subscribeFields.forEach((item, index) => {
          let shouldBeVisible = !item.classList.contains("hide");
          subscribeWigetFields[index].classList.toggle(
            "w-condition-invisible",
            !shouldBeVisible
          );
        });
      }
    },
    discountVisibility: function (...args) {
      console.log('work')
      let [discountId, state] = args;
      const iframeDoc = WidgetFields.iframeDoc();
      const discountField = Array.from(iframeDoc.querySelectorAll("[data-id]"));
      discountField.forEach(field => {
        let targetField = field.getAttribute("data-id");
        if (targetField === discountId && state) {
          console.log('show')
          field.classList.remove("w-condition-invisible");
        } else {
          console.log('hide')
          field.classList.add("w-condition-invisible");
        }
      })
    }
  };
})();

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

// Модуль: Управление дисконтом
(function () {
  window.Discount = {
    elements: null, 
    observer: null, 
    state: {}, 

    initDiscount() {
      if (!this.elements || this.elements.length === 0) {
        console.warn("Нет элементов для наблюдения!");
        return;
      }

      // Создаём MutationObserver
      this.observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            const target = mutation.target;
            const parent = target.closest(".discounted-wrapper");

            if (parent) {
              const isChecked = target.classList.contains(
                "w--redirected-checked"
              );
              this.updateState(parent, target, isChecked);
            }
          }
        });
      });

      // Инициализация элементов
      this.elements.forEach((el) => {
        const discountedElement = el.querySelector(".discounted");

        if (!discountedElement) {
          console.warn(
            `Элемент с классом .discounted отсутствует в контейнере ${el.dataset.id}`
          );
          return;
        }

        this.observeElement(discountedElement);
        this.initializeState(el);
      });
    },

    observeElement(element) {
      this.observer.observe(element, {
        attributes: true,
        attributeFilter: ["class"],
      });
    },

    initializeState(parent) {
      const discountedElement = parent.querySelector(".discounted");
      const isChecked =
        discountedElement?.classList.contains("w--redirected-checked") || false;

      if (!parent.dataset.id) {
        console.warn("Отсутствует атрибут data-id у элемента:", parent);
        return;
      }

      this.state[parent.dataset.id] = {
        parent,
        isDiscounted: isChecked,
        target: discountedElement,
      };
    },

    updateState(parent, target, isChecked) {
      const parentId = parent.dataset.id;

      if (!this.state[parentId]) {
        console.warn(`Не удалось найти состояние для ${parentId}`);
        return;
      }

      // Обновляем состояние
      this.state[parentId].isDiscounted = isChecked;

      console.log(`Обновлено состояние для ${parentId}`, this.state[parentId]);

      // Пример дальнейшей обработки
      if (isChecked) {
        console.log(`Дисконт активирован в элементе ${parentId}`);
        SyncFields.discountVisibility(parentId, true);

      } else {
        console.log(`Дисконт деактивирован в элементе ${parentId}`);
        SyncFields.discountVisibility(parentId, false);
      }
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
            WidgetFields.changeData("", input); // очистка полей виджета в услугах, которые не отображаються
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
        SyncFields.subscribeVisibility();
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
        SyncFields.subscribeVisibility();
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
          OptionsHandler.eventHandler({ target, parent, mainWrapper });
        });
      });
    },

    eventHandler({ target, parent, mainWrapper }) {
      const parentIndex = Array.from(mainWrapper.children).indexOf(parent);
      const visibleBlocks = Array.from(mainWrapper.children).filter(
        (block) => !block.classList.contains("hide")
      );

      if (target.getAttribute("option") === "up" && parentIndex > 0) {
        parent.parentNode.insertBefore(
          parent,
          parent.parentNode.children[parentIndex - 1]
        );
        OptionsHandler.updateMenu();
      } else if (
        target.getAttribute("option") === "down" &&
        parentIndex < parent.parentNode.children.length - 1 &&
        !parent.parentNode.children[parentIndex + 1].classList.contains("hide")
      ) {
        parent.parentNode.insertBefore(
          parent,
          parent.parentNode.children[parentIndex + 2]
        );
        OptionsHandler.updateMenu();
      } else if (target.getAttribute("option") === "delete") {
        parent.classList.add("hide");
        multiplyCount--;
        OptionsHandler.updateMenu();
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
      OptionsHandler.resetMenu({ optionWrapper });
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
    resetMenu({ optionWrapper }) {
      console.log("resetMenu");
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

// Модуль: Создание новых блоков с услугами в интерфейсе пользователя
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
  const discountBlocks = document.querySelectorAll(".discounted-wrapper");

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

  window.addEventListener("DOMContentLoaded", () => {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.addEventListener("load", () => {
        console.log("Widget has loaded!");
        widgetReady = true;
        WidgetFields.setState();
      });
    } else {
      console.log("Widget not found!");
    }
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

    ServiceBlocksHandler.addServiceBlock({
      btnAddMoreService,
      addServiceBtn,
      optionWrapper,
      multiplyWrapper,
      supportMessage,
    });

    Discount.elements = discountBlocks;
    Discount.initDiscount();
    InputHandler.initInputsEvent();
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
