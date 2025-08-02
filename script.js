const formulario = document.getElementById('formulario');
const sueldoInput = document.getElementById('sueldoBruto');
const errorInput = document.getElementById('errorInput');
const resultado = document.getElementById('resultado');
const btnCalcular = document.getElementById('btnCalcular');
const btnLimpiar = document.getElementById('btnLimpiar');

// Validar input en tiempo real para activar/desactivar botón
sueldoInput.addEventListener('input', () => {
  const value = parseFloat(sueldoInput.value);
  if (isNaN(value) || value <= 0) {
    errorInput.textContent = 'Ingresá un sueldo válido mayor que cero.';
    btnCalcular.disabled = true;
  } else {
    errorInput.textContent = '';
    btnCalcular.disabled = false;
  }
});

// Calcular al enviar el formulario
formulario.addEventListener('submit', e => {
  e.preventDefault();

  const bruto = parseFloat(sueldoInput.value);

  // Cálculos
  const jubilacion = bruto * 0.11;
  const obraSocial = bruto * 0.03;
  const pami = bruto * 0.03;

  let ganancias = 0;
  if (bruto > 150000) {
    ganancias = (bruto - 150000) * 0.25;
  }

  const descuentos = jubilacion + obraSocial + pami + ganancias;
  const neto = bruto - descuentos;

  // Categorizar sueldo neto
  let categoria = '';
  if (neto < 50000) categoria = 'bajo';
  else if (neto < 100000) categoria = 'medio';
  else categoria = 'alto';

  resultado.className = `resultado ${categoria} visible`;
  resultado.innerHTML = `
    <p>Descuento por Jubilación (11%): $${jubilacion.toFixed(2)}</p>
    <p>Obra Social (3%): $${obraSocial.toFixed(2)}</p>
    <p>PAMI (3%): $${pami.toFixed(2)}</p>
    <p>Impuesto a las Ganancias: $${ganancias.toFixed(2)}</p>
    <hr />
    <p><strong>Sueldo Neto: $${neto.toFixed(2)}</strong></p>
    <p>Categoría: <strong>${categoria.toUpperCase()}</strong></p>
  `;
});

// Botón limpiar
btnLimpiar.addEventListener('click', () => {
  sueldoInput.value = '';
  errorInput.textContent = '';
  resultado.textContent = '';
  btnCalcular.disabled = true;
  sueldoInput.focus();
});
