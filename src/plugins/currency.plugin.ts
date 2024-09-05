import currency from 'currency.js';
const CURRENCY_OPTIONS: currency.Options = {
  precision: 2,
  symbol: '$ ',
};
export class CurrencyAdapter {
  private currencyValue: number;
  private options: currency.Options;
  constructor(value: number, options: currency.Options = CURRENCY_OPTIONS) {
    this.currencyValue = value;
    this.options = options;
  }

  static create(value: number, options?: currency.Options): CurrencyAdapter {
    return new CurrencyAdapter(value, options);
  }

  add(number: number): CurrencyAdapter {
    this.currencyValue = currency(this.currencyValue, this.options).add(
      number,
    ).value;
    return this;
  }
  subtract(number: number): CurrencyAdapter {
    this.currencyValue = currency(this.currencyValue, this.options).subtract(
      number,
    ).value;
    return this;
  }
  multiply(number: number): CurrencyAdapter {
    this.currencyValue = currency(this.currencyValue, this.options).multiply(
      number,
    ).value;
    return this;
  }
  divide(number: number): CurrencyAdapter {
    this.currencyValue = currency(this.currencyValue, this.options).divide(
      number,
    ).value;
    return this;
  }
  format(): string {
    return currency(this.currencyValue, this.options).format();
  }
  getValue(): number {
    return currency(this.currencyValue, this.options).value;
  }
}
