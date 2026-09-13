window.SB_TRIP = Object.freeze({
  start: "2026-10-01",
  wedding: "2026-10-10",
  end: "2026-10-18",
  stays: {
    verona: {name:"Raggio di Luna Apartment", area:"Verona", page:"verona.html"},
    parma: {name:"Casa Nadia / 150 MQ Apartment + Depandance", area:"Parma", page:"parma.html"},
    ispraWedding: {name:"Villa Eden 8", area:"Ispra / Lake Maggiore", page:"ispra.html"},
    gemmas: {name:"Gemma’s Nest", area:"Ispra", page:"ispra.html"},
    santa: {name:"Painted Blue by PortofinoVip", area:"Santa Margherita Ligure", page:"santa-margherita.html"},
    beaulieu: {name:"Penthouse for 2", area:"Beaulieu-sur-Mer", page:"nice.html"}
  },
  days: {
    "2026-10-01": {city:"Verona", stayKey:"verona", idea:"Settle in + easy Verona wander", ideaDetail:"Aperitivo and an early night after arrival.", ideaLink:"verona.html#map", transport:"Arrive in Verona", transportDetail:"VRN airport → taxi to our stay", transportLink:"transportation.html#oct-01"},
    "2026-10-02": {city:"Verona", stayKey:"verona", idea:"Historic-center day", ideaDetail:"Arena, Piazza delle Erbe and a relaxed evening.", ideaLink:"verona.html#map", transport:"Next travel: Parma", transportDetail:"Oct 4 • relaxed late-morning departure", transportLink:"transportation.html#oct-04"},
    "2026-10-03": {city:"Verona", stayKey:"verona", idea:"Open Verona day", ideaDetail:"Keep room for an event if it appeals.", ideaLink:"verona.html#map", transport:"Next travel: Parma", transportDetail:"Tomorrow • keep the morning easy", transportLink:"transportation.html#oct-04"},
    "2026-10-04": {city:"Travel → Parma", stayKey:"parma", idea:"Check in + first Parma dinner", ideaDetail:"Keep the arrival afternoon easy.", ideaLink:"parma.html#restaurants", transport:"Verona → Parma", transportDetail:"Checkout 11:00 AM • flexible train", transportLink:"transportation.html#oct-04"},
    "2026-10-05": {city:"Parma", stayKey:"parma", idea:"Food + historic center", ideaDetail:"Lean into Parma’s specialties.", ideaLink:"parma.html#restaurants", transport:"Next travel: Ispra", transportDetail:"Oct 7 • booked train + rental pickup", transportLink:"transportation.html#oct-07"},
    "2026-10-06": {city:"Parma", stayKey:"parma", idea:"Easy Parma day", ideaDetail:"Leave time to regroup before the travel day.", ideaLink:"parma.html#map", transport:"Next travel: Ispra", transportDetail:"Tomorrow • IC 580 at 10:39 AM", transportLink:"transportation.html#oct-07"},
    "2026-10-07": {city:"Travel → Ispra", stayKey:"ispraWedding", idea:"Villa arrival + lake evening", ideaDetail:"Pick up the rental car at MXP and settle in.", ideaLink:"ispra.html#map", transport:"Parma → Ispra", transportDetail:"IC 580 10:39 → 12:15 • MXP rental 3:00 PM", transportLink:"transportation.html#oct-07"},
    "2026-10-08": {city:"Ispra / Lake Maggiore", stayKey:"ispraWedding", idea:"Easy lake day", ideaDetail:"Use the car; ferry only if fall service is confirmed.", ideaLink:"ispra.html#map", transport:"Next travel: Santa Margherita", transportDetail:"Oct 11 • return car + IC 665", transportLink:"transportation.html#oct-11"},
    "2026-10-09": {city:"Ispra", stayKey:"ispraWedding", idea:"Wedding prep + low-key day", ideaDetail:"Protect the evening and keep logistics simple.", ideaLink:"wedding.html", transport:"Next travel: Santa Margherita", transportDetail:"Oct 11 • after the wedding", transportLink:"transportation.html#oct-11"},
    "2026-10-10": {city:"Wedding Day 💍", stayKey:"gemmas", idea:"Get married", ideaDetail:"Ceremony → champagne → golden hour → dinner.", ideaLink:"wedding.html", transport:"Tomorrow: Ligurian coast", transportDetail:"Return rental → Milan → IC 665", transportLink:"transportation.html#oct-11"},
    "2026-10-11": {city:"Travel → Santa Margherita", stayKey:"santa", idea:"Check in + Riviera evening", ideaDetail:"No need to force sightseeing after the travel day.", ideaLink:"santa-margherita.html#map", transport:"Ispra → Santa Margherita", transportDetail:"IC 665 • Milan 12:10 → Santa 2:16 PM", transportLink:"transportation.html#oct-11"},
    "2026-10-12": {city:"Santa Margherita Ligure", stayKey:"santa", idea:"Portofino option", ideaDetail:"Go if the weather is good; otherwise enjoy Santa slowly.", ideaLink:"santa-margherita.html#map", transport:"Next travel: France", transportDetail:"Oct 14 • 3 booked train legs", transportLink:"transportation.html#oct-14"},
    "2026-10-13": {city:"Santa Margherita Ligure", stayKey:"santa", idea:"Relaxed Ligurian coast day", ideaDetail:"Long lunch, waterfront and honeymoon pace.", ideaLink:"santa-margherita.html#restaurants", transport:"Next travel: Beaulieu", transportDetail:"Tomorrow • first train 10:14 AM", transportLink:"transportation.html#oct-14"},
    "2026-10-14": {city:"Travel → French Riviera", stayKey:"beaulieu", idea:"Check in + waterfront evening", ideaDetail:"Arrive 3:26 PM and keep the first evening local.", ideaLink:"nice.html#map", transport:"Santa → Beaulieu", transportDetail:"10:14 → 11:02 • 11:35 → 2:12 • 2:40 → 3:26", transportLink:"transportation.html#oct-14"},
    "2026-10-15": {city:"Beaulieu / Nice", stayKey:"beaulieu", idea:"Nice day", ideaDetail:"Old Nice, waterfront and dancing if you want it.", ideaLink:"nice.html#map", transport:"Airport day", transportDetail:"Oct 18 • train toward Nice Airport", transportLink:"transportation.html#oct-18"},
    "2026-10-16": {city:"French Riviera", stayKey:"beaulieu", idea:"Èze option", ideaDetail:"A good day for the hill village if energy and weather cooperate.", ideaLink:"nice.html#map", transport:"Airport day", transportDetail:"Oct 18 • checkout around 9:00 AM", transportLink:"transportation.html#oct-18"},
    "2026-10-17": {city:"French Riviera", stayKey:"beaulieu", idea:"Final honeymoon day", ideaDetail:"Keep it romantic and low-pressure.", ideaLink:"nice.html#map", transport:"Tomorrow: Nice Airport", transportDetail:"12:35 PM flight", transportLink:"transportation.html#oct-18"},
    "2026-10-18": {city:"Fly home ✈️", stayKey:"beaulieu", idea:"Airport morning", ideaDetail:"Checkout around 9:00 and head directly toward NCE.", ideaLink:"transportation.html#oct-18", transport:"Beaulieu → NCE Terminal 2", transportDetail:"Flight 12:35 PM", transportLink:"transportation.html#oct-18"}
  },
  travelDays: [
    {date:"Oct 1", status:"Booked flight", title:"VRN airport → Verona", detail:"Arrive 12:45 PM; taxi is the simplest luggage-friendly transfer.", link:"transportation.html#oct-01"},
    {date:"Oct 4", status:"Flexible", title:"Verona → Parma", detail:"Checkout by 11:00 AM; choose a relaxed train that lands near the 3:00 PM check-in window.", link:"transportation.html#oct-04"},
    {date:"Oct 7", status:"Booked", title:"Parma → Milan → MXP → Ispra", detail:"IC 580: 10:39 AM → 12:15 PM. Rental pickup at MXP Terminal 1 at 3:00 PM.", link:"transportation.html#oct-07"},
    {date:"Oct 11", status:"Booked", title:"Ispra → MXP → Milan → Santa Margherita", detail:"IC 665: Milano Centrale 12:10 PM → S. Margherita Ligure-Portofino 2:16 PM, direct.", link:"transportation.html#oct-11"},
    {date:"Oct 14", status:"Booked", title:"Santa Margherita → Beaulieu-sur-Mer", detail:"10:14 → 11:02 Genova Brignole; 11:35 → 2:12 Ventimiglia; 2:40 → 3:26 Beaulieu.", link:"transportation.html#oct-14"},
    {date:"Oct 18", status:"Booked flight", title:"Beaulieu → Nice Airport", detail:"Checkout around 9:00 AM; allow a generous airport buffer for the 12:35 PM flight.", link:"transportation.html#oct-18"}
  ],
  weatherRoute: [
    {name:"Verona",lat:45.4384,lng:10.9916,start:"2026-10-01",end:"2026-10-04"},
    {name:"Parma",lat:44.8015,lng:10.3279,start:"2026-10-04",end:"2026-10-07"},
    {name:"Ispra / Lake Maggiore",lat:45.8149,lng:8.6129,start:"2026-10-07",end:"2026-10-11"},
    {name:"Santa Margherita Ligure",lat:44.3345,lng:9.2120,start:"2026-10-11",end:"2026-10-14"},
    {name:"Beaulieu-sur-Mer / Nice",lat:43.7065,lng:7.3315,start:"2026-10-14",end:"2026-10-18"}
  ]
});