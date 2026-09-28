package com.campus.lostfound.repository;

import com.campus.lostfound.model.PossibleMatch;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class MatchRepository {

    private final JdbcTemplate jdbcTemplate;

    public MatchRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<PossibleMatch> matchRowMapper = (rs, rowNum) -> {
        PossibleMatch match = new PossibleMatch();
        match.setId(rs.getLong("id"));
        match.setLostItemId(rs.getLong("lost_item_id"));
        match.setFoundItemId(rs.getLong("found_item_id"));
        match.setMatchScore(rs.getInt("match_score"));
        match.setMatchReasons(rs.getString("match_reasons"));
        match.setStatus(rs.getString("status"));
        match.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return match;
    };

    public void upsertMatch(Long lostItemId, Long foundItemId, int score, String reasons) {
        String sql = "INSERT INTO possible_matches (lost_item_id, found_item_id, match_score, match_reasons, status) " +
                     "VALUES (?, ?, ?, ?, 'POTENTIAL') " +
                     "ON DUPLICATE KEY UPDATE match_score = VALUES(match_score), match_reasons = VALUES(match_reasons)";
        jdbcTemplate.update(sql, lostItemId, foundItemId, score, reasons);
    }

    public List<PossibleMatch> findAllPotential() {
        String sql = "SELECT * FROM possible_matches WHERE status = 'POTENTIAL' ORDER BY match_score DESC";
        return jdbcTemplate.query(sql, matchRowMapper);
    }

    public List<PossibleMatch> findByLostItemId(Long lostItemId) {
        String sql = "SELECT * FROM possible_matches WHERE lost_item_id = ? ORDER BY match_score DESC";
        return jdbcTemplate.query(sql, matchRowMapper, lostItemId);
    }

    public List<PossibleMatch> findByFoundItemId(Long foundItemId) {
        String sql = "SELECT * FROM possible_matches WHERE found_item_id = ? ORDER BY match_score DESC";
        return jdbcTemplate.query(sql, matchRowMapper, foundItemId);
    }

    public int updateStatus(Long matchId, String status) {
        String sql = "UPDATE possible_matches SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status, matchId);
    }

    public Optional<PossibleMatch> findById(Long id) {
        String sql = "SELECT * FROM possible_matches WHERE id = ?";
        try {
            PossibleMatch match = jdbcTemplate.queryForObject(sql, matchRowMapper, id);
            return Optional.ofNullable(match);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
