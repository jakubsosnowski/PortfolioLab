document.addEventListener("DOMContentLoaded", function() {
  /**
   * HomePage - Help section
   */
  class Help {
    constructor($el) {
      this.$el = $el;
      this.$buttonsContainer = $el.querySelector(".help--buttons");
      this.$slidesContainers = $el.querySelectorAll(".help--slides");
      this.currentSlide = this.$buttonsContainer.querySelector(".active").parentElement.dataset.id;
      this.init();
    }

    init() {
      const url = new URL(window.location.href);
    if (url.searchParams.get('fundations_page')) {
        this.currentSlide = '1';
    } else if (url.searchParams.get('organizations_page')) {
        this.currentSlide = '2';
    } else if (url.searchParams.get('collections_page')) {
        this.currentSlide = '3';
    }

    this.events();
    this.updateSlide();
    }


    updateSlide() {
    [...this.$buttonsContainer.children].forEach(btn => btn.firstElementChild.classList.remove("active"));
    this.$slidesContainers.forEach(el => el.classList.remove("active"));

    this.$buttonsContainer.querySelector(`[data-id="${this.currentSlide}"] a`).classList.add("active");
    this.$el.querySelector(`.help--slides[data-id="${this.currentSlide}"]`).classList.add("active");
}
    events() {
      /**
       * Slide buttons
       */
      this.$buttonsContainer.addEventListener("click", e => {
        if (e.target.classList.contains("btn")) {
          this.changeSlide(e);
        }
      });

      /**
       * Pagination buttons
       */
      this.$el.addEventListener("click", e => {
        if (e.target.classList.contains("btn") && e.target.parentElement.parentElement.classList.contains("help--slides-pagination")) {
          this.changePage(e);
        }
      });
    }

    changeSlide(e) {
      e.preventDefault();
      const $btn = e.target;

      // Buttons Active class change
      [...this.$buttonsContainer.children].forEach(btn => btn.firstElementChild.classList.remove("active"));
      $btn.classList.add("active");

      // Current slide
      this.currentSlide = $btn.parentElement.dataset.id;

      // Slides active class change
      this.$slidesContainers.forEach(el => {
        el.classList.remove("active");

        if (el.dataset.id === this.currentSlide) {
          el.classList.add("active");
        }
      });
    }

    /**
     * TODO: callback to page change event
     */
    changePage(e) {
      e.preventDefault();
      const page = e.target.dataset.page;
      const type = e.target.closest('.help--slides').dataset.id

      const url = new URL(window.location.href);

      url.searchParams.delete('fundations_page');
      url.searchParams.delete('organizations_page');
      url.searchParams.delete('collections_page')

      let pageParam = 'page'
      if (type == '1') {
        pageParam = 'fundations_page'
      } else if (type == '2') {
        pageParam = 'organizations_page'
      } else if (type == '3'){
        pageParam = 'collections_page'
      }

      url.searchParams.set(pageParam, page);

      window.location.href = url.href;
    }
  }
  const helpSection = document.querySelector(".help");
  if (helpSection !== null) {
    new Help(helpSection);
  }

  /**
   * Form Select
   */
  class FormSelect {
    constructor($el) {
      this.$el = $el;
      this.options = [...$el.children];
      this.init();
    }

    init() {
      this.createElements();
      this.addEvents();
      this.$el.parentElement.removeChild(this.$el);
    }

    createElements() {
      // Input for value
      this.valueInput = document.createElement("input");
      this.valueInput.type = "text";
      this.valueInput.name = this.$el.name;

      // Dropdown container
      this.dropdown = document.createElement("div");
      this.dropdown.classList.add("dropdown");

      // List container
      this.ul = document.createElement("ul");

      // All list options
      this.options.forEach((el, i) => {
        const li = document.createElement("li");
        li.dataset.value = el.value;
        li.innerText = el.innerText;

        if (i === 0) {
          // First clickable option
          this.current = document.createElement("div");
          this.current.innerText = el.innerText;
          this.dropdown.appendChild(this.current);
          this.valueInput.value = el.value;
          li.classList.add("selected");
        }

        this.ul.appendChild(li);
      });

      this.dropdown.appendChild(this.ul);
      this.dropdown.appendChild(this.valueInput);
      this.$el.parentElement.appendChild(this.dropdown);
    }

    addEvents() {
      this.dropdown.addEventListener("click", e => {
        const target = e.target;
        this.dropdown.classList.toggle("selecting");

        // Save new value only when clicked on li
        if (target.tagName === "LI") {
          this.valueInput.value = target.dataset.value;
          this.current.innerText = target.innerText;
        }
      });
    }
  }
  document.querySelectorAll(".form-group--dropdown select").forEach(el => {
    new FormSelect(el);
  });

  /**
   * Hide elements when clicked on document
   */
  document.addEventListener("click", function(e) {
    const target = e.target;
    const tagName = target.tagName;

    if (target.classList.contains("dropdown")) return false;

    if (tagName === "LI" && target.parentElement.parentElement.classList.contains("dropdown")) {
      return false;
    }

    if (tagName === "DIV" && target.parentElement.classList.contains("dropdown")) {
      return false;
    }

    document.querySelectorAll(".form-group--dropdown .dropdown").forEach(el => {
      el.classList.remove("selecting");
    });
  });

  /**
   * Switching between form steps
   */
  class FormSteps {
    constructor(form) {
      this.$form = form;
      this.$next = form.querySelectorAll(".next-step");
      this.$prev = form.querySelectorAll(".prev-step");
      this.$step = form.querySelector(".form--steps-counter span");
      this.currentStep = 1;

      this.$stepInstructions = form.querySelectorAll(".form--steps-instructions p");
      const $stepForms = form.querySelectorAll("form > div");
      this.slides = [...this.$stepInstructions, ...$stepForms];

      this.init();
    }

    /**
     * Init all methods
     */
    init() {
      this.events();
      this.updateForm();
    }

    /**
     * All events that are happening in form
     */
    events() {
      // Next step
      this.$next.forEach(btn => {
        btn.addEventListener("click", e => {
          e.preventDefault();
          this.currentStep++;
          this.updateForm();
        });
      });

      // Previous step
      this.$prev.forEach(btn => {
        btn.addEventListener("click", e => {
          e.preventDefault();
          this.currentStep--;
          this.updateForm();
        });
      });

      // Form submit
      this.$form.querySelector("form").addEventListener("submit", e => this.submit(e));
    }

    /**
     * Update form front-end
     * Show next or previous section etc.
     */
    updateForm() {
      this.$step.innerText = this.currentStep;

      // TODO: Validation

      this.slides.forEach(slide => {
        slide.classList.remove("active");

        if (slide.dataset.step == this.currentStep) {
          slide.classList.add("active");
        }
      });

      this.$stepInstructions[0].parentElement.parentElement.hidden = this.currentStep >= 6;
      this.$step.parentElement.hidden = this.currentStep >= 6;

      this.updateSummary();
    }

    updateSummary() {
    this.$step.innerText = this.currentStep;

    this.slides.forEach(slide => {
        slide.classList.remove("active");

        if (slide.dataset.step == this.currentStep) {
            slide.classList.add("active");
        }
    });

    this.$stepInstructions[0].parentElement.parentElement.hidden = this.currentStep >= 6;
    this.$step.parentElement.hidden = this.currentStep >= 6;

    // Update summary with selected categories
    this.updateSummaryCategory();
}

updateSummaryCategory() {
    const checkedCheckboxes = document.querySelectorAll('.category-checkbox:checked');
    const categories = [];

    checkedCheckboxes.forEach(checkbox => {
        const descriptionElement = checkbox.parentElement.querySelector('.description-checkbox');
        categories.push(descriptionElement.innerText);
    });

    const fundationChecked = document.querySelector('[data-step="3"] input[type="radio"]:checked');
    let fundationName = ''
    if(fundationChecked) {
    fundationName = fundationChecked.parentElement.querySelector('.description .title').innerText;
    }

    const bagsInputElement = document.querySelector("input[name='bags']");
    const bagsValue = bagsInputElement.value

    const categoriesText = categories.join(', ');
    const summaryCategoryElement = document.querySelector('.summary-bags');
    const fundationElement = document.querySelector('.summary-fundation');

    const addressData = document.querySelectorAll('.form--address')
    const courierData = document.querySelectorAll('.form--courier')

    let addressDataArr = [];
    for (let i= 0; i < addressData.length; i++){
        addressDataArr.push(addressData[i].value)
    }

    let courierDataArr = []
  for (let i=0; i<courierData.length; i++){
    courierDataArr.push(courierData[i].value)
  }

    if (summaryCategoryElement) {
        summaryCategoryElement.innerText = `Ilość worków ${bagsValue} - ${categoriesText}`;
    }
    if (fundationElement){
      fundationElement.innerText = `Dla ${fundationName}`
    }

    const addressResultGroup = document.querySelector('.address-results ul');
    addressResultGroup.innerHTML = '';
    addressDataArr.forEach(element => {
      let li = document.createElement('li');
      li.innerText = element;
      addressResultGroup.appendChild(li);
    })

    const courierResultGroup = document.querySelector('.courier-results ul');
    courierResultGroup.innerHTML = ''
    courierDataArr.forEach(element => {
      let li = document.createElement('li')
      li.innerText = element
      courierResultGroup.appendChild(li);
    })



}
    /**
     * Submit form
     *
     * TODO: validation, send data to server
     */
    submit(e) {
      if (this.currentStep <5) {
        e.preventDefault();
        this.currentStep++;
        this.updateForm();
      } else {
        console.log('Formularz wysłany')
      }
    }
  }

  const form = document.querySelector(".form--steps");
  if (form !== null) {
    new FormSteps(form);
  }

  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const organizationItems = document.querySelectorAll('.organization-item');

  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', filterOrganizations);
  });

  function filterOrganizations() {
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value);

    organizationItems.forEach(item => {
      const itemCategories = item.getAttribute('data-categories').split(',');
      const isVisible = selectedCategories.every(category => itemCategories.includes(category));

      if (isVisible) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  filterOrganizations();
});
