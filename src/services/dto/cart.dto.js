export default class CartDTO {
    constructor(cart) {
        this.products = cart.products.map(productItem => ({
              product: productItem.product,
              quantity: productItem.quantity || 1,
            }));
    }
}
