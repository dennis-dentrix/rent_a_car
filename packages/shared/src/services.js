// The services a rental company can offer, grouped as the renter sees them. The ids are stored and sent
// in the address and the API; the words shown to people live in the web app's copy. A rental company
// chooses which of these it offers, and a renter can filter by them.
export const SERVICE_GROUPS = {
  car_hire: ['self_drive', 'chauffeur_driven'],
  transfers: ['airport_transfer', 'corporate_transfer'],
  events: ['wedding_car', 'video_shoot', 'convoy', 'corporate_transport'],
}

export const SERVICE_GROUP_IDS = Object.keys(SERVICE_GROUPS)
export const SERVICE_IDS = Object.values(SERVICE_GROUPS).flat()

/** The group a service belongs to, or undefined for an unknown id. */
export const groupOfService = (serviceId) =>
  SERVICE_GROUP_IDS.find((group) => SERVICE_GROUPS[group].includes(serviceId))
