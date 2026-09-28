import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Database, Server, Code, CheckCircle2, RefreshCw, X, Shield, BookOpen, Layers } from 'lucide-react';

export function ArchitectureModal({ isOpen, onClose, onQuickLogin }) {
  const [activeTab, setActiveTab] = useState('diagram');
  const [archInfo, setArchInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getArchitectureInfo()
        .then(setArchInfo)
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = async () => {
    try {
      setLoading(true);
      await api.resetDemoDatabase();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      alert('Error resetting demo database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">College Project Viva & Architecture Inspector</h2>
              <p className="text-xs text-slate-400">Spring Boot 3.x • Direct JDBC • MySQL Relational Database • React Frontend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'diagram'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> System Flow & Viva Overview
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" /> MySQL ER Tables & Schema
          </button>
          <button
            onClick={() => setActiveTab('jdbc')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'jdbc'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" /> Spring Boot JDBC Layer
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'testing'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" /> Quick Test Accounts
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700 text-sm">
          {activeTab === 'diagram' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-1">Architecture Summary (Strictly No ORM / No Hibernate)</h4>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Per the college project specification, this application uses <strong>Direct JDBC</strong> with <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">JdbcTemplate</code> and parameterized <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">PreparedStatement</code>. All queries, transactions, and row mappings are written explicitly in SQL without Hibernate, JPA, or Prisma.
                </p>
              </div>

              {/* Visual Architecture Diagram */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-xs overflow-x-auto shadow-inner">
                <pre className="leading-relaxed">
{`   [ CLIENT BROWSER: REACT JSX ]
          │
          │  REST API JSON Requests (HTTP GET, POST, PATCH, DELETE)
          ▼
   [ SPRING BOOT REST CONTROLLER ]
      - AuthController (/api/auth)
      - ItemController (/api/items)
      - ClaimController (/api/claims)
      - MatchController (/api/matches)
      - AdminController (/api/admin)
          │
          ▼
   [ JAVA SERVICE LAYER ]
      - AuthService (BCrypt Hashing, Token Verification)
      - ItemService (Input Validation, Workflow Logic)
      - ClaimService (Claim Evaluation, Item State Transitions)
      - MatchService (Rule-Based Keyword, Location & Proximity Scoring)
          │
          ▼
   [ JDBC DATA ACCESS LAYER (JdbcTemplate) ]
      - UserRepository (Parameterized PreparedStatement)
      - ItemRepository (Multi-condition Dynamic SQL Filtering)
      - ClaimRepository (JOIN queries across users & items)
      - MatchRepository (Rule evaluation persistence)
          │
          ▼
   [ MYSQL DATABASE ENGINE (InnoDB) ]
      - users, categories, locations, items, claims, possible_matches`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Key Viva Concepts
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li>• <strong>Why JDBC over Hibernate?</strong> Direct control over SQL execution plans, zero ORM overhead, and complete transparency of database operations.</li>
                    <li>• <strong>Security:</strong> Passwords hashed with BCrypt. Parameterized queries prevent SQL injection attacks.</li>
                    <li>• <strong>Rule-based Matching:</strong> Algorithmic keyword extraction, category comparison, and date proximity calculation.</li>
                  </ul>
                </div>
                <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" /> Role-Based Access Control
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li>• <strong>STUDENT:</strong> Report lost/found, search directories, submit claims on found items, view own reports.</li>
                    <li>• <strong>ADMIN:</strong> Review pending claims, approve/reject with notes, update item status to CLAIMED/RESOLVED/RETURNED, view statistics.</li>
                    <li>• Backend verifies token & role server-side on every protected endpoint.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Relational tables defined in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">backend-spring-boot/src/main/resources/schema.sql</code></p>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  6 Tables Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="font-semibold text-slate-900 text-xs flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                    <span>1. users</span>
                    <span className="text-[10px] text-slate-400 font-mono">InnoDB</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 space-y-1">
                    <div><span className="text-indigo-600">id</span> BIGINT AUTO_INCREMENT (PK)</div>
                    <div>full_name VARCHAR(100) NOT NULL</div>
                    <div>email VARCHAR(150) NOT NULL UNIQUE</div>
                    <div>phone VARCHAR(20) NOT NULL</div>
                    <div>student_id VARCHAR(50) NOT NULL UNIQUE</div>
                    <div>password_hash VARCHAR(255) NOT NULL</div>
                    <div>role ENUM('STUDENT', 'ADMIN')</div>
                    <div>created_at / updated_at TIMESTAMP</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="font-semibold text-slate-900 text-xs flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                    <span>2. items</span>
                    <span className="text-[10px] text-slate-400 font-mono">InnoDB</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 space-y-1">
                    <div><span className="text-indigo-600">id</span> BIGINT AUTO_INCREMENT (PK)</div>
                    <div><span className="text-amber-600">user_id</span> BIGINT (FK users.id)</div>
                    <div>title VARCHAR(150) NOT NULL</div>
                    <div>type ENUM('LOST', 'FOUND') NOT NULL</div>
                    <div><span className="text-amber-600">category_id</span> (FK categories.id)</div>
                    <div><span className="text-amber-600">location_id</span> (FK locations.id)</div>
                    <div>description TEXT NOT NULL</div>
                    <div>status ENUM('ACTIVE', 'CLAIMED', 'RETURNED', 'RESOLVED')</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="font-semibold text-slate-900 text-xs flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                    <span>3. claims</span>
                    <span className="text-[10px] text-slate-400 font-mono">InnoDB</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 space-y-1">
                    <div><span className="text-indigo-600">id</span> BIGINT AUTO_INCREMENT (PK)</div>
                    <div><span className="text-amber-600">item_id</span> BIGINT (FK items.id)</div>
                    <div><span className="text-amber-600">user_id</span> BIGINT (FK users.id)</div>
                    <div>claimant_name, email, phone</div>
                    <div>proof_details TEXT NOT NULL</div>
                    <div>status ENUM('PENDING', 'ACCEPTED', 'REJECTED')</div>
                    <div>admin_notes TEXT</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="font-semibold text-slate-900 text-xs flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                    <span>4. possible_matches</span>
                    <span className="text-[10px] text-slate-400 font-mono">InnoDB</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 space-y-1">
                    <div><span className="text-indigo-600">id</span> BIGINT AUTO_INCREMENT (PK)</div>
                    <div><span className="text-amber-600">lost_item_id</span> (FK items.id)</div>
                    <div><span className="text-amber-600">found_item_id</span> (FK items.id)</div>
                    <div>match_score INT (0-100)</div>
                    <div>match_reasons TEXT</div>
                    <div>status ENUM('POTENTIAL', 'CONFIRMED', 'DISMISSED')</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jdbc' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Example parameterized JDBC implementation in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ItemRepository.java</code>:
              </p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto shadow-inner">
                <pre>{`// Direct JDBC with KeyHolder & Parameterized PreparedStatement (No ORM)
public Item save(Item item) {
    String sql = "INSERT INTO items (user_id, title, type, category_id, category_name, " +
                 "location_id, location_name, description, date_reported, status, image_url, contact_info) " +
                 "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    KeyHolder keyHolder = new GeneratedKeyHolder();

    jdbcTemplate.update(connection -> {
        PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        ps.setLong(1, item.getUserId());
        ps.setString(2, item.getTitle());
        ps.setString(3, item.getType());
        ps.setLong(4, item.getCategoryId());
        ps.setString(5, item.getCategoryName());
        ps.setLong(6, item.getLocationId());
        ps.setString(7, item.getLocationName());
        ps.setString(8, item.getDescription());
        ps.setDate(9, Date.valueOf(item.getDateReported()));
        ps.setString(10, item.getStatus());
        ps.setString(11, item.getImageUrl());
        ps.setString(12, item.getContactInfo());
        return ps;
    }, keyHolder);

    item.setId(keyHolder.getKey().longValue());
    return item;
}`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-900 leading-relaxed">
                <strong>No Fake Student Data Policy:</strong> Per project specification, the database contains zero pre-seeded student accounts, items, or claims. You can register your real student account using the <strong>Register Account</strong> page, or use the pre-configured System Administrator account below.
              </div>

              <div className="border border-indigo-200 rounded-lg p-5 bg-indigo-50/40">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">System Administrator Account</h4>
                    <p className="text-xs text-slate-500">Official Campus Administration • ID: ADM-2024-001</p>
                  </div>
                  <span className="bg-indigo-900 text-white text-xs px-2.5 py-0.5 rounded font-medium">ADMIN</span>
                </div>
                <div className="text-xs text-slate-600 mb-4 space-y-1">
                  <div>Email: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">admin@campus.edu</code></div>
                  <div>Password: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">Admin@123</code></div>
                  <p className="text-[11px] text-slate-500 pt-1">Allows inspecting the claims review desk, system inventory, and aggregated database metrics.</p>
                </div>
                <button
                  onClick={() => {
                    onQuickLogin('admin@campus.edu', 'Admin@123');
                    onClose();
                  }}
                  className="w-full text-xs font-semibold py-2 px-3 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sign In as System Administrator
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900 text-xs">Reset to Clean Database</h5>
                  <p className="text-[11px] text-slate-500">Resets to zero student records, zero items, and zero claims.</p>
                </div>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {resetSuccess ? 'Reset Complete!' : 'Clear All Activity'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>Campus Lost & Found • University CS Project</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
