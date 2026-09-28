import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const PORT = 3000;
const DB_FILE = path.resolve(process.cwd(), 'data', 'database.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

interface UserRecord {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  student_id: string;
  password_hash: string;
  role: 'STUDENT' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

interface CategoryRecord {
  id: number;
  name: string;
  icon: string;
  description: string;
}

interface LocationRecord {
  id: number;
  name: string;
  campus_zone: string;
  description: string;
}

interface ItemRecord {
  id: number;
  user_id: number;
  title: string;
  type: 'LOST' | 'FOUND';
  category_id: number;
  category_name: string;
  location_id: number;
  location_name: string;
  description: string;
  date_reported: string;
  status: 'ACTIVE' | 'CLAIMED' | 'RETURNED' | 'RESOLVED';
  image_url: string;
  contact_info: string;
  reporter_name?: string;
  reporter_email?: string;
  created_at: string;
  updated_at: string;
}

interface ClaimRecord {
  id: number;
  item_id: number;
  user_id: number;
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string;
  proof_details: string;
  explanation: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

interface PossibleMatchRecord {
  id: number;
  lost_item_id: number;
  found_item_id: number;
  match_score: number;
  match_reasons: string;
  status: 'POTENTIAL' | 'CONFIRMED' | 'DISMISSED';
  created_at: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  categories: CategoryRecord[];
  locations: LocationRecord[];
  items: ItemRecord[];
  claims: ClaimRecord[];
  possible_matches: PossibleMatchRecord[];
  sessions: { [token: string]: number };
}

function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@123', salt);

  return {
    users: [
      {
        id: 1,
        full_name: 'Campus Admin Office',
        email: 'admin@campus.edu',
        phone: '9876543210',
        student_id: 'ADM-2024-001',
        password_hash: adminHash,
        role: 'ADMIN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    categories: [
      { id: 1, name: 'Electronics', icon: 'laptop', description: 'Laptops, mobile phones, chargers, smartwatches, calculators' },
      { id: 2, name: 'Books & Study Material', icon: 'book-open', description: 'Textbooks, notebooks, practical records, novel books' },
      { id: 3, name: 'Accessories', icon: 'watch', description: 'Wristwatches, jewelry, keychains, sunglasses, rings' },
      { id: 4, name: 'ID Cards & Documents', icon: 'credit-card', description: 'Student IDs, driver licenses, ATM cards, exam admit cards' },
      { id: 5, name: 'Bags & Backpacks', icon: 'briefcase', description: 'College bags, laptop sleeves, pouches, gym bags' },
      { id: 6, name: 'Stationery', icon: 'pen-tool', description: 'Geometry boxes, drafters, pen sets, scientific calculators' },
      { id: 7, name: 'Clothing & Wearables', icon: 'shirt', description: 'Jackets, hoodies, caps, umbrellas, lab aprons' },
      { id: 8, name: 'Other Items', icon: 'help-circle', description: 'Keys, water bottles, sports equipment, miscellaneous' },
    ],
    locations: [
      { id: 1, name: 'Central Library', campus_zone: 'Academic Block A', description: 'Ground and 1st floor reading halls, reference section' },
      { id: 2, name: 'Computer Lab 3', campus_zone: 'IT Block', description: '2nd Floor, Department of Computer Science' },
      { id: 3, name: 'Main Campus Canteen', campus_zone: 'Student Center', description: 'Ground floor food court and seating area' },
      { id: 4, name: 'Lecture Hall 102', campus_zone: 'Academic Block B', description: '1st Floor lecture theater' },
      { id: 5, name: 'College Auditorium', campus_zone: 'Auditorium Complex', description: 'Main event hall, stage and backstage' },
      { id: 6, name: 'Sports Ground & Pavilion', campus_zone: 'Sports Complex', description: 'Cricket ground, basketball court and gymnasium' },
      { id: 7, name: 'Administration Block', campus_zone: 'Admin Building', description: 'Accounts office, Dean office, registrar hall' },
      { id: 8, name: 'Science & Physics Lab', campus_zone: 'Science Wing', description: 'Ground floor laboratory complex' },
    ],
    items: [],
    claims: [],
    possible_matches: [],
    sessions: {},
  };
}

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const init = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    const init = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
}

function writeDb(db: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Rule-based matching algorithm
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'between', 'into',
  'through', 'during', 'before', 'after', 'to', 'from', 'up', 'down', 'and', 'or', 'but',
  'while', 'of', 'it', 'its', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'this', 'that', 'these', 'those', 'my', 'your',
  'found', 'lost', 'item', 'near',
]);

function extractKeywords(text: string): Set<string> {
  const words = new Set<string>();
  const tokens = (text || '')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/);
  for (const token of tokens) {
    const clean = token.trim();
    if (clean.length >= 3 && !STOP_WORDS.has(clean)) {
      words.add(clean);
    }
  }
  return words;
}

