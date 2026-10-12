import {
  Profile,
  Sport,
  Venue,
  Tournament,
  TournamentRound,
  TournamentTeam,
  Match,
  Ranking,
  PlayerStatistic,
  Certificate,
  GalleryItem,
  UpdateItem,
  Registration
} from './types';

export const mockCurrentUser: Profile = {
  id: 'usr_athlete_01',
  email: 'student@svec.ac.in',
  google_email: 'student@gmail.com',
  full_name: 'Student Athlete',
  role: 'member',
  program: 'B.Tech',
  department: 'CSE',
  year: '3rd',
  student_id: '22A81A0501',
  gender: 'Men',
  phone: '+91 94401 00000',
  bio: 'Collegiate Athlete at Sri Vasavi Engineering College.',
  requires_password_change: false,
  is_active: true,
  created_at: '2025-08-10T10:00:00Z'
};

export const mockStudentAccounts: Profile[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    email: 'student.cse2@svec.ac.in',
    google_email: 'rajesh.k@gmail.com',
    full_name: 'K. Rajesh',
    role: 'member',
    program: 'B.Tech',
    department: 'CSE',
    year: '2nd',
    student_id: '24A81A0501',
    gender: 'Men',
    phone: '+91 98480 11111',
    is_active: true,
    requires_password_change: true,
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'usr_athlete_01',
    email: 'student@svec.ac.in',
    google_email: 'student@gmail.com',
    full_name: 'Student Athlete',
    role: 'member',
    program: 'B.Tech',
    department: 'CSE',
    year: '3rd',
    student_id: '22A81A0501',
    gender: 'Men',
    phone: '+91 94401 00000',
    is_active: true,
    requires_password_change: false,
    created_at: '2025-08-10T10:00:00Z'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    email: 'student.ece3@svec.ac.in',
    google_email: 'suresh.ece@gmail.com',
    full_name: 'M. Suresh',
    role: 'member',
    program: 'B.Tech',
    department: 'ECE',
    year: '3rd',
    student_id: '23A81A0401',
    gender: 'Men',
    phone: '+91 98480 22222',
    is_active: true,
    requires_password_change: false,
    created_at: '2025-08-12T10:00:00Z'
  },
  {
    id: 'd0000000-0000-0000-0000-000000000007',
    email: 'student.cai3@svec.ac.in',
    google_email: 'haritha.cai@gmail.com',
    full_name: 'S. Haritha',
    role: 'member',
    program: 'B.Tech',
    department: 'CAI',
    year: '3rd',
    student_id: '23A81A4301',
    gender: 'Women',
    phone: '+91 98480 55555',
    is_active: true,
    requires_password_change: false,
    created_at: '2025-08-14T10:00:00Z'
  }
];

export const mockAdminUser: Profile = {
  id: 'a0000000-0000-0000-0000-000000000001',
  email: 'coach.cricket@svec.ac.in',
  full_name: 'Coach & Sports Administrator',
  role: 'admin',
  department: 'Physical Education',
  year: 'Faculty / Staff',
  student_id: 'EMP-PED-COACH',
  phone: '+91 94401 00001',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  bio: 'Faculty Coach & Sports Administrator, Physical Education Department, Sri Vasavi Engineering College.',
  created_at: '2024-01-01T08:00:00Z'
};

export const mockCoachUser: Profile = {
  id: 'c0000000-0000-0000-0000-000000000002',
  email: 'coach.cricket@svec.ac.in',
  full_name: 'Coach & Sports Administrator',
  role: 'admin',
  department: 'Physical Education',
  year: 'Faculty / Staff',
  student_id: 'EMP-PED-COACH',
  phone: '+91 94401 00002',
  avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  bio: 'Faculty Coach & Sports Administrator, Physical Education Department, Sri Vasavi Engineering College.',
  created_at: '2024-01-01T08:00:00Z'
};

