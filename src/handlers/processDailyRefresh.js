// events:
// - schedule: cron(0 0 * * ? *)

import createError from "http-errors";
import { getProducts } from "./getProducts";
import { getUsers } from "../lib/getUsers";
import { restockProduct } from "../lib/restockProduct";
import { restockAccountBalance } from "../lib/restockAccountBalance";

async function processDailyRefresh(event, context) {
  try {
    const productsToRefresh = await getProducts();
    const refreshProducts = productsToRefresh.map((product) =>
      restockProduct(product)
    );

    const balancesToRefresh = await getUsers();
    const refreshBalances = balancesToRefresh.map((user) =>
      restockAccountBalance(user)
    );

    await Promise.all([refreshProducts, refreshBalances]);

    return {
      updatedProducts: refreshProducts.length,
      updatedBalances: refreshBalances.length,
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processDailyRefresh;
