import { getProductById } from "./getProduct";

export async function getOrderTotal(products) {
  let newTotal = 0;
  try {
    const priceCalculator = products.forEach((product) => {
      const item = getProductById(product);
      const { unitPrice } = item;
      newTotal = newTotal + unitPrice;
    });

    await Promise.all(priceCalculator);

    return newTotal;
  } catch {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}