export const mockSports: Sport[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    name: 'Shuttle Badminton',
    slug: 'shuttle-badminton',
    facility_type: 'competitive_sport',
    category: 'Racquet Sport',
    discipline_type: 'both',
    is_competitive: true,
    icon: 'Zap',
    cover_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
    description: 'Singles and doubles collegiate badminton championship on synthetic courts.',
    rules: 'Standard BWF rules. Best of 3 sets of 21 points.',
    min_team_size: 1,
    max_team_size: 2,
    active_athletes_count: 56
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    name: 'Kho-Kho',
    slug: 'kho-kho',
    facility_type: 'competitive_sport',
    category: 'Outdoor Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Activity',
    cover_image: 'https://img.olympics.com/images/image/private/t_s_16_9_g_auto/t_s_w2440/f_auto/primary/fyygtuyj2h1uwjeeucmh',
    description: 'Traditional Indian tag team sport demanding extreme agility and stamina.',
    rules: 'Official KKFI regulations. 9 players per side with chasers and runners.',
    min_team_size: 9,
    max_team_size: 12,
    active_athletes_count: 48
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    name: 'Yoga',
    slug: 'yoga',
    facility_type: 'fitness_wellness',
    category: 'Mind & Body',
    discipline_type: 'individual',
    is_competitive: false,
    icon: 'Heart',
    cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80',
    description: 'Comprehensive holistic wellness and asana practice sessions promoting student mental health and flexibility.',
    rules: 'Standard yogic practice protocols under certified guidance.',
    min_team_size: 1,
    max_team_size: 1,
    active_athletes_count: 85
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    name: 'Basketball',
    slug: 'basketball',
    facility_type: 'competitive_sport',
    category: 'Outdoor Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Trophy',
    cover_image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
    description: 'Varsity basketball team program with official floodlit court fixtures.',
    rules: 'FIBA standard 4 quarters of 10 minutes.',
    min_team_size: 5,
    max_team_size: 10,
    active_athletes_count: 64
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    name: 'Handball',
    slug: 'handball',
    facility_type: 'competitive_sport',
    category: 'Outdoor Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Target',
    cover_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJ5_qX82jJKHsSdeJRDjyaIDXbQqDZTa45JLl7Iu7qgw&s=10',
    description: 'Fast-paced team handball competitions and training on marked courts.',
    rules: 'IHF regulations. Two 30-minute halves.',
    min_team_size: 7,
    max_team_size: 14,
    active_athletes_count: 42
  },
  {
    id: 'f0000000-0000-0000-0000-000000000006',
    name: 'Netball',
    slug: 'netball',
    facility_type: 'competitive_sport',
    category: 'Outdoor Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Target',
    cover_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
    description: 'Precision ball sport emphasizing team coordination and court positioning.',
    rules: 'INF international tournament rules. 7 players per team.',
    min_team_size: 7,
    max_team_size: 12,
    active_athletes_count: 36
  },
  {
    id: 'f0000000-0000-0000-0000-000000000007',
    name: 'Fencing',
    slug: 'fencing',
    facility_type: 'competitive_sport',
    category: 'Combat & Martial Arts',
    discipline_type: 'individual',
    is_competitive: true,
    icon: 'Shield',
    cover_image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1200&auto=format&fit=crop&q=80',
    description: 'Olympic sword discipline testing tactical acumen, reflexes, and precision footwork.',
    rules: 'FIE foil, epee, and sabre regulations.',
    min_team_size: 1,
    max_team_size: 1,
    active_athletes_count: 24
  },
  {
    id: 'f0000000-0000-0000-0000-000000000008',
    name: 'Taekwondo',
    slug: 'taekwondo',
    facility_type: 'competitive_sport',
    category: 'Combat & Martial Arts',
    discipline_type: 'individual',
    is_competitive: true,
    icon: 'Flame',
    cover_image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1200&auto=format&fit=crop&q=80',
    description: 'World Taekwondo martial art discipline emphasizing high kicks and defensive sparring.',
    rules: 'WT competition sparring rules with protective gear.',
    min_team_size: 1,
    max_team_size: 1,
    active_athletes_count: 32
  },
  {
    id: 'f0000000-0000-0000-0000-000000000009',
    name: 'Self-Defence',
    slug: 'self-defence',
    facility_type: 'training_facility',
    category: 'Combat & Martial Arts',
    discipline_type: 'individual',
    is_competitive: false,
    icon: 'ShieldAlert',
    cover_image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    description: 'Practical personal safety and situational defense conditioning workshops.',
    rules: 'Safety-first progressive resistance training.',
    min_team_size: 1,
    max_team_size: 1,
    active_athletes_count: 55
  },
  {
    id: 'f0000000-0000-0000-0000-000000000010',
    name: 'Table Tennis',
    slug: 'table-tennis',
    facility_type: 'competitive_sport',
    category: 'Racquet Sport',
    discipline_type: 'both',
    is_competitive: true,
    icon: 'Circle',
    cover_image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=1200&auto=format&fit=crop&q=80',
    description: 'Fast indoor table tennis trials and varsity singles/doubles tournaments.',
    rules: 'ITTF rules. 11-point sets with alternating service.',
    min_team_size: 1,
    max_team_size: 2,
    active_athletes_count: 44
  },
  {
    id: 'f0000000-0000-0000-0000-000000000011',
    name: 'Ball Badminton',
    slug: 'ball-badminton',
    facility_type: 'competitive_sport',
    category: 'Racquet Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Wind',
    cover_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
    description: 'Traditional Indian racquet team sport played with woolen yellow ball.',
    rules: 'Ball Badminton Federation of India official rules. 5 players per side.',
    min_team_size: 5,
    max_team_size: 10,
    active_athletes_count: 38
  },
  {
    id: 'f0000000-0000-0000-0000-000000000012',
    name: 'Chess',
    slug: 'chess',
    facility_type: 'competitive_sport',
    category: 'Mind & Strategy',
    discipline_type: 'individual',
    is_competitive: true,
    icon: 'Brain',
    cover_image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1200&auto=format&fit=crop&q=80',
    description: 'Collegiate mind sport championship featuring standard and rapid time controls.',
    rules: 'FIDE touch-move and electronic clock regulations.',
    min_team_size: 1,
    max_team_size: 1,
    active_athletes_count: 50
  },
  {
    id: 'f0000000-0000-0000-0000-000000000013',
    name: 'Cricket',
    slug: 'cricket',
    facility_type: 'competitive_sport',
    category: 'Outdoor Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Crosshair',
    cover_image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&auto=format&fit=crop&q=80',
    coach_name: 'Cricket Coach',
    coach_contact: 'coach.cricket@svec.ac.in | +91 94401 00002',
    venue: 'SVEC Sports Ground',
    description: 'Varsity cricket team selections, inter-department tournaments, and JNTUK trials.',
    rules: 'BCCI / ICC standard playing conditions.',
    min_team_size: 11,
    max_team_size: 16,
    active_athletes_count: 120
  },
  {
    id: 'f0000000-0000-0000-0000-000000000014',
    name: 'Volleyball',
    slug: 'volleyball',
    facility_type: 'competitive_sport',
    category: 'Outdoor Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Compass',
    cover_image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&auto=format&fit=crop&q=80',
    description: 'Men and women volleyball selections on standard sand and hard outdoor courts.',
    rules: 'FIVB rules. Best of 3 or 5 sets of 25 points with rotation.',
    min_team_size: 6,
    max_team_size: 12,
    active_athletes_count: 72
  },
  {
    id: 'f0000000-0000-0000-0000-000000000015',
    name: 'Kabaddi',
    slug: 'kabaddi',
    facility_type: 'competitive_sport',
    category: 'Outdoor Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Award',
    cover_image: 'https://www.economist.com/cdn-cgi/image/width=1424,quality=80,format=auto/media-assets/image/20221008_BLP507.jpg',
    description: 'High-intensity contact sport testing raider skill and defensive team coordination.',
    rules: 'AKFI standard mat/court regulations. 7 active players per side.',
    min_team_size: 7,
    max_team_size: 12,
    active_athletes_count: 65
  },
  {
    id: 'f0000000-0000-0000-0000-000000000016',
    name: 'Football',
    slug: 'football',
    facility_type: 'competitive_sport',
    category: 'Outdoor Sport',
    discipline_type: 'team',
    is_competitive: true,
    icon: 'Activity',
    cover_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwowk9D7lYezjKMTtUD37lSLYYzbRJOFAYHvhsAY2wjw&s=10',
    description: '11-a-side association football championship on standard natural turf.',
    rules: 'FIFA Laws of the Game.',
    min_team_size: 11,
    max_team_size: 16,
    active_athletes_count: 110
  },
  {
    id: 'f0000000-0000-0000-0000-000000000017',
    name: 'Athletics',
    slug: 'athletics',
    facility_type: 'competitive_sport',
    category: 'Track & Field',
    discipline_type: 'individual',
    is_competitive: true,
    icon: 'Zap',
    cover_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    description: 'Track events (100m, 200m, 400m, relays) and field jumps/throws.',
    rules: 'AFI track and field rules with electronic timing.',
    min_team_size: 1,
    max_team_size: 4,
    active_athletes_count: 88
  },
  {
    id: 'f0000000-0000-0000-0000-000000000018',
    name: 'Archery',
    slug: 'archery',
    facility_type: 'competitive_sport',
    category: 'Target Sport',
    discipline_type: 'individual',
    is_competitive: true,
    icon: 'Target',
    cover_image: 'https://images.theconversation.com/files/13526/original/c4xgctyd-1343370892.jpg?ixlib=rb-4.1.1&q=45&auto=format&w=754&fit=clip',
    description: 'Target precision archery discipline with recurve and compound equipment.',
    rules: 'World Archery standard target face scoring protocols.',
    min_team_size: 1,
    max_team_size: 1,
    active_athletes_count: 22
  },
  {
    id: 'f0000000-0000-0000-0000-000000000019',
    name: 'Gymnasium',
    slug: 'gymnasium',
    facility_type: 'training_facility',
    category: 'Fitness Facility',
    discipline_type: 'individual',
    is_competitive: false,
    icon: 'Dumbbell',
    cover_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    description: 'Dedicated multi-station indoor gym equipped with free weights and strength resistance machines.',
    rules: 'Athletics department gym safety and supervision guidelines.',
    min_team_size: 1,
    max_team_size: 1,
    active_athletes_count: 140
  },
  {
    id: 'f0000000-0000-0000-0000-000000000020',
    name: 'Open Gym',
    slug: 'open-gym',
    facility_type: 'training_facility',
    category: 'Fitness Facility',
    discipline_type: 'individual',
    is_competitive: false,
    icon: 'Sun',
    cover_image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&auto=format&fit=crop&q=80',
    description: 'Open-air bodyweight and calisthenics fitness installation accessible across athletic grounds.',
    rules: 'Outdoor fitness station safety protocols.',
    min_team_size: 1,
    max_team_size: 1,
    active_athletes_count: 95
  }
];

