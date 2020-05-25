import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('customersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const existentUser = await this.customersRepository.findByEmail(email);
    if (existentUser) {
      throw new AppError('Email already in use by another user', 400);
    }
    return this.customersRepository.create({ name, email });
  }
}

export default CreateCustomerService;
