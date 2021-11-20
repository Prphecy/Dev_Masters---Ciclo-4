import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { llaves } from '../config/llaves';
import {Rol, Usuario} from '../models';
import {RolRepository, UsuarioRepository} from '../repositories';
import { AutenticacionService } from '../services';
const fetch = require('node-fetch');

export class RolController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    @repository(RolRepository)
    public rolRepository : RolRepository,
    @service(AutenticacionService)
    public servicioAutentificacion : AutenticacionService
  ) {}
  @post('/usuarios/roles')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async crearUsuariosConDIstintosRol(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>
  ): Promise<Usuario> {
    
    //asignar contraseña
    let clave = this.servicioAutentificacion.generarClave();
    let claceCifrada = this.servicioAutentificacion.cifradoClave(clave);
    usuario.contrasena = claceCifrada;
    //Esta ruta solo tendra el rol de cliente
    let rol= await this.servicioAutentificacion.ValidarRol(usuario.nombreROl)
    if(rol){
      usuario.rolId = `${rol.id}`
    }else{
      let nuevoRol= await this.rolRepository.create({nombre: `${usuario.nombreROl}`})
      usuario.rolId = `${nuevoRol.id}`
    }
    let Usr= await this.usuarioRepository.create(usuario);
    //Notificación Usuario
    let destino = usuario.correo;
    let asunto = 'Registro Eco-Sastreria';
    let contenido = `Hola ${usuario.nombre}, su usuario es: ${usuario.correo}, su contraseña es: ${clave} y su rol es: ${usuario.nombreROl}.
    Bienvenido a eco-satreria`
    fetch(`${llaves.urlServiciosNotificaciones}/envio-correo?destino=${destino}&asunto=${asunto}&contenido=${contenido}`).then((data:any)=>{
      console.log(data);
    });
    return usuario;

  }
  @post('/rols')
  @response(200, {
    description: 'Rol model instance',
    content: {'application/json': {schema: getModelSchemaRef(Rol)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rol, {
            title: 'NewRol',
            exclude: ['id'],
          }),
        },
      },
    })
    rol: Omit<Rol, 'id'>,
  ): Promise<Rol> {
    return this.rolRepository.create(rol);
  }

  @get('/rols/count')
  @response(200, {
    description: 'Rol model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Rol) where?: Where<Rol>,
  ): Promise<Count> {
    return this.rolRepository.count(where);
  }

  @get('/rols')
  @response(200, {
    description: 'Array of Rol model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Rol, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Rol) filter?: Filter<Rol>,
  ): Promise<Rol[]> {
    return this.rolRepository.find(filter);
  }

  @patch('/rols')
  @response(200, {
    description: 'Rol PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rol, {partial: true}),
        },
      },
    })
    rol: Rol,
    @param.where(Rol) where?: Where<Rol>,
  ): Promise<Count> {
    return this.rolRepository.updateAll(rol, where);
  }

  @get('/rols/{id}')
  @response(200, {
    description: 'Rol model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Rol, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Rol, {exclude: 'where'}) filter?: FilterExcludingWhere<Rol>
  ): Promise<Rol> {
    return this.rolRepository.findById(id, filter);
  }

  @patch('/rols/{id}')
  @response(204, {
    description: 'Rol PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rol, {partial: true}),
        },
      },
    })
    rol: Rol,
  ): Promise<void> {
    await this.rolRepository.updateById(id, rol);
  }

  @put('/rols/{id}')
  @response(204, {
    description: 'Rol PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() rol: Rol,
  ): Promise<void> {
    await this.rolRepository.replaceById(id, rol);
  }

  @del('/rols/{id}')
  @response(204, {
    description: 'Rol DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.rolRepository.deleteById(id);
  }
}
