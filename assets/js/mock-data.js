/**
 * mock-data.js — DEMO DATA ONLY.
 *
 * Every sample record used by the prototype lives in this file. Nothing here
 * comes from a database. Field names are snake_case and mirror the planned
 * MySQL columns so the render code can consume real JSON from PHP later:
 *
 *   users            user_id, full_name, email, phone, role, created_at,
 *                    password_hash (DEMO: sha256 of "hrs-demo:<email>:<password>")
 *   rooms            room_id, room_number, room_type, title, description, floor,
 *                    capacity, bed_type, size_sqm, view, price_per_night,
 *                    status, amenities[], image_url, image_alt,
 *                    gallery[] ({ url, alt }) — paths relative to the project root
 *   room_types       room_type, label, base_price, description
 *   pricing_rules    rule_id, name, room_type ('all' or a type), start_date,
 *                    end_date, adjustment_percent, is_active
 *   reservations     reservation_id, booking_reference, user_id, room_id,
 *                    guest_name, guest_email, guest_phone, check_in_date,
 *                    check_out_date, num_guests, special_requests, status,
 *                    payment_status, total_price, created_at
 *   payments         (generated in data-service.js for paid reservations)
 *   reviews          review_id, reservation_id, user_id, room_id, guest_name,
 *                    rating, title, comment, status, created_at
 *   service_requests request_id, room_number, guest_name, request_type,
 *                    details, priority, status, assigned_to, created_at
 *   complaints       complaint_id, booking_reference, guest_name, room_number,
 *                    category, subject, description, priority, status,
 *                    resolution_notes, created_at
 *
 * Dates are generated relative to today so the demo always has arrivals,
 * in-house guests, departures and past stays.
 *
 * BACKEND INTEGRATION: delete this file once assets/js/data-service.js reads
 * from PHP instead of localStorage. database/hotel_reservation.sql should
 * define tables with the same field names.
 */
