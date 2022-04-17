require("dotenv").config();
const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");
const main = async () => {
  const busquedas = new Busquedas();
  let opt;
  // busquedas.ciudad()
  do {
    opt = await inquirerMenu();
    switch (opt) {
      case 1:
        //mostrar mensaje
        const termino = await leerInput("Ciudad: ");

        //buscar los lugares
        const lugares = await busquedas.ciudad(termino);
        //Seleccionar el lugar
        const idSeleccionado = await listarLugares(lugares);
        if(idSeleccionado === "0"){
          continue;
        }
        const lugarSeleccionado = lugares.find(
          (lugar) => lugar.id === idSeleccionado
        );
        busquedas.agregarHistorial(lugarSeleccionado.nombre)
        //Datos del clima
        const clima = await busquedas.climaLugar(
          lugarSeleccionado.lat,
          lugarSeleccionado.lng
        );
        //mostrar resultados
        console.clear()
        console.log("\nInformación de la ciudad\n".green);
        console.log("Ciudad: " + lugarSeleccionado.nombre.green);
        console.log("Lat: " + lugarSeleccionado.lat);
        console.log("Lng: " + lugarSeleccionado.lng);
        console.log("Temperatura: " + clima.temp);
        console.log(`Mínima: ${clima.min}`.bgBlue);
        console.log(`Máxima: ${clima.max}`.bgRed);
        console.log("¿Cómo está el clima?: " + clima.desc.green);
        break;
      case 2:
          busquedas.historialCapitalizado.forEach((lugar, index) => {
            const idx = `${index+1}`.green
            console.log(`${idx} - ${lugar}`)
          })
        break;
      default:
    }
    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
