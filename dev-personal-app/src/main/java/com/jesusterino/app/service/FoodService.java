package com.jesusterino.app.service;

import com.jesusterino.app.dto.FoodDTO;
import com.jesusterino.app.dto.OpenFoodFactsResponseDTO;
import com.jesusterino.app.model.Food;
import com.jesusterino.app.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<FoodDTO> getAllFoods() {
        return foodRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public FoodDTO createFood(FoodDTO dto) {
        Food food = new Food();
        food.setName(dto.getName());
        food.setCaloriesPer100g(dto.getCaloriesPer100g() != null ? dto.getCaloriesPer100g() : 0.0);
        food.setProteinPer100g(dto.getProteinPer100g() != null ? dto.getProteinPer100g() : 0.0);
        food.setCarbsPer100g(dto.getCarbsPer100g() != null ? dto.getCarbsPer100g() : 0.0);
        food.setFatPer100g(dto.getFatPer100g() != null ? dto.getFatPer100g() : 0.0);
        food.setBarcode(dto.getBarcode());

        food = foodRepository.save(food);
        return mapToDTO(food);
    }

    public FoodDTO getOrFetchFoodByBarcode(String barcode) {
        return foodRepository.findByBarcode(barcode)
                .map(this::mapToDTO)
                .orElseGet(() -> fetchFromOpenFoodFacts(barcode));
    }

    private FoodDTO fetchFromOpenFoodFacts(String barcode) {
        String url = "https://world.openfoodfacts.org/api/v0/product/" + barcode + ".json";
        try {
            ResponseEntity<OpenFoodFactsResponseDTO> response = restTemplate.getForEntity(url, OpenFoodFactsResponseDTO.class);
            OpenFoodFactsResponseDTO body = response.getBody();
            if (body != null && body.getStatus() == 1 && body.getProduct() != null) {
                OpenFoodFactsResponseDTO.Product product = body.getProduct();
                OpenFoodFactsResponseDTO.Nutriments nutr = product.getNutriments();

                Food food = new Food();
                food.setBarcode(barcode);
                food.setName(product.getProductName() != null ? product.getProductName() : "Unknown");

                if (nutr != null) {
                    food.setCaloriesPer100g(nutr.getEnergyKcal100g() != null ? nutr.getEnergyKcal100g() : 0.0);
                    food.setProteinPer100g(nutr.getProteins100g() != null ? nutr.getProteins100g() : 0.0);
                    food.setCarbsPer100g(nutr.getCarbohydrates100g() != null ? nutr.getCarbohydrates100g() : 0.0);
                    food.setFatPer100g(nutr.getFat100g() != null ? nutr.getFat100g() : 0.0);
                } else {
                    food.setCaloriesPer100g(0.0);
                    food.setProteinPer100g(0.0);
                    food.setCarbsPer100g(0.0);
                    food.setFatPer100g(0.0);
                }

                food = foodRepository.save(food);
                return mapToDTO(food);
            }
        } catch (Exception e) {
            System.err.println("Error fetching from OpenFoodFacts: " + e.getMessage());
        }
        throw new RuntimeException("Food not found for barcode: " + barcode);
    }

    public FoodDTO mapToDTO(Food food) {
        return FoodDTO.builder()
                .id(food.getId())
                .name(food.getName())
                .caloriesPer100g(food.getCaloriesPer100g())
                .proteinPer100g(food.getProteinPer100g())
                .carbsPer100g(food.getCarbsPer100g())
                .fatPer100g(food.getFatPer100g())
                .barcode(food.getBarcode())
                .build();
    }
}
