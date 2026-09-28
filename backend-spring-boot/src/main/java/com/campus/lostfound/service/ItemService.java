package com.campus.lostfound.service;

import com.campus.lostfound.dto.ItemRequest;
import com.campus.lostfound.model.CampusLocation;
import com.campus.lostfound.model.Category;
import com.campus.lostfound.model.Item;
import com.campus.lostfound.model.User;
import com.campus.lostfound.repository.CategoryRepository;
import com.campus.lostfound.repository.ItemRepository;
import com.campus.lostfound.repository.LocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final MatchService matchService;

    public ItemService(ItemRepository itemRepository,
                       CategoryRepository categoryRepository,
                       LocationRepository locationRepository,
                       MatchService matchService) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.matchService = matchService;
    }

    public Item createItem(ItemRequest req, User currentUser) {
        if (!"LOST".equalsIgnoreCase(req.getType()) && !"FOUND".equalsIgnoreCase(req.getType())) {
            throw new IllegalArgumentException("Item type must be LOST or FOUND");
        }

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid category selected"));

        CampusLocation location = locationRepository.findById(req.getLocationId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid campus location selected"));

        Item item = new Item();
        item.setUserId(currentUser.getId());
        item.setTitle(req.getTitle().trim());
        item.setType(req.getType().toUpperCase());
        item.setCategoryId(category.getId());
        item.setCategoryName(category.getName());
        item.setLocationId(location.getId());
        item.setLocationName(location.getName());
        item.setDescription(req.getDescription().trim());
        item.setDateReported(req.getDateReported());
        item.setStatus("ACTIVE");
        item.setImageUrl(req.getImageUrl());
        item.setContactInfo(req.getContactInfo() != null && !req.getContactInfo().isBlank()
                ? req.getContactInfo().trim()
                : currentUser.getEmail() + " | " + currentUser.getPhone());

        Item saved = itemRepository.save(item);

        // Run rule-based matching engine
        try {
            matchService.computeMatchesForItem(saved);
        } catch (Exception e) {
            // Log matching error without breaking item submission
            System.err.println("Rule-based match computation warning: " + e.getMessage());
        }

        return itemRepository.findById(saved.getId()).orElse(saved);
    }

    public List<Item> getItems(String type, String search, Long categoryId, Long locationId, String status, String sort) {
        return itemRepository.findWithFilters(type, search, categoryId, locationId, status, sort);
    }

    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found with ID: " + id));
    }

    public List<Item> getUserReports(Long userId) {
        return itemRepository.findByUserId(userId);
    }

    public void updateStatus(Long itemId, String status, User actor) {
        Item item = getItemById(itemId);

        // Security check: Only Admin or the reporter can change status
        boolean isAdmin = "ADMIN".equalsIgnoreCase(actor.getRole());
        boolean isOwner = item.getUserId().equals(actor.getId());

        if (!isAdmin && !isOwner) {
            throw new SecurityException("Unauthorized: You do not have permission to modify this item status");
        }

        // Validate allowed transitions
        if (!List.of("ACTIVE", "CLAIMED", "RETURNED", "RESOLVED").contains(status.toUpperCase())) {
            throw new IllegalArgumentException("Invalid item status");
        }

        itemRepository.updateStatus(itemId, status.toUpperCase());
    }

    public void deleteItem(Long itemId, User actor) {
        Item item = getItemById(itemId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(actor.getRole());
        boolean isOwner = item.getUserId().equals(actor.getId());

        if (!isAdmin && !isOwner) {
            throw new SecurityException("Unauthorized to delete this item");
        }

        itemRepository.deleteById(itemId);
    }
}
