import { LitElement, html } from '@polymer/lit-element';
import { currencies, debounce, httpWrapper } from './utils';

export default class MyComponent extends LitElement {
  static get properties() {
    return {
      from: { type: String },
      to: { type: String },
      amountFrom: { type: Number },
      amountTo: { type: Number }
    };
  }

  constructor() {
    super();
    this.baseUrl = 'https://api.exchangeratesapi.io';
    this.amountFrom = 1;
    this.amountTo = null;
    this.currencies = currencies;
    this.currencyFrom = '';
    this.currencyTo = '';
  }

  firstUpdated() {
    this.currencyFrom = this.from;
    this.currencyTo = this.to;
    this.calculate('from', this.currencyFrom, this.currencyTo, this.amountFrom);
  }

  calculate(type, base, currency, amount) {
    let qs = `base=${base}&symbols=${currency}`;
    httpWrapper(`${this.baseUrl}/latest?${qs}`, data => {
      const value = parseFloat(parseFloat(amount * data.rates[currency]).toFixed(2));
      if (type === 'from') this.amountTo = value;
      else this.amountFrom = value;
    });
  }

  handleKeyUp(type) {
    let amount = parseFloat(this.shadowRoot.querySelector(`input[name=${type}]`).value);
    if (type === 'iptFrom') {
      this.calculate('from', this.currencyFrom, this.currencyTo, amount);
    } else {
      this.calculate('to', this.currencyTo, this.currencyFrom, amount);
    }
  }

  handleSelect(e) {
    e.preventDefault();
    if (e.target.name === 'slcFrom') {
      this.currencyFrom = e.target.value;
    } else {
      this.currencyTo = e.target.value;
    }
    this.calculate('from', this.currencyFrom, this.currencyTo, this.amountFrom);
  }

  selectsTpl(type, selected) {
    return html`
      <select @change=${e => this.handleSelect(e)} name=${type}>
        ${this.currencies.map(currency => {
          return html`
            <option ?selected=${currency === selected} .value=${currency}>
              ${currency}
            </option>
          `;
        })}
      </select>
    `;
  }

  inputTpl(type, amount) {
    return html`
      <input name=${type}
        @keyup=${debounce(this.handleKeyUp.bind(this, type), 400)} 
        .value=${amount}
        type="text">
    `;
  }

  render() {
    return html`
      <style>
        section, h1, h2 {
          margin: 0;
          padding: 0 0 20px 0;
        }
        section {
          padding: 20px;
          background-color: #f0f0f0;
          border-radius: 3px;
        }
      </style>
      <section>
        <div>
          ${this.inputTpl('iptFrom', this.amountFrom)}
          ${this.selectsTpl('slcFrom', this.currencyFrom)}
        </div>
        <div>
          ${this.inputTpl('iptTo', this.amountTo)}
          ${this.selectsTpl('slcTo', this.currencyTo)}
        </div>
      </section>`;
  }
}

customElements.define('app-my-component', MyComponent);
