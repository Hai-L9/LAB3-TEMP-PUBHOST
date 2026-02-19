const events = [];
let editingEventId = null;

function getCategoryBgClass(category) {
  switch (category) {
    case "academic":
      return "bg-primary-subtle";
    case "work":
      return "bg-warning-subtle";
    case "personal":
      return "bg-success-subtle";
    case "social":
      return "bg-info-subtle";
    default:
      return "bg-light";
  }
}

function updateLocationOptions() {
  const modality = document.getElementById("event_modality")?.value || "";
  const inPersonFields = document.getElementById("in_person_fields");
  const remoteFields = document.getElementById("remote_fields");
  const attendeesField = document.getElementById("attendees_field");

  if (modality === "in-person") {
    if (inPersonFields) inPersonFields.style.display = "block";
    if (remoteFields) remoteFields.style.display = "none";
    if (attendeesField) attendeesField.style.display = "block";
    return;
  }

  if (modality === "remote") {
    if (inPersonFields) inPersonFields.style.display = "none";
    if (remoteFields) remoteFields.style.display = "block";
    if (attendeesField) attendeesField.style.display = "block";
    return;
  }

  if (inPersonFields) inPersonFields.style.display = "none";
  if (remoteFields) remoteFields.style.display = "none";
  if (attendeesField) attendeesField.style.display = "none";
}

function createEventCard(eventDetails) {
  const event_element = document.createElement("div");
  event_element.classList = "event row border rounded m-1 py-1 cursor-pointer";
  event_element.classList.add(getCategoryBgClass(eventDetails.category));
  event_element.dataset.eventId = String(eventDetails.id);
  event_element.addEventListener("click", () => openEditEvent(eventDetails.id));

  const info = document.createElement("div");
  const locationLine =
    eventDetails.modality === "in-person"
      ? `<div><strong>Location:</strong> ${eventDetails.location}</div>`
      : `<div><strong>Remote URL:</strong> ${eventDetails.remote_url}</div>`;
  const attendeesLine = `<div><strong>Attendees:</strong> ${(eventDetails.attendees || []).join(", ")}</div>`;

  info.innerHTML = `
    <div class="fw-semibold">${eventDetails.name}</div>
    <div><strong>Category:</strong> ${eventDetails.category}</div>
    <div><strong>Time:</strong> ${eventDetails.time}</div>
    <div><strong>Modality:</strong> ${eventDetails.modality}</div>
    ${locationLine}
    ${attendeesLine}
  `;

  event_element.appendChild(info);
  return event_element;
}

function addEventToCalendarUI(eventInfo) {
  const dayColumn = document.getElementById(eventInfo.weekday);
  if (!dayColumn) return;
  dayColumn.appendChild(createEventCard(eventInfo));
}

function startCreateEvent() {
  editingEventId = null;
  const form = document.getElementById("create_event_form");
  const title = document.getElementById("event_modal_label");
  if (title) title.textContent = "Create Event";
  if (form) {
    form.reset();
    form.classList.remove("was-validated");
  }
  updateLocationOptions();
}

function openEditEvent(eventId) {
  const eventObj = events.find((e) => e.id === eventId);
  if (!eventObj) return;

  editingEventId = eventId;

  const title = document.getElementById("event_modal_label");
  if (title) title.textContent = "Update Event";

  document.getElementById("event_name").value = eventObj.name;
  document.getElementById("event_category").value = eventObj.category;
  document.getElementById("event_weekday").value = eventObj.weekday;
  document.getElementById("event_time").value = eventObj.time;
  document.getElementById("event_modality").value = eventObj.modality;
  document.getElementById("event_location").value = eventObj.location ?? "";
  document.getElementById("event_remote_url").value = eventObj.remote_url ?? "";
  document.getElementById("event_attendees").value = (eventObj.attendees || []).join(", ");

  const form = document.getElementById("create_event_form");
  if (form) form.classList.remove("was-validated");

  updateLocationOptions();

  const modalEl = document.getElementById("event_modal");
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function saveEvent() {
  const form = document.getElementById("create_event_form");
  if (!form) return;

  form.classList.add("was-validated");
  if (!form.checkValidity()) return;

  const name = document.getElementById("event_name").value.trim();
  const category = document.getElementById("event_category").value;
  const weekday = document.getElementById("event_weekday").value;
  const time = document.getElementById("event_time").value;
  const modality = document.getElementById("event_modality").value;

  let location = null;
  let remote_url = null;

  if (modality === "in-person") location = document.getElementById("event_location").value.trim();
  if (modality === "remote") remote_url = document.getElementById("event_remote_url").value.trim();

  const attendeesRaw = document.getElementById("event_attendees").value.trim();
  const attendees = attendeesRaw
    ? attendeesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  if (editingEventId === null) {
    const newEvent = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      category,
      weekday,
      time,
      modality,
      location,
      remote_url,
      attendees,
    };
    events.push(newEvent);
    addEventToCalendarUI(newEvent);
  } else {
    const idx = events.findIndex((e) => e.id === editingEventId);
    if (idx === -1) return;

    const updatedEvent = {
      ...events[idx],
      name,
      category,
      weekday,
      time,
      modality,
      location,
      remote_url,
      attendees,
    };
    events[idx] = updatedEvent;

    const oldCard = document.querySelector(`[data-event-id="${editingEventId}"]`);
    if (oldCard) oldCard.remove();

    addEventToCalendarUI(updatedEvent);
  }

  editingEventId = null;

  form.reset();
  form.classList.remove("was-validated");
  updateLocationOptions();

  const modalEl = document.getElementById("event_modal");
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();
}

document.addEventListener("DOMContentLoaded", () => {
  updateLocationOptions();
});
