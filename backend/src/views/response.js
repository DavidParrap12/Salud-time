exports.ok = (res, data, mensaje = 'OK') => {
  return res.status(200).json({ success: true, mensaje, data });
};

exports.created = (res, data, mensaje = 'Creado') => {
  return res.status(201).json({ success: true, mensaje, data });
};

exports.error = (res, codigo, mensaje, detalles = null) => {
  return res.status(codigo).json({ success: false, mensaje, detalles });
};