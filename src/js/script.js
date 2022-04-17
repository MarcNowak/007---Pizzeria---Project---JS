/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {                                  /* tworzymy klasę Product */
    constructor(id, data) {                        /* z app.initMenu: id = productData, data = thisApp.data.products[productData]*/
      const thisProduct = this;                    /*  thisProduct.id- to samo co w przykładzie z Employee: thisEmoployee.name*/

      thisProduct.id = id;                         /* zapisujemy wartości argumentów do właściwości instancji*/
      thisProduct.data = data;                     /* używamy 'this / thisProduct', który jest odnośnikiem do obiektu <new Product>*/

      thisProduct.renderInMenu();                  /* konstruktor uruchomi tę funkcję od razu po utworzeniu instancji */
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();


      console.log('new Product: ', thisProduct);
    }

    renderInMenu() {                                /* tworzymy metodę renderInMenu */
      const thisProduct = this;

      // generate HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* wywołujemy metodę templates.menuProduct [jest zapisana nad klasą Product] i przekazujemy jej dane produktu */
      // console.log('generated HTML: ', generatedHTML); - działa

      // create element using utils.createElementFromHTML (tworzenie elementu DOM)
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* przyjmuje jako argument kod HTML (tekst) i zwraca element DOM na nim oparty*/
      /* element DOM jest zapisany jako właściwość instancji */
      /* mamy do niego dostęp również w innych metodach instancji, nie tylko w renderInMenu */

      // find menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* obiekt 'select' + odpowiednie obiekty-dzieci */

      // add element to menu
      menuContainer.appendChild(thisProduct.element);
      /* za pomocą metody appendChild dodajemy stworzony element do menu */
    }

    getElements() {                                 /* tworzymy metodę getElements*/
      const thisProduct = this;                     /* która odnajdzie elementy w kontenerze produktu */

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }

    initAccordion() {                              /* tworzymy metodę initAccordion */
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // po dodaniu referencji accordionTrigger w getElements stała clickableTrigger nie jest już potrzebna

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        // stałą clickableTrigger zamieniamy na referencję

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        console.log('active products: ', activeProduct);

        if (activeProduct !== null && activeProduct !== thisProduct.element) activeProduct.classList.remove('active');
        // (activeProduct !== null && activeProduct !== thisProduct.element) ? activeProduct.classList.remove('active') : thisProduct.element;
        // short if nie jest potrzebny w tej sytuacji. Sama konstrukcja short ifa jest zbudowana poprawnie

        console.log('zdjęta klasa active: ', activeProduct);

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
        console.log('toggle class: ', thisProduct.element);

      });
    }

    initOrderForm() {                              /* tworzymy metodę initOrderForm */
      const thisProduct = this;                    /* jest ona uruchamiana tylko raz dla każdego produktu */
      console.log('initOrderForm:');

      thisProduct.form.addEventListener('submit', function(event){    /* dodaje event listener do formularza */
        event.preventDefault();         /* blokujemy domyślną akcję: wysłanie formularza, reload strony, zmianę URL */
        thisProduct.processOrder();     /* funkcja callback: metoda processOrder bez argumentów*/
      });

      for(let input of thisProduct.formInputs){    /* dodaje event listener do kontrolek formularza */
        input.addEventListener('change', function(){
          thisProduct.processOrder();   /* funkcja callback: metoda processOrder bez argumentów*/
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){     /* dodaje event listener do guzika dodania do koszyka */
        event.preventDefault();         /* blokujemy domyślną akcję: wysłanie formularza, reload strony, zmianę URL */
        thisProduct.processOrder();     /* funkcja callback: metoda processOrder bez argumentów*/
      });
    }

    processOrder() {                               /* tworzymy metodę processOrder*/
      const thisProduct = this;
      
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      /* konwertuje otrzymany obiekt formularza na zwykły obiekt JS*/

      console.log('formdata: ', formData);

      // set price to default price
      let price = thisProduct.data.price;
      /* ustawiamy wartość 'price" danego produktu jako cenę domyślną */

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options){
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          console.log(optionId, option);
        }
      }

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
  }

  const app = {                                    /* deklaracja obiektu app */
    initMenu: function () {                        /* dodajemy deklarację metody app.initMenu */
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);

      for (let productData in thisApp.data.products) { /* tworzymy instancję dla każdego produktu przez użycie pętli */
        new Product(productData, thisApp.data.products[productData]); /*  przekazane do konstruktora jako "id" oraz "data"*/
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;                    /* thisApp.data to referencja do tych samych danych, do których kieruje OBIEKT dataSource */
    },

    init: function () {
      const thisApp = this;                         /* uruchamiamy metodę init na obiekcie app (app.init), dlatego this wskazuje na app */
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();

  // 01 - app.init
  // 02 - app.initData
  // 03 - app.initMenu
  // 04 - renderInMenu dla każdej utworzonej instancji
  // 05 - app.initAccordion
}
