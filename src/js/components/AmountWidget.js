import {
  select,
  settings,
}
  from '../settings.js';

import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {

    /* potrzebuje dwóch argumentów:
       - wrapper, czyli element przekazany konstruktorowi klasy AmountWidget
       - początkowa wartość widgetu */
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element);


    thisWidget.initActions();

    // console.log('Amount Widget: ', thisWidget);
    // console.log('constructor arguments: ', element);
  }

  getElements() {                         /* tworzymy nową metodę getElements */
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);

  }

  /* będzie zwracać prawdę lub fałsz w zależności od tego
  czy wartość którą chcemy ustawić dla tyego widgetu
  jest prawidłowa wedle kryteriów, któr ustalimy
  dla każdego z widgetów */
  isValid(value) {
    return !isNaN(value)
      && value <= settings.amountWidget.defaultMax
      && value >= settings.amountWidget.defaultMin;
  }

  /* służy temu aby bieżąca wartość widgetu
  została wyświetlona na stronie */
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {                                /* tworzymy metodę initActions */
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      // thisWidget.setValue(thisWidget.value);
      thisWidget.value(thisWidget.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;