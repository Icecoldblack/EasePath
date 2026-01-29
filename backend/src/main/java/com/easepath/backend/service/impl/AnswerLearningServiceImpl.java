package com.easepath.backend.service.impl;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.easepath.backend.model.LearnedAnswerDocument;
import com.easepath.backend.model.LearnedAnswerDocument.QuestionCategory;
import com.easepath.backend.repository.LearnedAnswerRepository;
import com.easepath.backend.service.AnswerLearningService;

/**
 * ANSWER LEARNING SERVICE - "Machine Learning Lite" for form autofill
 * 
 * PURPOSE:
 * This service learns from users' past answers to suggest responses for new
 * questions.
 * When a user fills out "Why do you want to work here?" on one application,
 * we can suggest a similar answer on future applications.
 * 
 * KEY ALGORITHMS:
 * 1. QUESTION CATEGORIZATION: Classifies questions into categories (salary,
 * experience, etc.)
 * using keyword matching - a simple form of Natural Language Processing (NLP)
 * 
 * 2. KEYWORD EXTRACTION: Removes "stop words" (the, a, is, etc.) to find
 * meaningful terms
 * This is a common NLP preprocessing technique called "stop word removal"
 * 
 * 3. SIMILARITY SCORING: Calculates how similar a new question is to stored
 * questions
 * using word overlap (similar to Jaccard similarity coefficient)
 * 
 * 4. CONFIDENCE SCORING: Tracks how reliable each answer is:
 * - Increases when user accepts suggested answer as-is
 * - Decreases when user edits the suggestion
 * - This is a form of "reinforcement learning" feedback loop
 * 
 * DATA STRUCTURE:
 * Each LearnedAnswerDocument stores:
 * - Original question text
 * - Normalized question pattern (lowercase, no punctuation)
 * - Extracted keywords for similarity matching
 * - Question category (SALARY, EXPERIENCE, BEHAVIORAL, etc.)
 * - The user's answer
 * - Confidence score (0.0 to 1.0)
 * - Usage statistics (how often used, last used date)
 */
@Service // Spring annotation - marks this as a business logic component
public class AnswerLearningServiceImpl implements AnswerLearningService {

    private static final Logger log = LoggerFactory.getLogger(AnswerLearningServiceImpl.class);

    // Repository for database operations (Spring Data MongoDB)
    private final LearnedAnswerRepository learnedAnswerRepository;

    // CONSTRUCTOR INJECTION: Spring automatically provides the repository
    public AnswerLearningServiceImpl(LearnedAnswerRepository learnedAnswerRepository) {
        this.learnedAnswerRepository = learnedAnswerRepository;
    }

