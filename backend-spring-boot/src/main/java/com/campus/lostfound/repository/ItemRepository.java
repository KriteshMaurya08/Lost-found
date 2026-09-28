package com.campus.lostfound.repository;

import com.campus.lostfound.model.Item;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ItemRepository {

    private final JdbcTemplate jdbcTemplate;

    public ItemRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Item> itemRowMapper = (rs, rowNum) -> {
        Item item = new Item();
        item.setId(rs.getLong("id"));
        item.setUserId(rs.getLong("user_id"));
        item.setTitle(rs.getString("title"));
        item.setType(rs.getString("type"));
        item.setCategoryId(rs.getLong("category_id"));
        item.setCategoryName(rs.getString("category_name"));
        item.setLocationId(rs.getLong("location_id"));
        item.setLocationName(rs.getString("location_name"));
        item.setDescription(rs.getString("description"));
        if (rs.getDate("date_reported") != null) {
            item.setDateReported(rs.getDate("date_reported").toLocalDate());
        }
        item.setStatus(rs.getString("status"));
        item.setImageUrl(rs.getString("image_url"));
        item.setContactInfo(rs.getString("contact_info"));
        item.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        if (rs.getTimestamp("updated_at") != null) {
            item.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }
        // Joined columns from users
        try {
            item.setReporterName(rs.getString("reporter_name"));
            item.setReporterEmail(rs.getString("reporter_email"));
        } catch (Exception ignored) {}

        return item;
    };

    public Item save(Item item) {
        String sql = "INSERT INTO items (user_id, title, type, category_id, category_name, location_id, " +
                     "location_name, description, date_reported, status, image_url, contact_info) " +
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
            ps.setString(10, item.getStatus() != null ? item.getStatus() : "ACTIVE");
            ps.setString(11, item.getImageUrl());
            ps.setString(12, item.getContactInfo());
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            item.setId(keyHolder.getKey().longValue());
        }
        return item;
    }

    public Optional<Item> findById(Long id) {
        String sql = "SELECT i.*, u.full_name as reporter_name, u.email as reporter_email " +
                     "FROM items i " +
                     "JOIN users u ON i.user_id = u.id " +
                     "WHERE i.id = ?";
        try {
            Item item = jdbcTemplate.queryForObject(sql, itemRowMapper, id);
            return Optional.ofNullable(item);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Item> findWithFilters(String type, String search, Long categoryId, Long locationId, String status, String sort) {
        StringBuilder sql = new StringBuilder(
            "SELECT i.*, u.full_name as reporter_name, u.email as reporter_email " +
            "FROM items i " +
            "JOIN users u ON i.user_id = u.id " +
            "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();

        if (type != null && !type.isBlank()) {
            sql.append("AND i.type = ? ");
            params.add(type.toUpperCase());
        }

        if (status != null && !status.isBlank()) {
            sql.append("AND i.status = ? ");
            params.add(status.toUpperCase());
        }

        if (categoryId != null && categoryId > 0) {
            sql.append("AND i.category_id = ? ");
            params.add(categoryId);
        }

        if (locationId != null && locationId > 0) {
            sql.append("AND i.location_id = ? ");
            params.add(locationId);
        }

        if (search != null && !search.isBlank()) {
            String wildcard = "%" + search.trim() + "%";
            sql.append("AND (i.title LIKE ? OR i.description LIKE ? OR i.location_name LIKE ? OR i.category_name LIKE ?) ");
            params.add(wildcard);
            params.add(wildcard);
            params.add(wildcard);
            params.add(wildcard);
        }

        if ("oldest".equalsIgnoreCase(sort)) {
            sql.append("ORDER BY i.date_reported ASC, i.id ASC");
        } else {
            sql.append("ORDER BY i.date_reported DESC, i.id DESC");
        }

        return jdbcTemplate.query(sql.toString(), itemRowMapper, params.toArray());
    }

    public List<Item> findByUserId(Long userId) {
        String sql = "SELECT i.*, u.full_name as reporter_name, u.email as reporter_email " +
                     "FROM items i " +
                     "JOIN users u ON i.user_id = u.id " +
                     "WHERE i.user_id = ? " +
                     "ORDER BY i.created_at DESC";
        return jdbcTemplate.query(sql, itemRowMapper, userId);
    }

    public int updateStatus(Long itemId, String status) {
        String sql = "UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, status, itemId);
    }

    public int updateItem(Long id, String title, String description, Long categoryId, String categoryName,
                          Long locationId, String locationName, String imageUrl, String contactInfo) {
        String sql = "UPDATE items SET title = ?, description = ?, category_id = ?, category_name = ?, " +
                     "location_id = ?, location_name = ?, image_url = ?, contact_info = ?, updated_at = CURRENT_TIMESTAMP " +
                     "WHERE id = ?";
        return jdbcTemplate.update(sql, title, description, categoryId, categoryName, locationId, locationName, imageUrl, contactInfo, id);
    }

    public int deleteById(Long id) {
        String sql = "DELETE FROM items WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public long countByType(String type) {
        String sql = "SELECT COUNT(*) FROM items WHERE type = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, type);
        return count != null ? count : 0L;
    }

    public long countByStatus(String status) {
        String sql = "SELECT COUNT(*) FROM items WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status);
        return count != null ? count : 0L;
    }

    public List<Item> findRecentByType(String type, int limit) {
        String sql = "SELECT i.*, u.full_name as reporter_name, u.email as reporter_email " +
                     "FROM items i " +
                     "JOIN users u ON i.user_id = u.id " +
                     "WHERE i.type = ? " +
                     "ORDER BY i.created_at DESC LIMIT ?";
        return jdbcTemplate.query(sql, itemRowMapper, type, limit);
    }
}
