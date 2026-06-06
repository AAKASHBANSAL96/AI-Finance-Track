const merchantDictionary: Record<string, string> = {
  swiggy: 'Food',
  zomato: 'Food',
  dmart: 'Groceries',
  amazon: 'Shopping',
  uber: 'Travel',
  ola: 'Travel',
  netflix: 'Entertainment',
  spotify: 'Entertainment',
  prime: 'Shopping',
  shell: 'Fuel',
  hpcl: 'Fuel',
  walmart: 'Groceries',
  alipay: 'Bills',
};

export const classifyMerchant = (merchant: string): string => {
  const name = merchant.toLowerCase();
  for (const key of Object.keys(merchantDictionary)) {
    if (name.includes(key)) return merchantDictionary[key];
  }
  return 'Other';
};
