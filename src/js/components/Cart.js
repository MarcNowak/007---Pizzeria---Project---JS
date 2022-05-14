import {
  select,
  classNames,
  templates,
  settings,
}
  from './setting.js';

import CartProduct from './components/CartProduct.js';
import utils from '../utils';

class Cart {                                     /* tworzymy klasę Cart obsługującą koszyk */
  constructor(element) {
    const thisCart = this;                      /* tworzymy stałą i zapisujemy w niej obiekt this */

    thisCart.products = [];                     /* tablica przechowuje produkty dodane do koszyka */

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('new Cart: ', thisCart);
  }

  getElements(element) {                         /* tworzymy metodę getElements*/
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);


    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    // referencja do elementu pokazującego koszt przesyłki

    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    // referencja do elementu pokazującego cenę końcową, ale bez kosztów przesyłki

    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    // referencja do WSZYSTKICH lementów pokazujących cenę końcową

    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    // referencja do elementu pokazującego liczbę sztuk

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    // referencja do elementu formularza <form>

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

  }

  initActions() {                               /* tworzymy metodę initActions*/
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      // dodajemy listener eventu 'click' na elemencie thisCart.dom.toggleTrigger

      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      // handler toggluje klasę zapisaną w
      // classNames.cart.wrapperActive na elemencie thisCart.dom.wrapper
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {

      event.preventDefault();
      thisCart.sendOrder();

    });

  }

  add(menuProduct) {                            /* tworzymy metodę add z argumentem menuProduct */
    // 9.4 TASK  
    const thisCart = this;

    // generate HTML based on template
    const generatedHTML = templates.cartProduct(menuProduct);

    // create element using utils.createElementFromHTML (tworzenie elementu DOM)
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* przyjmuje jako argument kod HTML (tekst) i zwraca element DOM na nim oparty*/

    // add element to menu
    thisCart.dom.productList.appendChild(generatedDOM);
    /* za pomocą metody appendChild dodajemy stworzony element do menu */

    console.log('adding product / productSummary:', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products: ', thisCart.products);

    thisCart.update();
  }

  update() {                                    /* tworzymy metodę update */
    const thisCart = this;
    // deklarujemy stałą thisCart

    let deliveryFee;
    // tworzymy stałą z  o cenie dostawy

    let totalNumber = 0;
    // odpowiada całościwoej liczbie sztuk

    let subtotalPrice = 0;
    // zsumowana cena za wszystko- ale bez ceny dostawt

    for (let product of thisCart.products) {
      // pętlą przechodzimy po thisCart.products

      totalNumber += product.amount;
      // zwiększamy liczbę produktów o wartość zapisaną w product.amount

      subtotalPrice += product.price;
      // zwiększamy cenę - wartość danego produktu
    }

    /* shorthand if */
    subtotalPrice > 0 ? deliveryFee = settings.cart.defaultDeliveryFee : deliveryFee = 0;
    /* condition      ? doThisIfTrue                                   : doThisIfFalse*/

    thisCart.totalPrice = subtotalPrice + deliveryFee;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;
    thisCart.deliveryFee = deliveryFee;
    // zapisanie danej informacji jako właściwość pozwala 
    // z niej skorzystać w innych metodach, np. w sendOrder()

    for (let total of thisCart.dom.totalPrice) {
      total.innerHTML = thisCart.totalPrice;
    }

  }

  remove(element) {
    const thisCart = this;
    element.dom.wrapper.remove();
    // usuwamy element / produkt z HTML

    const indexOfProduct = thisCart.products.indexOf(element);
    thisCart.products.splice(indexOfProduct, 1);
    // usuwamy danym produkt z tablicy

    thisCart.update();
    // wywołujemy metodę update do przeliczenia sum po usunięciu produktu
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      // wartość elementu input możemy odczytać
      // za pomocą właściwości 'value'

      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
    // .then(function(response) {
    //   return response.json();
    // }).then(function(parsedResponse){
    //   console.log('PARSED RESPONSE: ', parsedResponse);
    // });
    // tylko do sprawdzenia co zwraca funckcja
    // pod odkomentowaniu usunąć średnik w linii z fetchem


    // console.log('Payload: ', payload);
  }
}

export default Cart;