    /**
     * FIND BEST ANSWER - The core matching algorithm
     * 
     * ALGORITHM (2-tier search):
     * Tier 1: Exact pattern match (fast, database query)
     * Tier 2: Category + similarity match (slower, in-memory scoring)
     * 
     * @param userEmail - User identifier (answers are per-user)
     * @param question  - The new question we need to find an answer for
     * @return The best matching answer, or empty if none found
     */
    @Override
    public Optional<LearnedAnswerDocument> findBestAnswer(String userEmail, String question) {
        // PREPROCESSING: Convert question to searchable format
        String pattern = normalizeQuestion(question); // "What is your experience?" -> "what is your experience"
        QuestionCategory category = categorizeQuestion(question); // -> EXPERIENCE

        log.info("Finding answer for pattern: '{}', category: {}", pattern, category);

        // ══════════════════════════════════════════════════════════════════
        // TIER 1: Exact pattern match (O(1) database lookup)
        // ══════════════════════════════════════════════════════════════════
        // If user answered this EXACT question before, use that answer
        Optional<LearnedAnswerDocument> exactMatch = learnedAnswerRepository
                .findByUserEmailAndQuestionPattern(userEmail, pattern);

        // Only use if confidence is above threshold (0.5 = 50%)
        // Low confidence answers might have been edited many times
        if (exactMatch.isPresent() && exactMatch.get().getConfidence() > 0.5) {
            log.info("Found exact match with confidence: {}", exactMatch.get().getConfidence());
            return exactMatch;
        }

        // ══════════════════════════════════════════════════════════════════
        // TIER 2: Category + similarity match (O(n) in-memory loop)
        // ══════════════════════════════════════════════════════════════════
        // Get all answers in the same category, then score by word similarity
        List<LearnedAnswerDocument> categoryMatches = learnedAnswerRepository.findByUserEmailAndCategory(userEmail,
                category);

        if (!categoryMatches.isEmpty()) {
            // Tokenize the question into words for comparison
            String[] questionWords = pattern.split("\\s+");

            LearnedAnswerDocument bestMatch = null;
            double bestScore = 0;

            // LINEAR SEARCH: Check each stored answer for similarity
            // In production, you might use a vector database for faster similarity search
            for (LearnedAnswerDocument answer : categoryMatches) {
                // Calculate how many keywords overlap (Jaccard-like similarity)
                double score = calculateSimilarity(questionWords, answer.getQuestionKeywords());

                // Update best if: higher score AND confidence above threshold
                if (score > bestScore && answer.getConfidence() > 0.4) {
                    bestScore = score;
                    bestMatch = answer;
                }
            }

            // Only return if similarity is above minimum threshold (30%)
            // Lower threshold = more matches but less accurate
            if (bestMatch != null && bestScore > 0.3) {
                log.info("Found category match with similarity: {}", bestScore);
                return Optional.of(bestMatch);
            }
        }

        // NO MATCH: Question is too different from anything we've seen
        log.info("No suitable answer found");
        return Optional.empty();
    }

    @Override
    public LearnedAnswerDocument learnAnswer(String userEmail, String question, String answer,
            String platform, String jobTitle) {
        String pattern = normalizeQuestion(question);
        QuestionCategory category = categorizeQuestion(question);
        List<String> keywords = extractKeywords(question);

        log.info("Learning answer for question category: {}", category);

        // Check if we already have this pattern
        Optional<LearnedAnswerDocument> existing = learnedAnswerRepository.findByUserEmailAndQuestionPattern(userEmail,
                pattern);

        LearnedAnswerDocument doc;
        if (existing.isPresent()) {
            doc = existing.get();
            doc.setAnswer(answer);
            doc.setLastUsedAt(Instant.now());
            doc.setUseCount(doc.getUseCount() + 1);
            // Boost confidence when user provides/updates answer
            doc.setConfidence(Math.min(1.0, doc.getConfidence() + 0.1));
        } else {
            doc = new LearnedAnswerDocument();
            doc.setUserEmail(userEmail);
            doc.setQuestionPattern(pattern);
            doc.setOriginalQuestion(question);
            doc.setAnswer(answer);
            doc.setCategory(category);
            doc.setQuestionKeywords(keywords);
            doc.setSourcePlatform(platform);
            doc.setJobTitleContext(jobTitle);
            doc.setConfidence(0.6); // Start with reasonable confidence for user-provided answers
        }

        return learnedAnswerRepository.save(doc);
    }

    @Override
    public void recordAnswerUsed(String answerId) {
        learnedAnswerRepository.findById(answerId).ifPresent(doc -> {
            doc.setUseCount(doc.getUseCount() + 1);
            doc.setLastUsedAt(Instant.now());
            doc.setConfidence(Math.min(1.0, doc.getConfidence() + 0.05));
            learnedAnswerRepository.save(doc);
            log.info("Recorded answer use, new confidence: {}", doc.getConfidence());
        });
    }

    @Override
    public void recordAnswerEdited(String answerId, String newAnswer) {
        learnedAnswerRepository.findById(answerId).ifPresent(doc -> {
            doc.setAnswer(newAnswer);
            doc.setLastUsedAt(Instant.now());
            // Slight confidence drop when user edits (they didn't use it as-is)
            doc.setConfidence(Math.max(0.3, doc.getConfidence() - 0.05));
            learnedAnswerRepository.save(doc);
            log.info("Updated answer, new confidence: {}", doc.getConfidence());
        });
    }