export const mockVenues: Venue[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    name: 'SVEC Sports Ground',
    location: 'College Campus Ground',
    capacity: 2500,
    supported_sports: ['Cricket', 'Football', 'Athletics', 'Volleyball', 'Kho-Kho', 'Kabaddi', 'Basketball', 'Handball', 'Ball Badminton'],
    is_active: true
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    name: 'SVEC Indoor Sports Complex',
    location: 'Student Amenities Block',
    capacity: 500,
    supported_sports: ['Table Tennis', 'Shuttle Badminton', 'Chess', 'Yoga', 'Taekwondo', 'Fencing', 'Self-Defence'],
    is_active: true
  }
];

export const mockTournaments: Tournament[] = [
  {
    id: 'tourn_football_2026',
    sport_id: 'sp_football',
    sport_name: 'Football',
    title: 'Inter-Department Football Championship 2026',
    slug: 'inter-dept-football-championship-2026',
    format: 'knockout',
    start_date: '2026-10-01',
    end_date: '2026-10-15',
    status: 'live',
    min_team_size: 11,
    max_team_size: 16,
    max_teams: 8,
    current_teams_count: 8,
    registration_deadline: '2026-09-28T23:59:59Z',
    rules: '8-team single elimination knockout tournament. 90 minutes + penalty shootout if tied. CS, MECH, ELEC, CIVIL, MBA, ECE, BIO, CHEM.',
    banner_image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'tourn_basketball_2026',
    sport_id: 'sp_basketball',
    sport_name: 'Basketball',
    title: 'Campus Basketball Super League',
    slug: 'campus-basketball-super-league',
    format: 'knockout',
    start_date: '2026-10-10',
    end_date: '2026-10-24',
    status: 'registration_open',
    min_team_size: 5,
    max_team_size: 10,
    max_teams: 8,
    current_teams_count: 6,
    registration_deadline: '2026-10-05T23:59:59Z',
    rules: 'Full court 5v5 collegiate tournament. Double elimination bracket. Professional referees, shot clock and full stat tracking.',
    banner_image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'tourn_cricket_2026',
    sport_id: 'sp_cricket',
    sport_name: 'Cricket',
    title: "Chancellor's Cup T20 Trophy",
    slug: 'chancellors-cup-t20-trophy',
    format: 'league',
    start_date: '2026-11-01',
    end_date: '2026-11-20',
    status: 'upcoming',
    min_team_size: 11,
    max_team_size: 15,
    max_teams: 8,
    current_teams_count: 4,
    registration_deadline: '2026-10-20T23:59:59Z',
    rules: 'T20 round-robin group stage followed by Top 4 Playoffs (Qualifier 1, Eliminator, Qualifier 2, Grand Final).',
    banner_image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1600&auto=format&fit=crop&q=80'
  },
  {
    id: 'tourn_badminton_2026',
    sport_id: 'sp_badminton',
    sport_name: 'Badminton',
    title: 'Smash Masters Badminton Open',
    slug: 'smash-masters-badminton-open',
    format: 'knockout',
    start_date: '2026-09-15',
    end_date: '2026-09-22',
    status: 'completed',
    min_team_size: 1,
    max_team_size: 2,
    max_teams: 16,
    current_teams_count: 16,
    registration_deadline: '2026-09-10T23:59:59Z',
    rules: 'Men Singles, Women Singles, and Mixed Doubles. BWF rally point scoring.',
    banner_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1600&auto=format&fit=crop&q=80'
  }
];

