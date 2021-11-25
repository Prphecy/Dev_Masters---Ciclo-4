import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {Producto} from './producto.model';
import {Usuario} from './usuario.model';

@model()
export class Pedido extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;
  @property({
    type: 'number',
    required: false,
  })
  total: number;
  @property({
    type: 'number',
    required: false,
  })
  cantidad: number;

  @property({
    type: 'boolean',
    required: false,
  })
  confirmacionPedido: boolean;
  @property({
    type: 'boolean',
    required: false,
  })
  estado: boolean;

  @belongsTo(() => Usuario)
  usuarioId: string;

  @hasOne(() => Producto)
  producto: Producto;

  @property({
    type: 'string',
  })
  productoId?: string;

  constructor(data?: Partial<Pedido>) {
    super(data);
  }
}

export interface PedidoRelations {
  // describe navigational properties here
}

export type PedidoWithRelations = Pedido & PedidoRelations;
