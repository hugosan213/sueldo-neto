// script.js
document.getElementById('formulario').addEventListener('submit', function(e) {
  e.preventDefault();

  const bruto = parseFloat(document.getElementById('sueldoBruto').value);
  if (isNaN(bruto) || bruto <= 0) {
    alert('Ingresá un sueldo válido.');
    return;
  }

  const jubilacion = bruto * 0.11;
  const obraSocial = bruto * 0.03;
  const pami = bruto * 0.03;

  let ganancias = 0;
  if (bruto > 150000) {
    ganancias = (bruto - 150000) * 0.25; // ejemplo simple
  }

  const descuentos = jubilacion + obraSocial + pami + ganancias;
  const neto = bruto - descuentos;

  document.getElementById('resultado').innerHTML = `
    <p>Descuento por Jubilación (11%): $${jubilacion.toFixed(2)}</p>
    <p>Obra Social (3%): $${obraSocial.toFixed(2)}</p>
    <p>PAMI (3%): $${pami.toFixed(2)}</p>
    <p>Impuesto a las Ganancias: $${ganancias.toFixed(2)}</p>
    <hr>
    <p><strong>Sueldo Neto: $${neto.toFixed(2)}</strong></p>
  `;
});