export const mockTeams: TournamentTeam[] = [
  {
    id: 'team_cs',
    tournament_id: 'tourn_football_2026',
    name: 'CS Strikers',
    captain_id: 'usr_athlete_01',
    captain_name: 'Alex Vance',
    department: 'Computer Science',
    hostel: 'Aryabhatta Hostel',
    status: 'qualified',
    seed: 1,
    players_count: 14
  },
  {
    id: 'team_mech',
    tournament_id: 'tourn_football_2026',
    name: 'Mechanical Warriors',
    captain_id: 'usr_mech_cap',
    captain_name: 'Jason Brody',
    department: 'Mechanical Eng.',
    hostel: 'Tagore Bhavan',
    status: 'eliminated',
    seed: 8,
    players_count: 15
  },
  {
    id: 'team_elec',
    tournament_id: 'tourn_football_2026',
    name: 'Electrical Dynamos',
    captain_id: 'usr_elec_cap',
    captain_name: 'Siddharth Rao',
    department: 'Electrical Eng.',
    hostel: 'Aryabhatta Hostel',
    status: 'qualified',
    seed: 4,
    players_count: 13
  },
  {
    id: 'team_civil',
    tournament_id: 'tourn_football_2026',
    name: 'Civil Titans',
    captain_id: 'usr_civil_cap',
    captain_name: 'Vikram Sethi',
    department: 'Civil Eng.',
    hostel: 'Kalam Tower',
    status: 'eliminated',
    seed: 5,
    players_count: 14
  },
  {
    id: 'team_mba',
    tournament_id: 'tourn_football_2026',
    name: 'MBA Knights',
    captain_id: 'usr_mba_cap',
    captain_name: 'Rohan Mehra',
    department: 'School of Management',
    hostel: 'Gargi Hall',
    status: 'qualified',
    seed: 2,
    players_count: 12
  },
  {
    id: 'team_ece',
    tournament_id: 'tourn_football_2026',
    name: 'ECE Ravens',
    captain_id: 'usr_ece_cap',
    captain_name: 'Ananya Sharma',
    department: 'Electronics & Comm.',
    hostel: 'Gargi Hall',
    status: 'eliminated',
    seed: 7,
    players_count: 14
  },
  {
    id: 'team_bio',
    tournament_id: 'tourn_football_2026',
    name: 'Biotech Eagles',
    captain_id: 'usr_bio_cap',
    captain_name: 'Tanya Roy',
    department: 'Biotechnology',
    hostel: 'Sarojini House',
    status: 'registered',
    seed: 3,
    players_count: 13
  },
  {
    id: 'team_chem',
    tournament_id: 'tourn_football_2026',
    name: 'Chemical Phoenix',
    captain_id: 'usr_chem_cap',
    captain_name: 'Aakash Verma',
    department: 'Chemical Eng.',
    hostel: 'Tagore Bhavan',
    status: 'registered',
    seed: 6,
    players_count: 14
  }
];

