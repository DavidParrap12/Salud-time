module.exports = (req, res) => {
  return res.status(404).json({
    success: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    detalles: null
  });
};
