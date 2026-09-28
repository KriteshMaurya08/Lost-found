package com.campus.lostfound.service;

import com.campus.lostfound.model.Item;
import com.campus.lostfound.model.PossibleMatch;
import com.campus.lostfound.repository.ItemRepository;
import com.campus.lostfound.repository.MatchRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final ItemRepository itemRepository;

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "an", "the", "in", "on", "at", "by", "for", "with", "about", "against", "between",
            "into", "through", "during", "before", "after", "above", "below", "to", "from", "up",
            "down", "and", "or", "but", "while", "of", "it", "its", "is", "was", "are", "were",
            "be", "been", "being", "have", "has", "had", "do", "does", "did", "this", "that",
            "these", "those", "my", "your", "his", "her", "their", "found", "lost", "item", "near"
    ));

    public MatchService(MatchRepository matchRepository, ItemRepository itemRepository) {
        this.matchRepository = matchRepository;
        this.itemRepository = itemRepository;
    }

    /**
     * Rule-based algorithmic matching between a newly reported item and opposite-type items.
     * Evaluates category, location, date proximity, and keyword overlap.
     */
    public void computeMatchesForItem(Item newItem) {
        String oppositeType = "LOST".equalsIgnoreCase(newItem.getType()) ? "FOUND" : "LOST";
        List<Item> candidates = itemRepository.findWithFilters(oppositeType, null, null, null, "ACTIVE", "newest");

        for (Item candidate : candidates) {
            Item lostItem = "LOST".equalsIgnoreCase(newItem.getType()) ? newItem : candidate;
            Item foundItem = "FOUND".equalsIgnoreCase(newItem.getType()) ? newItem : candidate;

            int score = 0;
            List<String> reasons = new ArrayList<>();

            // Rule 1: Category Match
            if (lostItem.getCategoryId() != null && lostItem.getCategoryId().equals(foundItem.getCategoryId())) {
                score += 35;
                reasons.add("Matching category: " + lostItem.getCategoryName());
            }

            // Rule 2: Campus Location Match
            if (lostItem.getLocationId() != null && lostItem.getLocationId().equals(foundItem.getLocationId())) {
                score += 30;
                reasons.add("Identical campus location: " + lostItem.getLocationName());
            }

            // Rule 3: Date Proximity Match
            if (lostItem.getDateReported() != null && foundItem.getDateReported() != null) {
                long daysDiff = Math.abs(ChronoUnit.DAYS.between(lostItem.getDateReported(), foundItem.getDateReported()));
                if (daysDiff == 0) {
                    score += 20;
                    reasons.add("Reported on the exact same date (" + lostItem.getDateReported() + ")");
                } else if (daysDiff <= 3) {
                    score += 15;
                    reasons.add("Incident dates within " + daysDiff + " days of each other");
                } else if (daysDiff <= 7) {
                    score += 10;
                    reasons.add("Incident dates within one week");
                }
            }

            // Rule 4: Title & Description Keyword Overlap
            Set<String> lostWords = extractKeywords(lostItem.getTitle() + " " + lostItem.getDescription());
            Set<String> foundWords = extractKeywords(foundItem.getTitle() + " " + foundItem.getDescription());

            Set<String> commonWords = new HashSet<>(lostWords);
            commonWords.retainAll(foundWords);

            if (!commonWords.isEmpty()) {
                int keywordBonus = Math.min(25, commonWords.size() * 8);
                score += keywordBonus;
                reasons.add("Shared descriptive keywords: [" + String.join(", ", commonWords) + "]");
            }

            // If combined match score is 45 or higher, persist as potential match
            if (score >= 45) {
                String matchReasonText = String.join(" • ", reasons);
                matchRepository.upsertMatch(lostItem.getId(), foundItem.getId(), Math.min(100, score), matchReasonText);
            }
        }
    }

    private Set<String> extractKeywords(String text) {
        if (text == null) return Collections.emptySet();
        Set<String> words = new HashSet<>();
        String[] tokens = text.toLowerCase().replaceAll("[^a-zA-Z0-9 ]", " ").split("\\s+");
        for (String token : tokens) {
            String clean = token.trim();
            if (clean.length() >= 3 && !STOP_WORDS.contains(clean)) {
                words.add(clean);
            }
        }
        return words;
    }

    public List<PossibleMatch> getPotentialMatches() {
        List<PossibleMatch> matches = matchRepository.findAllPotential();
        for (PossibleMatch m : matches) {
            itemRepository.findById(m.getLostItemId()).ifPresent(m::setLostItem);
            itemRepository.findById(m.getFoundItemId()).ifPresent(m::setFoundItem);
        }
        return matches;
    }

    public List<PossibleMatch> getMatchesForItem(Long itemId, String type) {
        List<PossibleMatch> matches = "LOST".equalsIgnoreCase(type)
                ? matchRepository.findByLostItemId(itemId)
                : matchRepository.findByFoundItemId(itemId);

        for (PossibleMatch m : matches) {
            itemRepository.findById(m.getLostItemId()).ifPresent(m::setLostItem);
            itemRepository.findById(m.getFoundItemId()).ifPresent(m::setFoundItem);
        }
        return matches;
    }

    public void updateMatchStatus(Long matchId, String status) {
        matchRepository.updateStatus(matchId, status);
    }
}