export const mockRounds: TournamentRound[] = [
  {
    id: 'round_qf',
    tournament_id: 'tourn_football_2026',
    round_number: 1,
    round_name: 'Quarterfinals',
    status: 'active'
  },
  {
    id: 'round_sf',
    tournament_id: 'tourn_football_2026',
    round_number: 2,
    round_name: 'Semifinals',
    status: 'pending'
  },
  {
    id: 'round_final',
    tournament_id: 'tourn_football_2026',
    round_number: 3,
    round_name: 'Championship Final',
    status: 'pending'
  }
];

export const mockMatches: Match[] = [
  // Quarterfinals
  {
    id: 'm_qf_1',
    tournament_id: 'tourn_football_2026',
    round_id: 'round_qf',
    round_name: 'Quarterfinals',
    team1_id: 'team_cs',
    team2_id: 'team_mech',
    team1: mockTeams[0],
    team2: mockTeams[1],
    venue_id: 'ven_turf',
    venue_name: 'Main Stadium Turf Arena',
    court_table: 'Pitch 1',
    start_time: '2026-10-02T15:00:00Z',
    status: 'live',
    bracket_node_id: 'QF_1',
    next_match_id: 'm_sf_1',
    result: {
      id: 'res_qf_1',
      match_id: 'm_qf_1',
      team1_score: 2,
      team2_score: 1,
      winner_team_id: 'team_cs',
      extra_info: {
        period: "2nd Half",
        timeRemaining: "74'",
        scorers: ['Alex Vance (23\')', 'Jason Brody (49\')', 'Alex Vance (68\')'],
        mvp: 'Alex Vance (CS)'
      },
      verified_by_admin: false
    }
  },
  {
    id: 'm_qf_2',
    tournament_id: 'tourn_football_2026',
    round_id: 'round_qf',
    round_name: 'Quarterfinals',
    team1_id: 'team_elec',
    team2_id: 'team_civil',
    team1: mockTeams[2],
    team2: mockTeams[3],
    venue_id: 'ven_turf',
    venue_name: 'Main Stadium Turf Arena',
    court_table: 'Pitch 1',
    start_time: '2026-10-02T17:30:00Z',
    status: 'completed',
    bracket_node_id: 'QF_2',
    next_match_id: 'm_sf_1',
    result: {
      id: 'res_qf_2',
      match_id: 'm_qf_2',
      team1_score: 3,
      team2_score: 0,
      winner_team_id: 'team_elec',
      extra_info: {
        period: 'Full Time',
        scorers: ['Siddharth Rao (12\', 55\')', 'R. Patel (80\')'],
        mvp: 'Siddharth Rao (ELEC)'
      },
      verified_by_admin: true
    }
  },
  {
    id: 'm_qf_3',
    tournament_id: 'tourn_football_2026',
    round_id: 'round_qf',
    round_name: 'Quarterfinals',
    team1_id: 'team_mba',
    team2_id: 'team_ece',
    team1: mockTeams[4],
    team2: mockTeams[5],
    venue_id: 'ven_turf',
    venue_name: 'Main Stadium Turf Arena',
    court_table: 'Pitch 2',
    start_time: '2026-10-03T15:00:00Z',
    status: 'completed',
    bracket_node_id: 'QF_3',
    next_match_id: 'm_sf_2',
    result: {
      id: 'res_qf_3',
      match_id: 'm_qf_3',
      team1_score: 1,
      team2_score: 0,
      winner_team_id: 'team_mba',
      extra_info: {
        period: 'Full Time',
        scorers: ['Rohan Mehra (88\')'],
        mvp: 'Rohan Mehra (MBA)'
      },
      verified_by_admin: true
    }
  },
  {
    id: 'm_qf_4',
    tournament_id: 'tourn_football_2026',
    round_id: 'round_qf',
    round_name: 'Quarterfinals',
    team1_id: 'team_bio',
    team2_id: 'team_chem',
    team1: mockTeams[6],
    team2: mockTeams[7],
    venue_id: 'ven_turf',
    venue_name: 'Main Stadium Turf Arena',
    court_table: 'Pitch 2',
    start_time: '2026-10-03T17:30:00Z',
    status: 'scheduled',
    bracket_node_id: 'QF_4',
    next_match_id: 'm_sf_2'
  },
  // Semifinals
  {
    id: 'm_sf_1',
    tournament_id: 'tourn_football_2026',
    round_id: 'round_sf',
    round_name: 'Semifinals',
    team1_id: 'team_cs',
    team2_id: 'team_elec',
    team1: mockTeams[0],
    team2: mockTeams[2],
    venue_id: 'ven_turf',
    venue_name: 'Main Stadium Turf Arena',
    court_table: 'Main Pitch',
    start_time: '2026-10-07T16:00:00Z',
    status: 'scheduled',
    bracket_node_id: 'SF_1',
    next_match_id: 'm_final'
  },
  {
    id: 'm_sf_2',
    tournament_id: 'tourn_football_2026',
    round_id: 'round_sf',
    round_name: 'Semifinals',
    team1_id: 'team_mba',
    team2_id: undefined,
    team1: mockTeams[4],
    team2: undefined,
    venue_id: 'ven_turf',
    venue_name: 'Main Stadium Turf Arena',
    court_table: 'Main Pitch',
    start_time: '2026-10-08T16:00:00Z',
    status: 'scheduled',
    bracket_node_id: 'SF_2',
    next_match_id: 'm_final'
  },
  // Final
  {
    id: 'm_final',
    tournament_id: 'tourn_football_2026',
    round_id: 'round_final',
    round_name: 'Championship Final',
    team1_id: undefined,
    team2_id: undefined,
    venue_id: 'ven_turf',
    venue_name: 'Main Stadium Turf Arena',
    court_table: 'Grand Stage',
    start_time: '2026-10-12T17:00:00Z',
    status: 'scheduled',
    bracket_node_id: 'FINAL_1'
  }
];

