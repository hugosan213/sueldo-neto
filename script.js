const formulario = document.getElementById('formulario');
const sueldoInput = document.getElementById('sueldoBruto');
const errorInput = document.getElementById('errorInput');
const resultado = document.getElementById('resultado');
const btnCalcular = document.getElementById('btnCalcular');
const btnLimpiar = document.getElementById('btnLimpiar');
const prepagaCheck = document.getElementById('prepaga');
const sindicatoCheck = document.getElementById('sindicato');
const prepagaPorc = document.getElementById('prepagaPorc');
const sindicatoPorc = document.getElementById('sindicatoPorc');
const modoOscuroBtn = document.getElementById('modoOscuroBtn');
const grafico = document.getElementById('grafico');
const btnPDF = document.getElementById('btnPDF');
const piechart = document.getElementById('piechart');
const piechartContainer = document.getElementById('piechart-container');
let chartInstance = null;
let pieInstance = null;

// Accesibilidad: focus en primer input
window.addEventListener('DOMContentLoaded', () => {
  sueldoInput.focus();
  // Modo oscuro automático según sistema
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('oscuro');
    modoOscuroBtn.textContent = '☀️';
    modoOscuroBtn.title = 'Desactivar modo oscuro';
  }
  mostrarHistorial();
});

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
prepagaCheck.addEventListener('change', () => {
  prepagaPorc.disabled = !prepagaCheck.checked;
  validarFormulario();
});
sindicatoCheck.addEventListener('change', () => {
  sindicatoPorc.disabled = !sindicatoCheck.checked;
  validarFormulario();
});
prepagaPorc.addEventListener('change', validarFormulario);
sindicatoPorc.addEventListener('change', validarFormulario);

// Calcular al enviar el formulario
formulario.addEventListener('submit', e => {
  e.preventDefault();

  const bruto = parseFloat(sueldoInput.value);

  // Descuentos reales Argentina 2025
  const jubilacion = bruto * 0.11;
  const obraSocial = bruto * 0.03;
  const pami = bruto * 0.03;
  const prepaga = prepagaCheck.checked ? bruto * parseFloat(prepagaPorc.value) : 0;
  const sindicato = sindicatoCheck.checked ? bruto * parseFloat(sindicatoPorc.value) : 0;

  // Ganancias: mínimo no imponible anual $2.200.000 (mensual $183.333), escalas simplificadas
  let ganancias = 0;
  if (bruto > 183333) {
    const excedente = bruto - 183333;
    if (excedente <= 50000) {
      ganancias = excedente * 0.05;
    } else if (excedente <= 150000) {
      ganancias = (50000 * 0.05) + ((excedente - 50000) * 0.09);
    } else if (excedente <= 300000) {
      ganancias = (50000 * 0.05) + (100000 * 0.09) + ((excedente - 150000) * 0.12);
    } else {
      ganancias = (50000 * 0.05) + (100000 * 0.09) + (150000 * 0.12) + ((excedente - 300000) * 0.15);
    }
  }

  const descuentos = jubilacion + obraSocial + pami + prepaga + sindicato + ganancias;
  const neto = bruto - descuentos;

  // Categorizar sueldo neto
  let categoria = '';
  if (neto < 100000) categoria = 'bajo';
  else if (neto < 300000) categoria = 'medio';
  else categoria = 'alto';

  resultado.className = `resultado ${categoria} visible`;
  resultado.innerHTML = `
    <p>Jubilación (11%): $${jubilacion.toFixed(2)}</p>
    <p>Obra Social (3%): $${obraSocial.toFixed(2)}</p>
    <p>PAMI (3%): $${pami.toFixed(2)}</p>
    <p>Prepaga (${prepagaCheck.checked ? (parseFloat(prepagaPorc.value)*100).toFixed(0)+'%' : '0%' }): $${prepaga.toFixed(2)}</p>
    <p>Sindicato (${sindicatoCheck.checked ? (parseFloat(sindicatoPorc.value)*100).toFixed(0)+'%' : '0%' }): $${sindicato.toFixed(2)}</p>
    <p>Impuesto a las Ganancias: $${ganancias.toFixed(2)}</p>
    <hr />
    <p><strong>Sueldo Neto: $${neto.toFixed(2)}</strong></p>
    <p>Categoría: <strong>${categoria.toUpperCase()}</strong></p>
  `;

  // Mostrar gráfico barras
  mostrarGrafico(bruto, neto);
  grafico.style.display = 'block';

  // Mostrar gráfico de torta
  mostrarPieChart({
    jubilacion, obraSocial, pami, prepaga, sindicato, ganancias, neto
  });
  piechartContainer.style.display = 'block';

  // Mostrar botón PDF
  btnPDF.style.display = 'inline-block';

  // Guardar en historial
  guardarHistorial({ bruto, jubilacion, obraSocial, pami, prepaga, sindicato, ganancias, neto, fecha: new Date().toLocaleString() });
});

