import fs from "fs";
import __dirname from "../utils.js"
import path from "path";



function logger(req, res, next) {
 /*  // console.log(req);
  console.log(
    `${req.method} - ${
      req.originalUrl
    } - ${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`
  );

  next();
 */
  try {
    const logMessage = `${req.method} - ${req.originalUrl} - ${new Date().toLocaleString()}`;
    console.log(logMessage);
    // Ruta del directorio de logs
  const logsDirectory = path.join(__dirname, 'logs');

  // Asegurarse de que el directorio exista, si no, crearlo
  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
  }

    // Ruta del archivo de registro
    const logFilePath = path.join(logsDirectory, 'access.log');
    // Escribir en el archivo de registro (append)
    fs.appendFile(logFilePath, logMessage+ '\n', (err) => {
      if (err) {
        console.error('Error al escribir en el archivo de registro:', err);
      }
    });

    next();
  } catch (error) {
    next(error); // Pasar el error al siguiente middleware de manejo de errores
  }
}

export { logger };