export const mockCampusCupStandings: Ranking[] = [
  {
    id: 'cup_cs',
    entity_type: 'department',
    entity_name: 'Computer Science & Eng.',
    rank: 1,
    points: 480,
    previous_rank: 2,
    change_direction: 'up',
    stats: { played: 18, won: 15, lost: 3, goldMedals: 3, silverMedals: 2, bronzeMedals: 1 }
  },
  {
    id: 'cup_mech',
    entity_type: 'department',
    entity_name: 'Mechanical Engineering',
    rank: 2,
    points: 440,
    previous_rank: 1,
    change_direction: 'down',
    stats: { played: 19, won: 13, lost: 6, goldMedals: 2, silverMedals: 3, bronzeMedals: 2 }
  },
  {
    id: 'cup_elec',
    entity_type: 'department',
    entity_name: 'Electrical Engineering',
    rank: 3,
    points: 390,
    previous_rank: 3,
    change_direction: 'same',
    stats: { played: 16, won: 11, lost: 5, goldMedals: 2, silverMedals: 1, bronzeMedals: 3 }
  },
  {
    id: 'cup_civil',
    entity_type: 'department',
    entity_name: 'Civil Engineering',
    rank: 4,
    points: 310,
    previous_rank: 5,
    change_direction: 'up',
    stats: { played: 15, won: 8, lost: 7, goldMedals: 1, silverMedals: 2, bronzeMedals: 1 }
  },
  {
    id: 'cup_mba',
    entity_type: 'department',
    entity_name: 'School of Management (MBA)',
    rank: 5,
    points: 290,
    previous_rank: 4,
    change_direction: 'down',
    stats: { played: 14, won: 8, lost: 6, goldMedals: 1, silverMedals: 1, bronzeMedals: 2 }
  },
  {
    id: 'cup_ece',
    entity_type: 'department',
    entity_name: 'Electronics & Communication',
    rank: 6,
    points: 240,
    previous_rank: 6,
    change_direction: 'same',
    stats: { played: 14, won: 6, lost: 8, goldMedals: 0, silverMedals: 2, bronzeMedals: 2 }
  }
];

