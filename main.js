document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('formDispositivo').addEventListener('submit', async function(event) {
      event.preventDefault();
  
      const deviceType = document.getElementById('deviceType').value;
      const nome = document.getElementById('nomeDispositivo').value;
      const tipo = document.getElementById('tipoDispositivo').value;
      const pin = document.getElementById('pinDispositivo').value;
      const modoOperacao = document.getElementById('modoOperacao').value;
      const unidade = document.getElementById('idUnidade').value;
      const esp = document.getElementById('espDropdown').value;
      const valor = 0;
      const dtCriacao = new Date();
      const dispositivoId = 1;  //esp.match(/\(([^)]+)\)$/)[1]; 
  
      const data = {
        nome,
        tipo,
        pin,
        modoOperacao,
        valor,
        dtCriacao,
        dispositivoId,
        unidade,
      };
  
      let url = '';
      let espIP = 'http://192.168.1.71';
      if (deviceType === 'sensor') {
        url = `${espIP}/addSensor`;
      } else if (deviceType === 'actuator') {
        url = `${espIP}/atuadores`;
      }
      console.log('url', url);
  
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
  
        if (response.ok) {
          alert(`${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} added successfully!`);
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to add the device. Please try again.');
      }
    });
  });
  