function calculatePossibleMatches(newItem: ItemRecord, db: DatabaseSchema) {
  const oppositeType = newItem.type === 'LOST' ? 'FOUND' : 'LOST';
  const candidates = db.items.filter((i) => i.type === oppositeType && i.status === 'ACTIVE');

  for (const candidate of candidates) {
    const lostItem = newItem.type === 'LOST' ? newItem : candidate;
    const foundItem = newItem.type === 'FOUND' ? newItem : candidate;

    let score = 0;
    const reasons: string[] = [];

    // Category match
    if (lostItem.category_id === foundItem.category_id) {
      score += 35;
      reasons.push(`Matching Category: ${lostItem.category_name}`);
    }

    // Location match
    if (lostItem.location_id === foundItem.location_id) {
      score += 30;
      reasons.push(`Identical Campus Location: ${lostItem.location_name}`);
    }

    // Date proximity
    if (lostItem.date_reported && foundItem.date_reported) {
      const d1 = new Date(lostItem.date_reported).getTime();
      const d2 = new Date(foundItem.date_reported).getTime();
      const diffDays = Math.abs(Math.round((d1 - d2) / (1000 * 3600 * 24)));
      if (diffDays === 0) {
        score += 20;
        reasons.push(`Reported on exact same date (${lostItem.date_reported})`);
      } else if (diffDays <= 3) {
        score += 15;
        reasons.push(`Reported within ${diffDays} days`);
      } else if (diffDays <= 7) {
        score += 10;
        reasons.push('Reported within one week');
      }
    }

    // Keyword overlap
    const lostWords = extractKeywords(`${lostItem.title} ${lostItem.description}`);
    const foundWords = extractKeywords(`${foundItem.title} ${foundItem.description}`);
    const common: string[] = [];
    lostWords.forEach((w) => {
      if (foundWords.has(w)) common.push(w);
    });

    if (common.length > 0) {
      const keywordBonus = Math.min(25, common.length * 8);
      score += keywordBonus;
      reasons.push(`Shared descriptive keywords: [${common.join(', ')}]`);
    }

    if (score >= 45) {
      const finalScore = Math.min(100, score);
      const reasonText = reasons.join(' • ');
      const existingIdx = db.possible_matches.findIndex(
        (m) => m.lost_item_id === lostItem.id && m.found_item_id === foundItem.id
      );
      if (existingIdx >= 0) {
        db.possible_matches[existingIdx].match_score = finalScore;
        db.possible_matches[existingIdx].match_reasons = reasonText;
      } else {
        const nextId = db.possible_matches.length > 0 ? Math.max(...db.possible_matches.map((m) => m.id)) + 1 : 1;
        db.possible_matches.push({
          id: nextId,
          lost_item_id: lostItem.id,
          found_item_id: foundItem.id,
          match_score: finalScore,
          match_reasons: reasonText,
          status: 'POTENTIAL',
          created_at: new Date().toISOString(),
        });
      }
    }
  }
}

