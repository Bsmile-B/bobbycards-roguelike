// Mock data for the Bloop prototype
const MOCK_EVENTS = [
  { id: 1, cat: 'sport', title: 'Foot au Parc des Princes', place: 'Parc des Princes', distance: '1.2 km', dateLabel: 'DEMAIN', time: '18:30', count: 6, max: 10, trending: true, avatars: ['#FF6A00','#006CFF','#1DB954'], host: 'Marc D.', description: 'Petit match entre potes, niveau intermédiaire. Ramenez vos crampons !' },
  { id: 2, cat: 'soiree', title: 'Rooftop Sunset Vibes', place: 'Le Perchoir, 11e', distance: '2.8 km', dateLabel: 'VEN 21', time: '20:00', count: 14, max: 20, trending: true, avatars: ['#B65CFF','#FF4D6D','#FF6A00'], host: 'Julie M.', description: 'Cocktails, DJ set house et la vue parisienne au coucher de soleil.' },
  { id: 3, cat: 'rando', title: 'Rando Fontainebleau', place: 'Forêt de Fontainebleau', distance: '64 km', dateLabel: 'SAM 22', time: '09:00', count: 8, max: 12, avatars: ['#7FB83E','#006CFF','#FF6A00'], host: 'Sophie C.', description: 'Boucle de 14 km, pique-nique inclus. Niveau facile-moyen.' },
  { id: 4, cat: 'apero', title: 'Apéro sur les Quais', place: 'Quai de Seine', distance: '0.5 km', dateLabel: 'CE SOIR', time: '19:30', count: 5, max: 8, trending: true, avatars: ['#FF8D3F','#006CFF','#B65CFF'], host: 'Thomas L.', description: 'On ramène les bouteilles, venez avec vos potes !' },
  { id: 5, cat: 'culture', title: 'Expo immersive · Van Gogh', place: 'Atelier des Lumières', distance: '3.1 km', dateLabel: 'DIM 23', time: '14:00', count: 4, max: 6, avatars: ['#6AA1FF','#FF6A00','#1DB954'], host: 'Léa R.', description: 'Expo immersive puis café-débat. Billets groupés.' },
  { id: 6, cat: 'food', title: 'Ramen Crawl · Opéra', place: 'Quartier Opéra', distance: '1.8 km', dateLabel: 'JEU 20', time: '20:00', count: 7, max: 10, avatars: ['#FF4D6D','#FF6A00','#B65CFF'], host: 'Kenji T.', description: '3 spots de ramen, on compare et on départage.' },
];
window.MOCK_EVENTS = MOCK_EVENTS;

const MOCK_FRIENDS = [
  { id: 1, name: 'Julie Martin', avatar: '#FF6A00', last: 'Tu fais quoi ce week-end ?', time: '15:30', unread: 2, online: true, emoji: '👩' },
  { id: 2, name: 'Marc Dupont', avatar: '#006CFF', last: 'Merci pour hier, c\'était génial !', time: '12:15', unread: 0, online: false, emoji: '👨' },
  { id: 3, name: 'Sophie Chen', avatar: '#B65CFF', last: 'À demain pour la rando ! 🥾', time: 'hier', unread: 0, online: true, emoji: '👩‍🦱' },
  { id: 4, name: 'Thomas Leroy', avatar: '#1DB954', last: 'On se capte au Perchoir ?', time: 'hier', unread: 1, online: false, emoji: '🧔' },
  { id: 5, name: 'Léa Roux', avatar: '#FF4D6D', last: 'Photos postées sur le groupe', time: 'mer.', unread: 0, online: true, emoji: '👩‍🦰' },
];
window.MOCK_FRIENDS = MOCK_FRIENDS;

const MOCK_BADGES = [
  { id: 'explorer', emoji: '🗺️', name: 'Explorateur', desc: '10 événements différents', got: true, tier: 'gold' },
  { id: 'host', emoji: '🎤', name: 'Organisateur', desc: '5 events créés', got: true, tier: 'silver' },
  { id: 'social', emoji: '🤝', name: 'Sociable', desc: '25 potes rencontrés', got: true, tier: 'bronze' },
  { id: 'streak', emoji: '🔥', name: 'Streak 7j', desc: '7 jours d\'activité', got: true, tier: 'gold' },
  { id: 'night', emoji: '🌙', name: 'Noctambule', desc: '10 soirées', got: false, tier: 'silver' },
  { id: 'athlete', emoji: '🏃', name: 'Athlète', desc: '20 events sport', got: false, tier: 'gold' },
];
window.MOCK_BADGES = MOCK_BADGES;