    @Override
    public List<LearnedAnswerDocument> getUserAnswers(String userEmail) {
        return learnedAnswerRepository.findByUserEmailOrderByUseCountDesc(userEmail);
    }

    @Override
    public List<LearnedAnswerDocument> getAnswersByCategory(String userEmail, QuestionCategory category) {
        return learnedAnswerRepository.findByUserEmailAndCategory(userEmail, category);
    }

    @Override
    public QuestionCategory categorizeQuestion(String question) {
        String q = question.toLowerCase();

        // Motivation questions
        if (containsAny(q, "why do you want", "why are you interested", "why this company",
                "why this role", "why should we hire", "what attracts you")) {
            return QuestionCategory.MOTIVATION;
        }

        // Experience questions
        if (containsAny(q, "tell us about your experience", "describe your experience",
                "what experience do you have", "years of experience")) {
            return QuestionCategory.EXPERIENCE;
        }

        // Challenge/Problem solving
        if (containsAny(q, "challenge", "difficult situation", "problem you solved",
                "obstacle", "conflict", "disagreement")) {
            return QuestionCategory.CHALLENGE;
        }

        // Strengths/Weaknesses
        if (containsAny(q, "strength", "weakness", "greatest asset", "area of improvement",
                "what makes you unique")) {
            return QuestionCategory.STRENGTH_WEAKNESS;
        }

        // Salary
        if (containsAny(q, "salary", "compensation", "pay", "rate", "expectations")) {
            return QuestionCategory.SALARY;
        }

        // Availability
        if (containsAny(q, "when can you start", "availability", "notice period",
                "start date", "available to begin")) {
            return QuestionCategory.AVAILABILITY;
        }

        // Relocation
        if (containsAny(q, "relocation", "relocate", "willing to move", "work location")) {
            return QuestionCategory.RELOCATION;
        }

        // Cover letter
        if (containsAny(q, "cover letter", "personal statement", "introduce yourself",
                "tell us about yourself", "about you")) {
            return QuestionCategory.COVER_LETTER;
        }

        // Technical
        if (containsAny(q, "technical", "programming", "code", "algorithm", "system design",
                "technology", "framework", "language")) {
            return QuestionCategory.TECHNICAL;
        }

        // Behavioral (STAR)
        if (containsAny(q, "tell me about a time", "give an example", "describe a situation",
                "how did you handle", "walk me through")) {
            return QuestionCategory.BEHAVIORAL;
        }

        return QuestionCategory.OTHER;
    }

    private String normalizeQuestion(String question) {
        return question.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private List<String> extractKeywords(String question) {
        String[] stopWords = { "the", "a", "an", "is", "are", "was", "were", "be", "been",
                "being", "have", "has", "had", "do", "does", "did", "will",
                "would", "could", "should", "may", "might", "must", "shall",
                "can", "to", "of", "in", "for", "on", "with", "at", "by",
                "from", "as", "into", "through", "during", "before", "after",
                "above", "below", "up", "down", "out", "off", "over", "under",
                "again", "further", "then", "once", "here", "there", "when",
                "where", "why", "how", "all", "each", "few", "more", "most",
                "other", "some", "such", "no", "nor", "not", "only", "own",
                "same", "so", "than", "too", "very", "just", "and", "but",
                "if", "or", "because", "until", "while", "about", "your",
                "you", "us", "we", "our", "tell", "describe", "explain" };

        List<String> stopList = Arrays.asList(stopWords);

        return Arrays.stream(normalizeQuestion(question).split("\\s+"))
                .filter(word -> word.length() > 2)
                .filter(word -> !stopList.contains(word))
                .distinct()
                .collect(Collectors.toList());
    }

    private double calculateSimilarity(String[] questionWords, List<String> answerKeywords) {
        if (answerKeywords == null || answerKeywords.isEmpty())
            return 0;

        long matches = Arrays.stream(questionWords)
                .filter(answerKeywords::contains)
                .count();

        return (double) matches / Math.max(questionWords.length, answerKeywords.size());
    }

    private boolean containsAny(String text, String... phrases) {
        for (String phrase : phrases) {
            if (text.contains(phrase))
                return true;
        }
        return false;
    }
}
