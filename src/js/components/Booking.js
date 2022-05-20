import { classNames, select, settings, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    /*     odbiera referencję do kontenera
        przekazaną w app.initBooking, jako argument (np. o nazwie element), */

    const thisBooking = this;

    thisBooking.render(element);
    /*     wywołuje metodę render,
        przekazując tę referencję dalej
        (render musi mieć w końcu dostęp do kontenera), */

    thisBooking.initWidgets();
    // wywołuje metodę initWidgets bez argumentów

    thisBooking.getData();
  }

  /* będzie pobierać dane z API używając adresów
  z parametrami filtrującymi wyniki */
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,

      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,

      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],

    };

    // console.log('getData params', params);

    const urls = {
      /* booking zawiera adres endpointu API, który
      zwróci nam listę rezerwacji */
      booking: settings.db.url + '/' + settings.db.booking
        + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsRepeat.join('&'),
    };
    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])

      /* funkcja wykonywana w metodzie .then jako argument przyjmie
      tablicę zawierającą odpowiedzi ze wszystkich fetchów
      podanych w Promise.all */
      .then(function (allResponses) {
        /* argument allResponses jest tablicą analogicznie do
        tablicy użytej w Promise.all */

        /* aby wydobyć odppowiedź dpotyczącą rezerwacji  musimy zapisać stałą
        bookingsResponse równą [0] - czyli pierwszemu elementowi tablicy */
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
          /* zwraca sparsowane wyniki dotyczące rezeewacji
          dlatego w tym miejscu również używamy Promise.all */
        ]);

      })
      /* kolejna funkcja również będzie otrzymywała tablicę */
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        /* ten zapis oznacza: potraktuj pierwszy argument jako tablicę
        i pierwszy element tej tablicy zapisz w zmiennej bookings */
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    /* pętla iteruje przez wszystkie zwykłe bookingi */
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    /* pętla iteruje przez wszystkie wydarzenia jednorazowe */
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    /* pętla iteruje przez wszystkie wydarzenia cykliczne */
    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);

        }
      }
    }

    // console.log('thisBooking.booked: ', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    /* sprawdzamy czy mamy już jakikolwiek wpis w thisBooking.booked
    dla tej konkretnej daty */
    if (typeof thisBooking.booked[date] == 'undefined') {
      /* jeśli nie, to chcemy stworzyć pusty obiekt */
      thisBooking.booked[date] = {};
    }

    /* konwertujemy godzinę na liczbę */
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop: ', hourBlock);
      /* sprawdzamy czy mamy już jakikolwiek wpis w thisBooking.booked
dla tej konkretnej daty i godziny */
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        /* jeśli nie, to chcemy stworzyć pustą tablicę */
        thisBooking.booked[date][hourBlock] = [];
      }

      /* dla danej daty i godziny chcemy dodać stolik
      do listy zajętych stolików, czyli thisBooking.book */
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    /* zapisujemy właściwości date oraz hour 
    w oparciu o wartości widgetów datePicker i hourPicker
    są to wartości wybrane aktualnie przez użytkownika */
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      /* jeśli w obiekcie thisBooking.booked dla tej daty nie ma obiektu */
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      /* lub dla tej daty i godziny nie istnieje tablica */
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      /* znaczy to, że wszystkie stoliki są dostępne
      i zmieniamy wartość zmiennej na true */
      allAvailable = true;
    }

    /* iterując przez wszystkie stoliki */
    for (let table of thisBooking.dom.tables){
      /* pobieramy ID aktualnego stolika */
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        
        /* konwertujemy tekst na liczbę */
        tableId = parseInt(tableId);
      }

      /* if sprawdza czy nie wszystkie stoliki są dostępne
      czy któryś stolik jest zajęty */
      if(
        !allAvailable
        &&
        /* czy tego dnia o danej godzinie jest zajęty stolik o danym ID */
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }



  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(element);
    // generowanie kodu HTML za pomocą szablonu templates.bookingWidget

    thisBooking.dom = {};
    // utworzenie pustego obiektu thisBooking.dom

    thisBooking.dom.wrapper = element;
    /*     dodanie do tego obiektu właściwości wrapper i przypisanie do niej 
        referencji do kontenera (jest dostępna w argumencie metody), */

    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    /*     zmiana zawartości wrappera (innerHTML)
        na kod HTML wygenerowany z szablonu */

    // dodajemy dwie nowe właściwości: dom.peopleAmount i dom.hoursAmount
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    /* przygotowujemy referencje do obu inputów */
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    /* referncja do stolików widocznych na mapie */
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets() {
    const thisBooking = this;

    /*     tworzymy nowe instancje AmountWidget na obu przygotowanych wcześniej elementach
        i dodajemy do nich listenery */
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('click', function () { });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function () { });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('click', function () { });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('click', function () { });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }
}

export default Booking;