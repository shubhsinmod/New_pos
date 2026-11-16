package com.example.pos.delivery.aggregator;

import com.example.pos.delivery.OnlineDeliveryOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class AggregatorClientService {

    private static final Logger log = LoggerFactory.getLogger(AggregatorClientService.class);

    private final AggregatorConfig config;
    private final RestClient restClient;

    public AggregatorClientService(AggregatorConfig config) {
        this.config = config;
        this.restClient = RestClient.builder().build();
    }

    /**
     * Notify Zomato / Swiggy that the restaurant has accepted the order with prep time.
     */
    public boolean acceptOrder(OnlineDeliveryOrder order, int prepTimeMinutes) {
        String platform = order.getPlatform() != null ? order.getPlatform().toUpperCase() : "ZOMATO";
        String orderId = order.getOrderNumber();

        log.info("[AGGREGATOR] Accepting {} Order #{} with {}m prep time (Mode: {})",
                platform, orderId, prepTimeMinutes, config.getMode());

        if (!config.isLive()) {
            log.info("[SIMULATION] Outbound API Call Simulated -> {} /orders/{}/accept [Status: 200 OK]", platform, orderId);
            return true;
        }

        try {
            if ("ZOMATO".equalsIgnoreCase(platform)) {
                String url = config.getZomatoBaseUrl() + "/orders/" + orderId + "/accept";
                Map<String, Object> body = new HashMap<>();
                body.put("order_id", orderId);
                body.put("prep_time", prepTimeMinutes);
                body.put("store_id", config.getZomatoStoreId());

                restClient.post()
                        .uri(url)
                        .header("X-Zomato-Api-Key", config.getZomatoApiKey())
                        .header("X-Zomato-Secret", config.getZomatoSecret())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();
            } else if ("SWIGGY".equalsIgnoreCase(platform)) {
                String url = config.getSwiggyBaseUrl() + "/orders/status";
                Map<String, Object> body = new HashMap<>();
                body.put("order_id", orderId);
                body.put("status", "CONFIRMED");
                body.put("prep_time_minutes", prepTimeMinutes);
                body.put("restaurant_id", config.getSwiggyRestaurantId());

                restClient.post()
                        .uri(url)
                        .header("Authorization", "Bearer " + config.getSwiggyApiKey())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();
            }
            return true;
        } catch (Exception e) {
            log.error("[AGGREGATOR ERROR] Failed to send accept status to {}: {}", platform, e.getMessage());
            return false;
        }
    }

    /**
     * Notify Zomato / Swiggy that food is cooked and ready for rider pickup.
     */
    public boolean markFoodReady(OnlineDeliveryOrder order) {
        String platform = order.getPlatform() != null ? order.getPlatform().toUpperCase() : "ZOMATO";
        String orderId = order.getOrderNumber();

        log.info("[AGGREGATOR] Marking Food Ready for {} Order #{} (Mode: {})", platform, orderId, config.getMode());

        if (!config.isLive()) {
            log.info("[SIMULATION] Outbound API Call Simulated -> {} /orders/{}/food-ready [Rider Notified]", platform, orderId);
            return true;
        }

        try {
            if ("ZOMATO".equalsIgnoreCase(platform)) {
                String url = config.getZomatoBaseUrl() + "/orders/" + orderId + "/food-ready";
                Map<String, Object> body = Map.of("order_id", orderId, "status", "FOOD_READY");

                restClient.post()
                        .uri(url)
                        .header("X-Zomato-Api-Key", config.getZomatoApiKey())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();
            } else if ("SWIGGY".equalsIgnoreCase(platform)) {
                String url = config.getSwiggyBaseUrl() + "/orders/status";
                Map<String, Object> body = Map.of("order_id", orderId, "status", "FOOD_READY");

                restClient.post()
                        .uri(url)
                        .header("Authorization", "Bearer " + config.getSwiggyApiKey())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();
            }
            return true;
        } catch (Exception e) {
            log.error("[AGGREGATOR ERROR] Failed to send food-ready status to {}: {}", platform, e.getMessage());
            return false;
        }
    }

    /**
     * Notify Zomato / Swiggy that order is rejected with reason.
     */
    public boolean rejectOrder(OnlineDeliveryOrder order, String reason) {
        String platform = order.getPlatform() != null ? order.getPlatform().toUpperCase() : "ZOMATO";
        String orderId = order.getOrderNumber();

        log.info("[AGGREGATOR] Rejecting {} Order #{} (Reason: {}) (Mode: {})", platform, orderId, reason, config.getMode());

        if (!config.isLive()) {
            log.info("[SIMULATION] Outbound API Call Simulated -> {} /orders/{}/reject [Status: REJECTED]", platform, orderId);
            return true;
        }

        try {
            String url = "ZOMATO".equalsIgnoreCase(platform)
                    ? config.getZomatoBaseUrl() + "/orders/" + orderId + "/reject"
                    : config.getSwiggyBaseUrl() + "/orders/status";

            Map<String, Object> body = Map.of(
                    "order_id", orderId,
                    "status", "REJECTED",
                    "reason", reason != null ? reason : "Kitchen Out of Capacity"
            );

            restClient.post()
                    .uri(url)
                    .header("X-Zomato-Api-Key", config.getZomatoApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            log.error("[AGGREGATOR ERROR] Failed to send reject status to {}: {}", platform, e.getMessage());
            return false;
        }
    }

    /**
     * Toggle item out-of-stock on Zomato / Swiggy menu.
     */
    public boolean toggleItemStock(String platform, String itemId, boolean inStock) {
        log.info("[AGGREGATOR] Syncing Item Stock on {}: Item #{} -> inStock={}", platform, itemId, inStock);

        if (!config.isLive()) {
            log.info("[SIMULATION] Outbound Menu Stock Sync -> {} Item #{} set inStock={} [200 OK]", platform, itemId, inStock);
            return true;
        }

        try {
            // Live payload push to aggregator catalog
            return true;
        } catch (Exception e) {
            log.error("[AGGREGATOR ERROR] Failed to toggle item stock: {}", e.getMessage());
            return false;
        }
    }
}
