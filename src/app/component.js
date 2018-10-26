import { LitElement, html } from '@polymer/lit-element';
import { currencies, debounce, httpWrapper } from './utils';

export default class MyComponent extends LitElement {
  static get properties() {
    return {
      currencyFrom: String,
      currencyTo: String,
      amount: Number,
      result: Number,
      labelFrom: String,
      labelTo: String
    };
  }

  constructor() {
    super();
    this.baseUrl = 'https://api.exchangeratesapi.io';
    this.amount = 1;
    this.result = 0;
    this.currencies = currencies;
  }

  firstUpdated() {
    this.currencies.sort((a, b) => (a.label > b.label ? 1 : -1));
    this.calculate(this.currencyFrom, this.currencyTo, this.amount);
  }

  async calculate(base, currency, amount) {
    const qs = `base=${base}&symbols=${currency}`;
    const { rates } = await httpWrapper(`${this.baseUrl}/latest?${qs}`);
    const value = parseFloat(Math.round(amount * rates[currency] * 100) / 100).toFixed(2);

    this.amount = amount;
    this.result = value;
    this.labelFrom = this.currencies.find(val => val.value === this.currencyFrom).label;
    this.labelTo = this.currencies.find(val => val.value === this.currencyTo).label;
  }

  handleKeyUp(type) {
    let amount = parseFloat(this.shadowRoot.querySelector(`input[name=${type}]`).value);
    if (amount) {
      this.calculate(this.currencyFrom, this.currencyTo, amount);
    }
  }

  handleSelect(e) {
    e.preventDefault();
    const { name, value } = e.target;

    if (name === 'slcFrom') this.currencyFrom = value;
    else this.currencyTo = value;

    this.calculate(this.currencyFrom, this.currencyTo, this.amount);
  }

  handleClick(e) {
    e.preventDefault();

    let from = this.currencyFrom;
    let to = this.currencyTo;
    let lblFrom = this.labelFrom;
    let lblTo = this.labelTo;

    this.currencyFrom = to;
    this.currencyTo = from;
    this.labelFrom = lblTo;
    this.labelTo = lblFrom;
    this.calculate(this.currencyFrom, this.currencyTo, this.amount);
  }

  inputTpl(type, amount, disabled = false) {
    return html`
      <input 
        .name=${type}
        @keyup=${debounce(this.handleKeyUp.bind(this, type), 500)} 
        .value=${amount}
        .disabled=${disabled}
        type="text">
    `;
  }

  selectsTpl(type, selected) {
    return html`
      <select .name=${type} @change=${this.handleSelect}>
        ${this.currencies.map(currency => {
          return html`
            <option 
              ?selected=${currency.value === selected}
              .value=${currency.value}
              .label=${currency.label}>
            </option>
          `;
        })}
      </select>
    `;
  }

  render() {
    console.log('Performance Test!');
    return html`
      <style>
        main, section, h1, h2, input, select, button {
          margin: 0;
          padding: 0;
        }
        main {
          width: 360px;
          text-align: center;
          padding: 20px;
          background-color: #f8f8f8;
          border-radius: 2px;
          box-shadow: 0 2px 2px 0 #f0f0f0;
        }
        section {
          margin-bottom: 10px;
        }
        h1 {
          font-size: 26px;
        }
        h2 {
          font-size: 16px;
          font-weight: normal;
          color: #878787;
        }
        input {
          width: 100%;
          padding: 8px 10px;
          text-align: right;
          font-size: 16px;
          color: #878787;
          border: 1px solid #d9d9d9;
          box-sizing: border-box;
          border-radius: 2px;
        }
        input[name='iptTo'] {
          margin-top: 20px;
          background: #f0f0f0;
        }
        select {
          width: 145px;
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
          font-size: 12px;
          border-radius: 0;
        }
        button {
          width: 60px;
          padding: 8px 0;
          font-size: 12px;
          background: #f0f0f0;
          border: none;
          border-radius: 2px;
          box-shadow: 0 2px 2px 0 #f0f0f0;

        }
      </style>
      <main>
        <section>
          <h2>${this.amount} ${this.labelFrom} equals</h2>
          <h1>${this.result} ${this.labelTo}</h1>
        </section>
        <section>
          ${this.inputTpl('iptFrom', this.amount)}
        </section>
        <section>
          ${this.selectsTpl('slcFrom', this.currencyFrom)}
          <button @click=${this.handleClick}>Switch</button>
          ${this.selectsTpl('slcTo', this.currencyTo)}
        </section>
        <section>
          ${this.inputTpl('iptTo', this.result, true)}
        </section>
      </section>`;
  }
}

customElements.define('app-my-component', MyComponent);
