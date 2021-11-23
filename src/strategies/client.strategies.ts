import { AuthenticationStrategy } from "@loopback/authentication";
import { service } from "@loopback/core";
import { HttpErrors, Request } from "@loopback/rest";
import {UserProfile} from '@loopback/Security';
import parseBearerToken from "parse-bearer-token";
import { AutenticacionService } from "../services";

export class ClientStrategy implements AuthenticationStrategy{
    name: string = 'cliente';

constructor(
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
){

}

    async authenticate(request: Request): Promise<UserProfile | undefined>{
        let token = parseBearerToken(request);
            if(token){
                let datos = this.servicioAutenticacion.validarToken(token);
                    if(datos){
                        if(datos.data.rol==='6196d4c5f87ca32fac994dfa'){
                            let perfil: UserProfile = Object.assign({
                                nombre: datos.data.nombre,
                                correo: datos.data.correo,
                                id: datos.data.id
                            });
                            return perfil;
                        }else{
                            throw new HttpErrors[401]("Este usuario no tiene permisos para esta acción")
                        }

                    }else{
                        throw new HttpErrors[401]("El token incluido no es valido.")
                    }
            }else{
                throw new HttpErrors[401]("No se ha incluido un token en la solicitud.")
            }
    }
}
