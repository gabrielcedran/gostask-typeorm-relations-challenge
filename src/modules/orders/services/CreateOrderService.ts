import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('ordersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('productsRepository')
    private productsRepository: IProductsRepository,
    @inject('customersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Invalid customer', 404);
    }

    const productsFound = await this.productsRepository.findAllById(products);
    if (productsFound.length !== products.length) {
      throw new AppError('Invalid product provided', 404);
    }

    const productsById = productsFound.reduce((map, product) => {
      // eslint-disable-next-line no-param-reassign
      map[product.id] = product;
      return map;
    }, {} as { [key: string]: Product });

    const productsWithPrice = products.map(product => {
      return {
        product_id: product.id,
        quantity: product.quantity,
        price: productsById[product.id].price,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsWithPrice,
    });
    return order;
  }
}

export default CreateOrderService;
