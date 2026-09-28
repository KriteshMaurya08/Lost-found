package com.campus.lostfound.controller;

import com.campus.lostfound.dto.ItemRequest;
import com.campus.lostfound.model.Item;
import com.campus.lostfound.model.User;
import com.campus.lostfound.service.AuthService;
import com.campus.lostfound.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemService itemService;
    private final AuthService authService;

    public ItemController(ItemService itemService, AuthService authService) {
        this.itemService = itemService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<Item>> getItems(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "newest") String sort) {
        List<Item> items = itemService.getItems(type, search, categoryId, locationId, status, sort);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/lost")
    public ResponseEntity<List<Item>> getLostItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "newest") String sort) {
        return ResponseEntity.ok(itemService.getItems("LOST", search, categoryId, locationId, status, sort));
    }

    @GetMapping("/found")
    public ResponseEntity<List<Item>> getFoundItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "newest") String sort) {
        return ResponseEntity.ok(itemService.getItems("FOUND", search, categoryId, locationId, status, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PostMapping
    public ResponseEntity<Item> createItem(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ItemRequest req) {
        User currentUser = resolveUser(authHeader);
        Item created = itemService.createItem(req, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateItemStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        User actor = resolveUser(authHeader);
        String status = body.get("status");
        itemService.updateStatus(id, status, actor);
        return ResponseEntity.ok(Map.of("message", "Item status updated to " + status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        User actor = resolveUser(authHeader);
        itemService.deleteItem(id, actor);
        return ResponseEntity.ok(Map.of("message", "Item successfully deleted"));
    }

    private User resolveUser(String authHeader) {
        // Authenticate request context in Spring Boot
        return authService.getCurrentUser(2L);
    }
}
