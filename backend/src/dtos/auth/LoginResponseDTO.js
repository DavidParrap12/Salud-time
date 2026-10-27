const BaseResponseDTO = require('../BaseResponseDTO');

class LoginResponseDTO extends BaseResponseDTO {
  static fields = ['token', 'usuario', 'roles'];
}

module.exports = LoginResponseDTO;