(function (HRS) {
  'use strict';

  var day = function (offset) { return HRS.date.addDays(HRS.date.today(), offset); };
  var at = function (offset, time) { return day(offset) + 'T' + (time || '10:00') + ':00'; };

  HRS.mockData = {
    settings: {
      hotel_name: 'The Developers Hotel',
      currency: 'EGP',          // NFR-25 default; admins can change it (display only, amounts are not converted)
      tax_rate: 0.14,
      service_rate: 0.12,
      free_cancellation_hours: 48,
      check_in_time: '14:00',
      check_out_time: '12:00'
    },

    // DEMO ONLY accounts — the passwords are published on login.php:
    //   admin@example.com / Admin@2026, staff@example.com / Staff@2026,
    //   guest@example.com / Guest@2026. Other sample guests cannot sign in.
    users: [
      { user_id: 1, full_name: 'Mona Hassan', email: 'admin@example.com', phone: '+20 100 000 0001', role: 'admin', created_at: day(-400),
        password_hash: '209d30ec4b53618d78bc1f0c4fab9899e43a7feb3e1eb9ea0184481918ec14a9' },
      { user_id: 2, full_name: 'Karim Adel', email: 'staff@example.com', phone: '+20 100 000 0002', role: 'staff', created_at: day(-300),
        password_hash: 'bda417b9c9d63802ebf920b315519b07d33d6b16f206d359ea74ac1293221097' },
      { user_id: 3, full_name: 'Sara Mahmoud', email: 'guest@example.com', phone: '+20 100 000 0003', role: 'guest', created_at: day(-120),
        password_hash: 'b582b2e3d29d485be271697b1eede73c230c79d2915e19c9c112af5880a817c8' },
      { user_id: 4, full_name: 'James Carter', email: 'james.carter@example.com', phone: '+44 20 0000 0004', role: 'guest', created_at: day(-90) },
      { user_id: 5, full_name: 'Laila Nabil', email: 'laila.nabil@example.com', phone: '+20 100 000 0005', role: 'guest', created_at: day(-80) },
      { user_id: 6, full_name: 'Omar Farouk', email: 'omar.farouk@example.com', phone: '+20 100 000 0006', role: 'guest', created_at: day(-75) },
      { user_id: 7, full_name: 'Emma Schultz', email: 'emma.schultz@example.com', phone: '+49 30 0000 0007', role: 'guest', created_at: day(-60) }
    ],

    room_types: [
      { room_type: 'single', label: 'Single', base_price: 95, description: 'Compact rooms for solo travellers.' },
      { room_type: 'double', label: 'Double', base_price: 140, description: 'King or twin beds for two.' },
      { room_type: 'deluxe', label: 'Deluxe', base_price: 210, description: 'Larger rooms with sea views.' },
      { room_type: 'family', label: 'Family', base_price: 260, description: 'Space for families of four or five.' },
      { room_type: 'suite', label: 'Suite', base_price: 340, description: 'Separate living areas and lounge access.' }
    ],

    rooms: [
      { room_id: 1, room_number: '101', room_type: 'single', title: 'Classic Single', floor: 1, capacity: 1, bed_type: 'Queen bed', size_sqm: 22, view: 'Garden', price_per_night: 95, status: 'available',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Work desk', 'Safe'],
        description: 'A calm, well-lit room overlooking the garden courtyard, ideal for business travellers.' },
      { room_id: 2, room_number: '102', room_type: 'single', title: 'Classic Single', floor: 1, capacity: 1, bed_type: 'Queen bed', size_sqm: 22, view: 'Garden', price_per_night: 95, status: 'available',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Work desk', 'Safe'],
        description: 'A quiet garden-facing room with a generous work desk and rain shower.' },
      { room_id: 3, room_number: '201', room_type: 'double', title: 'Superior King', floor: 2, capacity: 2, bed_type: 'King bed', size_sqm: 30, view: 'City', price_per_night: 140, status: 'available',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Coffee machine', 'Safe'],
        description: 'Warm wood tones, a king bed and floor-to-ceiling windows over the city skyline.' },
      { room_id: 4, room_number: '202', room_type: 'double', title: 'Superior Twin', floor: 2, capacity: 2, bed_type: 'Two single beds', size_sqm: 30, view: 'City', price_per_night: 140, status: 'occupied',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Safe'],
        description: 'Two comfortable single beds, perfect for friends or colleagues travelling together.' },
      { room_id: 5, room_number: '203', room_type: 'double', title: 'Superior King', floor: 2, capacity: 2, bed_type: 'King bed', size_sqm: 32, view: 'Pool', price_per_night: 150, status: 'maintenance',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Balcony'],
        description: 'A king room with a private balcony overlooking the pool terrace.' },
      { room_id: 6, room_number: '301', room_type: 'deluxe', title: 'Deluxe Sea View', floor: 3, capacity: 2, bed_type: 'King bed', size_sqm: 38, view: 'Sea', price_per_night: 210, status: 'available',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Balcony', 'Sea view', 'Bathtub', 'Coffee machine'],
        description: 'Wake up to the Mediterranean from a private balcony, with a deep soaking tub for the evening.' },
      { room_id: 7, room_number: '302', room_type: 'deluxe', title: 'Deluxe Corner Room', floor: 3, capacity: 3, bed_type: 'King bed + sofa bed', size_sqm: 42, view: 'Sea', price_per_night: 225, status: 'occupied',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Sea view', 'Bathtub', 'Coffee machine', 'Room service'],
        description: 'A bright corner room with wraparound windows and a sofa bed for a third guest.' },
      { room_id: 8, room_number: '401', room_type: 'family', title: 'Family Room', floor: 4, capacity: 4, bed_type: 'King bed + sofa bed', size_sqm: 48, view: 'City', price_per_night: 260, status: 'available',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Kitchenette', 'Safe'],
        description: 'A bright, spacious room with a king bed, a double sofa bed, a kitchenette and plenty of storage for longer family stays.' },
      { room_id: 9, room_number: '402', room_type: 'family', title: 'Family Sea View', floor: 4, capacity: 5, bed_type: 'King + two singles', size_sqm: 55, view: 'Sea', price_per_night: 280, status: 'available',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Kitchenette', 'Sea view', 'Balcony', 'Bathtub'],
        description: 'A connecting-room layout with a king bedroom and a separate twin room for the children.' },
      { room_id: 10, room_number: '501', room_type: 'suite', title: 'Junior Suite', floor: 5, capacity: 3, bed_type: 'King bed', size_sqm: 58, view: 'Sea', price_per_night: 340, status: 'occupied',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Sea view', 'Bathtub', 'Lounge access', 'Coffee machine'],
        description: 'An open-plan suite with a lounge area, executive lounge access and sweeping sea views.' },
      { room_id: 11, room_number: '502', room_type: 'suite', title: 'Executive Suite', floor: 5, capacity: 4, bed_type: 'King bed + sofa bed', size_sqm: 72, view: 'Sea', price_per_night: 450, status: 'available',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Sea view', 'Balcony', 'Jacuzzi', 'Lounge access', 'Room service'],
        description: 'A separate living room, dining area and a balcony jacuzzi above the bay.' },
      { room_id: 12, room_number: '601', room_type: 'suite', title: 'Presidential Suite', floor: 6, capacity: 4, bed_type: 'Two king beds', size_sqm: 120, view: 'Panoramic', price_per_night: 890, status: 'available',
        amenities: ['Wi-Fi', 'Air conditioning', 'Smart TV', 'Mini bar', 'Sea view', 'Balcony', 'Jacuzzi', 'Lounge access', 'Room service', 'Kitchenette'],
        description: 'The top floor in its entirety: two bedrooms, a private dining room and a panoramic terrace.' }
    ],

    // Room photography (local files, see assets/images/rooms/CREDITS.md).
    // Merged into `rooms` below; a missing/broken image falls back to the
    // styled placeholder in HRS.views.roomMedia.
    room_photos: {
      1: ['classic-single-101.jpg', 'Classic single room with a queen bed, built-in sofa and work desk',
        [['gallery/single-room-work-desk.jpg', 'Work desk and window seat in a classic single room'], ['gallery/minimal-dark-bedroom.jpg', 'Quiet bedroom corner with reading lamp']]],
      2: ['classic-single-102.jpg', 'Minimalist single room with a dark upholstered bed and framed line art',
        [['gallery/minimalist-white-bedroom.jpg', 'Bright minimalist bedroom with tufted bed'], ['gallery/bright-modern-bedroom.jpg', 'Modern bedroom with padded headboard wall']]],
      3: ['superior-king-city-201.jpg', 'Superior king room with grey headboard and floor-to-ceiling city windows',
        [['gallery/king-room-grey-headboard.jpg', 'King bed with grey headboard and mirrored wardrobe'], ['gallery/king-room-dark-accent.jpg', 'King room with dark accent wall and bedside lamps']]],
      4: ['superior-twin-202.jpg', 'Superior twin room with two beds, teal throws and a seating area',
        [['gallery/bathroom-freestanding-tub.jpg', 'Bright bathroom with freestanding bathtub']]],
      5: ['superior-king-pool-203.jpg', 'Superior king room with warm bedside lighting and wood-panelled wall',
        [['gallery/king-room-wood-panels.jpg', 'King bed framed by dark wood panels'], ['gallery/king-room-warm-lighting.jpg', 'King room with garden view and warm lighting']]],
      6: ['deluxe-sea-view-301.jpg', 'Deluxe room with a king bed facing open balcony doors and morning light',
        [['gallery/bed-deck-mountain-view.jpg', 'Bed on a private deck overlooking water and mountains'], ['gallery/bathroom-freestanding-tub.jpg', 'Bathroom with freestanding bathtub']]],
      7: ['deluxe-corner-302.jpg', 'Deluxe corner room with wraparound windows over the skyline',
        [['gallery/dark-bedroom-garden-view.jpg', 'Bedroom with dark feature wall and large garden window'], ['gallery/bedroom-teal-bench.jpg', 'King bed with teal bench and reading chair']]],
      8: ['family-room-401.jpg', 'Spacious family room with a king bed, sitting chair and plush rug',
        [['gallery/family-bedroom-ottomans.jpg', 'Family bedroom with twin ottomans at the foot of the bed'], ['gallery/modern-room-lounge-corner.jpg', 'Lounge corner with TV and dressing table']]],
      9: ['family-sea-view-402.jpg', 'Family room with panoramic windows onto a turquoise sea and private deck',
        [['gallery/infinity-pool-sea-terrace.jpg', 'Infinity pool terrace overlooking the sea'], ['gallery/king-room-balcony-doors.jpg', 'Bedroom with balcony doors and a seating area']]],
      10: ['junior-suite-501.jpg', 'Junior suite with king bed and a separate lounge sofa by tall windows',
        [['gallery/suite-bedroom-chandelier.jpg', 'Suite bedroom with channel-tufted bed and city view'], ['gallery/suite-lounge-seating.jpg', 'Suite lounge with armchairs and coffee table']]],
      11: ['executive-suite-502.jpg', 'Executive suite with tufted sofa, king bed and elegant drapery',
        [['gallery/suite-bedroom-elegant.jpg', 'Elegant suite bedroom with pendant lights'], ['gallery/suite-living-room-view.jpg', 'Suite living room with a view of the bay and mountains']]],
      12: ['presidential-suite-601.jpg', 'Presidential suite with panoramic glass walls and a sunken lounge',
        [['gallery/luxury-bedroom-tufted.jpg', 'Luxury bedroom with tufted headboard and bench'], ['gallery/presidential-living-room.jpg', 'Presidential living room with coffered ceiling and fireplace']]]
    },

    pricing_rules: [
      { rule_id: 1, name: 'Autumn Festival', room_type: 'suite', start_date: day(-2), end_date: day(10), adjustment_percent: 10, is_active: true },
      { rule_id: 2, name: 'Peak Holiday Season', room_type: 'all', start_date: day(20), end_date: day(35), adjustment_percent: 20, is_active: true },
      { rule_id: 3, name: 'Off-peak Saver', room_type: 'single', start_date: day(40), end_date: day(90), adjustment_percent: -15, is_active: true },
      { rule_id: 4, name: 'Family Spring Offer', room_type: 'family', start_date: day(60), end_date: day(80), adjustment_percent: -10, is_active: false }
    ],

    reservations: [
      { reservation_id: 1, booking_reference: 'HRS-10241', user_id: 3, room_id: 6, guest_name: 'Sara Mahmoud', guest_email: 'guest@example.com', guest_phone: '+20 100 000 0003', check_in_date: day(-10), check_out_date: day(-7), num_guests: 2, special_requests: 'Late check-out if possible.', status: 'checked-out', payment_status: 'paid', created_at: at(-30) },
      { reservation_id: 2, booking_reference: 'HRS-10242', user_id: 3, room_id: 11, guest_name: 'Sara Mahmoud', guest_email: 'guest@example.com', guest_phone: '+20 100 000 0003', check_in_date: day(14), check_out_date: day(18), num_guests: 3, special_requests: 'Anniversary — flowers in the room please.', status: 'confirmed', payment_status: 'paid', created_at: at(-12) },
      { reservation_id: 3, booking_reference: 'HRS-10243', user_id: 3, room_id: 3, guest_name: 'Sara Mahmoud', guest_email: 'guest@example.com', guest_phone: '+20 100 000 0003', check_in_date: day(30), check_out_date: day(32), num_guests: 2, special_requests: '', status: 'pending', payment_status: 'pending', created_at: at(-1) },
      { reservation_id: 4, booking_reference: 'HRS-10244', user_id: 4, room_id: 4, guest_name: 'James Carter', guest_email: 'james.carter@example.com', guest_phone: '+44 20 0000 0004', check_in_date: day(-2), check_out_date: day(2), num_guests: 2, special_requests: 'Extra pillows.', status: 'checked-in', payment_status: 'paid', created_at: at(-20) },
      { reservation_id: 5, booking_reference: 'HRS-10245', user_id: 5, room_id: 8, guest_name: 'Laila Nabil', guest_email: 'laila.nabil@example.com', guest_phone: '+20 100 000 0005', check_in_date: day(0), check_out_date: day(3), num_guests: 4, special_requests: 'Baby cot required.', status: 'confirmed', payment_status: 'paid', created_at: at(-14) },
      { reservation_id: 6, booking_reference: 'HRS-10246', user_id: 6, room_id: 2, guest_name: 'Omar Farouk', guest_email: 'omar.farouk@example.com', guest_phone: '+20 100 000 0006', check_in_date: day(0), check_out_date: day(1), num_guests: 1, special_requests: 'Arriving around 22:00.', status: 'confirmed', payment_status: 'pending', created_at: at(-3) },
      { reservation_id: 7, booking_reference: 'HRS-10247', user_id: 7, room_id: 10, guest_name: 'Emma Schultz', guest_email: 'emma.schultz@example.com', guest_phone: '+49 30 0000 0007', check_in_date: day(-3), check_out_date: day(0), num_guests: 2, special_requests: '', status: 'checked-in', payment_status: 'paid', created_at: at(-25) },
      { reservation_id: 8, booking_reference: 'HRS-10248', user_id: 4, room_id: 12, guest_name: 'James Carter', guest_email: 'james.carter@example.com', guest_phone: '+44 20 0000 0004', check_in_date: day(-40), check_out_date: day(-36), num_guests: 2, special_requests: 'Airport transfer.', status: 'checked-out', payment_status: 'paid', created_at: at(-70) },
      { reservation_id: 9, booking_reference: 'HRS-10249', user_id: 5, room_id: 7, guest_name: 'Laila Nabil', guest_email: 'laila.nabil@example.com', guest_phone: '+20 100 000 0005', check_in_date: day(-25), check_out_date: day(-22), num_guests: 3, special_requests: '', status: 'checked-out', payment_status: 'paid', created_at: at(-45) },
      { reservation_id: 10, booking_reference: 'HRS-10250', user_id: 6, room_id: 3, guest_name: 'Omar Farouk', guest_email: 'omar.farouk@example.com', guest_phone: '+20 100 000 0006', check_in_date: day(-15), check_out_date: day(-12), num_guests: 2, special_requests: '', status: 'cancelled', payment_status: 'refunded', created_at: at(-40), cancellation_reason: 'Change of travel plans' },
      { reservation_id: 11, booking_reference: 'HRS-10251', user_id: 7, room_id: 6, guest_name: 'Emma Schultz', guest_email: 'emma.schultz@example.com', guest_phone: '+49 30 0000 0007', check_in_date: day(5), check_out_date: day(9), num_guests: 2, special_requests: 'High floor preferred.', status: 'confirmed', payment_status: 'paid', created_at: at(-8) },
      { reservation_id: 12, booking_reference: 'HRS-10252', user_id: 3, room_id: 1, guest_name: 'Sara Mahmoud', guest_email: 'guest@example.com', guest_phone: '+20 100 000 0003', check_in_date: day(-60), check_out_date: day(-58), num_guests: 1, special_requests: '', status: 'checked-out', payment_status: 'paid', created_at: at(-75) },
      { reservation_id: 13, booking_reference: 'HRS-10253', user_id: 4, room_id: 9, guest_name: 'James Carter', guest_email: 'james.carter@example.com', guest_phone: '+44 20 0000 0004', check_in_date: day(45), check_out_date: day(50), num_guests: 4, special_requests: 'Two extra towels sets.', status: 'confirmed', payment_status: 'paid', created_at: at(-5) },
      { reservation_id: 14, booking_reference: 'HRS-10254', user_id: 5, room_id: 2, guest_name: 'Laila Nabil', guest_email: 'laila.nabil@example.com', guest_phone: '+20 100 000 0005', check_in_date: day(8), check_out_date: day(10), num_guests: 1, special_requests: '', status: 'pending', payment_status: 'pending', created_at: at(-2) },
      { reservation_id: 15, booking_reference: 'HRS-10255', user_id: 6, room_id: 11, guest_name: 'Omar Farouk', guest_email: 'omar.farouk@example.com', guest_phone: '+20 100 000 0006', check_in_date: day(-70), check_out_date: day(-66), num_guests: 2, special_requests: '', status: 'checked-out', payment_status: 'paid', created_at: at(-90) },
      { reservation_id: 16, booking_reference: 'HRS-10256', user_id: 7, room_id: 7, guest_name: 'Emma Schultz', guest_email: 'emma.schultz@example.com', guest_phone: '+49 30 0000 0007', check_in_date: day(-1), check_out_date: day(4), num_guests: 3, special_requests: 'Vegetarian breakfast.', status: 'checked-in', payment_status: 'paid', created_at: at(-18) }
    ],

    reviews: [
      { review_id: 1, reservation_id: 1, user_id: 3, room_id: 6, guest_name: 'Sara Mahmoud', rating: 5, title: 'The sea view is unforgettable', comment: 'We spent every morning on the balcony. Spotless room, thoughtful staff and a breakfast worth waking up for.', status: 'published', created_at: day(-6) },
      { review_id: 2, reservation_id: 8, user_id: 4, room_id: 12, guest_name: 'James Carter', rating: 5, title: 'Worth every penny', comment: 'The Presidential Suite felt like a private apartment. The butler service and terrace dinners were outstanding.', status: 'published', created_at: day(-35) },
      { review_id: 3, reservation_id: 9, user_id: 5, room_id: 7, guest_name: 'Laila Nabil', rating: 4, title: 'Lovely corner room', comment: 'Bright and spacious, and the sofa bed was comfortable for our daughter. Check-in took a little longer than expected.', status: 'published', created_at: day(-21) },
      { review_id: 4, reservation_id: null, user_id: 6, room_id: 1, guest_name: 'Omar Farouk', rating: 4, title: 'Perfect for a work trip', comment: 'Quiet, fast Wi-Fi and a proper desk. The garden view made long calls more pleasant.', status: 'published', created_at: day(-57) },
      { review_id: 5, reservation_id: 15, user_id: 6, room_id: 11, guest_name: 'Omar Farouk', rating: 3, title: 'Great suite, slow room service', comment: 'The suite itself was beautiful, but room service took almost an hour on both evenings.', status: 'published', created_at: day(-65) },
      { review_id: 6, reservation_id: null, user_id: 7, room_id: 10, guest_name: 'Emma Schultz', rating: 5, title: 'Lounge access is a treat', comment: 'Afternoon tea in the executive lounge became our favourite ritual. Staff remembered our names from day one.', status: 'published', created_at: day(-100) },
      { review_id: 7, reservation_id: null, user_id: 4, room_id: 3, guest_name: 'James Carter', rating: 2, title: 'Noisy at night', comment: 'Comfortable bed, but street noise on the city side kept us up. Ask for a higher floor.', status: 'hidden', created_at: day(-110) }
    ],

    service_requests: [
      { request_id: 1, room_number: '202', guest_name: 'James Carter', request_type: 'housekeeping', details: 'Extra pillows and towels.', priority: 'low', status: 'open', assigned_to: '', created_at: at(0, '08:15') },
      { request_id: 2, room_number: '501', guest_name: 'Emma Schultz', request_type: 'food', details: 'Breakfast for two at 08:30 — continental.', priority: 'medium', status: 'in-progress', assigned_to: 'Kitchen', created_at: at(0, '07:50') },
      { request_id: 3, room_number: '302', guest_name: 'Emma Schultz', request_type: 'maintenance', details: 'Air conditioning is making a rattling noise.', priority: 'high', status: 'open', assigned_to: '', created_at: at(0, '09:05') },
      { request_id: 4, room_number: '202', guest_name: 'James Carter', request_type: 'transport', details: 'Taxi to the airport tomorrow at 06:00.', priority: 'medium', status: 'completed', assigned_to: 'Concierge', created_at: at(-1, '18:30') },
      { request_id: 5, room_number: '302', guest_name: 'Emma Schultz', request_type: 'amenities', details: 'Baby bath and bottle warmer.', priority: 'low', status: 'completed', assigned_to: 'Housekeeping', created_at: at(-1, '15:10') }
    ],

    complaints: [
      { complaint_id: 1, booking_reference: 'HRS-10244', guest_name: 'James Carter', room_number: '202', category: 'noise', subject: 'Noise from the corridor', description: 'Loud conversations in the corridor after midnight two nights in a row.', priority: 'medium', status: 'in-progress', resolution_notes: 'Security asked to patrol floor 2 after 23:00.', created_at: at(-1, '09:20') },
      { complaint_id: 2, booking_reference: 'HRS-10256', guest_name: 'Emma Schultz', room_number: '302', category: 'maintenance', subject: 'Air conditioning noise', description: 'The AC unit rattles constantly and makes it hard to sleep.', priority: 'high', status: 'open', resolution_notes: '', created_at: at(0, '09:10') },
      { complaint_id: 3, booking_reference: 'HRS-10249', guest_name: 'Laila Nabil', room_number: '302', category: 'service', subject: 'Slow check-in', description: 'Waited 40 minutes at reception on arrival.', priority: 'low', status: 'resolved', resolution_notes: 'Apologised and offered a complimentary dinner. Rostering reviewed.', created_at: at(-25, '16:00') },
      { complaint_id: 4, booking_reference: 'HRS-10255', guest_name: 'Omar Farouk', room_number: '502', category: 'billing', subject: 'Minibar charge disputed', description: 'Charged for two items that were not consumed.', priority: 'medium', status: 'resolved', resolution_notes: 'Charge reversed after minibar audit.', created_at: at(-66, '11:30') }
    ]
  };

  var PHOTO_DIR = 'assets/images/rooms/';
  HRS.mockData.rooms.forEach(function (room) {
    var photo = HRS.mockData.room_photos[room.room_id];
    room.image_url = photo ? PHOTO_DIR + photo[0] : '';
    room.image_alt = photo ? photo[1] : '';
    room.gallery = photo ? photo[2].map(function (g) { return { url: PHOTO_DIR + g[0], alt: g[1] }; }) : [];
  });
  delete HRS.mockData.room_photos;
})(window.HRS);