export const mockHostelCupStandings: Ranking[] = [
  {
    id: 'hostel_aryabhatta',
    entity_type: 'hostel',
    entity_name: 'Aryabhatta Hostel',
    rank: 1,
    points: 520,
    previous_rank: 1,
    change_direction: 'same',
    stats: { played: 22, won: 17, lost: 5, goldMedals: 4, silverMedals: 2, bronzeMedals: 2 }
  },
  {
    id: 'hostel_tagore',
    entity_type: 'hostel',
    entity_name: 'Tagore Bhavan',
    rank: 2,
    points: 460,
    previous_rank: 3,
    change_direction: 'up',
    stats: { played: 21, won: 14, lost: 7, goldMedals: 2, silverMedals: 4, bronzeMedals: 1 }
  },
  {
    id: 'hostel_gargi',
    entity_type: 'hostel',
    entity_name: 'Gargi Hall',
    rank: 3,
    points: 410,
    previous_rank: 2,
    change_direction: 'down',
    stats: { played: 20, won: 13, lost: 7, goldMedals: 2, silverMedals: 2, bronzeMedals: 3 }
  },
  {
    id: 'hostel_kalam',
    entity_type: 'hostel',
    entity_name: 'Kalam Tower',
    rank: 4,
    points: 320,
    previous_rank: 4,
    change_direction: 'same',
    stats: { played: 18, won: 9, lost: 9, goldMedals: 1, silverMedals: 1, bronzeMedals: 2 }
  }
];

export const mockPlayerStats: PlayerStatistic[] = [
  {
    id: 'stat_football_alex',
    profile_id: 'usr_athlete_01',
    sport_id: 'sp_football',
    sport_name: 'Football',
    matches_played: 28,
    wins: 22,
    mvp_count: 7,
    stat_metrics: {
      'Goals Scored': 19,
      'Key Assists': 14,
      'Pass Completion %': '87.4%',
      'Tackles Won': 46
    }
  },
  {
    id: 'stat_badminton_alex',
    profile_id: 'usr_athlete_01',
    sport_id: 'sp_badminton',
    sport_name: 'Badminton',
    matches_played: 12,
    wins: 9,
    mvp_count: 2,
    stat_metrics: {
      'Sets Won': 21,
      'Smash Speed (max)': '285 km/h',
      'Net Winners': 34
    }
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: 'cert_001',
    certificate_no: 'SVEC-CERT-2025-0491',
    profile_id: 'usr_athlete_01',
    athlete_name: 'Alex Vance',
    tournament_id: 'tourn_badminton_2026',
    tournament_title: 'Smash Masters Badminton Open 2025',
    sport_name: 'Badminton',
    rank_achieved: 'Runner-Up (Silver Medalist)',
    issue_date: '2025-09-22',
    verification_hash: '8f92a1c0d45e679b32fa9981',
    status: 'issued'
  },
  {
    id: 'cert_002',
    certificate_no: 'SVEC-CERT-2025-0104',
    profile_id: 'usr_athlete_01',
    athlete_name: 'Alex Vance',
    tournament_id: 'tourn_football_2026',
    tournament_title: 'Inter-College Invitational Shield 2025',
    sport_name: 'Football',
    rank_achieved: 'Champions (Gold Medalist)',
    issue_date: '2025-04-18',
    verification_hash: '4b71e33c9120af8479e4d502',
    status: 'issued'
  }
];

