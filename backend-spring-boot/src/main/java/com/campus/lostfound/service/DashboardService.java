package com.campus.lostfound.service;

import com.campus.lostfound.dto.DashboardStatsResponse;
import com.campus.lostfound.repository.ClaimRepository;
import com.campus.lostfound.repository.ItemRepository;
import com.campus.lostfound.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;

    public DashboardService(UserRepository userRepository, ItemRepository itemRepository, ClaimRepository claimRepository) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
    }

    public DashboardStatsResponse getStatistics() {
        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalLostItems(itemRepository.countByType("LOST"));
        stats.setTotalFoundItems(itemRepository.countByType("FOUND"));
        stats.setActiveItems(itemRepository.countByStatus("ACTIVE"));
        stats.setPendingClaims(claimRepository.countByStatus("PENDING"));
        stats.setClaimedItems(itemRepository.countByStatus("CLAIMED"));
        stats.setReturnedItems(itemRepository.countByStatus("RETURNED"));
        stats.setResolvedItems(itemRepository.countByStatus("RESOLVED"));
        return stats;
    }
}
