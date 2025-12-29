export function currency(amount){
  return typeof amount === 'number' ? `$${amount.toFixed(2)}` : amount;
}