export const mockUpdates: UpdateItem[] = [
  {
    id: 'upd_01',
    title: 'CS Strikers Advance to Semifinals in Thriller Over Mech Warriors',
    summary: 'Alex Vance delivers a brace as CS edged Mechanical 2-1 before a packed stadium crowd under lights.',
    content: 'In one of the most electric encounters of the tournament, Computer Science held off a fierce second-half rally from Mechanical Engineering to secure their spot in the Inter-Department Football Championship Semifinals. The match opened at a blistering pace with Vance slotting in a clinical rebound in the 23rd minute.',
    category: 'Tournament',
    cover_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
    featured: true,
    author_name: 'Athletics Media Desk',
    created_at: '2026-10-02T18:45:00Z'
  },
  {
    id: 'upd_02',
    title: 'Campus Sports Cup 2026: CS Overtakes Mechanical for Overall Lead',
    summary: 'With deep playoff runs across Football and Badminton, CS climbs to 480 points at the top of the leaderboard.',
    content: 'The race for the prestigious Chancellor’s Trophy has reached peak excitement. CS currently leads with 480 points, closely trailed by defending champions Mechanical Engineering at 440 points. Electrical is firmly within striking distance at 390 points with basketball trials kicking off next week.',
    category: 'Campus Cup',
    cover_image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    featured: false,
    author_name: 'Sports Director Office',
    created_at: '2026-10-01T12:00:00Z'
  },
  {
    id: 'upd_03',
    title: 'New LED Floodlights & Synthetic Turf Upgrade Completed at North Arena',
    summary: 'Evening matches can now host up to 2,500 spectators with broadcast-grade 1200 lux sports lighting.',
    content: 'The campus athletic department officially inaugurated the upgraded floodlighting system at the North Athletic Quad. All remaining evening fixtures will be held under full broadcast illuminance, enhancing safety and spectator experience.',
    category: 'Facility',
    cover_image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80',
    featured: false,
    author_name: 'Campus Infrastructure',
    created_at: '2026-09-27T09:30:00Z'
  }
];

export const mockGallery: GalleryItem[] = [
  {
    id: 'gal_01',
    tournament_id: 'tourn_football_2026',
    sport_name: 'Football',
    title: 'Strikers Celebrating QF Goal',
    caption: 'Alex Vance mobbed by teammates after scoring the match-winner against Mechanical.',
    media_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    media_type: 'photo',
    aspect_ratio: '16:9',
    featured: true
  },
  {
    id: 'gal_02',
    sport_name: 'Basketball',
    title: 'Fastbreak Slam at Indoor Arena',
    caption: 'High-flying fast break dunk during the Varsity intra-squad scrimmage.',
    media_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80',
    media_type: 'photo',
    aspect_ratio: '4:3',
    featured: true
  },
  {
    id: 'gal_03',
    sport_name: 'Track & Field',
    title: '100m Sprint Heat Finals',
    caption: 'Blistering acceleration off the blocks at the 400m synthetic oval.',
    media_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80',
    media_type: 'photo',
    aspect_ratio: '16:9',
    featured: false
  },
  {
    id: 'gal_04',
    sport_name: 'Badminton',
    title: 'Mid-Air Smash Championship Point',
    caption: 'Full extension airborne smash down the sideline at Badminton Arena.',
    media_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1000&auto=format&fit=crop&q=80',
    media_type: 'photo',
    aspect_ratio: '4:3',
    featured: true
  },
  {
    id: 'gal_05',
    sport_name: 'Cricket',
    title: 'Clean Bowled Under Sunset Lights',
    caption: 'Off-stump sent cartwheeling in the 19th over at the Cricket Oval.',
    media_url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1000&auto=format&fit=crop&q=80',
    media_type: 'photo',
    aspect_ratio: '16:9',
    featured: false
  },
  {
    id: 'gal_06',
    sport_name: 'Volleyball',
    title: 'Triple Block at the Net',
    caption: 'Defensive wall blocking a thunderous spike in the 3rd set.',
    media_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1000&auto=format&fit=crop&q=80',
    media_type: 'photo',
    aspect_ratio: '1:1',
    featured: false
  }
];

export const mockRegistrations: Registration[] = [
  {
    id: 'reg_01',
    tournament_id: 'tourn_football_2026',
    tournament_title: 'Inter-Department Football Championship 2026',
    sport_name: 'Football',
    profile_id: 'usr_athlete_01',
    profile_name: 'Alex Vance',
    team_id: 'team_cs',
    team_name: 'CS Strikers',
    registration_type: 'team',
    status: 'checked_in',
    qr_code_token: 'SVEC-QR-FB26-CS-001',
    checked_in_at: '2026-10-02T14:15:00Z',
    created_at: '2026-09-20T11:00:00Z'
  },
  {
    id: 'reg_02',
    tournament_id: 'tourn_basketball_2026',
    tournament_title: 'Campus Basketball Super League',
    sport_name: 'Basketball',
    profile_id: 'usr_athlete_01',
    profile_name: 'Alex Vance',
    registration_type: 'individual',
    status: 'approved',
    qr_code_token: 'SVEC-QR-BB26-IND-042',
    created_at: '2026-09-25T16:20:00Z'
  }
];
