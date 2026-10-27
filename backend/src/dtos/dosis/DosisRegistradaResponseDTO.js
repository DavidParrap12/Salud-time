const BaseResponseDTO = require('../BaseResponseDTO');
const DosisProgramadaResponseDTO = require('./DosisProgramadaResponseDTO');
const RegistroDosisResponseDTO = require('../registro/RegistroDosisResponseDTO');

class DosisRegistradaResponseDTO extends BaseResponseDTO {
  static fields = ['dosis', 'registro'];

  constructor({ dosis, registro } = {}) {
    super({
      dosis: new DosisProgramadaResponseDTO(dosis),
      registro: new RegistroDosisResponseDTO(registro)
    });
  }
}

module.exports = DosisRegistradaResponseDTO;
