class BaseWidget {
  /* konstruktor przyjmuje dwa argumenty:
     wrapperElement - element DOM, w którym znajduje się ten widget
     initialValue - czyli początkowa wartość widgetu */
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    /* w obiekcie znajdować się będą wszystkie elementy DOM,
       z których będziemy korzystać w naszej aplikacji */

    /* wrapper przekazany lpnstruktorowi
       w momencie tworzenia instancji */
    thisWidget.dom.wrapper = wrapperElement;

    // pocztąkowa wartość widgetu
    thisWidget.correctValue = initialValue;
  }

  /* jest getterem, czyli metodą wykonywaną przy
  każdej próbie odczytania wartości właściwości value */
  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  /*   służy do ustawiania nowej wartości widgetu
  ale tylko pod warunkiem, że jest to prawidłowa wartość */
  set value(value) {                              /* tworzymy metodę setValue */
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);
    /* konwertujemy ze stringa na liczbę */

    /* TODO: add validation */
    if (
      thisWidget.correctValue !== newValue
      // && !isNaN(newValue)
      && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
    }

    thisWidget.announce();
    /* wywołujemy metodę announce*/

    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  /*   będzie wykorzystywana do tego aby przekształcić
  wartość którą chcemy ustawić na odpowiedni typ lub format */
  parseValue(value) {
    return parseInt(value);
  }

  /* będzie zwracać prawdę lub fałsz w zależności od tego
  czy wartość którą chcemy ustawić dla tyego widgetu
  jest prawidłowa wedle kryteriów, któr ustalimy
  dla każdego z widgetów */
  isValid(value) {
    return !isNaN(value);
  }

  /* służy temu aby bieżąca wartość widgetu
została wyświetlona na stronie */
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {                                  /* tworzymy mnetodę announce */
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;