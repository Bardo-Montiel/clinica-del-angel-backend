const Card = require("../models/Card.js");
const PDFDocument = require("pdfkit");
const path = require("path");

//Controlador para crear una cita
async function addCard(req, res, next) {
  try {
    const { patientName, phoneNumber, date, typeOfAppointment, age, area } =
      req.body;
    const ownerId = req.user._id;
    const card = await Card.create({
      patientName,
      phoneNumber,
      date,
      typeOfAppointment,
      age,
      area,
      owner: ownerId,
    });
    res.status(201).json({ data: card });
  } catch (error) {
    next(error);
  }
}

//Controlador para encontrar una cita por ID
async function findCardById(req, res, next) {
  try {
    const card = await Card.findById(req.params.id).orFail(() => {
      const error = new Error("La cita no fue encontrada");
      error.statusCode = 404;
      return error;
    });
    res.status(200).json({ data: card });
  } catch (error) {
    next(error);
  }
}

//Controlador para encontrar citas por nombre
async function findCardsByName(req, res, next) {
  try {
    const { patientName } = req.query;
    //al usar req.query mi ruta en POSTman tendra que ser la que ponga en mi router mas "?patientName=Nombres Apellidos"
    const card = await Card.find({ patientName }).orFail(() => {
      const error = new Error("No se encontraron las citas de este Usuario");
      error.statusCode = 404;
      return error;
    });
    res.status(200).json({ data: card });
  } catch (error) {
    next(error);
  }
}

//Controlador para encontrar las citas que le pertenecen a cada usuario
async function getMyCards(req, res, next) {
  try {
    //el id viene del token de auth.js
    const ownerId = req.user._id;
    //se buscan todas las citas cuyo campo owner (puesto en el esquema) coincida con este ID
    const cards = await Card.find({ owner: ownerId }).orFail(() => {
      const error = new Error("Aún no se crean citas para este usuario");
      error.statusCode = 404;
      return error;
    });
    res.status(200).json({ data: cards });
  } catch (error) {
    next(error);
  }
}

//Controlador para eliminar citas por ID
async function deleteCardsById(req, res, next) {
  try {
    const card = await Card.findByIdAndDelete(req.params.id).orFail(() => {
      const error = new Error("Cita no encontrada");
      error.statusCode = 404;
      return error;
    });
    res
      .status(200)
      .json({ status: "El siguiente elemento ha sido eliminado", data: card });
  } catch (error) {
    next(error);
  }
}

//Controlador para generar PDF de citas
async function donwloadAppointmentPDF(req, res, next) {
  try {
    const { id } = req.params;
    const appointment = await Card.findById(id).orFail(() => {
      const error = new Error("No se encontró la cita");
      error.statusCode = 404;
      return error;
    });
    //crea el documento pdf en blanco
    const doc = new PDFDocument({ margin: 50 });
    //se configuran los Headers para que el navegador sepa que es un PDF
    //inline es para que se abra el archivo en otra ventana y no se descargue
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Cita-${appointment.patientName}-${appointment._id}.pdf`,
    );
    //conecta directamente el PDF a la respuesta HTTP
    doc.pipe(res);
    const logoPath = path.join(__dirname, "..", "assets", "images", "logo.png");
    //Se diseña el conenido del PDF usando los datos de la base
    doc.image(logoPath, 50, 25, { width: 60 });
    doc
      .fillColor("#1a365d")
      .fontSize(22)
      .text("CLÍNICA DEL ÁNGEL", { align: "center" });
    doc
      .fillColor("#718096")
      .fontSize(10)
      .text("Comprobante oficial de cita médica", { align: "center" });
    //linea divisora
    doc
      .moveTo(50, 95)
      .lineTo(550, 95)
      .lineWidth(5)
      .strokeColor("#e2e8f0")
      .stroke();
    //Salto de linea (en este caso 3 lineas)
    doc.moveDown(3);
    //"guarda" la altura hasta esl punto del cursor
    let cardY = doc.y;
    //figura geométrica como contenedor
    doc.rect(50, cardY, 500, 140).fillColor("#f7fafc").fill();
    doc.fillColor("#2d3748").fontSize(12);
    doc.text(`Folio de Cita: ${appointment._id}`, 70, cardY + 15);
    doc.text(`Paciente: ${appointment.patientName}`, 70, cardY + 35);
    doc.text(`Edad: ${appointment.age} años`, 70, cardY + 55);
    doc.text(`Área de consulta: ${appointment.area}`, 70, cardY + 75);
    doc.text(`Fecha y Hora: ${appointment.date}`, 70, cardY + 95);
    doc.text(`Contacto: ${appointment.phoneNumber}`, 70, cardY + 115);
    doc.y = cardY + 150;
    doc.fillColor("#4a5568").fontSize(13);
    doc.text("Información Importante:", 50, doc.y + 20, { underline: true });
    doc.moveDown(0.5);
    doc.text(
      `El presente documento indica que el paciente ${appointment.patientName} solicitó una cita el la fecha: ${appointment.date.toString().slice(4, 15)}, para acudir al área de ${appointment.area} en el siguiente horario: ${appointment.date.toString().slice(16, 21)}. En caso de que el paciente requiera reagendar o cancelar una cita es necesario comunicarse al número +52 (55) 1234-56-78 mínimo con dos dias de anticipación. `,
      { align: "justify", lineGap: 4 },
    );
    doc.moveDown(2);
    doc
      .fillColor("#e53e3e")
      .fontSize(11)
      .text(`Es necesario llegar 15 minutos antes de la cita`, {
        align: "center",
        oblique: true,
      });
    doc
      .moveTo(50, 593)
      .lineTo(230, 593)
      .lineWidth(1)
      .strokeColor("#050608")
      .stroke();
    doc.fillColor("#2d3748").fontSize(13).text(`Firma del paciente`, 80, 600);
    doc
      .moveTo(370, 593)
      .lineTo(550, 593)
      .lineWidth(1)
      .strokeColor("#050608")
      .stroke();
    doc.fillColor("#2d3748").fontSize(13).text(`Firma de recepción`, 400, 600);
    doc.end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addCard,
  findCardById,
  findCardsByName,
  deleteCardsById,
  getMyCards,
  donwloadAppointmentPDF,
};
