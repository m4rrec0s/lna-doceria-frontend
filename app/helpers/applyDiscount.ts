/**
 * Calculates the final price after applying a discount
 * @param price The original price
 * @param discountPercentage The discount percentage (e.g. 10 for 10%)
 * @returns The price after discount is applied
 */
export const applyDiscount = (
  price: number,
  discountPercentage?: number
): number => {
  if (!discountPercentage || discountPercentage <= 0) {
    return price;
  }

  const discountAmount = (price * discountPercentage) / 100;

  return price - discountAmount;
};
