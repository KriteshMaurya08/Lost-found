package com.campus.lostfound.repository;

import com.campus.lostfound.model.Category;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public CategoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Category> rowMapper = (rs, rowNum) -> new Category(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("icon"),
            rs.getString("description")
    );

    public List<Category> findAll() {
        return jdbcTemplate.query("SELECT * FROM categories ORDER BY id ASC", rowMapper);
    }

    public Optional<Category> findById(Long id) {
        List<Category> list = jdbcTemplate.query("SELECT * FROM categories WHERE id = ?", rowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
