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
  HttpErrors,
} from '@loopback/rest';
import {Credenciales, Rol, Usuario} from '../models';
import {RolRepository, UsuarioRepository} from '../repositories';
import { AutenticacionService } from '../services';
import {llaves} from '../config/llaves'
import { promises } from 'dns';
const fetch = require('node-fetch');

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    @repository(RolRepository)
    public rolRepositorio : RolRepository,
    @service(AutenticacionService)
    public servicioAutentificacion : AutenticacionService
  ) {}

  //Cambiar contraseña

  @put('/cambiarComtrasena')
  @response(200,{
    description: "Cambiar una contraseña"
  })
  async cambiarContrasena(@requestBody() credenciales : Credenciales){
    let usr = await this.servicioAutentificacion.cambiarContrasena(credenciales.usuario);
    if(usr){
      let nuevaContrasena = this.servicioAutentificacion.generarClave();
      let nuevaContrasenaCifrada = this.servicioAutentificacion.cifradoClave(nuevaContrasena);

      let usuarioActualizado = await this.usuarioRepository.updateById(usr.id,{contrasena: nuevaContrasenaCifrada});
      //notificación
      let destino = usr.correo;
      let asunto = 'Registro Eco-Sastreria';
      let contenido = `Hola ${usr.nombre}, su contraseña ahora es ${nuevaContrasena} y su rol es: ${usr.rolId}.`
      fetch(`${llaves.urlServiciosNotificaciones}/envio-correo?destino=${destino}&asunto=${asunto}&contenido=${contenido}`).then((data:any)=>{
      console.log(data);
      return usuarioActualizado;
    });
    }else{
      throw new HttpErrors['401']("Usuario no existe")
    }
  }

  //identificación de usuario

  @post('/identificarUsuario')
  @response(200,{
    description: "Identificar a un usuario con su rol"
  })
  async identificarUsuario(@requestBody() credenciales : Credenciales){
    let usr = await this.servicioAutentificacion.identificarUsuario(credenciales.usuario, credenciales.contrasena);
    if (usr){
      let token = this.servicioAutentificacion.generarTokenJw(usr);
      return{
        datos : {
          nombre: usr.nombre,
          correo: usr.correo,
          id : usr.id,
          rol: usr.rolId
        },
        tk: token
      }
    }else{
      throw new HttpErrors['401']("Datos incorrectos")
    }
  }
  
  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
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
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {
    //asignar contraseña
    let clave = this.servicioAutentificacion.generarClave();
    let claceCifrada = this.servicioAutentificacion.cifradoClave(clave);
    usuario.contrasena = claceCifrada;
    //Esta ruta solo tendra el rol de cliente
    let rol = await this.servicioAutentificacion.ValidarRol('cliente')
    if(rol){
      usuario.rolId = `${rol.id}`
      usuario.nombreROl= rol.nombre
    }else{
      let nuevoRol= await this.rolRepositorio.create({nombre: `${'cliente'}`})
      usuario.rolId = `${nuevoRol.id}`
      usuario.nombreROl= nuevoRol.nombre
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

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }
}