// Authentication Middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication token required' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const db = readDb();
  const userId = db.sessions[token];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session token' });
  }
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as UserRecord;
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden', message: 'Administrator privileges required' });
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // REST API: AUTHENTICATION
  // -------------------------------------------------------------
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { fullName, email, phone, studentId, password, confirmPassword } = req.body;
    if (!fullName || !email || !phone || !studentId || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Bad Request', message: 'All registration fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Bad Request', message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Bad Request', message: 'Password must be at least 6 characters' });
    }

    const db = readDb();
    const cleanEmail = email.toLowerCase().trim();
    const cleanStudentId = studentId.toUpperCase().trim();

    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ error: 'Conflict', message: 'An account with this email address already exists' });
    }
    if (db.users.some((u) => u.student_id.toUpperCase() === cleanStudentId)) {
      return res.status(409).json({ error: 'Conflict', message: 'An account with this Student ID already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const newId = Math.max(...db.users.map((u) => u.id)) + 1;
    const now = new Date().toISOString();

    const newUser: UserRecord = {
      id: newId,
      full_name: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      student_id: cleanStudentId,
      password_hash,
      role: 'STUDENT',
      created_at: now,
      updated_at: now,
    };

    db.users.push(newUser);
    const token = 'TOKEN-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.sessions[token] = newId;
    writeDb(db);

    return res.status(201).json({
      token,
      id: newUser.id,
      fullName: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      studentId: newUser.student_id,
      role: newUser.role,
      message: 'Registration successful',
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Bad Request', message: 'Email and password are required' });
    }

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    const token = 'TOKEN-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.sessions[token] = user.id;
    writeDb(db);

    return res.status(200).json({
      token,
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      studentId: user.student_id,
      role: user.role,
      message: 'Login successful',
    });
  });

  app.post('/api/auth/logout', authenticateUser, (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const db = readDb();
    delete db.sessions[token];
    writeDb(db);
    return res.status(200).json({ message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    return res.status(200).json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      studentId: user.student_id,
      role: user.role,
      createdAt: user.created_at,
    });
  });

  app.put('/api/auth/profile', authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { fullName, phone } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Bad Request', message: 'Full name and phone are required' });
    }

    const db = readDb();
    const targetUser = db.users.find((u) => u.id === user.id);
    if (targetUser) {
      targetUser.full_name = fullName.trim();
      targetUser.phone = phone.trim();
      targetUser.updated_at = new Date().toISOString();
      writeDb(db);
    }

    return res.status(200).json({ message: 'Profile updated successfully' });
  });

  // -------------------------------------------------------------
  // REST API: METADATA (CATEGORIES & LOCATIONS)
  // -------------------------------------------------------------
  app.get('/api/meta/categories', (req: Request, res: Response) => {
    const db = readDb();
    return res.status(200).json(db.categories);
  });

  app.get('/api/meta/locations', (req: Request, res: Response) => {
    const db = readDb();
    return res.status(200).json(db.locations);
  });

  // -------------------------------------------------------------
  // REST API: ITEMS (LOST & FOUND DIRECTORY)
  // -------------------------------------------------------------
  function filterItems(query: any) {
    const db = readDb();
    const { type, search, categoryId, locationId, status, sort } = query;

    let results = db.items.map((item) => {
      const reporter = db.users.find((u) => u.id === item.user_id);
      return {
        ...item,
        reporterName: reporter ? reporter.full_name : 'Campus Member',
        reporterEmail: reporter ? reporter.email : '',
      };
    });

    if (type) {
      results = results.filter((i) => i.type.toUpperCase() === String(type).toUpperCase());
    }

    if (status) {
      results = results.filter((i) => i.status.toUpperCase() === String(status).toUpperCase());
    }

    if (categoryId) {
      results = results.filter((i) => i.category_id === Number(categoryId));
    }

    if (locationId) {
      results = results.filter((i) => i.location_id === Number(locationId));
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location_name.toLowerCase().includes(q) ||
          i.category_name.toLowerCase().includes(q)
      );
    }

    if (sort === 'oldest') {
      results.sort((a, b) => new Date(a.date_reported).getTime() - new Date(b.date_reported).getTime());
    } else {
      results.sort((a, b) => new Date(b.date_reported).getTime() - new Date(a.date_reported).getTime());
    }

    return results;
  }

  app.get('/api/items', (req: Request, res: Response) => {
    return res.status(200).json(filterItems(req.query));
  });

  app.get('/api/items/lost', (req: Request, res: Response) => {
    return res.status(200).json(filterItems({ ...req.query, type: 'LOST' }));
  });

  app.get('/api/items/found', (req: Request, res: Response) => {
    return res.status(200).json(filterItems({ ...req.query, type: 'FOUND' }));
  });

  app.get('/api/items/:id', (req: Request, res: Response) => {
    const db = readDb();
    const id = Number(req.params.id);
    const item = db.items.find((i) => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: 'Item not found with ID: ' + id });
    }

    const reporter = db.users.find((u) => u.id === item.user_id);
    return res.status(200).json({
      ...item,
      reporterName: reporter ? reporter.full_name : 'Campus Member',
      reporterEmail: reporter ? reporter.email : '',
    });
  });

  app.post('/api/items', authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { title, type, categoryId, locationId, description, dateReported, imageUrl, contactInfo } = req.body;

    if (!title || !type || !categoryId || !locationId || !description || !dateReported) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required item reporting fields' });
    }

    const upperType = String(type).toUpperCase();
    if (upperType !== 'LOST' && upperType !== 'FOUND') {
      return res.status(400).json({ error: 'Bad Request', message: 'Item type must be LOST or FOUND' });
    }

    const db = readDb();
    const category = db.categories.find((c) => c.id === Number(categoryId));
    const location = db.locations.find((l) => l.id === Number(locationId));

    if (!category) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid category ID' });
    }
    if (!location) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid campus location ID' });
    }

    const newId = db.items.length > 0 ? Math.max(...db.items.map((i) => i.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newItem: ItemRecord = {
      id: newId,
      user_id: user.id,
      title: title.trim(),
      type: upperType as 'LOST' | 'FOUND',
      category_id: category.id,
      category_name: category.name,
      location_id: location.id,
      location_name: location.name,
      description: description.trim(),
      date_reported: dateReported,
      status: 'ACTIVE',
      image_url: imageUrl || '',
      contact_info: contactInfo || `${user.email} | ${user.phone}`,
      created_at: now,
      updated_at: now,
    };

    db.items.unshift(newItem);

    // Compute algorithmic matches
    calculatePossibleMatches(newItem, db);
    writeDb(db);

    return res.status(201).json({
      ...newItem,
      reporterName: user.full_name,
      reporterEmail: user.email,
    });
  });

  app.patch('/api/items/:id/status', authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const id = Number(req.params.id);
    const { status } = req.body;

    const allowed = ['ACTIVE', 'CLAIMED', 'RETURNED', 'RESOLVED'];
    if (!status || !allowed.includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid status transition' });
    }

    const db = readDb();
    const item = db.items.find((i) => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: 'Item not found' });
    }

    // Role check
    if (user.role !== 'ADMIN' && item.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Not authorized to change this item status' });
    }

    item.status = status.toUpperCase() as any;
    item.updated_at = new Date().toISOString();
    writeDb(db);

    return res.status(200).json({ message: `Item status updated to ${status.toUpperCase()}`, item });
  });

  app.delete('/api/items/:id', authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const id = Number(req.params.id);

    const db = readDb();
    const itemIndex = db.items.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Not Found', message: 'Item not found' });
    }

    const item = db.items[itemIndex];
    if (user.role !== 'ADMIN' && item.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Not authorized to delete this item' });
    }

    db.items.splice(itemIndex, 1);
    // Remove associated matches
    db.possible_matches = db.possible_matches.filter((m) => m.lost_item_id !== id && m.found_item_id !== id);
    writeDb(db);

    return res.status(200).json({ message: 'Item deleted successfully' });
  });

  // -------------------------------------------------------------
  // REST API: MY REPORTS & MY CLAIMS
  // -------------------------------------------------------------
  app.get('/api/my/reports', authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const db = readDb();
    const userItems = db.items.filter((i) => i.user_id === user.id);
    return res.status(200).json(userItems);
  });

  app.get('/api/my/claims', authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const db = readDb();
    const userClaims = db.claims
      .filter((c) => c.user_id === user.id)
      .map((c) => {
        const item = db.items.find((i) => i.id === c.item_id);
        return {
          ...c,
          itemTitle: item ? item.title : 'Unknown Item',
          itemCategory: item ? item.category_name : '',
          itemLocation: item ? item.location_name : '',
          itemStatus: item ? item.status : '',
          itemImageUrl: item ? item.image_url : '',
        };
      });
    return res.status(200).json(userClaims);
  });

  // -------------------------------------------------------------
  // REST API: CLAIMS WORKFLOW
  // -------------------------------------------------------------
  app.post('/api/claims', authenticateUser, (req: Request, res: Response) => {
    const user = (req as any).user as UserRecord;
    const { itemId, claimantName, claimantEmail, claimantPhone, proofDetails, explanation } = req.body;

    if (!itemId || !claimantName || !claimantEmail || !claimantPhone || !proofDetails) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing required claim submission fields' });
    }

    const db = readDb();
    const item = db.items.find((i) => i.id === Number(itemId));
    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: 'Target item not found' });
    }

    if (item.type !== 'FOUND') {
      return res.status(400).json({ error: 'Bad Request', message: 'Claims can only be submitted for FOUND items' });
    }

    if (item.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Bad Request', message: `Cannot claim an item with status: ${item.status}` });
    }

    if (item.user_id === user.id) {
      return res.status(400).json({ error: 'Bad Request', message: 'You reported finding this item; you cannot claim it yourself' });
    }

    const existingClaim = db.claims.find(
      (c) => c.item_id === item.id && c.user_id === user.id && c.status !== 'REJECTED'
    );
    if (existingClaim) {
      return res.status(400).json({ error: 'Bad Request', message: 'You have already submitted an active claim for this item' });
    }

    const newId = db.claims.length > 0 ? Math.max(...db.claims.map((c) => c.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newClaim: ClaimRecord = {
      id: newId,
      item_id: item.id,
      user_id: user.id,
      claimant_name: claimantName.trim(),
      claimant_email: claimantEmail.trim(),
      claimant_phone: claimantPhone.trim(),
      proof_details: proofDetails.trim(),
      explanation: explanation ? explanation.trim() : '',
      status: 'PENDING',
      admin_notes: '',
      created_at: now,
      updated_at: now,
    };

    db.claims.unshift(newClaim);
    writeDb(db);

    return res.status(201).json({
      ...newClaim,
      itemTitle: item.title,
      itemCategory: item.category_name,
      itemLocation: item.location_name,
      itemStatus: item.status,
      itemImageUrl: item.image_url,
    });
  });

  app.get('/api/claims', authenticateUser, requireAdmin, (req: Request, res: Response) => {
    const { status } = req.query;
    const db = readDb();
    let list = db.claims.map((c) => {
      const item = db.items.find((i) => i.id === c.item_id);
      return {
        ...c,
        itemTitle: item ? item.title : 'Item Removed',
        itemCategory: item ? item.category_name : '',
        itemLocation: item ? item.location_name : '',
        itemStatus: item ? item.status : '',
        itemImageUrl: item ? item.image_url : '',
      };
    });

    if (status) {
      list = list.filter((c) => c.status === String(status).toUpperCase());
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return res.status(200).json(list);
  });

  app.patch('/api/claims/:id/status', authenticateUser, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status, adminNotes } = req.body;

    const upperStatus = String(status).toUpperCase();
    if (upperStatus !== 'ACCEPTED' && upperStatus !== 'REJECTED') {
      return res.status(400).json({ error: 'Bad Request', message: 'Status must be ACCEPTED or REJECTED' });
    }

    const db = readDb();
    const claim = db.claims.find((c) => c.id === id);
    if (!claim) {
      return res.status(404).json({ error: 'Not Found', message: 'Claim not found' });
    }

    claim.status = upperStatus as any;
    claim.admin_notes = adminNotes || '';
    claim.updated_at = new Date().toISOString();

    // Workflow rule: if accepted, update item status to CLAIMED
    if (upperStatus === 'ACCEPTED') {
      const item = db.items.find((i) => i.id === claim.item_id);
      if (item) {
        item.status = 'CLAIMED';
        item.updated_at = new Date().toISOString();
      }
    }

    writeDb(db);
    return res.status(200).json({ message: `Claim marked as ${upperStatus}`, claim });
  });

  // -------------------------------------------------------------
  // REST API: RULE-BASED MATCHES
  // -------------------------------------------------------------
  app.get('/api/matches', (req: Request, res: Response) => {
    const db = readDb();
    const matches = db.possible_matches
      .filter((m) => m.status === 'POTENTIAL')
      .map((m) => {
        const lost = db.items.find((i) => i.id === m.lost_item_id);
        const found = db.items.find((i) => i.id === m.found_item_id);
        return {
          ...m,
          lostItem: lost || null,
          foundItem: found || null,
        };
      })
      .filter((m) => m.lostItem && m.foundItem)
      .sort((a, b) => b.match_score - a.match_score);

    return res.status(200).json(matches);
  });

  app.get('/api/matches/item/:itemId', (req: Request, res: Response) => {
    const itemId = Number(req.params.itemId);
    const db = readDb();
    const matches = db.possible_matches
      .filter((m) => m.lost_item_id === itemId || m.found_item_id === itemId)
      .map((m) => {
        const lost = db.items.find((i) => i.id === m.lost_item_id);
        const found = db.items.find((i) => i.id === m.found_item_id);
        return {
          ...m,
          lostItem: lost || null,
          foundItem: found || null,
        };
      });

    return res.status(200).json(matches);
  });

  app.patch('/api/matches/:id/status', authenticateUser, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const db = readDb();
    const match = db.possible_matches.find((m) => m.id === id);
    if (!match) {
      return res.status(404).json({ error: 'Not Found', message: 'Match not found' });
    }
    match.status = status || 'DISMISSED';
    writeDb(db);
    return res.status(200).json({ message: 'Match status updated', match });
  });

  // -------------------------------------------------------------
  // REST API: ADMIN DASHBOARD & USERS
  // -------------------------------------------------------------
  app.get('/api/admin/stats', authenticateUser, requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const stats = {
      totalUsers: db.users.length,
      totalLostItems: db.items.filter((i) => i.type === 'LOST').length,
      totalFoundItems: db.items.filter((i) => i.type === 'FOUND').length,
      activeItems: db.items.filter((i) => i.status === 'ACTIVE').length,
      pendingClaims: db.claims.filter((c) => c.status === 'PENDING').length,
      claimedItems: db.items.filter((i) => i.status === 'CLAIMED').length,
      returnedItems: db.items.filter((i) => i.status === 'RETURNED').length,
      resolvedItems: db.items.filter((i) => i.status === 'RESOLVED').length,
    };
    return res.status(200).json(stats);
  });

  app.get('/api/admin/users', authenticateUser, requireAdmin, (req: Request, res: Response) => {
    const db = readDb();
    const safeUsers = db.users.map((u) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      studentId: u.student_id,
      role: u.role,
      createdAt: u.created_at,
    }));
    return res.status(200).json(safeUsers);
  });

  // Reset to initial clean state (helpful for testing and demonstrations)
  app.post('/api/admin/reset-demo', authenticateUser, requireAdmin, (req: Request, res: Response) => {
    const init = getInitialDatabase();
    writeDb(init);
    return res.status(200).json({ message: 'Database reset to standard seed records' });
  });

  // Architecture inspector endpoint for College Viva
  app.get('/api/architecture/info', (req: Request, res: Response) => {
    return res.status(200).json({
      stack: {
        frontend: 'React (JavaScript, JSX, Tailwind CSS)',
        backend: 'Java 17, Spring Boot 3.x, REST API, HikariCP',
        dataAccess: 'Direct JDBC via JdbcTemplate & PreparedStatement (Strictly No Hibernate / No JPA / No ORM)',
        database: 'MySQL 8.0 (InnoDB, UTF-8)',
      },
      endpoints: [
        { method: 'POST', path: '/api/auth/register', description: 'Student self-registration with duplicate validation & BCrypt hashing' },
        { method: 'POST', path: '/api/auth/login', description: 'Credential authentication against database users table' },
        { method: 'GET', path: '/api/items/lost', description: 'Query active lost item reports with multi-criteria SQL filters' },
        { method: 'GET', path: '/api/items/found', description: 'Query found item reports with location and category filters' },
        { method: 'POST', path: '/api/items', description: 'Report lost or found item & trigger rule-based match calculation' },
        { method: 'POST', path: '/api/claims', description: 'Submit proof claim against active found item' },
        { method: 'PATCH', path: '/api/claims/:id/status', description: 'Admin claim review (Accept -> transitions item to CLAIMED)' },
        { method: 'GET', path: '/api/matches', description: 'Algorithmic matching scores based on category, location, date, and keywords' },
        { method: 'GET', path: '/api/admin/stats', description: 'Real aggregated database metrics for the administration dashboard' },
      ],
      tables: ['users', 'categories', 'locations', 'items', 'claims', 'possible_matches'],
    });
  });

  // -------------------------------------------------------------
  // VITE DEV SERVER INTEGRATION
  // -------------------------------------------------------------
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Lost & Found full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
