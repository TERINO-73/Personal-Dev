package com.jesusterino.app.service;

import com.jesusterino.app.dto.AddFoodRequestDTO;
import com.jesusterino.app.dto.DailyFoodEntryDTO;
import com.jesusterino.app.dto.NutritionDayResponseDTO;
import com.jesusterino.app.dto.NutritionProfileDTO;
import com.jesusterino.app.model.DailyFoodEntry;
import com.jesusterino.app.model.Food;
import com.jesusterino.app.model.User;
import com.jesusterino.app.model.UserNutritionProfile;
import com.jesusterino.app.repository.DailyFoodEntryRepository;
import com.jesusterino.app.repository.FoodRepository;
import com.jesusterino.app.repository.UserNutritionProfileRepository;
import com.jesusterino.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NutritionService {

    private final UserNutritionProfileRepository profileRepository;
    private final DailyFoodEntryRepository dailyEntryRepository;
    private final UserRepository userRepository;
    private final FoodRepository foodRepository;
    private final FoodService foodService; // to use mapping logic

    public NutritionProfileDTO getProfile(String username) {
        return profileRepository.findByUserUsername(username)
                .map(this::mapProfileToDTO)
                .orElse(null);
    }

    public NutritionProfileDTO saveProfile(String username, NutritionProfileDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        UserNutritionProfile profile = profileRepository.findByUserUsername(username)
                .orElse(new UserNutritionProfile());

        profile.setUser(user);
        profile.setWeight(dto.getWeight());
        profile.setHeight(dto.getHeight());
        profile.setSex(dto.getSex());
        profile.setAge(dto.getAge());
        profile.setActivityLevel(dto.getActivityLevel());
        profile.setGoal(dto.getGoal());

        // Check if manual adjustments are sent
        if (dto.getTargetCalories() != null && dto.getTargetCalories() > 0) {
            profile.setTargetCalories(dto.getTargetCalories());
            profile.setTargetProtein(dto.getTargetProtein());
            profile.setTargetCarbs(dto.getTargetCarbs());
            profile.setTargetFat(dto.getTargetFat());
        } else {
            // Auto Calculate Form
            calculateMacros(profile);
        }

        profile = profileRepository.save(profile);
        return mapProfileToDTO(profile);
    }

    public NutritionProfileDTO resetMacros(String username) {
        UserNutritionProfile profile = profileRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        calculateMacros(profile);
        profile = profileRepository.save(profile);
        return mapProfileToDTO(profile);
    }

    private void calculateMacros(UserNutritionProfile p) {
        if (p.getWeight() == null || p.getHeight() == null || p.getSex() == null || p.getAge() == null) {
            return;
        }

        // BMR: Mifflin-St Jeor
        double bmr = (10 * p.getWeight()) + (6.25 * p.getHeight()) - (5 * p.getAge());
        if ("male".equalsIgnoreCase(p.getSex())) {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        double activityFactor = 1.2; // Sedentario por defecto
        if ("Ligero".equalsIgnoreCase(p.getActivityLevel())) activityFactor = 1.375;
        else if ("Moderado".equalsIgnoreCase(p.getActivityLevel())) activityFactor = 1.55;
        else if ("Alto".equalsIgnoreCase(p.getActivityLevel())) activityFactor = 1.725;
        else if ("Muy alto".equalsIgnoreCase(p.getActivityLevel())) activityFactor = 1.9;

        double tdee = bmr * activityFactor;

        double targetCal = tdee;
        if ("Perder grasa".equalsIgnoreCase(p.getGoal())) {
            targetCal -= 500;
        } else if ("Ganar masa muscular".equalsIgnoreCase(p.getGoal())) {
            targetCal += 300;
        }

        double targetProtein = p.getWeight() * 2.0; // 2g/kg
        double targetFat = p.getWeight() * 0.8; // 0.8g/kg
        double proteinCals = targetProtein * 4;
        double fatCals = targetFat * 9;
        double remainingCals = targetCal - proteinCals - fatCals;
        double targetCarbs = remainingCals > 0 ? remainingCals / 4 : 0;

        p.setTargetCalories((double) Math.round(targetCal));
        p.setTargetProtein((double) Math.round(targetProtein));
        p.setTargetFat((double) Math.round(targetFat));
        p.setTargetCarbs((double) Math.round(targetCarbs));
    }

    public NutritionDayResponseDTO getDayInfo(String username, LocalDate date) {
        NutritionProfileDTO profile = getProfile(username);
        List<DailyFoodEntry> entries = dailyEntryRepository.findByUserUsernameAndDate(username, date);

        double tCal = 0, tPro = 0, tCar = 0, tFat = 0;
        List<DailyFoodEntryDTO> dtoList = entries.stream().map(e -> {
            DailyFoodEntryDTO dto = mapEntryToDTO(e);
            return dto;
        }).collect(Collectors.toList());

        for (DailyFoodEntryDTO dto : dtoList) {
            tCal += dto.getCalories();
            tPro += dto.getProtein();
            tCar += dto.getCarbs();
            tFat += dto.getFat();
        }

        return NutritionDayResponseDTO.builder()
                .date(date)
                .totalCalories(tCal)
                .totalProtein(tPro)
                .totalCarbs(tCar)
                .totalFat(tFat)
                .targetCalories(profile != null ? profile.getTargetCalories() : 0.0)
                .targetProtein(profile != null ? profile.getTargetProtein() : 0.0)
                .targetCarbs(profile != null ? profile.getTargetCarbs() : 0.0)
                .targetFat(profile != null ? profile.getTargetFat() : 0.0)
                .entries(dtoList)
                .build();
    }

    public DailyFoodEntryDTO addFoodToDay(String username, AddFoodRequestDTO req) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Food food = foodRepository.findById(req.getFoodId())
                .orElseThrow(() -> new RuntimeException("Food not found"));

        double factor = req.getGrams() / 100.0;
        double cals = food.getCaloriesPer100g() * factor;
        double pro = food.getProteinPer100g() * factor;
        double carbs = food.getCarbsPer100g() * factor;
        double fat = food.getFatPer100g() * factor;

        DailyFoodEntry entry = DailyFoodEntry.builder()
                .user(user)
                .food(food)
                .date(req.getDate())
                .grams(req.getGrams())
                .calories(cals)
                .protein(pro)
                .carbs(carbs)
                .fat(fat)
                .build();

        entry = dailyEntryRepository.save(entry);
        return mapEntryToDTO(entry);
    }

    public void removeFoodFromDay(Long entryId, String username) {
        DailyFoodEntry entry = dailyEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Entry not found"));
        if (!entry.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to delete this entry");
        }
        dailyEntryRepository.delete(entry);
    }

    private NutritionProfileDTO mapProfileToDTO(UserNutritionProfile p) {
        return NutritionProfileDTO.builder()
                .id(p.getId())
                .weight(p.getWeight())
                .height(p.getHeight())
                .sex(p.getSex())
                .age(p.getAge())
                .activityLevel(p.getActivityLevel())
                .goal(p.getGoal())
                .targetCalories(p.getTargetCalories())
                .targetProtein(p.getTargetProtein())
                .targetCarbs(p.getTargetCarbs())
                .targetFat(p.getTargetFat())
                .build();
    }

    private DailyFoodEntryDTO mapEntryToDTO(DailyFoodEntry e) {
        return DailyFoodEntryDTO.builder()
                .id(e.getId())
                .food(foodService.mapToDTO(e.getFood()))
                .date(e.getDate())
                .grams(e.getGrams())
                .calories(e.getCalories())
                .protein(e.getProtein())
                .carbs(e.getCarbs())
                .fat(e.getFat())
                .build();
    }
}
