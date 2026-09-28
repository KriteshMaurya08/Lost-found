package com.campus.lostfound.repository;

import com.campus.lostfound.model.Claim;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class ClaimRepository {

    private final JdbcTemplate jdbcTemplate;

    public ClaimRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Claim> claimRowMapper = (rs, rowNum) -> {
        Claim claim = new Claim();
        claim.setId(rs.getLong("id"));
        claim.setItemId(rs.getLong("item_id"));
        claim.setUserId(rs.getLong("user_id"));
        claim.setClaimantName(rs.getString("claimant_name"));
        claim.setClaimantEmail(rs.getString("claimant_email"));
        claim.setClaimantPhone(rs.getString("claimant_phone"));
        claim.setProofDetails(rs.getString("proof_details"));
        claim.setExplanation(rs.getString("explanation"));
        claim.setStatus(rs.getString("status"));
        claim.setAdminNotes(rs.getString("admin_notes"));
        claim.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        if (rs.getTimestamp("updated_at") != null) {
            claim.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        // Joined item fields
        try {
            claim.setItemTitle(rs.getString("item_title"));
            claim.setItemCategory(rs.getString("item_category"));
            claim.setItemLocation(rs.getString("item_location"));
            claim.setItemStatus(rs.getString("item_status"));
            claim.setItemImageUrl(rs.getString("item_image_url"));
        } catch (Exception ignored) {}

        return claim;
    };

    public Claim save(Claim claim) {
        String sql = "INSERT INTO claims (item_id, user_id, claimant_name, claimant_email, claimant_phone, proof_details, explanation, status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, claim.getItemId());
            ps.setLong(2, claim.getUserId());
            ps.setString(3, claim.getClaimantName());
            ps.setString(4, claim.getClaimantEmail());
            ps.setString(5, claim.getClaimantPhone());
            ps.setString(6, claim.getProofDetails());
            ps.setString(7, claim.getExplanation());
            ps.setString(8, claim.getStatus() != null ? claim.getStatus() : "PENDING");
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            claim.setId(keyHolder.getKey().longValue());
        }
        return claim;
    }

    public Optional<Claim> findById(Long id) {
        String sql = "SELECT c.*, i.title as item_title, i.category_name as item_category, " +
                     "i.location_name as item_location, i.status as item_status, i.image_url as item_image_url " +
                     "FROM claims c " +
                     "JOIN items i ON c.item_id = i.id " +
                     "WHERE c.id = ?";
        try {
            Claim claim = jdbcTemplate.queryForObject(sql, claimRowMapper, id);
            return Optional.ofNullable(claim);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Claim> findByUserId(Long userId) {
        String sql = "SELECT c.*, i.title as item_title, i.category_name as item_category, " +
                     "i.location_name as item_location, i.status as item_status, i.image_url as item_image_url " +
                     "FROM claims c " +
                     "JOIN items i ON c.item_id = i.id " +
                     "WHERE c.user_id = ? " +
                     "ORDER BY c.created_at DESC";
        return jdbcTemplate.query(sql, claimRowMapper, userId);
    }

    public List<Claim> findAll(String status) {
        if (status != null && !status.isBlank()) {
            String sql = "SELECT c.*, i.title as item_title, i.category_name as item_category, " +
                         "i.location_name as item_location, i.status as item_status, i.image_url as item_image_url " +
                         "FROM claims c " +
                         "JOIN items i ON c.item_id = i.id " +
                         "WHERE c.status = ? " +
                         "ORDER BY c.created_at DESC";
            return jdbcTemplate.query(sql, claimRowMapper, status.toUpperCase());
        }
        String sql = "SELECT c.*, i.title as item_title, i.category_name as item_category, " +
                     "i.location_name as item_location, i.status as item_status, i.image_url as item_image_url " +
                     "FROM claims c " +
                     "JOIN items i ON c.item_id = i.id " +
                     "ORDER BY c.created_at DESC";
        return jdbcTemplate.query(sql, claimRowMapper);
    }

    public List<Claim> findByItemId(Long itemId) {
        String sql = "SELECT c.*, i.title as item_title, i.category_name as item_category, " +
                     "i.location_name as item_location, i.status as item_status, i.image_url as item_image_url " +
                     "FROM claims c " +
                     "JOIN items i ON c.item_id = i.id " +
                     "WHERE c.item_id = ? " +
                     "ORDER BY c.created_at DESC";
        return jdbcTemplate.query(sql, claimRowMapper, itemId);
    }

    public boolean hasUserAlreadyClaimed(Long itemId, Long userId) {
        String sql = "SELECT COUNT(*) FROM claims WHERE item_id = ? AND user_id = ? AND status != 'REJECTED'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, itemId, userId);
        return count != null && count > 0;
    }

    public int updateStatus(Long claimId, String status, String adminNotes) {
        String sql = "UPDATE claims SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, status, adminNotes, claimId);
    }

    public long countByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM claims WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status);
        return count != null ? count : 0L;
    }
}
