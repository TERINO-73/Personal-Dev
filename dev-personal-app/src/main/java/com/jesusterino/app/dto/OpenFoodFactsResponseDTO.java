package com.jesusterino.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OpenFoodFactsResponseDTO {
    private Integer status;
    private Product product;

    @Data
    public static class Product {
        @JsonProperty("product_name")
        private String productName;

        private Nutriments nutriments;
    }

    @Data
    public static class Nutriments {
        @JsonProperty("energy-kcal_100g")
        private Double energyKcal100g;

        @JsonProperty("proteins_100g")
        private Double proteins100g;

        @JsonProperty("carbohydrates_100g")
        private Double carbohydrates100g;

        @JsonProperty("fat_100g")
        private Double fat100g;
    }
}
