import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    return this.ormRepository.findOne({ where: { name } });
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    return this.ormRepository.findByIds(products.map(product => product.id));
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productEntities = await this.ormRepository.findByIds(
      products.map(product => product.id),
    );

    const productQuantityById = products.reduce((map, product) => {
      // eslint-disable-next-line no-param-reassign
      map[product.id] = product;
      return map;
    }, {} as { [key: string]: IUpdateProductsQuantityDTO });

    productEntities.forEach(product => {
      // eslint-disable-next-line no-param-reassign
      product.quantity -= productQuantityById[product.id].quantity;
    });

    await this.ormRepository.save(productEntities);
    return productEntities;
  }
}

export default ProductsRepository;
