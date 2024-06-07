document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('formDispositivo').addEventListener('submit', async function(event) {
      event.preventDefault();
  
      const tipoDispositivo = document.getElementById('tipoDispositivo').value;
      const nome = document.getElementById('nomeDispositivo').value;
      const tipo = document.getElementById('tipoDispositivoDetalhe').value;
      const pin = document.getElementById('pinDispositivo').value;
      const modoOperacao = document.getElementById('modoOperacao').value;
      const unidade = document.getElementById('idUnidade').value;
      const esp = document.getElementById('espDropdown').value;
      const valor = 0;
      const dtCriacao = new Date();
      const dispositivoId = 1;  //esp.match(/\(([^)]+)\)$/)[1]; 

      const response = await fetch(`http://localhost:3000/api/devices/${esp}`);
      const deviceDetails = await response.json();
  
      const espIP = deviceDetails;
      
      // You can now use espIP in your application logic
      console.log(`ESP IP: ${espIP}`);
  
      const data = {
        nome,
        tipo,
        tipoDispositivo,
        pin,
        modoOperacao,
        valor,
        dtCriacao,
        dispositivoId,
        unidade,
      };
  
      let url = `http://${espIP}/addDevice`;
  
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
          alert(`${tipoDispositivo.charAt(0).toUpperCase() + tipoDispositivo.slice(1)} added successfully!`);
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
  