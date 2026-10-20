class RecordatorioResponseDTO {
  constructor(recordatorio) {
    this.id_recordatorio = recordatorio.id_recordatorio;
    this.id_tratamiento  = recordatorio.id_tratamiento;
    this.hora            = recordatorio.hora;
    this.dias_semana     = recordatorio.dias_semana;
    this.fecha_inicio    = recordatorio.fecha_inicio;
    this.fecha_fin       = recordatorio.fecha_fin;
    this.estado          = recordatorio.estado;
  }

  static fromList(lista) {
    return lista.map(r => new RecordatorioResponseDTO(r));
  }
}

module.exports = RecordatorioResponseDTO;
