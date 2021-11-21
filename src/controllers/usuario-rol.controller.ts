import { service } from '@loopback/core';
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  post,
  response,
  requestBody,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Usuario,
  Rol,
} from '../models';
import {Credenciales} from '../models';
import {RolRepository, UsuarioRepository} from '../repositories';
import { AutenticacionService } from '../services';
import {llaves} from '../config/llaves'
import { promises } from 'dns';
const fetch = require('node-fetch');

export class UsuarioRolController {
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
  @get('/usuarios/{id}/rol', {
    responses: {
      '200': {
        description: 'Rol belonging to Usuario',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Rol)},
          },
        },
      },
    },
  })
  async getRol(
    @param.path.string('id') id: typeof Usuario.prototype.id,
  ): Promise<Rol> {
    return this.usuarioRepository.rol(id);
  }
}
