package com.campus.lostfound.controller;

import com.campus.lostfound.model.CampusLocation;
import com.campus.lostfound.model.Category;
import com.campus.lostfound.repository.CategoryRepository;
import com.campus.lostfound.repository.LocationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meta")
@CrossOrigin(origins = "*")
public class MetaController {

    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;

    public MetaController(CategoryRepository categoryRepository, LocationRepository locationRepository) {
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/locations")
    public ResponseEntity<List<CampusLocation>> getLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }
}
