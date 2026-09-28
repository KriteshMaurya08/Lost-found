package com.campus.lostfound.repository;

import com.campus.lostfound.model.CampusLocation;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class LocationRepository {

    private final JdbcTemplate jdbcTemplate;

    public LocationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<CampusLocation> rowMapper = (rs, rowNum) -> new CampusLocation(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("campus_zone"),
            rs.getString("description")
    );

    public List<CampusLocation> findAll() {
        return jdbcTemplate.query("SELECT * FROM locations ORDER BY id ASC", rowMapper);
    }

    public Optional<CampusLocation> findById(Long id) {
        List<CampusLocation> list = jdbcTemplate.query("SELECT * FROM locations WHERE id = ?", rowMapper, id);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
