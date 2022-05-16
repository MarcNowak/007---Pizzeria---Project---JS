import {
  settings,
  select,
  classNames,
}
  from './settings.js';

import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {                                    /* deklaracja obiektu app */

  initPages: function () {                      /* deklaracja metody initaPages odpowiadającej za wyświetlanie podstron*/
    const thisApp = this;

    // właściwość pages - będziemy niej przechowywać wszystkie kontenery podstron
    // jakie musimy wyszukać w drzewie DOM
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    // dzięki właściwości children w PAGES znajdą się wszystkie dzieci kontenera stron

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    // jak wydobyć hash
    const idFromHash = window.location.hash.replace('#/', '');


    // przekazujemy ID pierwszej ze znalezionych podstron
    // thisApp.activatePage(thisApp.pages[0].id);

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }
    // console.log('pageMatchingHash: ', pageMatchingHash);
    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attibute*/
        const id = clickedElement.getAttribute('href').replace('#', '');
        // hash nie jest częścią ID dlatego zamieniamy go na pusty ciąg znaków

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }

  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class 'active' to matching pages, remove from non-matching */

    // pętla przechodzi przez wszystkie kontenery podstron zapisane w thisApp.pages
    for (let page of thisApp.pages) {

      // dla każdej z podstron sprawdzimy czy jej ID
      // jest takie samo jak ID przekazane w atrybucie metody activatePages
      // if (page.id == pageId) {
      //   // jeśli tak, chcemy ze ta strona otrzymała klasę active
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }

      // to czy klasa zostanie nadana może być kontrolowane za pomocą drugiego argumentu
      // ten zapis spowoduje dokładnie to samo co powyższy if else
      page.classList.toggle(classNames.pages.active, page.id == pageId);


    }

    /* add class 'active' to matching links, remove from non-matching */

    // dla każdego z linków zpaisanych w thsApp.navLinks
    for (let link of thisApp.navLinks) {

      // chcemy dodać lub usunąć klasę active
      link.classList.toggle(
        classNames.nav.active,

        // w zależności od tego czy atrybut href tego linka jest równy przekazanemu pageId
        link.getAttribute('href') == '#' + pageId
      );
    }

  },

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
        // console.log('parsed response: ', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });

    // console.log('thisApp.data: ', JSON.stringify(thisApp.data));
  },

  initCart: function () {                         /* dodajemy deklarację metody iniCart */
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    /* przekazujemy refencję do diva, w którym ma być obecny koszyk */

    thisApp.cart = new Cart(cartElem);            /* inicjuje instancję koszyka */

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      // musimy użyć produktu, który został przekazany
      // w detail.product
      app.cart.add(event.detail.product);
      // event posiada obiekt detail (musi się tak nazywać), 
      // w którym znajduje się właściwość product

    });
  },

  initBooking: function () {
    const thisApp = this;

    thisApp.bookingContainer = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(this.bookingContainer);
  },

  init: function () {
    const thisApp = this;                         /* uruchamiamy metodę init na obiekcie app (app.init), dlatego this wskazuje na app */
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();

    thisApp.initData();
    // thisApp.initMenu(); - zbędne po dodaniu AJAXa
    thisApp.initCart();

    thisApp.initBooking();
  },
};

app.init();

