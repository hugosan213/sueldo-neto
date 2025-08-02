const formulario = document.getElementById('formulario');
const sueldoInput = document.getElementById('sueldoBruto');
const errorInput = document.getElementById('errorInput');
const resultado = document.getElementById('resultado');
const btnCalcular = document.getElementById('btnCalcular');
const btnLimpiar = document.getElementById('btnLimpiar');
const prepagaCheck = document.getElementById('prepaga');
const sindicatoCheck = document.getElementById('sindicato');
const modoOscuroBtn = document.getElementById('modoOscuroBtn');
const grafico = document.getElementById('grafico');
const btnPDF = document.getElementById('btnPDF');
let chartInstance = null;

// Validar input en tiempo real para activar/desactivar botón
function validarFormulario() {
  const value = parseFloat(sueldoInput.value);
  if (isNaN(value) || value <= 0) {
    errorInput.textContent = 'Ingresá un sueldo válido mayor que cero.';
    btnCalcular.disabled = true;
  } else {
    errorInput.textContent = '';
    btnCalcular.disabled = false;
  }
}
sueldoInput.addEventListener('input', validarFormulario);
prepagaCheck.addEventListener('change', validarFormulario);
sindicatoCheck.addEventListener('change', validarFormulario);

// Calcular al enviar el formulario
formulario.addEventListener('submit', e => {
  e.preventDefault();

  const bruto = parseFloat(sueldoInput.value);
  const jubilacion = bruto * 0.11;
  const obraSocial = bruto * 0.03;
  const pami = bruto * 0.03;
  const prepaga = prepagaCheck.checked ? bruto * 0.02 : 0;
  const sindicato = sindicatoCheck.checked ? bruto * 0.015 : 0;

  let ganancias = 0;
  if (bruto > 150000) {
    ganancias = (bruto - 150000) * 0.25;
  }

  const descuentos = jubilacion + obraSocial + pami + prepaga + sindicato + ganancias;
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
    <p>Prepaga (2%): $${prepaga.toFixed(2)}</p>
    <p>Sindicato (1.5%): $${sindicato.toFixed(2)}</p>
    <p>Impuesto a las Ganancias: $${ganancias.toFixed(2)}</p>
    <hr />
    <p><strong>Sueldo Neto: $${neto.toFixed(2)}</strong></p>
    <p>Categoría: <strong>${categoria.toUpperCase()}</strong></p>
  `;

  // Mostrar gráfico
  mostrarGrafico(bruto, neto);
  grafico.style.display = 'block';

  // Mostrar botón PDF
  btnPDF.style.display = 'inline-block';
});

// Botón limpiar
btnLimpiar.addEventListener('click', () => {
  sueldoInput.value = '';
  errorInput.textContent = '';
  resultado.textContent = '';
  btnCalcular.disabled = true;
  sueldoInput.focus();
  grafico.style.display = 'none';
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  btnPDF.style.display = 'none';
});

// Modo oscuro
modoOscuroBtn.addEventListener('click', () => {
  document.body.classList.toggle('oscuro');
  if (document.body.classList.contains('oscuro')) {
    modoOscuroBtn.textContent = '☀️';
    modoOscuroBtn.title = 'Desactivar modo oscuro';
  } else {
    modoOscuroBtn.textContent = '🌙';
    modoOscuroBtn.title = 'Activar modo oscuro';
  }
});

// Gráfico bruto vs neto
function mostrarGrafico(bruto, neto) {
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(grafico, {
    type: 'bar',
    data: {
      labels: ['Sueldo Bruto', 'Sueldo Neto'],
      datasets: [{
        label: 'Monto ($)',
        data: [bruto, neto],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Comparación Bruto vs Neto' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Descargar PDF
btnPDF.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Simulador de Sueldo Neto', 15, 20);
  doc.setFontSize(12);
  let y = 35;
  resultado.querySelectorAll('p').forEach(p => {
    doc.text(p.textContent, 15, y);
    y += 10;
  });
  doc.save('resultado-sueldo-neto.pdf');
});