// Botón limpiar
btnLimpiar.addEventListener('click', () => {
  sueldoInput.value = '';
  errorInput.textContent = '';
  resultado.textContent = '';
  btnCalcular.disabled = true;
  sueldoInput.focus();
  grafico.style.display = 'none';
  piechartContainer.style.display = 'none';
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  if (pieInstance) {
    pieInstance.destroy();
    pieInstance = null;
  }
  btnPDF.style.display = 'none';
});

// Función para mostrar gráfico de torta (pie chart)
function mostrarPieChart({ jubilacion, obraSocial, pami, prepaga, sindicato, ganancias, neto }) {
  if (pieInstance) pieInstance.destroy();
  pieInstance = new Chart(piechart, {
    type: 'pie',
    data: {
      labels: [
        'Jubilación',
        'Obra Social',
        'PAMI',
        'Prepaga',
        'Sindicato',
        'Ganancias',
        'Neto'
      ],
      datasets: [{
        data: [jubilacion, obraSocial, pami, prepaga, sindicato, ganancias, neto],
        backgroundColor: [
          '#f59e42', '#3b82f6', '#a21caf', '#fbbf24', '#6366f1', '#ef4444', '#10b981'
        ],
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Desglose de descuentos y neto' }
      }
    }
  });
}

// Historial de simulaciones
function guardarHistorial(obj) {
  let hist = JSON.parse(localStorage.getItem('historialSueldo')) || [];
  hist.unshift(obj);
  if (hist.length > 5) hist = hist.slice(0, 5);
  localStorage.setItem('historialSueldo', JSON.stringify(hist));
  mostrarHistorial();
}

function mostrarHistorial() {
  let hist = JSON.parse(localStorage.getItem('historialSueldo')) || [];
  let cont = document.getElementById('historial');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'historial';
    cont.style = 'margin:24px auto 0;max-width:400px;';
    document.querySelector('.container').appendChild(cont);
  }
  if (hist.length === 0) {
    cont.innerHTML = '';
    return;
  }
  cont.innerHTML = '<h3 style="margin-bottom:8px;">Últimas simulaciones</h3>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.98rem;">' +
    '<thead><tr><th>Fecha</th><th>Bruto</th><th>Neto</th></tr></thead><tbody>' +
    hist.map(h => `<tr><td>${h.fecha}</td><td>$${h.bruto.toLocaleString()}</td><td>$${h.neto.toLocaleString()}</td></tr>`).join('') +
    '</tbody></table>';
}

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

// Descargar PDF (texto + gráficos, robusto)
btnPDF.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(16);
  doc.text('Simulador de Sueldo Neto', 15, 20);
  doc.setFontSize(12);
  let y = 35;

  // Verificar si hay datos para exportar
  const parrafos = resultado.querySelectorAll('p');
  if (!parrafos.length) {
    doc.setTextColor(220, 38, 38);
    doc.text('No hay datos para exportar. Calculá primero.', 15, y);
    doc.save('resultado-sueldo-neto.pdf');
    return;
  }

  // Agregar textos
  parrafos.forEach(p => {
    doc.setTextColor(33, 37, 41);
    doc.text(p.textContent, 15, y);
    y += 10;
  });

  y += 10; // espacio extra antes de gráficos

  // Agregar gráfico de barras si está visible y tiene datos
  if (grafico && grafico.style.display !== 'none' && grafico.toDataURL) {
    try {
      const imgGrafico = grafico.toDataURL('image/png');
      doc.addImage(imgGrafico, 'PNG', 15, y, 180, 90);
      y += 100;
    } catch (e) {}
  }

  // Agregar gráfico de torta si está visible y tiene datos
  if (piechart && piechartContainer && piechartContainer.style.display !== 'none' && piechart.toDataURL) {
    try {
      const imgPie = piechart.toDataURL('image/png');
      doc.addImage(imgPie, 'PNG', 15, y, 120, 90);
      y += 100;
    } catch (e) {}
  }

  doc.save('resultado-sueldo-neto.pdf');
});
