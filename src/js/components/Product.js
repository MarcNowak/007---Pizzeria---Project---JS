import {
  select,
  classNames,
  templates
} 
  from './settings.js';
  
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

class Product {                                  /* tworzymy klasę Product */
  constructor(id, data) {                        /* z app.initMenu: id = productData, data = thisApp.data.products[productData]*/
    const thisProduct = this;                    /*  thisProduct.id- to samo co w przykładzie z Employee: thisEmoployee.name*/

    thisProduct.id = id;                         /* zapisujemy wartości argumentów do właściwości instancji*/
    thisProduct.data = data;                     /* używamy 'this / thisProduct', który jest odnośnikiem do obiektu <new Product>*/

    thisProduct.renderInMenu();                  /* konstruktor uruchomi tę funkcję od razu po utworzeniu instancji */
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();


    // console.log('new Product: ', thisProduct);
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

    thisProduct.dom = {};

    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    // referencja do pojedynczego elementu o selektorze zapisanym w select.menuProduct.imageWrapper

    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    // referencja do diva z inputem i buttonami "+" i "-".
  }

  initAccordion() {                              /* tworzymy metodę initAccordion */
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    // po dodaniu referencji accordionTrigger w getElements stała clickableTrigger nie jest już potrzebna

    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
      // stałą clickableTrigger zamieniamy na referencję

      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      // console.log('active products: ', activeProduct);

      if (activeProduct !== null && activeProduct !== thisProduct.element) activeProduct.classList.remove('active');
      // (activeProduct !== null && activeProduct !== thisProduct.element) ? activeProduct.classList.remove('active') : thisProduct.element;
      // short if nie jest potrzebny w tej sytuacji. Sama konstrukcja short ifa jest zbudowana poprawnie

      // console.log('zdjęta klasa active: ', activeProduct);

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
      // console.log('toggle class: ', thisProduct.element);

    });
  }

  initOrderForm() {                              /* tworzymy metodę initOrderForm */
    const thisProduct = this;                    /* jest ona uruchamiana tylko raz dla każdego produktu */
    // console.log('initOrderForm:');

    thisProduct.dom.form.addEventListener('submit', function (event) {    /* dodaje event listener do formularza */
      event.preventDefault();         /* blokujemy domyślną akcję: wysłanie formularza, reload strony, zmianę URL */
      thisProduct.processOrder();     /* funkcja callback: metoda processOrder bez argumentów*/
    });

    for (let input of thisProduct.dom.formInputs) {    /* dodaje event listener do kontrolek formularza */
      input.addEventListener('change', function () {
        thisProduct.processOrder();   /* funkcja callback: metoda processOrder bez argumentów*/
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function (event) {     /* dodaje event listener do guzika dodania do koszyka */
      event.preventDefault();         /* blokujemy domyślną akcję: wysłanie formularza, reload strony, zmianę URL */
      thisProduct.processOrder();     /* funkcja callback: metoda processOrder bez argumentów*/
      thisProduct.addToCart();        /* */
    });
  }

  processOrder() {                               /* tworzymy metodę processOrder */
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    /* konwertuje otrzymany obiekt formularza na zwykły obiekt JS*/

    // console.log('formdata: ', formData);

    // set price to default price
    let price = thisProduct.data.price;
    /* ustawiamy wartość 'price" danego produktu jako cenę domyślną */

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);

      // for every option in this category
      for (let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);

        // check if there is param with a name of paramId in formData and if it includes optionId
        // if (formData[paramId] && formData[paramId].includes(optionId)) {
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {

          // check if the option is not default
          if (!option.default == true) {

            // add option price to price variable
            price += option.price;
          }
        } else {
          // check if the option is default
          if (option.default == true)

            // reduce price variable
            price -= option.price;
        }

        // wyświetlanie obrazków 
        const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        // szukamy obrazka odpowiadającego konkretnej parze kategoria-opcja

        if (optionImage) {
          if (optionSelected) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    thisProduct.priceSingle = price;
    // każde uruchomienie processOrder zaktualizuje thisProduct.priceSingle
    // metoda uruchamia się przy każdej zmianie opcji
    // dlatego priceSingle zawsze zwraca aktualną cenę jednostkową

    // multiply price by amount
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  initAmountWidget() {                           /* tworzymy metodę initAmountWidget */
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);

    thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  addToCart() {                                  /* tworzymy metodę addToCart */
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());
    // przekazujemy to co zwróciła metoda thisProduct.prepareCartProduct

    // CustomEvent - klasa wbudowana w przeglądarkę
    // pierwszym argumentem konstruktora będzie nazwa eventu "add-to-cart"
    // drugim argumentem: obiekt zawierający ustawienia eventu
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      // będzie przekazywany do swojego rodzica, rodzica rodzica itd...
      detail: {
        // żeby pod kluczem produkt znajdował się produkt
        // który został dodany do koszyka
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {                        /* tworzymy metodę prepareCartProduct */
    const thisProduct = this;

    const productSummary = {

      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;

  }

  prepareCartProductParams() {                   /* tworzymy metodę pprepareCartProductParam */
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    /* konwertuje otrzymany obiekt formularza na zwykły obiekt JS*/

    // console.log('formdata: ', formData);

    const params = {};

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {         /* toppings = { */
        label: param.label,       /*    label: Toppings, */
        options: {}               /*    options: {} */
      };

      // for every option in this category
      for (let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);

        // check if there is param with a name of paramId in formData and if it includes optionId
        // if (formData[paramId] && formData[paramId].includes(optionId)) {
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          // option is selected!

          params[paramId].options[optionId] = option.label;
        }
      }
    }

    return params;
  }
}

export default Product;