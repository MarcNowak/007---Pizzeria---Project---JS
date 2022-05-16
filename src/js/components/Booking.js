import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    // odbiera referencję do kontenera
    // przekazaną w app.initBooking, jako argument (np. o nazwie element),

    const thisBooking = this;

    thisBooking.render(element);
    // wywołuje metodę render,
    // przekazując tę referencję dalej
    // (render musi mieć w końcu dostęp do kontenera),

    thisBooking.initWidgets();
    // wywołuje metodę initWidgets bez argumentów
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(element);
    // generowanie kodu HTML za pomocą szablonu templates.bookingWidget

    thisBooking.dom = {};
    // utworzenie pustego obiektu thisBooking.dom

    thisBooking.dom.wrapper = element;
    // dodanie do tego obiektu właściwości wrapper i przypisanie do niej 
    // referencji do kontenera (jest dostępna w argumencie metody),

    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    // zmiana zawartości wrappera (innerHTML)
    // na kod HTML wygenerowany z szablonu

    // dodajemy dwie nowe właściwości: dom.peopleAmount i dom.hoursAmount
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    // tworzymy nowe instancje AmountWidget na obu przygotowanych wcześniej elementach
    // i dodajemy do nich listenery
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('click', function(){});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function(){});
  }
}

export default Booking;