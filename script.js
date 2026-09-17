const demoShipments = {
  "EWS100001": {
    status: "In Transit",
    origin: "New York City, USA",
    destination: "Lagos, Nigeria",
    service: "International Express",
    eta: "Demo ETA — connect live carrier data",
    events: [
      ["Shipment information received", "New York City, USA"],
      ["Package picked up", "New York City, USA"],
      ["Departed origin facility", "New York City, USA"],
      ["In transit", "International transit"]
    ]
  },
  "EWS100002": {
    status: "Delivered",
    origin: "London, UK",
    destination: "New York City, USA",
    service: "Air Freight",
    eta: "Delivered — demo record",
    events: [
      ["Shipment received", "London, UK"],
      ["Departed origin facility", "London, UK"],
      ["Arrived at destination", "New York City, USA"],
      ["Delivered", "New York City, USA"]
    ]
  }
};

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("trackingForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const number = document.getElementById("trackingNumber").value.trim().toUpperCase();
  const result = document.getElementById("trackingResult");
  const shipment = demoShipments[number];

  result.classList.remove("hidden");

  if (!shipment) {
    result.innerHTML = `<h3>Tracking number not found</h3>
      <p>No demo shipment matches <strong>${number}</strong>. For a real tracking system, connect this page to your company's shipment database or carrier API.</p>`;
    return;
  }

  result.innerHTML = `
    <h3>Shipment ${number}</h3>
    <p><span class="status">${shipment.status}</span></p>
    <p><strong>Origin:</strong> ${shipment.origin}<br>
    <strong>Destination:</strong> ${shipment.destination}<br>
    <strong>Service:</strong> ${shipment.service}<br>
    <strong>ETA:</strong> ${shipment.eta}</p>
    <div class="timeline">
      ${shipment.events.map(([title, place]) => `<div><strong>${title}</strong><br><span>${place}</span></div>`).join("")}
    </div>`;
});
