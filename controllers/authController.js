const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.autenticarUsuario = async (req , res) => { 
    const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errores: errors.array() });
    }
    
    //extraer el email y password 
    const {email , password} = req.body ; 
    try {
        // Revisar que sea un usuario registrado 
        let usuario = await Usuario.findOne({email}) ; 
        if(!usuario) { 
            return res.status(400).json({msg: 'El usuario no existe'});
        }

        // Revisar el password 
        const passCorrecto  = await bcryptjs.compare(password , usuario.password );
        if(!passCorrecto){
            return res.status(400).json({msg : 'Password Incorrecto'})
        }
        //crear y firmar el jwt
        const payload = {
			usuario: {
				id: usuario.id
			}
		};


        // si todo es correcto firmar el jwt
		jwt.sign(
			payload,
			process.env.SECRETA,
			{
				expiresIn: 3600 //1 hora
			},
			(error, token) => {
				if (error) throw error;
				// mensaje de confirmación
				res.json({ token });
			}
		);

    } catch (error) {
        console.log(error);
    }
}

//obtiene que usuario esta autenticado 
exports.usuarioAutenticado = async(req,res) => { 
    try {
        //excluye el campo password 
       const usuario = await Usuario.findById(req.usuario.id).select('-password');
       res.json({usuario}); 
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Hubo un error'});
    }
}