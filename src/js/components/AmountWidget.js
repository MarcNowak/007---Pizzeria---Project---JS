import {
  select,
  settings,
}
  from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    // console.log('Amount Widget: ', thisWidget);
    // console.log('constructor arguments: ', element);
  }

  getElements(element) {                         /* tworzymy nową metodę getElements */
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.value = settings.amountWidget.defaultValue;
  }

  setValue(value) {                              /* tworzymy metodę setValue */
    const thisWidget = this;

    const newValue = parseInt(value);
    /* konwertujemy ze stringa na liczbę */

    /* TODO: add validation */
    if (
      thisWidget.value !== newValue
      && !isNaN(newValue)
      && newValue <= settings.amountWidget.defaultMax
      && newValue >= settings.amountWidget.defaultMin
    ) {
      thisWidget.value = newValue;
    }

    // thisWidget.value = value;
    /* zapisuje we właściwości thisWidget.value wartość przekazanego argumentu */

    thisWidget.announce();
    /* wywołujemy metodę announce*/

    thisWidget.input.value = thisWidget.value;
  }

  initActions() {                                /* tworzymy metodę initActions */
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.value);

    });

    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce() {                                  /* tworzymy mnetodę announce */
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;