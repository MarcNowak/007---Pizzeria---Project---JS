import {
  settings,
  select,
} 
  from './settings.js';

import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {                                    /* deklaracja obiektu app */
  initMenu: function () {                        /* dodajemy deklarację metody app.initMenu */
    const thisApp = this;
    // console.log('thisApp.data: ', thisApp.data);

    for (let productData in thisApp.data.products) { /* tworzymy instancję dla każdego produktu przez użycie pętli */
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]); /*  przekazane do konstruktora jako "id" oraz "data"*/
    }
  },

  initData: function () {
    const thisApp = this;

    // thisApp.data = dataSource;                    /* thisApp.data to referencja do tych samych danych, do których kieruje OBIEKT dataSource */
    thisApp.data = {};

    // pobieranie danych o produktach przez API
    const url = settings.db.url + '/' + settings.db.products;
    //   http: //localhost:3131    /    products

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })

      .then(function (parsedResponse) {
        console.log('parsed response: ', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });

    console.log('thisApp.data: ', JSON.stringify(thisApp.data));
  },

  initCart: function () {                         /* dodajemy deklarację metody iniCart */
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    /* przekazujemy refencję do diva, w którym ma być obecny koszyk */

    thisApp.cart = new Cart(cartElem);            /* inicjuje instancję koszyka */

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event){
      // musimy użyć produktu, który został przekazany
      // w detail.product
      app.cart.add(event.detail.product);
      // event posiada obiekt detail (musi się tak nazywać), 
      // w którym znajduje się właściwość product

    });
  },

  init: function () {
    const thisApp = this;                         /* uruchamiamy metodę init na obiekcie app (app.init), dlatego this wskazuje na app */
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initData();
    // thisApp.initMenu(); - zbędne po dodaniu AJAXa
    thisApp.initCart();
  },
};

app.init();

