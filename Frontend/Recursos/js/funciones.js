(function () {
    'use strict'

  var forms = document.querySelectorAll('.needs-validation')
      
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }else{
          RegistrarUsuario();
          event.preventDefault()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()
  
  /////// Registrar Usuario///////
  
  function RegistrarUsuario(){
      let nombre = document.querySelector('#txtNombre').value;
      let correo = document.querySelector('#txtCorreo').value;    
      let url = `http://localhost:3000/usuarios`;
      let datos = {
          nombre: nombre,         
          correo: correo
      };
      
      console.log(datos)
  
      fetch(url, {
          method: 'POST',
          body: JSON.stringify(datos),
          headers: {
              'Content-Type': 'application/json',              
          }
      }).then(res => res.json())
      .then(mensaje =>{
          console.log(mensaje)
      });
  
  };

    /////// Iniciar sesión ///////
