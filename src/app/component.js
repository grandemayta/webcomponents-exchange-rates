import { LitElement, html } from '@polymer/lit-element';
import { currencies, debounce, httpWrapper } from './utils';

export default class MyComponent extends LitElement {
  static get properties() {
    return {
      currencyFrom: String,
      currencyTo: String,
      amountFrom: Number,
      amountTo: Number
    };
  }

  constructor() {
    super();
    this.baseUrl = 'https://api.exchangeratesapi.io';
    this.amountFrom = 1;
    this.amountTo = 0;
    this.currencies = currencies;
  }

  firstUpdated() {
    this.calculate('from', this.currencyFrom, this.currencyTo, this.amountFrom);
  }

  updated() {
    this.calculate('from', this.currencyFrom, this.currencyTo, this.amountFrom);
  }

  calculate(type, base, currency, amount) {
    let qs = `base=${base}&symbols=${currency}`;
    httpWrapper(`${this.baseUrl}/latest?${qs}`, data => {
      const value = parseFloat(parseFloat(amount * data.rates[currency]).toFixed(2));
      if (type === 'from') {
        this.amountFrom = amount;
        this.amountTo = value;
      } else {
        this.amountFrom = value;
        this.amountTo = amount;
      }
    });
  }

  handleKeyUp(type) {
    let amount = parseFloat(this.shadowRoot.querySelector(`input[name=${type}]`).value);
    if (amount) {
      if (type === 'iptFrom') {
        this.calculate('from', this.currencyFrom, this.currencyTo, amount);
      } else {
        this.calculate('to', this.currencyTo, this.currencyFrom, amount);
      }
    }
  }

  handleSelect(e) {
    e.preventDefault();
    if (e.target.name === 'slcFrom') {
      if (e.target.value === this.currencyTo) this.currencyTo = this.currencyFrom;
      this.currencyFrom = e.target.value;
    } else {
      if (e.target.value === this.currencyFrom) this.currencyFrom = this.currencyTo;
      this.currencyTo = e.target.value;
    }
    this.calculate('from', this.currencyFrom, this.currencyTo, this.amountFrom);
  }

  selectsTpl(type, selected) {
    return html`
      <select .name=${type} @change=${this.handleSelect}>
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
      <input 
        .name=${type}
        @keyup=${debounce(this.handleKeyUp.bind(this, type), 500)} 
        .value=${amount}
        type="text">
    `;
  }

  render() {
    return html`
      <style>
        main, section, h1, h2, input, select {
          margin: 0;
          padding: 0;
        }
        main {
          padding: 20px;
          background-color: #f8f8f8;
          border-radius: 2px;
          box-shadow: 0 2px 2px 0 #f0f0f0;
        }
        section {
          margin-bottom: 10px;
        }
        input {
          padding: 8px 10px;
          text-align: right;
          font-size: 16px;
          color: #878787;
          border: 1px solid #d9d9d9;
          border-radius: 2px;
        }
        select {
          width: 80px;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          border: none;
          background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='#000'><polygon points='0,0 100,0 50,50'/></svg>") no-repeat;
          background-position: calc(100% - 10px) center;
          background-repeat: no-repeat;
          background-size: 12px;
          background-color: #d8d8d8;
          padding: 8px 10px;
          font-size: 16px;
          border-radius: 0;
        }
      </style>
      <main>
        <section>
          ${this.inputTpl('iptFrom', this.amountFrom)}
          ${this.selectsTpl('slcFrom', this.currencyFrom)}
        </section>
        <section>
          ${this.inputTpl('iptTo', this.amountTo)}
          ${this.selectsTpl('slcTo', this.currencyTo)}
        </section>
      </section>`;
  }
}

customElements.define('app-my-component', MyComponent);
